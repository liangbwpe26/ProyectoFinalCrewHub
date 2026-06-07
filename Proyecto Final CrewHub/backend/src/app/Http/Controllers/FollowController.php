<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Follow;
use App\Models\User;
use App\Models\Notification;
use MongoDB\BSON\ObjectId;
use App\Events\NotificationSent;
use Illuminate\Support\Facades\Log;

/**
 * Controlador para gestionar seguimientos y solicitudes de seguimiento.
 */
class FollowController extends Controller
{
    /**
     * Permite seguir o dejar de seguir a un usuario.
     *
     * @param Request $request Petición HTTP actual.
     * @param string $id Identificador del usuario a seguir o dejar de seguir.
     * @return \Illuminate\Http\JsonResponse
     */
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
            $exists->delete();
            return response()->json([
                'success' => true, 
                'status' => 'none', 
                'message' => 'Has dejado de seguir a este usuario.'
            ]);
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

    /**
     * Deja de seguir a un usuario.
     *
     * @param Request $request Petición HTTP actual.
     * @param string $id Identificador del usuario a dejar de seguir.
     * @return \Illuminate\Http\JsonResponse
     */
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

    /**
     * Obtiene los usuarios con seguimiento mutuo.
     *
     * @param Request $request Petición HTTP actual.
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMutuals(Request $request)
    {
        $me = $request->user();

        $followingIds = Follow::where('follower_id', $me->_id)
            ->where(function($query) {
                $query->where('status', 'accepted')->orWhereNull('status');
            })->pluck('followed_id')->toArray();

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

    /**
     * Obtiene las solicitudes de seguimiento pendientes para el usuario autenticado.
     *
     * @param Request $request Petición HTTP actual.
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPendingRequests(Request $request)
    {
        $me = $request->user();

        $pendingFollowerIds = Follow::where('followed_id', $me->_id)
            ->where('status', 'pending')
            ->pluck('follower_id')->toArray();

        $pendingUsers = User::whereIn('_id', $pendingFollowerIds)
            ->get(['_id', 'username', 'display_name', 'profile_picture']);

        return response()->json([
            'success' => true,
            'requests' => $pendingUsers
        ]);
    }

    /**
     * Acepta una solicitud de seguimiento pendiente.
     *
     * @param Request $request Petición HTTP actual.
     * @param string $followerId Identificador del usuario que envió la solicitud.
     * @return \Illuminate\Http\JsonResponse
     */
    public function acceptRequest(Request $request, $followerId)
    {
        $me = $request->user();

        $follow = Follow::where('followed_id', $me->_id)
            ->where('follower_id', $followerId)
            ->where('status', 'pending')
            ->first();

        if ($follow) {
            $follow->update(['status' => 'accepted']);

            Notification::where('recipient_id', $me->_id)
                ->where('sender_id', $followerId)
                ->where('type', 'follow_request')
                ->delete();

            return response()->json(['success' => true]);
        }

        return response()->json(['success' => false], 404);
    }

    /**
     * Rechaza una solicitud de seguimiento pendiente.
     *
     * @param Request $request Petición HTTP actual.
     * @param string $followerId Identificador del usuario que envió la solicitud.
     * @return \Illuminate\Http\JsonResponse
     */
   public function rejectRequest(Request $request, $followerId)
    {
        $me = $request->user();
        $follow = Follow::where('followed_id', $me->_id)
            ->where('follower_id', $followerId)
            ->where('status', 'pending')
            ->first();

        if ($follow) {
            $follow->delete();

            Notification::where('recipient_id', $me->_id)
                ->where('sender_id', $followerId)
                ->where('type', 'follow_request')
                ->delete();

            return response()->json(['success' => true]);
        }

        return response()->json(['success' => false], 404);
    }

    /**
     * Obtiene la lista de seguidores de un usuario.
     *
     * @param Request $request Petición HTTP actual.
     * @param string $username Nombre de usuario a consultar.
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFollowers(Request $request, $username)
    {
        $user = User::where('username', $username)->first();
        if (!$user) return response()->json(['success' => false, 'message' => 'Usuario no encontrado'], 404);

        $offset = (int) $request->query('offset', 0);
        $limit = 10;
        $me = $request->user();

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

        if ($me) {
            $myIdStr = (string)($me->id ?? $me->_id);

            $listIdsStr = $followers->map(function($u) { return (string)($u->id ?? $u->_id); })->toArray();
            
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

            $followers->transform(function ($u) use ($myIdStr, $statusMap) {
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
            'users' => $followers,
            'hasMore' => ($offset + $limit) < $totalCount
        ]);
    }

    /**
     * Obtiene la lista de usuarios a los que sigue un usuario.
     *
     * @param Request $request Petición HTTP actual.
     * @param string $username Nombre de usuario a consultar.
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFollowing(Request $request, $username)
    {
        $user = User::where('username', $username)->first();
        if (!$user) return response()->json(['success' => false, 'message' => 'Usuario no encontrado'], 404);

        $offset = (int) $request->query('offset', 0);
        $limit = 10;
        $me = $request->user();

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