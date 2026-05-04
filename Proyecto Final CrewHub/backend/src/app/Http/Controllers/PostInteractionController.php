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

class PostInteractionController extends Controller
{
    /**
     * 1. REACCIÓN A LA PUBLICACIÓN (Carita Feliz)
     */
    public function toggleReaction(Request $request, $postId)
    {
        $me = $request->user();

        $existingReaction = Reaction::where('user_id', $me->_id)
            ->where('post_id', $postId)
            ->first();

        if ($existingReaction) {
            $existingReaction->delete();
            return response()->json(['success' => true, 'reacted' => false]);
        } else {
            Reaction::create([
                'user_id' => $me->_id,
                'post_id' => $postId
            ]);
            return response()->json(['success' => true, 'reacted' => true]);
        }
    }

    /**
     * 2. OBTENER COMENTARIOS (Con Paginación de 5 en 5)
     */
    public function getComments(Request $request, $postId)
    {
        $me = $request->user();
        
        // Obtenemos desde dónde empezar (0 por defecto) y el límite (5)
        $offset = (int) $request->query('offset', 0);
        $limit = 5;

        // Preparamos la consulta base
        $query = Comment::with(['user'])
            ->where('post_id', $postId)
            ->whereNull('parent_id')
            ->orderBy('created_at', 'desc');

        // Contamos cuántos comentarios principales hay en total
        $totalCount = $query->count();

        // Traemos solo los 5 que tocan
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
            // Enviamos un booleano al frontend para saber si aún quedan más por cargar
            'hasMore' => ($offset + $limit) < $totalCount 
        ]);
    }

    /**
     * 3. AGREGAR COMENTARIO O RESPUESTA + DETECTAR @ETIQUETAS
     */
    public function addComment(Request $request, $postId)
    {
        $request->validate([
            'content' => 'required|string|max:500',
            'parent_id' => 'nullable'
        ]);

        $me = $request->user();
        $content = $request->input('content');
        $parentId = $request->input('parent_id');

        // 1. Crear el comentario
        $comment = Comment::create([
            'user_id' => $me->_id,
            'post_id' => $postId,
            'content' => $content,
            'parent_id' => $parentId
        ]);

        $parentUserId = null;

        // 2. NOTIFICACIÓN POR RESPUESTA
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

                // Disparar WebSocket para la respuesta
                broadcast(new NotificationSent($notif));
            }
        }

        // 3. NOTIFICACIONES POR ETIQUETA (@username)
        preg_match_all('/@([a-zA-Z0-9_]+)/', $content, $matches);
        $usernamesInText = array_unique($matches[1]);

        foreach ($usernamesInText as $username) {
            $userToTag = User::where('username', $username)->first();

            if ($userToTag && $userToTag->_id !== $me->_id) {
                // No repetir si ya notificamos por respuesta
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

                // Disparar WebSocket para la etiqueta
                broadcast(new NotificationSent($notif));
            }
        }

        return response()->json([
            'success' => true,
            'comment' => $comment->load('user')
        ]);
    }

    /**
     * 4. REACCIONAR A UN COMENTARIO (Carita Feliz en Comentarios)
     */
    public function toggleCommentReaction(Request $request, $commentId)
    {
        $me = $request->user();
        $existing = CommentReaction::where('user_id', $me->_id)
            ->where('comment_id', $commentId)
            ->first();

        if ($existing) {
            // Si ya reaccionó, la quitamos
            $existing->delete();

            // BONUS: Borramos la notificación para no confundir al usuario
            Notification::where('sender_id', $me->_id)
                ->where('comment_id', $commentId)
                ->where('type', 'comment_reaction')
                ->delete();

            return response()->json(['success' => true, 'reacted' => false]);
        }

        // Si no ha reaccionado, la creamos
        CommentReaction::create([
            'user_id' => $me->_id,
            'comment_id' => $commentId
        ]);

        // --- MAGIA NUEVA: CREAR NOTIFICACIÓN ---
        $comment = Comment::find($commentId);

        // Solo notificamos si el comentario existe y NO es de nosotros mismos
        if ($comment && $comment->user_id !== $me->_id) {
            Notification::create([
                'recipient_id' => $comment->user_id,
                'sender_id' => $me->_id,
                'type' => 'comment_reaction', // Nuevo tipo de notificación
                'post_id' => $comment->post_id,
                'comment_id' => $comment->_id,
                'is_read' => false
            ]);

            
        }

        return response()->json(['success' => true, 'reacted' => true]);
    }

    /**
     * 5. BUSCADOR DE MENCIONES (@)
     * Prioriza amigos mutuos en los resultados.
     */
    public function searchMentions(Request $request)
    {
        $query = ltrim($request->query('q', ''), '@');
        $me = $request->user();

        if (empty($query)) {
            return response()->json(['success' => true, 'users' => []]);
        }

        // Obtener IDs de amigos mutuos
        $followingIds = Follow::where('follower_id', $me->_id)->where('status', 'accepted')->pluck('followed_id')->toArray();
        $followerIds = Follow::where('followed_id', $me->_id)->where('status', 'accepted')->pluck('follower_id')->toArray();
        $mutualIds = array_intersect($followingIds, $followerIds);

        // Buscar usuarios por username
        $users = User::where('username', 'like', "%{$query}%")
            ->where('_id', '!=', $me->_id)
            ->take(10)
            ->get(['_id', 'username', 'profile_picture', 'display_name']);

        // Ordenar: Amigos mutuos arriba
        $sortedUsers = $users->sortByDesc(function ($user) use ($mutualIds) {
            return in_array($user->_id, $mutualIds) ? 1 : 0;
        })->values();

        return response()->json([
            'success' => true,
            'users' => $sortedUsers
        ]);
    }

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
}