<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Follow;

class UserController extends Controller
{
    public function search(Request $request)
    {
        $me = $request->user();
        $searchTerm = $request->query('q');

        if (!$searchTerm) {
            return response()->json(['success' => true, 'users' => []]);
        }

        // 1. Buscamos usuarios que coincidan con el texto (y excluimos al usuario actual)
        $users = User::where('_id', '!=', $me->_id)
            ->where(function($query) use ($searchTerm) {
                $query->where('username', 'like', "%{$searchTerm}%")
                      ->orWhere('email', 'like', "%{$searchTerm}%");
            })
            ->take(20) // Limitamos a 20 resultados por rendimiento
            ->get(['_id', 'username', 'email']);

        // 2. Obtenemos la lista de los IDs de las personas a las que YO sigo
        $myFollowingIds = Follow::where('follower_id', $me->_id)->pluck('followed_id')->toArray();

        // 3. Le añadimos una bandera 'is_followed' a cada resultado para que React sepa qué botón dibujar
        $users->transform(function($user) use ($myFollowingIds) {
            $user->is_followed = in_array($user->_id, $myFollowingIds);
            return $user;
        });

        return response()->json([
            'success' => true,
            'users' => $users
        ]);
    }
}