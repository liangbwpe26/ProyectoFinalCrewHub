<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Follow;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    // Obtener los datos del perfil y sus estadísticas
    public function show(Request $request, $username)
    {
        // 1. Buscamos al usuario por su username
        $user = User::where('username', $username)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado'
            ], 404);
        }

        $targetUserId = (string) $user->_id;
        // Ojo: Verificamos si hay un usuario logueado haciendo la petición
        $activeUserId = $request->user() ? (string) $request->user()->_id : null; 

        // 2. Contadores (¡Solo contamos los aceptados o los antiguos sin estado!)
        $followersCount = Follow::where('followed_id', $targetUserId)
            ->where(function($query) {
                $query->where('status', 'accepted')->orWhereNull('status');
            })->count();

        $followingCount = Follow::where('follower_id', $targetUserId)
            ->where(function($query) {
                $query->where('status', 'accepted')->orWhereNull('status');
            })->count();

        // 3. ¿Estado del seguimiento actual? ('none', 'pending', 'accepted')
        $followStatus = 'none';
        
        if ($activeUserId && $targetUserId !== $activeUserId) {
            $followRecord = Follow::where('follower_id', $activeUserId)
                ->where('followed_id', $targetUserId)
                ->first();

            if ($followRecord) {
                // Si existe el registro pero no tiene status (es viejo), asumimos 'accepted'
                $followStatus = $followRecord->status ?? 'accepted';
            }
        }

        $me = $request->user();

        // 1. Buscamos todas las publicaciones de este usuario (ordenadas por la más reciente)
        $userPosts = \App\Models\Post::where('user_id', $targetUserId)
                                     ->orderBy('created_at', 'desc')
                                     ->get();

        // 2. NUEVO: Le inyectamos a cada foto sus caritas felices y comentarios
        $userPosts->transform(function($post) use ($me) {
            $post->reactions_count = \App\Models\Reaction::where('post_id', $post->_id)->count();
            $post->comments_count = \App\Models\Comment::where('post_id', $post->_id)->count();
            
            // Verificamos si el usuario actual ya le dio carita feliz
            if ($me) {
                $post->has_reacted = \App\Models\Reaction::where('post_id', $post->_id)
                                                         ->where('user_id', $me->_id)
                                                         ->exists();
            } else {
                $post->has_reacted = false;
            }
            
            return $post;
        });

        // 3. Preparamos los datos
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
            'posts' => $userPosts // <-- ¡Aquí van las fotos ya con sus estadísticas!
        ];

        return response()->json([
            'success' => true,
            'profile' => $profileData
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user(); // Obtenemos al usuario autenticado

        // 1. Validación estricta
        $request->validate([
            'display_name' => 'nullable|string|max:50',
            'date_of_birth' => 'nullable|date',
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2MB
        ]);

        // 2. Actualizar campos de texto
        if ($request->has('display_name')) {
            $user->display_name = $request->display_name;
        }

        if ($request->has('date_of_birth')) {
            $user->date_of_birth = $request->date_of_birth;
        }

        if ($request->has('is_private')) {
            // Convertimos a booleano (true o false)
            $user->is_private = filter_var($request->input('is_private'), FILTER_VALIDATE_BOOLEAN);
        }

        // 3. Lógica de la foto de perfil
        if ($request->hasFile('profile_picture')) {
            // Borrar foto anterior si existe (opcional pero recomendado)
            if ($user->profile_picture) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $user->profile_picture));
            }

            // Guardar la nueva foto en la carpeta 'profiles'
            $path = $request->file('profile_picture')->store('profiles', 'public');

            // Guardamos la URL completa para que React no tenga que adivinarla
            $user->profile_picture = '/storage/' . $path;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Perfil actualizado correctamente',
            'user' => $user
        ]);
    }
}