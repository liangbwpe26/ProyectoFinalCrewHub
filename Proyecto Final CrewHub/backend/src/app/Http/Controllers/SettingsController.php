<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Ticket;

class SettingsController extends Controller
{
    /**
     * Actualiza el correo y/o la contraseña del usuario autenticado.
     *
     * Valida el email, la contraseña actual y la nueva contraseña (opcional).
     * Si la contraseña actual es incorrecta retorna 403.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateAccount(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'current_password' => 'required|string',
            'new_password' => 'nullable|string|min:6'
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'La contraseña actual es incorrecta.'], 403);
        }

        $user->email = $request->email;

        if ($request->filled('new_password')) {
            $user->password = Hash::make($request->new_password);
        }

        $user->save();

        return response()->json(['success' => true, 'message' => 'Cuenta actualizada.']);
    }

    /**
     * Actualiza las preferencias de notificaciones del usuario.
     *
     * Espera un array de flags booleanos para distintos tipos de notificación
     * y los guarda en el campo notification_prefs del usuario.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateNotifications(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'likes' => 'required|boolean',
            'follows' => 'required|boolean',
            'messages' => 'required|boolean',
            'communities' => 'required|boolean',
        ]);

        $user->notification_prefs = $validated;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Preferencias guardadas correctamente.',
            'user' => $user->fresh()
        ]);
    }

    /**
     * Crea un ticket de soporte asociado al usuario autenticado.
     *
     * Valida asunto y mensaje y guarda el ticket con estado "pending".
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function storeTicket(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string'
        ]);

        $me = $request->user();
        $myId = (string) ($me->_id ?? $me->id);

        \App\Models\Ticket::create([
            'user_id' => $myId,
            'subject' => $request->subject,
            'message' => $request->message,
            'status' => 'pending'
        ]);

        return response()->json(['success' => true]);
    }

}