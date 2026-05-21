<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Story;
use App\Models\User;
use App\Models\Follow;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

class StoryController extends Controller
{
    // 1. SUBIR UNA HISTORIA
    public function store(Request $request)
    {
        $request->validate([
            'media' => 'required|file|mimes:jpeg,png,jpg,mp4,mov|max:10240', // Max 10MB
        ]);

        $me = $request->user();
        $file = $request->file('media');
        
        $extension = $file->getClientOriginalExtension();
        $type = in_array(strtolower($extension), ['mp4', 'mov']) ? 'video' : 'image';
        
        // Guardamos el archivo en la carpeta public/stories
        $path = $file->store('stories', 'public');

        $story = Story::create([
            'user_id' => $me->_id ?? $me->id,
            'media_path' => '/storage/' . $path,
            'media_type' => $type,
            'expires_at' => Carbon::now()->addHours(8), // Caduca exactamente en 8 horas
            'viewed_by' => [],
        ]);

        return response()->json([
            'success' => true,
            'story' => $story
        ]);
    }

    // 2. OBTENER LAS HISTORIAS DEL FEED
    public function getFeedStories(Request $request)
    {
        $me = $request->user();
        $myId = (string) ($me->_id ?? $me->id);

        // Obtenemos a quiénes sigo
        $followingIds = Follow::where('follower_id', $myId)
            ->where('status', 'accepted')
            ->pluck('followed_id')
            ->toArray();
            
        // Incluimos mi propio ID para ver mis propias historias
        $followingIds[] = $myId;

        // Buscamos historias activas (expires_at en el futuro)
        $activeStories = Story::with('user')
            ->whereIn('user_id', $followingIds)
            ->where('expires_at', '>', Carbon::now())
            ->orderBy('created_at', 'asc')
            ->get();

        // Agrupamos las historias por usuario para que React las pueda renderizar fácilmente
        $groupedStories = [];

        foreach ($activeStories as $story) {
            $userId = (string) $story->user_id;
            
            if (!isset($groupedStories[$userId])) {
                $groupedStories[$userId] = [
                    'user' => $story->user,
                    'stories' => [],
                    'all_viewed' => true // Asumimos que están vistas hasta demostrar lo contrario
                ];
            }

            // Sanitizar el arreglo de vistas para MongoDB
            $viewedBy = $story->viewed_by ?? [];
            if (is_object($viewedBy)) $viewedBy = (array) $viewedBy;

            $hasViewed = in_array($myId, $viewedBy);

            if (!$hasViewed) {
                $groupedStories[$userId]['all_viewed'] = false;
            }

            // Sanitizar el arreglo de likes para MongoDB
            $likedBy = $story->liked_by ?? [];
            if (is_object($likedBy)) $likedBy = (array) $likedBy;

            $storyArray = $story->toArray();
            $storyArray['has_viewed'] = $hasViewed;
            $storyArray['has_liked'] = in_array($myId, $likedBy);
            $storyArray['likes_count'] = count($likedBy);
            
            $groupedStories[$userId]['stories'][] = $storyArray;
        }

        // Ordenamos: Primero los usuarios con historias NO vistas, luego los que ya vimos
        $finalArray = array_values($groupedStories);
        usort($finalArray, function ($a, $b) use ($myId) {
            // Mis historias siempre van primero a la izquierda
            if ((string) $a['user']['_id'] === $myId) return -1;
            if ((string) $b['user']['_id'] === $myId) return 1;
            
            // Luego ordenamos por estado de visualización
            return $a['all_viewed'] <=> $b['all_viewed'];
        });

        return response()->json([
            'success' => true,
            'feed' => $finalArray
        ]);
    }

    // 3. MARCAR HISTORIA COMO VISTA
    public function markAsViewed(Request $request, $storyId)
    {
        $me = $request->user();
        $myId = (string) ($me->_id ?? $me->id);
        
        $story = Story::find($storyId);
        
        if ($story) {
            $viewedBy = $story->viewed_by ?? [];
            if (is_object($viewedBy)) $viewedBy = (array) $viewedBy;
            
            if (!in_array($myId, $viewedBy)) {
                $viewedBy[] = $myId;
                $story->forceFill(['viewed_by' => array_values($viewedBy)])->save();
            }
        }

        return response()->json(['success' => true]);
    }

    // 4. ELIMINAR HISTORIA
    public function destroy(Request $request, $id)
    {
        $me = $request->user();
        $myId = (string) ($me->_id ?? $me->id);
        
        $story = Story::find($id);

        if (!$story) return response()->json(['success' => false], 404);

        if ((string)$story->user_id !== $myId) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        // Opcional: Eliminar archivo del disco si lo deseas
        // \Illuminate\Support\Facades\Storage::disk('public')->delete(str_replace('/storage/', '', $story->media_path));

        $story->delete();

        return response()->json(['success' => true]);
    }

    public function toggleLike(Request $request, $id)
    {
        $me = $request->user();
        $myId = (string) ($me->_id ?? $me->id);
        $story = Story::find($id);
        
        if (!$story) return response()->json(['success' => false], 404);

        $likedBy = $story->liked_by ?? [];
        if (is_object($likedBy)) $likedBy = (array)$likedBy;

        $isLiked = in_array($myId, $likedBy);

        if ($isLiked) {
            // Quitar like
            $likedBy = array_values(array_diff($likedBy, [$myId]));
            \App\Models\Notification::where('sender_id', $myId)
                ->where('story_id', $story->_id)
                ->where('type', 'story_reaction')
                ->delete();
        } else {
            // Dar like
            $likedBy[] = $myId;
            
            if ((string)$story->user_id !== $myId) {
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

    // 6. OBTENER ESTADÍSTICAS DE LA HISTORIA (Solo para el dueño)
    public function getStats(Request $request, $id)
    {
        $me = $request->user();
        $story = Story::find($id);

        if (!$story) return response()->json(['success' => false], 404);

        // Seguridad: Solo el creador de la historia puede ver esto
        if ((string)$story->user_id !== (string)($me->_id ?? $me->id)) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $viewedByIds = is_object($story->viewed_by) ? (array)$story->viewed_by : ($story->viewed_by ?? []);
        $likedByIds = is_object($story->liked_by) ? (array)$story->liked_by : ($story->liked_by ?? []);

        // Obtenemos los datos reales de los usuarios
        $viewers = User::whereIn('_id', $viewedByIds)->get(['_id', 'username', 'profile_picture', 'display_name']);

        // Añadimos una bandera para saber si, además de verla, le dieron like
        $viewers->transform(function ($user) use ($likedByIds) {
            $user->has_liked = in_array((string)$user->_id, $likedByIds);
            return $user;
        });

        // Ordenamos: Primero los que dieron like
        $sortedViewers = $viewers->sortByDesc('has_liked')->values();

        return response()->json([
            'success' => true,
            'viewers' => $sortedViewers,
            'views_count' => count($viewedByIds),
            'likes_count' => count($likedByIds)
        ]);
    }
}