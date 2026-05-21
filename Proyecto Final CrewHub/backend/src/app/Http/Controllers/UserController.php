<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Follow;
use Illuminate\Support\Facades\Auth;
use App\Models\Interest;

class UserController extends Controller
{
    public function search(Request $request)
    {
        $me = $request->user();
        $searchTerm = $request->query('q');

        if (!$searchTerm) {
            return response()->json(['success' => true, 'users' => []]);
        }

        $users = User::where('_id', '!=', $me->_id)
            ->where('username', 'like', "%{$searchTerm}%")
            ->take(20)
            ->get(['_id', 'username', 'email', 'profile_picture', 'display_name']);

        // Traemos todos mis seguimientos hacia estos usuarios
        $myFollows = Follow::where('follower_id', $me->_id)
            ->whereIn('followed_id', $users->pluck('_id'))
            ->get()->keyBy('followed_id');

        // Le añadimos el estado exacto a cada usuario
        $users->transform(function($user) use ($myFollows) {
            $followRecord = $myFollows->get($user->_id);
            if ($followRecord) {
                $user->follow_status = $followRecord->status ?? 'accepted'; // Si es viejo, lo damos por aceptado
            } else {
                $user->follow_status = 'none'; // No lo seguimos
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
}