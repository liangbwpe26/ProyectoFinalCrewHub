<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Ticket; // Asumiendo que creas un modelo Ticket en MongoDB

class SettingsController extends Controller
{
    // 1. Actualizar contraseña o correo
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

    // 2. Guardar el JSON de preferencias
    public function updateNotifications(Request $request)
    {
        $user = $request->user();
        
        // MongoDB acepta arrays asociativos directo
        $user->notification_prefs = $request->all();
        $user->save();

        return response()->json(['success' => true]);
    }

    // 3. Sistema de Tickets
    public function storeTicket(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string'
        ]);

        $me = $request->user();
        $myId = (string) ($me->_id ?? $me->id);

        // Guardamos el ticket real en la base de datos
        \App\Models\Ticket::create([
            'user_id' => $myId,
            'subject' => $request->subject,
            'message' => $request->message,
            'status' => 'pending'
        ]);

        return response()->json(['success' => true]);
    }
}