<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;

class NotificationController extends Controller
{
    // Obtener todas las notificaciones separadas por tipo
    public function index(Request $request)
    {
        $me = $request->user();

        // Cargamos todas las notificaciones del usuario con sus relaciones
        // 'sender' para saber quién lo hizo, 'post' para mostrar la miniatura si aplica
        $allNotifications = Notification::with(['sender', 'post'])
            ->where('recipient_id', $me->_id)
            ->orderBy('created_at', 'desc')
            ->get();

        // Clasificamos en dos colecciones
        $main = $allNotifications->filter(function($n) {
            return $n->type !== 'follow_request';
        })->values();

        $requests = $allNotifications->filter(function($n) {
            return $n->type === 'follow_request';
        })->values();

        return response()->json([
            'success' => true,
            'main' => $main,
            'requests' => $requests,
            'unread_count' => Notification::where('recipient_id', $me->_id)->where('is_read', false)->count()
        ]);
    }

    // Marcar todas como leídas (se activa al abrir la campana)
    public function markAsRead(Request $request)
    {
        Notification::where('recipient_id', $request->user()->_id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }
}