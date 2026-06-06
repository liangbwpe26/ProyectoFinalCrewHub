<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $me = $request->user();

        $allNotifications = Notification::with(['sender', 'post'])
            ->where('recipient_id', $me->_id)
            ->orderBy('created_at', 'desc')
            ->get();

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

    public function markAsRead(Request $request)
    {
        Notification::where('recipient_id', $request->user()->_id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['success' => true]);
    }
}