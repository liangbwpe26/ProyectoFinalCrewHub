<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\Comment;
use App\Models\CommentReaction;
use App\Models\Notification;
use App\Models\User;
use App\Models\Follow;
use App\Models\Reaction;
use App\Events\NotificationSent;
use App\Models\SavedPost;

/**
 * Controlador para gestionar interacciones en publicaciones.
 * 
 * Maneja reacciones, comentarios, menciones, respuestas y publicaciones guardadas.
 */
class PostInteractionController extends Controller
{
    /**
     * Alterna la reacción de "me gusta" en una publicación.
     *
     * @param Request $request Objeto de la solicitud HTTP
     * @param mixed $postId Identificador de la publicación
     * @return \Illuminate\Http\JsonResponse Respuesta JSON con el estado de la reacción
     */
    public function toggleReaction(Request $request, $postId)
    {
        $me = $request->user();

        $existingReaction = Reaction::where('user_id', $me->_id)
            ->where('post_id', $postId)
            ->first();

        if ($existingReaction) {
            $existingReaction->delete();
            Notification::where('sender_id', $me->_id)->where('post_id', $postId)->where('type', 'post_reaction')->delete();
            return response()->json(['success' => true, 'reacted' => false]);
        } else {
            Reaction::create([
                'user_id' => $me->_id,
                'post_id' => $postId
            ]);

            $post = Post::find($postId);
            if ($post && $post->user_id !== $me->_id) {
                $notif = Notification::create([
                    'recipient_id' => $post->user_id,
                    'sender_id' => $me->_id,
                    'type' => 'post_reaction',
                    'post_id' => $postId,
                    'is_read' => false
                ]);
                $notif->load(['sender', 'post']);
                
                try {
                    broadcast(new NotificationSent($notif));
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Error WS: ' . $e->getMessage());
                }
            }

            return response()->json(['success' => true, 'reacted' => true]);
        }
    }

    /**
     * Obtiene los comentarios de nivel superior de una publicación con paginación.
     *
     * @param Request $request Objeto de la solicitud HTTP
     * @param mixed $postId Identificador de la publicación
     * @return \Illuminate\Http\JsonResponse Respuesta JSON con comentarios y metadatos de paginación
     */
    public function getComments(Request $request, $postId)
    {
        $me = $request->user();

        $offset = (int) $request->query('offset', 0);
        $limit = 5;

        $query = Comment::with(['user'])
            ->where('post_id', $postId)
            ->whereNull('parent_id')
            ->orderBy('created_at', 'desc');

        $totalCount = $query->count();

        $comments = $query->skip($offset)->take($limit)->get();

        $comments->transform(function ($comment) use ($me) {
            $comment->reactions_count = CommentReaction::where('comment_id', $comment->_id)->count();
            $comment->has_reacted = $me ? CommentReaction::where('comment_id', $comment->_id)->where('user_id', $me->_id)->exists() : false;

            $comment->replies_preview = Comment::with('user')
                ->where('parent_id', $comment->_id)
                ->orderBy('created_at', 'asc')
                ->take(2)
                ->get();

            $comment->replies_count = Comment::where('parent_id', $comment->_id)->count();

            $comment->replies_preview->transform(function ($reply) use ($me) {
                $reply->reactions_count = CommentReaction::where('comment_id', $reply->_id)->count();
                $reply->has_reacted = $me ? CommentReaction::where('comment_id', $reply->_id)->where('user_id', $me->_id)->exists() : false;
                return $reply;
            });

            return $comment;
        });

        return response()->json([
            'success' => true,
            'comments' => $comments,
            'hasMore' => ($offset + $limit) < $totalCount
        ]);
    }

    /**
     * Add a comment or reply and notify mentioned users.
     *
     * @param Request $request
     * @param mixed $postId
     * @return \Illuminate\Http\JsonResponse
     */
    public function addComment(Request $request, $postId)
    {
        $request->validate([
            'content' => 'required|string|max:500',
            'parent_id' => 'nullable'
        ]);

        $me = $request->user();
        $myIdStr = (string) ($me->_id ?? $me->id);
        
        $post = Post::with('user')->find($postId);
        if (!$post) return response()->json(['success' => false, 'message' => 'Post no encontrado'], 404);

        $postOwner = $post->user;
        if ($postOwner && (string) ($postOwner->_id ?? $postOwner->id) !== $myIdStr) {
            $privacy = $postOwner->privacy_comments ?? 'everyone';
            
            if ($privacy === 'none') {
                return response()->json(['success' => false, 'message' => 'Los comentarios están desactivados para esta publicación.'], 403);
            }
            
            if ($privacy === 'following') {
                $doesFollow = Follow::where('follower_id', (string) ($postOwner->_id ?? $postOwner->id))
                    ->where('followed_id', $myIdStr)
                    ->where('status', 'accepted')
                    ->exists();
                    
                if (!$doesFollow) {
                    return response()->json(['success' => false, 'message' => 'Solo las personas a las que sigue este usuario pueden comentar.'], 403);
                }
            }
        }

        $content = $request->input('content');
        $parentId = $request->input('parent_id');

        $comment = Comment::create([
            'user_id' => $me->_id,
            'post_id' => $postId,
            'content' => $content,
            'parent_id' => $parentId
        ]);

        $parentUserId = null;

        if ($parentId) {
            $parentComment = Comment::find($parentId);
            if ($parentComment && $parentComment->user_id !== $me->_id) {
                $parentUserId = $parentComment->user_id;

                $notif = Notification::create([
                    'recipient_id' => $parentUserId,
                    'sender_id' => $me->_id,
                    'type' => 'reply',
                    'post_id' => $postId,
                    'comment_id' => $comment->_id,
                    'is_read' => false
                ]);

                try {
                    broadcast(new NotificationSent($notif));
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Error WS: ' . $e->getMessage());
                }
            }
        }

        preg_match_all('/@([a-zA-Z0-9_]+)/', $content, $matches);
        $usernamesInText = array_unique($matches[1]);

        foreach ($usernamesInText as $username) {
            $userToTag = User::where('username', $username)->first();

            if ($userToTag && $userToTag->_id !== $me->_id) {
                if ($parentUserId && (string) $userToTag->_id === (string) $parentUserId) {
                    continue;
                }

                $notif = Notification::create([
                    'recipient_id' => $userToTag->_id,
                    'sender_id' => $me->_id,
                    'type' => 'tag',
                    'post_id' => $postId,
                    'comment_id' => $comment->_id,
                    'is_read' => false
                ]);

                $notif->load(['sender', 'post']);

                try {
                    broadcast(new NotificationSent($notif));
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::error('Error WS: ' . $e->getMessage());
                }
            }
        }

        return response()->json([
            'success' => true,
            'comment' => $comment->load('user')
        ]);
    }

    /**
     * Toggle reaction on a comment.
     *
     * @param Request $request
     * @param mixed $commentId
     * @return \Illuminate\Http\JsonResponse
     */
    public function toggleCommentReaction(Request $request, $commentId)
    {
        $me = $request->user();
        $existing = CommentReaction::where('user_id', $me->_id)
            ->where('comment_id', $commentId)
            ->first();

        if ($existing) {
            $existing->delete();

            Notification::where('sender_id', $me->_id)
                ->where('comment_id', $commentId)
                ->where('type', 'comment_reaction')
                ->delete();

            return response()->json(['success' => true, 'reacted' => false]);
        }

        CommentReaction::create([
            'user_id' => $me->_id,
            'comment_id' => $commentId
        ]);

        $comment = Comment::find($commentId);

        if ($comment && $comment->user_id !== $me->_id) {
            $notif = Notification::create([
                'recipient_id' => $comment->user_id,
                'sender_id' => $me->_id,
                'type' => 'comment_reaction',
                'post_id' => $comment->post_id,
                'comment_id' => $comment->_id,
                'is_read' => false
            ]);

            $notif->load(['sender', 'post']);
            try {
                broadcast(new NotificationSent($notif));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Error WS: ' . $e->getMessage());
            }
        }

        return response()->json(['success' => true, 'reacted' => true]);
    }

    /**
     * Search users for mention suggestions.
     *
     * Prioritizes mutual followers in results.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function searchMentions(Request $request)
    {
        $query = ltrim($request->query('q', ''), '@');
        $me = $request->user();

        if (empty($query)) {
            return response()->json(['success' => true, 'users' => []]);
        }

        $followingIds = Follow::where('follower_id', $me->_id)->where('status', 'accepted')->pluck('followed_id')->toArray();
        $followerIds = Follow::where('followed_id', $me->_id)->where('status', 'accepted')->pluck('follower_id')->toArray();
        $mutualIds = array_intersect($followingIds, $followerIds);

        $users = User::where('username', 'like', "%{$query}%")
            ->where('_id', '!=', $me->_id)
            ->take(10)
            ->get(['_id', 'username', 'profile_picture', 'display_name']);

        $sortedUsers = $users->sortByDesc(function ($user) use ($mutualIds) {
            return in_array($user->_id, $mutualIds) ? 1 : 0;
        })->values();

        return response()->json([
            'success' => true,
            'users' => $sortedUsers
        ]);
    }

    /**
     * Retrieve replies for a specific comment.
     *
     * @param Request $request
     * @param mixed $commentId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getReplies(Request $request, $commentId)
    {
        $me = $request->user();

        $replies = Comment::with('user')
            ->where('parent_id', $commentId)
            ->orderBy('created_at', 'asc')
            ->get();

        $replies->transform(function ($reply) use ($me) {
            $reply->reactions_count = CommentReaction::where('comment_id', $reply->_id)->count();
            $reply->has_reacted = $me ? CommentReaction::where('comment_id', $reply->_id)->where('user_id', $me->_id)->exists() : false;
            return $reply;
        });

        return response()->json([
            'success' => true,
            'replies' => $replies
        ]);
    }

    /**
     * Toggle saving a post for the authenticated user.
     *
     * @param Request $request
     * @param mixed $postId
     * @return \Illuminate\Http\JsonResponse
     */
    public function toggleSave(Request $request, $postId)
    {
        $me = $request->user();
        $myId = (string) ($me->_id ?? $me->id);
        $postIdStr = (string) $postId;

        $existing = SavedPost::where('user_id', $myId)
            ->where('post_id', $postIdStr)
            ->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['success' => true, 'saved' => false]);
        } else {
            SavedPost::create([
                'user_id' => $myId,
                'post_id' => $postIdStr
            ]);
            return response()->json(['success' => true, 'saved' => true]);
        }
    }

    /**
     * Get saved posts for the authenticated user.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSavedPosts(Request $request)
    {
        $me = $request->user();
        $myId = (string) ($me->_id ?? $me->id);

        $saved = SavedPost::with('post.user')
            ->where('user_id', $myId)
            ->orderBy('created_at', 'desc')
            ->get();

        $posts = $saved->pluck('post')->filter();

        $posts->transform(function ($post) use ($myId) {
            $postId = (string) ($post->_id ?? $post->id);
            
            $post->reactions_count = Reaction::where('post_id', $postId)->count();
            $post->comments_count = Comment::where('post_id', $postId)->count();
            $post->has_reacted = Reaction::where('post_id', $postId)->where('user_id', $myId)->exists();
            $post->has_saved = true; 
            
            return $post;
        });

        return response()->json([
            'success' => true,
            'posts' => $posts->values()
        ]);
    }
}