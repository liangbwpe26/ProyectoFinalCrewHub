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

/**
 * Controlador para manejar historias de usuarios y comunidades.
 */
class StoryController extends Controller
{
    /**
     * Convierte un valor en un arreglo seguro.
     *
     * @param mixed $value Valor a normalizar.
     * @return array Arreglo normalizado.
     */
    private function safeArray($value) {
        if (is_array($value)) return $value;
        if (is_object($value)) return json_decode(json_encode($value), true);
        if (is_string($value) && json_decode($value, true)) return json_decode($value, true);
        if (empty($value)) return [];
        return [$value]; 
    }

    public function store(Request $request)
    {
        $request->validate([
            'media' => 'required|file|mimes:jpeg,png,jpg,mp4,mov|max:10240',
        ]);

        $me = $request->user();
        $myId = (string) ($me->_id ?? $me->id);
        
        $rawSlug = (string) $request->input('community_slug');
        $rawId = (string) $request->input('community_id');
        
        // Normaliza parámetros de comunidad para evitar caracteres no válidos
        $communitySlug = preg_replace('/[^a-zA-Z0-9_-]/', '', $rawSlug);
        $communityId = preg_replace('/[^a-zA-Z0-9_-]/', '', $rawId);

        if (!empty($communityId) || !empty($communitySlug)) {
            $community = null;

            $allCommunities = Community::all();
            
            foreach ($allCommunities as $c) {
                $dbSlug = preg_replace('/[^a-zA-Z0-9_-]/', '', (string)$c->slug);
                $dbId = preg_replace('/[^a-zA-Z0-9_-]/', '', (string)($c->_id ?? $c->id));
                
                if ((!empty($communitySlug) && $dbSlug === $communitySlug) || 
                    (!empty($communityId) && $dbId === $communityId)) {
                    $community = $c;
                    break;
                }
            }

            if (!$community) {
                return response()->json(['success' => false, 'message' => 'Comunidad no encontrada a pesar de la limpieza.'], 404);
            }
            
            $admins = $this->safeArray($community->admins);
            
            // Verifica si el usuario actual está en la lista de administradores
            if (!in_array($myId, $admins)) {
                return response()->json(['success' => false, 'message' => 'Solo los administradores pueden subir historias.'], 403);
            }
            
            $communityId = (string) ($community->_id ?? $community->id);
        }

        $file = $request->file('media');
        $extension = $file->getClientOriginalExtension();
        $type = in_array(strtolower($extension), ['mp4', 'mov']) ? 'video' : 'image';

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

    /**
     * Obtiene las historias activas para el feed del usuario.
     *
     * Incluye historias propias, de usuarios seguidos y de comunidades
     * a las que pertenece o administra.
     *
     * @param Request $request Petición HTTP con el usuario autenticado.
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFeedStories(Request $request)
    {
        $me = $request->user();
        $myIdStr = (string) ($me->_id ?? $me->id);

        $allFollows = Follow::where('follower_id', $myIdStr)->where('status', 'accepted')->get();
        $allowedUserIds = [$myIdStr];
        foreach ($allFollows as $f) {
            $allowedUserIds[] = (string)$f->followed_id;
        }

        // Construye lista de comunidades a las que el usuario pertenece o administra
        $allCommunities = Community::all();
        $allowedCommunityIds = [];
        foreach ($allCommunities as $c) {
            $members = $this->safeArray($c->members);
            $admins = $this->safeArray($c->admins);
            
            if (in_array($myIdStr, $members) || in_array($myIdStr, $admins)) {
                $allowedCommunityIds[] = (string)($c->_id ?? $c->id);
            }
        }

        $recentStories = Story::with(['user', 'community'])
            ->where('created_at', '>=', Carbon::now()->subHours(24))
            ->orderBy('created_at', 'asc')
            ->get();

        $groupedStories = [];

        foreach ($recentStories as $story) {
            if (Carbon::parse($story->expires_at)->isPast()) continue;

            $isCommunity = !empty($story->community_id);
            
            if ($isCommunity) {
                if (!in_array((string)$story->community_id, $allowedCommunityIds)) continue;
                $entityId = 'c_' . $story->community_id;
                
                if (!$story->community) {
                    $story->community = Community::find($story->community_id);
                }
            } else {
                if (!in_array((string)$story->user_id, $allowedUserIds)) continue;
                $entityId = 'u_' . $story->user_id;
            }

            if (!isset($groupedStories[$entityId])) {
                if ($isCommunity && $story->community) {
                    $pseudoUser = [
                        '_id' => (string) $story->community->_id,
                        'id' => (string) $story->community->_id,
                        'username' => $story->community->slug ?? $story->community->name,
                        'display_name' => $story->community->name,
                        'profile_picture' => $story->community->avatar_path ?? null,
                        'is_community' => true,
                        'slug' => $story->community->slug ?? null
                    ];
                } else {
                    $pseudoUser = $story->user ? $story->user->toArray() : [];
                }

                $groupedStories[$entityId] = [
                    'user' => $pseudoUser,
                    'is_community' => $isCommunity,
                    'community' => $isCommunity ? $story->community : null,
                    'stories' => [],
                    'all_viewed' => true
                ];
            }

            $viewedBy = $this->safeArray($story->viewed_by);
            $hasViewed = in_array($myIdStr, $viewedBy);

            if (!$hasViewed) {
                $groupedStories[$entityId]['all_viewed'] = false;
            }

            $likedBy = $this->safeArray($story->liked_by);

            $storyArray = $story->toArray();
            $storyArray['viewed_by'] = $viewedBy;
            $storyArray['liked_by'] = $likedBy;
            $storyArray['has_viewed'] = $hasViewed;
            $storyArray['has_liked'] = in_array($myIdStr, $likedBy);
            $storyArray['likes_count'] = count($likedBy);

            $groupedStories[$entityId]['stories'][] = $storyArray;
        }

        $finalArray = array_values($groupedStories);

        usort($finalArray, function ($a, $b) use ($myIdStr) {
            $isMe = (!$a['is_community'] && (string) ($a['user']['_id'] ?? '') === $myIdStr);
            $isOtherMe = (!$b['is_community'] && (string) ($b['user']['_id'] ?? '') === $myIdStr);
            
            if ($isMe) return -1;
            if ($isOtherMe) return 1;
            
            return $a['all_viewed'] <=> $b['all_viewed'];
        });

        return response()->json([
            'success' => true,
            'feed' => $finalArray
        ]);
    }

    /**
     * Marca una historia como vista por el usuario actual.
     *
     * @param Request $request Petición HTTP con el usuario autenticado.
     * @param string $storyId Identificador de la historia.
     * @return \Illuminate\Http\JsonResponse
     */
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

    /**
     * Elimina una historia si el usuario actual es su propietario.
     *
     * @param Request $request Petición HTTP con el usuario autenticado.
     * @param string $id Identificador de la historia.
     * @return \Illuminate\Http\JsonResponse
     */
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

    /**
     * Alterna el like de la historia para el usuario actual.
     *
     * @param Request $request Petición HTTP con el usuario autenticado.
     * @param string $id Identificador de la historia.
     * @return \Illuminate\Http\JsonResponse
     */
    public function toggleLike(Request $request, $id)
    {
        $me = $request->user();
        $myId = (string) ($me->_id ?? $me->id);
        $story = Story::find($id);

        if (!$story) return response()->json(['success' => false], 404);

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

    /**
     * Obtiene estadísticas de la historia y lista de usuarios que la vieron.
     *
     * @param Request $request Petición HTTP con el usuario autenticado.
     * @param string $id Identificador de la historia.
     * @return \Illuminate\Http\JsonResponse
     */
    public function getStats(Request $request, $id)
    {
        $me = $request->user();
        $story = Story::find($id);

        if (!$story) return response()->json(['success' => false], 404);

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