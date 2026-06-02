<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Story;
use App\Models\User;
use App\Models\Follow;
use Carbon\Carbon;
use App\Models\Community;
use Illuminate\Support\Facades\Storage;
use MongoDB\BSON\ObjectId;

class StoryController extends Controller
{
    // FUNCIÓN AUXILIAR PARA EVITAR ERRORES DE STRING vs ARRAY EN MONGODB
    private function safeArray($value) {
        if (is_array($value)) return $value;
        if (is_object($value)) return (array) $value;
        if (is_string($value) && json_decode($value, true)) return json_decode($value, true);
        if (empty($value)) return [];
        return [$value]; 
    }

    // 1. SUBIR UNA HISTORIA
    public function store(Request $request)
    {
        $request->validate([
            'media' => 'required|file|mimes:jpeg,png,jpg,mp4,mov|max:10240',
            'community_id' => 'nullable|string'
        ]);

        $me = $request->user();
        $myId = (string) ($me->_id ?? $me->id);
        $communityId = $request->input('community_id');

        if ($communityId) {
            $community = Community::find($communityId);
            if (!$community)
                return response()->json(['success' => false, 'message' => 'Comunidad no encontrada'], 404);
            
            $admins = $this->safeArray($community->admins);
            
            if (!in_array($myId, $admins)) {
                return response()->json(['success' => false, 'message' => 'Solo los administradores pueden subir historias.'], 403);
            }
        }

        $file = $request->file('media');
        $extension = $file->getClientOriginalExtension();
        $type = in_array(strtolower($extension), ['mp4', 'mov']) ? 'video' : 'image';

        // S3 Upload
        $path = $file->store('stories', 's3');

        $story = Story::create([
            'user_id' => $myId,
            'community_id' => $communityId,
            'media_path' => Storage::disk('s3')->url($path),
            'media_type' => $type,
            'expires_at' => Carbon::now()->addHours(24),
            'viewed_by' => [],
            'liked_by' => []
        ]);

        return response()->json(['success' => true, 'story' => $story]);
    }

    // 2. OBTENER LA BARRA DE HISTORIAS SUPERIOR
    public function feed(Request $request)
    {
        $me = $request->user();
        $myIdStr = (string) ($me->_id ?? $me->id);

        $myMixedIds = [$myIdStr];
        try { $myMixedIds[] = new ObjectId($myIdStr); } catch (\Exception $e) {}

        $followingIds = Follow::whereIn('follower_id', $myMixedIds)
            ->where('status', 'accepted')
            ->pluck('followed_id')
            ->toArray();
        $followingIds[] = $myIdStr;

        $allowedUserIds = [];
        foreach ($followingIds as $id) {
            $allowedUserIds[] = (string)$id;
            try { $allowedUserIds[] = new ObjectId((string)$id); } catch (\Exception $e) {}
        }
        $allowedUserIds = array_values(array_unique($allowedUserIds));

        $myCommunitiesIds = Community::whereIn('members', $myMixedIds)
            ->pluck('_id')
            ->toArray();

        $allowedCommunityIds = [];
        foreach ($myCommunitiesIds as $id) {
            $allowedCommunityIds[] = (string)$id;
            try { $allowedCommunityIds[] = new ObjectId((string)$id); } catch (\Exception $e) {}
        }
        $allowedCommunityIds = array_values(array_unique($allowedCommunityIds));

        // SOLUCIÓN ZONAS HORARIAS: Filtramos por la fecha de expiración para que no se oculten
        $stories = Story::with(['user', 'community'])
            ->where('expires_at', '>', Carbon::now())
            ->where(function ($query) use ($allowedUserIds, $allowedCommunityIds) {
                $query->whereIn('user_id', $allowedUserIds);
                if (!empty($allowedCommunityIds)) {
                    $query->orWhereIn('community_id', $allowedCommunityIds);
                }
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $stories->transform(function ($story) {
            $story->viewed_by = $this->safeArray($story->viewed_by);
            $story->liked_by = $this->safeArray($story->liked_by);
            return $story;
        });

        return response()->json([
            'success' => true,
            'stories' => $stories
        ]);
    }

    // 3. OBTENER LAS HISTORIAS AGRUPADAS AL HACER CLIC
    public function getFeedStories(Request $request)
    {
        $me = $request->user();
        $myIdStr = (string) ($me->_id ?? $me->id);
        
        $myMixedIds = [$myIdStr];
        try { $myMixedIds[] = new ObjectId($myIdStr); } catch (\Exception $e) {}

        $followingIds = Follow::whereIn('follower_id', $myMixedIds)
            ->where('status', 'accepted')
            ->pluck('followed_id')
            ->toArray();
        $followingIds[] = $myIdStr;

        $allowedUserIds = [];
        foreach ($followingIds as $id) {
            $allowedUserIds[] = (string)$id;
            try { $allowedUserIds[] = new ObjectId((string)$id); } catch (\Exception $e) {}
        }
        $allowedUserIds = array_values(array_unique($allowedUserIds));

        $myCommunitiesIds = Community::whereIn('members', $myMixedIds)
            ->pluck('_id')
            ->toArray();

        $allowedCommunityIds = [];
        foreach ($myCommunitiesIds as $id) {
            $allowedCommunityIds[] = (string)$id;
            try { $allowedCommunityIds[] = new ObjectId((string)$id); } catch (\Exception $e) {}
        }
        $allowedCommunityIds = array_values(array_unique($allowedCommunityIds));

        // SOLUCIÓN ZONAS HORARIAS APLICADA
        $activeStories = Story::with(['user', 'community'])
            ->where('expires_at', '>', Carbon::now())
            ->where(function ($query) use ($allowedUserIds, $allowedCommunityIds) {
                $query->whereIn('user_id', $allowedUserIds);
                if (!empty($allowedCommunityIds)) {
                    $query->orWhereIn('community_id', $allowedCommunityIds);
                }
            })
            ->orderBy('created_at', 'asc')
            ->get();

        $groupedStories = [];

        foreach ($activeStories as $story) {
            $userId = (string) $story->user_id;

            if (!isset($groupedStories[$userId])) {
                $groupedStories[$userId] = [
                    'user' => $story->user,
                    'stories' => [],
                    'all_viewed' => true
                ];
            }

            $viewedBy = $this->safeArray($story->viewed_by);
            $hasViewed = in_array($myIdStr, $viewedBy);

            if (!$hasViewed) {
                $groupedStories[$userId]['all_viewed'] = false;
            }

            $likedBy = $this->safeArray($story->liked_by);

            $storyArray = $story->toArray();
            $storyArray['viewed_by'] = $viewedBy;
            $storyArray['liked_by'] = $likedBy;
            $storyArray['has_viewed'] = $hasViewed;
            $storyArray['has_liked'] = in_array($myIdStr, $likedBy);
            $storyArray['likes_count'] = count($likedBy);

            $groupedStories[$userId]['stories'][] = $storyArray;
        }

        $finalArray = array_values($groupedStories);

        usort($finalArray, function ($a, $b) use ($myIdStr) {
            if ((string) $a['user']['_id'] === $myIdStr) return -1;
            if ((string) $b['user']['_id'] === $myIdStr) return 1;
            return $a['all_viewed'] <=> $b['all_viewed'];
        });

        return response()->json([
            'success' => true,
            'feed' => $finalArray
        ]);
    }

    // 4. MARCAR HISTORIA COMO VISTA
    public function markAsViewed(Request $request, $storyId)
    {
        $me = $request->user();
        $myId = (string) ($me->_id ?? $me->id);

        $story = Story::find($storyId);

        if ($story) {
            $viewedBy = $this->safeArray($story->viewed_by);

            if (!in_array($myId, $viewedBy)) {
                $viewedBy[] = $myId;
                $story->forceFill(['viewed_by' => array_values($viewedBy)])->save();
            }
        }

        return response()->json(['success' => true]);
    }

    // 5. ELIMINAR HISTORIA
    public function destroy(Request $request, $id)
    {
        $me = $request->user();
        $myId = (string) ($me->_id ?? $me->id);

        $story = Story::find($id);

        if (!$story)
            return response()->json(['success' => false], 404);

        if ((string) $story->user_id !== $myId) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $story->delete();

        return response()->json(['success' => true]);
    }

    // 6. TOGGLE LIKE
    public function toggleLike(Request $request, $id)
    {
        $me = $request->user();
        $myId = (string) ($me->_id ?? $me->id);
        $story = Story::find($id);

        if (!$story)
            return response()->json(['success' => false], 404);

        $likedBy = $this->safeArray($story->liked_by);
        $isLiked = in_array($myId, $likedBy);

        if ($isLiked) {
            $likedBy = array_values(array_diff($likedBy, [$myId]));
            \App\Models\Notification::where('sender_id', $myId)
                ->where('story_id', $story->_id)
                ->where('type', 'story_reaction')
                ->delete();
        } else {
            $likedBy[] = $myId;

            if ((string) $story->user_id !== $myId) {
                $notif = \App\Models\Notification::create([
                    'recipient_id' => $story->user_id,
                    'sender_id' => $myId,
                    'type' => 'story_reaction',
                    'story_id' => $story->_id,
                    'is_read' => false
                ]);
                $notif->load('sender');
                broadcast(new \App\Events\NotificationSent($notif));
            }
        }

        $story->forceFill(['liked_by' => array_values($likedBy)])->save();
        return response()->json(['success' => true, 'reacted' => !$isLiked]);
    }

    // 7. OBTENER ESTADÍSTICAS DE LA HISTORIA (Solo para el dueño)
    public function getStats(Request $request, $id)
    {
        $me = $request->user();
        $story = Story::find($id);

        if (!$story)
            return response()->json(['success' => false], 404);

        if ((string) $story->user_id !== (string) ($me->_id ?? $me->id)) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $viewedByIds = $this->safeArray($story->viewed_by);
        $likedByIds = $this->safeArray($story->liked_by);

        $viewers = User::whereIn('_id', $viewedByIds)->get(['_id', 'username', 'profile_picture', 'display_name']);

        $viewers->transform(function ($user) use ($likedByIds) {
            $user->has_liked = in_array((string) $user->_id, $likedByIds);
            return $user;
        });

        $sortedViewers = $viewers->sortByDesc('has_liked')->values();

        return response()->json([
            'success' => true,
            'viewers' => $sortedViewers,
            'views_count' => count($viewedByIds),
            'likes_count' => count($likedByIds)
        ]);
    }
}