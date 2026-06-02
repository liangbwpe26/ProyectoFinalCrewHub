<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Follow;
use Illuminate\Support\Facades\Auth;
use App\Models\Interest;
use App\Models\Community;
use App\Models\Post;
use App\Models\Reaction;
use App\Models\Comment;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    public function search(Request $request)
    {
        $me = $request->user();
        $searchTerm = $request->query('q');
        $category = $request->query('category'); // NUEVO: Atrapamos la categoría

        // Si no hay búsqueda ni categoría, devolvemos vacío
        if (!$searchTerm && !$category) {
            return response()->json(['success' => true, 'users' => []]);
        }

        $query = User::where('_id', '!=', $me->_id);

        // Filtro por nombre
        if ($searchTerm) {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('username', 'like', "%{$searchTerm}%")
                    ->orWhere('display_name', 'like', "%{$searchTerm}%");
            });
        }

        // Filtro por categoría business
        if ($category) {
            $query->where('is_business', true)
                ->where('business_category', $category);
        }

        $users = $query->take(20)->get(['_id', 'username', 'email', 'profile_picture', 'display_name', 'is_business', 'business_category', 'is_verified']);

        // Traemos todos mis seguimientos hacia estos usuarios
        $myFollows = Follow::where('follower_id', $me->_id)
            ->whereIn('followed_id', $users->pluck('_id'))
            ->get()->keyBy('followed_id');

        // Le añadimos el estado exacto a cada usuario
        $users->transform(function ($user) use ($myFollows) {
            $followRecord = $myFollows->get($user->_id);
            if ($followRecord) {
                $user->follow_status = $followRecord->status ?? 'accepted';
            } else {
                $user->follow_status = 'none';
            }
            return $user;
        });

        return response()->json([
            'success' => true,
            'users' => $users
        ]);
    }

    public function updateInterests(Request $request)
    {
        $request->validate([
            'interests' => 'required|array',
            'interests.*' => 'string'
        ]);

        $user = Auth::user();

        $user->interests = $request->interests;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Intereses actualizados correctamente.',
            'user' => $user
        ]);
    }

    public function getAvailableInterests()
    {
        $interests = Interest::all();
        return response()->json([
            'success' => true,
            'interests' => $interests
        ]);
    }

    public function suggestions(Request $request)
    {
        $me = $request->user();
        $myIdStr = (string) ($me->_id ?? $me->id);

        // 1. Obtener a quién seguimos para no sugerirlos
        $followingIds = Follow::where('follower_id', $myIdStr)
            ->where('status', 'accepted')
            ->pluck('followed_id')
            ->toArray();
        $followingIds[] = $myIdStr;

        // 2. Sugerir usuarios (Reemplazamos inRandomOrder por shuffle en la colección)
        $suggestedUsers = User::whereNotIn('_id', $followingIds)
            ->where(function ($q) {
                $q->where('is_private', false)->orWhereNull('is_private');
            })
            ->take(30) // Tomamos los últimos 30
            ->get(['_id', 'username', 'display_name', 'profile_picture'])
            ->shuffle() // Los mezclamos aleatoriamente en PHP
            ->take(3)   // Nos quedamos con 3
            ->values();

        // 3. Sugerir comunidades
        $suggestedCommunities = Community::where('members', '!=', $myIdStr)
            ->orWhereNull('members')
            ->take(30)
            ->get(['_id', 'name', 'slug', 'avatar_path', 'members'])
            ->shuffle()
            ->take(3)
            ->values();

        return response()->json([
            'success' => true,
            'users' => $suggestedUsers,
            'communities' => $suggestedCommunities
        ]);
    }

    public function toggleBlock(Request $request, $username)
    {
        $me = $request->user();
        $targetUser = User::where('username', $username)->first();

        if (!$targetUser) {
            return response()->json(['success' => false, 'message' => 'Usuario no encontrado'], 404);
        }

        $myId = (string) ($me->_id ?? $me->id);
        $targetId = (string) ($targetUser->_id ?? $targetUser->id);

        if ($myId === $targetId) {
            return response()->json(['success' => false, 'message' => 'No puedes bloquearte a ti mismo'], 400);
        }

        // Aseguramos que blocked_users sea un array válido
        $blockedUsers = $me->blocked_users ?? [];
        if (is_object($blockedUsers))
            $blockedUsers = (array) $blockedUsers;

        $isBlocked = in_array($targetId, $blockedUsers);

        if ($isBlocked) {
            // Desbloquear
            $blockedUsers = array_values(array_diff($blockedUsers, [$targetId]));
            $status = false;
        } else {
            // Bloquear
            $blockedUsers[] = $targetId;
            $status = true;

            // Al bloquear, forzamos que se dejen de seguir mutuamente de la base de datos
            Follow::where(function ($query) use ($myId, $targetId) {
                $query->where('follower_id', $myId)->where('followed_id', $targetId);
            })->orWhere(function ($query) use ($myId, $targetId) {
                $query->where('follower_id', $targetId)->where('followed_id', $myId);
            })->delete();
        }

        $me->forceFill(['blocked_users' => array_values($blockedUsers)])->save();

        return response()->json([
            'success' => true,
            'is_blocked' => $status
        ]);
    }

    /**
     * MOSTRAR PERFIL DE USUARIO
     * - Incluye lógica de bloqueo
     * - Contadores de seguidores/seguidos
     * - Estado del seguimiento (none, pending, accepted)
     * - Últimas publicaciones con conteo de reacciones/comentarios
     */

    public function show(Request $request, $username)
    {
        try {
            $user = User::where('username', $username)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            $targetUserId = (string) ($user->_id ?? $user->id);
            $me = $request->user();
            $activeUserId = $me ? (string) ($me->_id ?? $me->id) : null;

            $blockedByMe = false;
            $blockedByThem = false;

            if ($me && $activeUserId !== $targetUserId) {
                $myBlocked = $me->blocked_users ?? [];
                if (is_string($myBlocked))
                    $myBlocked = json_decode($myBlocked, true) ?? [];
                $myBlocked = (array) $myBlocked;
                $blockedByMe = in_array($targetUserId, $myBlocked);

                $theirBlocked = $user->blocked_users ?? [];
                if (is_string($theirBlocked))
                    $theirBlocked = json_decode($theirBlocked, true) ?? [];
                $theirBlocked = (array) $theirBlocked;
                $blockedByThem = in_array($activeUserId, $theirBlocked);

                if ($blockedByMe || $blockedByThem) {
                    return response()->json([
                        'success' => true,
                        'profile' => [
                            'id' => $targetUserId,
                            'username' => $user->username,
                            'display_name' => $user->display_name ?? $user->username,
                            'profile_picture' => $user->profile_picture ?? null,
                            'followers_count' => 0,
                            'following_count' => 0,
                            'blocked_by_me' => $blockedByMe,
                            'blocked_by_them' => $blockedByThem,
                            'is_private' => false,
                            'follow_status' => 'none',
                            'posts' => []
                        ],
                        'posts' => []
                    ]);
                }
            }

            $followersCount = Follow::where('followed_id', $targetUserId)
                ->where(function ($query) {
                    $query->where('status', 'accepted')->orWhereNull('status');
                })->count();

            $followingCount = Follow::where('follower_id', $targetUserId)
                ->where(function ($query) {
                    $query->where('status', 'accepted')->orWhereNull('status');
                })->count();

            $followStatus = 'none';

            if ($activeUserId && $targetUserId !== $activeUserId) {
                $followRecord = Follow::where('follower_id', $activeUserId)
                    ->where('followed_id', $targetUserId)
                    ->first();

                if ($followRecord) {
                    $followStatus = $followRecord->status ?? 'accepted';
                }
            }

            // --- EL CANDADO DE PRIVACIDAD DEFINITIVO ---
            // Revisamos si la cuenta es privada, si no es tu propio perfil, y si no tienes el follow aceptado
            $isPrivateLock = $user->is_private && $activeUserId !== $targetUserId && $followStatus !== 'accepted';

            if ($isPrivateLock) {
                // Le mandamos una colección vacía para que el chismoso no vea nada por la API
                $userPosts = collect([]);
            } else {
                // Si todo está piola, jalamos la data real
                $userPosts = Post::where('user_id', $targetUserId)
                    ->orderBy('created_at', 'desc')
                    ->get();

                $userPosts->transform(function ($post) use ($me) {
                    $postIdStr = (string) ($post->_id ?? $post->id);

                    $post->reactions_count = Reaction::where('post_id', $postIdStr)->count();
                    $post->comments_count = Comment::where('post_id', $postIdStr)->count();

                    if ($me) {
                        $myIdStr = (string) ($me->_id ?? $me->id);
                        $post->has_reacted = Reaction::where('post_id', $postIdStr)
                            ->where('user_id', $myIdStr)
                            ->exists();
                    } else {
                        $post->has_reacted = false;
                    }

                    return $post;
                });
            }

            $profileData = [
                'id' => $targetUserId,
                'username' => $user->username,
                'display_name' => $user->display_name ?? $user->username,
                'profile_picture' => $user->profile_picture ?? null,
                'date_of_birth' => $user->date_of_birth ?? null,
                'is_private' => $user->is_private ?? false,
                'followers_count' => $followersCount,
                'following_count' => $followingCount,
                'follow_status' => $followStatus,
                'blocked_by_me' => $blockedByMe,
                'blocked_by_them' => $blockedByThem,
                'posts' => $userPosts,
                'is_business' => $user->is_business ?? false,
                'business_category' => $user->business_category ?? null,
                'business_slogan' => $user->business_slogan ?? null,
                'banner_picture' => $user->banner_picture ?? null,
                'is_verified' => $user->is_verified ?? false,
            ];

            return response()->json([
                'success' => true,
                'profile' => $profileData,
                'posts' => $userPosts
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error_message' => $e->getMessage(),
                'posts' => $userPosts,
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * ACTUALIZAR PERFIL DE USUARIO
     * - Permite actualizar display_name, date_of_birth, profile_picture e is_private
     * - La imagen se sube a S3 y se guarda la URL en el perfil
     */

    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'display_name' => 'nullable|string|max:50',
            'date_of_birth' => 'nullable|date',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'banner_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'privacy_messages' => 'nullable|in:everyone,following,none',
            'privacy_comments' => 'nullable|in:everyone,following,none',
            'business_slogan' => 'nullable|string|max:60',
        ]);

        $privacyMessages = $request->input('privacy_messages');
        $privacyComments = $request->input('privacy_comments');

        if ($privacyMessages) {
            $user->forceFill(['privacy_messages' => $privacyMessages]);
        }
        if ($privacyComments) {
            $user->forceFill(['privacy_comments' => $privacyComments]);
        }

        if ($request->has('display_name')) {
            $user->display_name = $request->display_name;
        }
        if ($request->has('date_of_birth')) {
            $user->date_of_birth = $request->date_of_birth;
        }
        if ($request->has('is_private')) {
            $user->is_private = filter_var($request->input('is_private'), FILTER_VALIDATE_BOOLEAN);
        }

        // AQUÍ GUARDAMOS EL SLOGAN
        if ($request->has('business_slogan')) {
            $user->business_slogan = $request->business_slogan;
        }

        if ($request->hasFile('profile_picture')) {
            $path = $request->file('profile_picture')->store('profiles', 's3');
            $user->profile_picture = Storage::disk('s3')->url($path);
        }

        // AQUÍ GUARDAMOS EL BANNER DIRECTO A S3
        if ($request->hasFile('banner_picture')) {
            $path = $request->file('banner_picture')->store('banners', 's3');
            $user->banner_picture = Storage::disk('s3')->url($path);
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Perfil actualizado correctamente',
            'user' => $user->fresh()
        ]);
    }
}