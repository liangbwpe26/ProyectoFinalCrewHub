<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Follow;
use App\Models\User;

class FollowController extends Controller
{
    // Función para empezar a seguir a alguien
    public function follow(Request $request, $id)
    {
        $me = $request->user();

        // Evitar que el usuario se siga a sí mismo
        if ($me->_id === $id) {
            return response()->json(['success' => false, 'message' => 'No puedes seguirte a ti mismo.'], 400);
        }

        // Verificar que el usuario a seguir exista
        if (!User::find($id)) {
            return response()->json(['success' => false, 'message' => 'Usuario no encontrado.'], 404);
        }

        // Verificar si ya lo seguimos para no duplicar datos
        $exists = Follow::where('follower_id', $me->_id)->where('followed_id', $id)->first();
        if ($exists) {
            return response()->json(['success' => false, 'message' => 'Ya sigues a este usuario.'], 400);
        }

        Follow::create([
            'follower_id' => $me->_id,
            'followed_id' => $id,
        ]);

        return response()->json(['success' => true, 'message' => 'Usuario seguido con éxito.']);
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

    // EL ALGORITMO DE MUTUALS (Amigos permitidos para chatear)
    public function getMutuals(Request $request)
    {
        $me = $request->user();

        // 1. Buscamos a quiénes sigo yo
        $followingIds = Follow::where('follower_id', $me->_id)->pluck('followed_id')->toArray();

        // 2. Buscamos quiénes me siguen a mí
        $followerIds = Follow::where('followed_id', $me->_id)->pluck('follower_id')->toArray();

        // 3. La magia de la Intersección: Filtramos solo los IDs que están en ambas listas
        $mutualIds = array_values(array_intersect($followingIds, $followerIds));

        // 4. Obtenemos los datos de esos usuarios (solo los datos seguros para enviar al frontend)
        $mutualUsers = User::whereIn('_id', $mutualIds)->get(['_id', 'username', 'email']);

        return response()->json([
            'success' => true,
            'mutuals' => $mutualUsers
        ]);
    }
}