<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Follow;
use App\Models\User;
use App\Models\Notification;
use MongoDB\BSON\ObjectId;
use App\Events\NotificationSent;
use Illuminate\Support\Facades\Log;

class FollowController extends Controller
{
    // Función para empezar a seguir a alguien (o enviar solicitud)
    public function follow(Request $request, $id)
    {
        $me = $request->user();

        if ($me->_id === $id) {
            return response()->json(['success' => false, 'message' => 'No puedes seguirte a ti mismo.'], 400);
        }

        $targetUser = User::find($id);
        if (!$targetUser) {
            return response()->json(['success' => false, 'message' => 'Usuario no encontrado.'], 404);
        }

        $exists = Follow::where('follower_id', $me->_id)->where('followed_id', $id)->first();
        if ($exists) {
            return response()->json(['success' => false, 'message' => 'Ya existe una relación o solicitud.'], 400);
        }

        $isPrivate = $targetUser->is_private ?? false;
        $status = $isPrivate ? 'pending' : 'accepted';

        $follow = Follow::create([
            'follower_id' => $me->_id,
            'followed_id' => $id,
            'status' => $status,
        ]);

        try {
            if ($isPrivate) {
                $notification = Notification::create([
                    'recipient_id' => $id,
                    'sender_id' => $me->_id,
                    'type' => 'follow_request',
                    'is_read' => false
                ]);

                $notification->load('sender');

                event(new NotificationSent($notification));
            }
        } catch (\Exception $e) {
            Log::error('Error al enviar notificación WebSocket: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'status' => $status,
            'message' => $isPrivate ? 'Solicitud enviada.' : 'Siguiendo.'
        ]);
    }

    // Función para dejar de seguir
    public function unfollow(Request $request, $id)
    {
        $me = $request->user();

        $follow = Follow::where('follower_id', $me->_id)->where('followed_id', $id)->first();

        if ($follow) {
            $follow->delete();
            return response()->json(['success' => true, 'message' => 'Has dejado de seguir a este usuario.']);
        }

        return response()->json(['success' => false, 'message' => 'No sigues a este usuario.'], 400);
    }

    // EL ALGORITMO DE MUTUALS
    public function getMutuals(Request $request)
    {
        $me = $request->user();

        // 1. A quiénes sigo yo (aceptados o antiguos sin status)
        $followingIds = Follow::where('follower_id', $me->_id)
            ->where(function($query) {
                $query->where('status', 'accepted')->orWhereNull('status');
            })->pluck('followed_id')->toArray();

        // 2. Quiénes me siguen a mí (aceptados o antiguos)
        $followerIds = Follow::where('followed_id', $me->_id)
            ->where(function($query) {
                $query->where('status', 'accepted')->orWhereNull('status');
            })->pluck('follower_id')->toArray();

        $mutualIds = array_values(array_intersect($followingIds, $followerIds));
        $mutualUsers = User::whereIn('_id', $mutualIds)->get(['_id', 'username', 'email', 'profile_picture', 'display_name']);

        return response()->json([
            'success' => true,
            'mutuals' => $mutualUsers
        ]);
    }

    // 1. OBTENER SOLICITUDES PENDIENTES
    public function getPendingRequests(Request $request)
    {
        $me = $request->user();

        // Buscamos los IDs de las personas que me quieren seguir y están en espera
        $pendingFollowerIds = Follow::where('followed_id', $me->_id)
            ->where('status', 'pending')
            ->pluck('follower_id')->toArray();

        // Obtenemos los datos públicos de esos usuarios para mostrarlos en la UI
        $pendingUsers = User::whereIn('_id', $pendingFollowerIds)
            ->get(['_id', 'username', 'display_name', 'profile_picture']);

        return response()->json([
            'success' => true,
            'requests' => $pendingUsers
        ]);
    }

    // 2. ACEPTAR SOLICITUD
    public function acceptRequest(Request $request, $followerId)
    {
        $me = $request->user();

        $follow = Follow::where('followed_id', $me->_id)
            ->where('follower_id', $followerId)
            ->where('status', 'pending')
            ->first();

        if ($follow) {
            $follow->update(['status' => 'accepted']);

            // LIMPIEZA: Borramos la notificación de solicitud ya que ha sido aceptada
            Notification::where('recipient_id', $me->_id)
                ->where('sender_id', $followerId)
                ->where('type', 'follow_request')
                ->delete();

            return response()->json(['success' => true]);
        }

        return response()->json(['success' => false], 404);
    }

    // 3. RECHAZAR SOLICITUD
   public function rejectRequest(Request $request, $followerId)
    {
        $me = $request->user();
        $follow = Follow::where('followed_id', $me->_id)
            ->where('follower_id', $followerId)
            ->where('status', 'pending')
            ->first();

        if ($follow) {
            $follow->delete();

            // LIMPIEZA: Borramos la notificación
            Notification::where('recipient_id', $me->_id)
                ->where('sender_id', $followerId)
                ->where('type', 'follow_request')
                ->delete();

            return response()->json(['success' => true]);
        }

        return response()->json(['success' => false], 404);
    }

    public function getFollowers(Request $request, $username)
    {
        $user = User::where('username', $username)->first();
        if (!$user) return response()->json(['success' => false, 'message' => 'Usuario no encontrado'], 404);

        $offset = (int) $request->query('offset', 0);
        $limit = 10;
        $me = $request->user();

        // 1. Buscamos a los seguidores
        $followerIds = Follow::whereIn('followed_id', [$user->_id, (string)$user->_id])
            ->where(function($query) {
                $query->where('status', 'accepted')->orWhereNull('status');
            })
            ->pluck('follower_id')
            ->toArray();

        $validIds = array_map(function($id) {
            try { return new ObjectId((string)$id); } 
            catch(\Exception $e) { return $id; }
        }, $followerIds);

        $totalCount = count($validIds);
        
        $followers = User::whereIn('_id', $validIds)
            ->skip($offset)
            ->take($limit)
            ->get(['_id', 'username', 'display_name', 'profile_picture']);

        // 👉 LA MAGIA ABSOLUTA (Diccionario PHP)
        if ($me) {
            $myIdStr = (string)($me->id ?? $me->_id);

            // Sacamos los IDs de los 10 usuarios que estamos viendo
            $listIdsStr = $followers->map(function($u) { return (string)($u->id ?? $u->_id); })->toArray();
            
            // Los convertimos a ObjectId por seguridad para la búsqueda
            $listObjectIds = array_map(function($id) {
                try { return new ObjectId($id); } catch(\Exception $e) { return $id; }
            }, $listIdsStr);

            // Buscamos DE UN SOLO GOLPE a cuáles de estos 10 usuarios sigues tú
            $myFollows = Follow::whereIn('follower_id', [$me->_id, $myIdStr])
                ->whereIn('followed_id', array_merge($listIdsStr, $listObjectIds))
                ->get();

            // Armamos un diccionario PHP: ['ID_DEL_USUARIO' => 'accepted']
            $statusMap = [];
            foreach($myFollows as $f) {
                $statusMap[(string)$f->followed_id] = $f->status ?? 'accepted';
            }

            // Repartimos el estado exacto sin preguntarle a la BD de nuevo
            $followers->transform(function ($u) use ($myIdStr, $statusMap) {
                $idStr = (string)($u->id ?? $u->_id);
                if ($idStr === $myIdStr) {
                    $u->follow_status = 'self';
                } else {
                    // Buscamos en el diccionario. Si no está, es 'none' (Seguir)
                    $u->follow_status = $statusMap[$idStr] ?? 'none';
                }
                return $u;
            });
        }

        return response()->json([
            'success' => true,
            'users' => $followers,
            'hasMore' => ($offset + $limit) < $totalCount
        ]);
    }

    public function getFollowing(Request $request, $username)
    {
        $user = User::where('username', $username)->first();
        if (!$user) return response()->json(['success' => false, 'message' => 'Usuario no encontrado'], 404);

        $offset = (int) $request->query('offset', 0);
        $limit = 10;
        $me = $request->user();

        // 1. Buscamos a los seguidos
        $followingIds = Follow::whereIn('follower_id', [$user->_id, (string)$user->_id])
            ->where(function($query) {
                $query->where('status', 'accepted')->orWhereNull('status');
            })
            ->pluck('followed_id')
            ->toArray();

        $validIds = array_map(function($id) {
            try { return new ObjectId((string)$id); } 
            catch(\Exception $e) { return $id; }
        }, $followingIds);

        $totalCount = count($validIds);
        
        $following = User::whereIn('_id', $validIds)
            ->skip($offset)
            ->take($limit)
            ->get(['_id', 'username', 'display_name', 'profile_picture']);

        // 👉 LA MISMA MAGIA ABSOLUTA AQUÍ
        if ($me) {
            $myIdStr = (string)($me->id ?? $me->_id);

            $listIdsStr = $following->map(function($u) { return (string)($u->id ?? $u->_id); })->toArray();
            
            $listObjectIds = array_map(function($id) {
                try { return new ObjectId($id); } catch(\Exception $e) { return $id; }
            }, $listIdsStr);

            $myFollows = Follow::whereIn('follower_id', [$me->_id, $myIdStr])
                ->whereIn('followed_id', array_merge($listIdsStr, $listObjectIds))
                ->get();

            $statusMap = [];
            foreach($myFollows as $f) {
                $statusMap[(string)$f->followed_id] = $f->status ?? 'accepted';
            }

            $following->transform(function ($u) use ($myIdStr, $statusMap) {
                $idStr = (string)($u->id ?? $u->_id);
                if ($idStr === $myIdStr) {
                    $u->follow_status = 'self';
                } else {
                    $u->follow_status = $statusMap[$idStr] ?? 'none';
                }
                return $u;
            });
        }

        return response()->json([
            'success' => true,
            'users' => $following,
            'hasMore' => ($offset + $limit) < $totalCount
        ]);
    }
}