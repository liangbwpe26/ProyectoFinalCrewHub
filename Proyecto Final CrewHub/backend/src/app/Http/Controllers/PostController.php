<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\User;
use App\Models\Follow;
use App\Models\Reaction;
use App\Models\Comment;
use App\Models\SavedPost;
use App\Models\Community;
use App\Models\Repost;
use App\Models\Notification;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'image' => 'nullable|image|max:5120',
            'original_post_id' => 'nullable|string',
            'description' => 'nullable|string|max:1000',
            'category' => 'nullable|string',
            'community_id' => 'nullable|string',
            'community_tag' => 'nullable|string'
        ]);

        if (!$request->hasFile('image') && !$request->filled('original_post_id')) {
            return response()->json(['success' => false, 'message' => 'Se requiere una imagen o un post original.'], 422);
        }

        $me = $request->user();
        $myId = (string) ($me->_id ?? $me->id);
        $communityId = $request->input('community_id');
        $status = 'approved';

        if ($communityId) {
            $community = Community::find($communityId);
            if ($community) {
                $admins = is_object($community->admins) ? (array) $community->admins : ($community->admins ?? []);
                if (!in_array($myId, $admins)) {
                    $status = 'pending';
                }
            }
        }

        $pathUrl = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('posts', 's3');
            $pathUrl = Storage::disk('s3')->url($path);
        }

        $post = Post::create([
            'user_id' => $myId,
            'community_id' => $communityId,
            'community_tag' => $request->input('community_tag'),
            'status' => $status,
            'image_path' => $pathUrl,
            'description' => $request->input('description'),
            'category' => $request->input('category'),
            'original_post_id' => $request->input('original_post_id'),
        ]);

        $post->load(['user', 'community', 'originalPost', 'originalPost.user']);

        return response()->json([
            'success' => true,
            'message' => $status === 'pending' ? 'Publicación enviada. Pendiente de aprobación.' : 'Publicación creada con éxito',
            'post' => $post,
            'status' => $status
        ]);
    }

    public function index(Request $request)
    {
        $me = $request->user();
        $myIdStr = $me ? (string) ($me->_id ?? $me->id) : null;

        $filter = $request->query('filter', 'all');
        $communityId = $request->query('community_id');
        $communityTag = $request->query('community_tag');
        $offset = (int) $request->query('offset', 0);
        $limit = 10;

        $postsQuery = Post::with(['user', 'community', 'originalPost', 'originalPost.user'])
            ->where(function ($query) {
                $query->where('status', 'approved')->orWhereNull('status');
            })
            ->where('is_hidden', '!=', true)
            ->orderBy('created_at', 'desc');

        if ($communityId) {
            $postsQuery->where('community_id', $communityId);
            if ($communityTag) {
                $postsQuery->where('community_tag', $communityTag);
            }
        }
        else {
            $followingIds = Follow::where('follower_id', $myIdStr)
                ->where('status', 'accepted')
                ->pluck('followed_id')
                ->toArray();
            $followingIds[] = $myIdStr;

            if ($filter === 'following') {
                $myCommunities = Community::where('members', $myIdStr)->pluck('_id')->toArray();
                $postsQuery->where(function ($query) use ($followingIds, $myCommunities) {
                    $query->where(function ($subQ) use ($followingIds) {
                        $subQ->whereNull('community_id')
                            ->whereIn('user_id', $followingIds);
                    })->orWhereIn('community_id', $myCommunities);
                });

            } else {
                $publicUsersIds = User::where('is_private', false)
                    ->orWhereNull('is_private')
                    ->pluck('_id')
                    ->toArray();

                $allowedUserIds = array_values(array_unique(array_merge($publicUsersIds, $followingIds)));

                $postsQuery->where(function ($query) use ($allowedUserIds) {
                    $query->where(function ($subQ) use ($allowedUserIds) {
                        $subQ->whereNull('community_id')
                            ->whereIn('user_id', $allowedUserIds);
                    })->orWhereNotNull('community_id');
                });
            }
        }

        $totalPosts = $postsQuery->count();
        $posts = $postsQuery->skip($offset)->take($limit)->get();

        $posts->transform(function ($post) use ($myIdStr) {
            $postId = (string) ($post->_id ?? $post->id);
            $post->reactions_count = Reaction::where('post_id', $postId)->count();
            $post->comments_count = Comment::where('post_id', $postId)->count();
            
            if ($myIdStr) {
                $post->has_reacted = Reaction::where('post_id', $postId)->where('user_id', $myIdStr)->exists();
                $post->has_saved = SavedPost::where('post_id', $postId)->where('user_id', $myIdStr)->exists();
                $post->has_reposted = Repost::where('post_id', $postId)->where('user_id', $myIdStr)->exists();
            }

            if ($post->user) {
                $post->user->is_verified = $post->user->is_verified ?? false;
            }

            $post->is_ad = false; 
            return $post;
        });

        $feed = collect();
        $adPosts = collect();

        if (!$communityId && $posts->count() > 0) {

            $businessUsersIds = User::where('is_business', true)
                ->whereNotNull('ad_plan')
                ->pluck('_id')
                ->toArray();

            if (!empty($businessUsersIds)) {
                $neededAds = ceil($posts->count() / 4);

                $adPosts = Post::with(['user', 'community'])
                    ->whereIn('user_id', $businessUsersIds)
                    ->where(function ($query) {
                        $query->where('status', 'approved')->orWhereNull('status');
                    })
                    ->inRandomOrder()
                    ->take($neededAds)
                    ->get();

                $adPosts->transform(function ($ad) use ($myIdStr) {
                    $adId = (string) ($ad->_id ?? $ad->id);
                    $ad->reactions_count = Reaction::where('post_id', $adId)->count();
                    $ad->comments_count = Comment::where('post_id', $adId)->count();
                    if ($myIdStr) {
                        $ad->has_reacted = Reaction::where('post_id', $adId)->where('user_id', $myIdStr)->exists();
                        $ad->has_saved = SavedPost::where('post_id', $adId)->where('user_id', $myIdStr)->exists();
                        $ad->has_reposted = Repost::where('post_id', $adId)->where('user_id', $myIdStr)->exists();
                    }
                    $ad->is_ad = true;
                    return $ad;
                });
            }
        }

        $adIndex = 0;
        foreach ($posts as $index => $post) {
            $feed->push($post);

            if (($index + 1) % 4 == 0 && $adIndex < $adPosts->count()) {
                $feed->push($adPosts[$adIndex]);
                $adIndex++;
            }
        }

        return response()->json([
            'success' => true,
            'posts' => $feed,
            'hasMore' => ($offset + $limit) < $totalPosts
        ]);
    }

    public function show(Request $request, $id)
    {
        $me = $request->user();
        $post = Post::with(['user', 'community'])->find($id);

        if (!$post)
            return response()->json(['success' => false, 'message' => 'No encontrado'], 404);

        $post->reactions_count = Reaction::where('post_id', $post->_id)->count();
        $post->has_reacted = $me ? Reaction::where('post_id', $post->_id)->where('user_id', $me->_id)->exists() : false;
        $post->has_saved = $me ? SavedPost::where('post_id', $post->_id)->where('user_id', $me->_id)->exists() : false;
        $post->comments_count = Comment::where('post_id', $post->_id)->count();

        if ($post->user) {
            $post->user->is_verified = $post->user->is_verified ?? false;
        }

        return response()->json(['success' => true, 'post' => $post]);
    }

    public function update(Request $request, $id)
    {
        $post = Post::find($id);
        if (!$post)
            return response()->json(['success' => false, 'message' => 'No encontrado'], 404);

        if ((string) $post->user_id !== (string) $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $request->validate(['description' => 'nullable|string|max:1000']);
        $post->description = $request->input('description');
        $post->save();

        return response()->json(['success' => true, 'post' => $post]);
    }

    public function destroy(Request $request, $id)
    {
        $post = Post::find($id);
        if (!$post)
            return response()->json(['success' => false], 404);

        $me = $request->user();
        $myId = (string) ($me->_id ?? $me->id);
        
        $isOwner = ((string) $post->user_id === $myId);
        $isAdminOfCommunity = false;
        $isPlatformAdmin = ($me->is_admin || $me->username === 'liangbw_');

        if ($post->community_id) {
            $community = Community::find($post->community_id);
            if ($community) {
                $admins = is_object($community->admins) ? (array) $community->admins : ($community->admins ?? []);
                if (in_array($myId, $admins)) {
                    $isAdminOfCommunity = true;
                }
            }
        }

        if (!$isOwner && !$isAdminOfCommunity && !$isPlatformAdmin) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        if ($isPlatformAdmin && !$isOwner) {
            $infractor = User::find($post->user_id);
            if ($infractor) {
                $infractor->strikes = ($infractor->strikes ?? 0) + 1;
                
                if ($infractor->strikes >= 3) {
                    $infractor->is_banned = true;
                }
                $infractor->save();

                Notification::create([
                    'recipient_id' => $infractor->_id,
                    'sender_id' => $myId,
                    'type' => 'strike_warning',
                    'is_read' => false
                ]);
            }
        }

        $post->delete();
        return response()->json(['success' => true]);
    }

    public function userReposts(Request $request, $username)
    {
        $user = User::where('username', $username)->first();
        if (!$user)
            return response()->json(['success' => false], 404);

        $repostIds = Repost::where('user_id', (string) $user->_id)->pluck('post_id')->toArray();

        $posts = Post::with(['user', 'community'])
            ->whereIn('_id', $repostIds)
            ->orderBy('created_at', 'desc')
            ->get();

        $me = $request->user();
        $myIdStr = $me ? (string) ($me->_id ?? $me->id) : null;

        $posts->transform(function ($post) use ($myIdStr) {
            $postId = (string) ($post->_id ?? $post->id);
            $post->reactions_count = Reaction::where('post_id', $postId)->count();
            $post->comments_count = Comment::where('post_id', $postId)->count();
            if ($myIdStr) {
                $post->has_reacted = Reaction::where('post_id', $postId)->where('user_id', $myIdStr)->exists();
                $post->has_saved = SavedPost::where('post_id', $postId)->where('user_id', $myIdStr)->exists();
                $post->has_reposted = Repost::where('post_id', $postId)->where('user_id', $myIdStr)->exists();
            }
            return $post;
        });

        return response()->json(['success' => true, 'posts' => $posts]);
    }

    public function toggleRepost(Request $request, $id)
    {
        $me = $request->user();
        $myId = (string) ($me->_id ?? $me->id);

        $repost = Repost::where('post_id', $id)
            ->where('user_id', $myId)
            ->first();

        if ($repost) {
            $repost->delete();
            return response()->json(['success' => true, 'status' => 'removed']);
        } else {
            Repost::create([
                'user_id' => $myId,
                'post_id' => $id
            ]);
            return response()->json(['success' => true, 'status' => 'added']);
        }
    }
}