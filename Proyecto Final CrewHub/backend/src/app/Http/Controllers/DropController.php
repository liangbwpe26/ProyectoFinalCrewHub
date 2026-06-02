<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Drop;
use App\Models\Comment;
use App\Models\Notification;
use App\Events\NotificationSent;
use Illuminate\Support\Facades\Storage;
use App\Models\User;

class DropController extends Controller
{
    private function safeArray($value)
    {
        if (is_array($value))
            return $value;
        if (is_object($value))
            return (array) $value;
        if (is_string($value) && json_decode($value, true))
            return json_decode($value, true);
        if (empty($value))
            return [];
        return [$value];
    }

    public function feed(Request $request)
    {
        $me = $request->user();
        $myIdStr = (string) ($me->_id ?? $me->id);
        $limit = 5;
        $offset = (int) $request->query('offset', 0);

        $drops = Drop::with('user')
            ->orderBy('created_at', 'desc')
            ->skip($offset)
            ->take($limit)
            ->get();

        $drops->transform(function ($drop) use ($myIdStr) {
            $drop->liked_by = $this->safeArray($drop->liked_by);
            $drop->saved_by = $this->safeArray($drop->saved_by);
            $drop->reposted_by = $this->safeArray($drop->reposted_by);

            $drop->likes_count = count($drop->liked_by);
            $drop->saves_count = count($drop->saved_by);
            $drop->reposts_count = count($drop->reposted_by);

            // Contamos los comentarios reales en la base de datos
            $drop->comments_count = Comment::where('drop_id', (string) $drop->_id)->count();

            $drop->has_liked = in_array($myIdStr, $drop->liked_by);
            $drop->has_saved = in_array($myIdStr, $drop->saved_by);
            $drop->has_reposted = in_array($myIdStr, $drop->reposted_by);

            return $drop;
        });

        return response()->json([
            'success' => true,
            'drops' => $drops,
            'hasMore' => Drop::count() > ($offset + $limit)
        ]);
    }

    public function show(Request $request, $id)
    {
        $me = $request->user();
        $myIdStr = (string) ($me->_id ?? $me->id);
        $drop = Drop::with('user')->find($id);

        if (!$drop)
            return response()->json(['success' => false], 404);

        $drop->liked_by = $this->safeArray($drop->liked_by);
        $drop->saved_by = $this->safeArray($drop->saved_by);
        $drop->reposted_by = $this->safeArray($drop->reposted_by);

        $drop->likes_count = count($drop->liked_by);
        $drop->saves_count = count($drop->saved_by);
        $drop->reposts_count = count($drop->reposted_by);
        $drop->comments_count = Comment::where('drop_id', (string) $drop->_id)->count();

        $drop->has_liked = in_array($myIdStr, $drop->liked_by);
        $drop->has_saved = in_array($myIdStr, $drop->saved_by);
        $drop->has_reposted = in_array($myIdStr, $drop->reposted_by);

        return response()->json(['success' => true, 'drop' => $drop]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'video' => 'required|mimetypes:video/mp4,video/quicktime|max:51200',
            'description' => 'nullable|string|max:500',
            'allow_downloads' => 'required|boolean'
        ]);

        $me = $request->user();
        $path = $request->file('video')->store('drops', 's3');
        $videoUrl = Storage::disk('s3')->url($path);

        $drop = Drop::create([
            'user_id' => (string) ($me->_id ?? $me->id),
            'video_url' => $videoUrl,
            'description' => $request->input('description'),
            'allow_downloads' => filter_var($request->input('allow_downloads'), FILTER_VALIDATE_BOOLEAN),
            'views_count' => 0,
            'liked_by' => [],
            'saved_by' => [],
            'reposted_by' => []
        ]);

        $drop->load('user');

        $drop->likes_count = 0;
        $drop->saves_count = 0;
        $drop->reposts_count = 0;
        $drop->comments_count = 0;
        $drop->has_liked = false;
        $drop->has_saved = false;
        $drop->has_reposted = false;

        return response()->json(['success' => true, 'drop' => $drop]);
    }

    public function destroy(Request $request, $id)
    {
        $me = $request->user();
        $myId = (string) ($me->_id ?? $me->id);
        $drop = Drop::find($id);

        if (!$drop)
            return response()->json(['success' => false], 404);
        if ((string) $drop->user_id !== $myId)
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);

        $drop->delete();
        Comment::where('drop_id', $id)->delete(); // Limpiar comentarios

        return response()->json(['success' => true]);
    }

    public function toggleLike(Request $request, $id)
    {
        $drop = Drop::find($id);
        if (!$drop)
            return response()->json(['success' => false], 404);

        $myId = (string) ($request->user()->_id ?? $request->user()->id);
        $array = $this->safeArray($drop->liked_by);
        $isActive = in_array($myId, $array);

        if ($isActive) {
            $array = array_values(array_diff($array, [$myId]));
            Notification::where('sender_id', $myId)->where('drop_id', $id)->where('type', 'drop_reaction')->delete();
        } else {
            $array[] = $myId;

            // Notificar al creador del Drop
            if ($drop->user_id !== $myId) {
                $notif = Notification::create([
                    'recipient_id' => $drop->user_id,
                    'sender_id' => $myId,
                    'type' => 'drop_reaction',
                    'drop_id' => $drop->_id,
                    'is_read' => false
                ]);
                $notif->load('sender');
                try {
                    broadcast(new NotificationSent($notif));
                } catch (\Exception $e) {
                }
            }
        }

        $drop->forceFill(['liked_by' => array_values($array)])->save();
        return response()->json(['success' => true, 'reacted' => !$isActive]);
    }

    public function toggleSave(Request $request, $id)
    {
        $drop = Drop::find($id);
        if (!$drop)
            return response()->json(['success' => false], 404);

        $myId = (string) ($request->user()->_id ?? $request->user()->id);
        $array = $this->safeArray($drop->saved_by);
        $isActive = in_array($myId, $array);

        if ($isActive) {
            $array = array_values(array_diff($array, [$myId]));
        } else {
            $array[] = $myId;
        }

        $drop->forceFill(['saved_by' => array_values($array)])->save();
        return response()->json(['success' => true, 'saved' => !$isActive]);
    }

    public function toggleRepost(Request $request, $id)
    {
        $drop = Drop::find($id);
        if (!$drop)
            return response()->json(['success' => false], 404);

        $myId = (string) ($request->user()->_id ?? $request->user()->id);
        $array = $this->safeArray($drop->reposted_by);
        $isActive = in_array($myId, $array);

        if ($isActive) {
            $array = array_values(array_diff($array, [$myId]));
        } else {
            $array[] = $myId;
        }

        $drop->forceFill(['reposted_by' => array_values($array)])->save();
        return response()->json(['success' => true, 'reposted' => !$isActive]);
    }

    // --- COMENTARIOS DE DROPS ---
    public function getComments($id)
    {
        $comments = Comment::with('user')->where('drop_id', $id)->orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'comments' => $comments]);
    }

    public function addComment(Request $request, $id)
    {
        $request->validate(['content' => 'required|string|max:500']);
        $me = $request->user();
        
        $comment = Comment::create([
            'drop_id' => $id,
            'user_id' => (string) ($me->_id ?? $me->id),
            'content' => $request->input('content')
        ]);

        $drop = Drop::find($id);
        if ($drop && $drop->user_id !== (string) ($me->_id ?? $me->id)) {
            $notif = Notification::create([
                'recipient_id' => $drop->user_id,
                'sender_id' => (string) ($me->_id ?? $me->id),
                'type' => 'drop_comment',
                'drop_id' => $drop->_id,
                'is_read' => false
            ]);
            $notif->load('sender');
            try { broadcast(new NotificationSent($notif)); } catch (\Exception $e) {}
        }

        return response()->json(['success' => true, 'comment' => $comment->load('user')]);
    }

    // Obtener los drops guardados por el usuario
    public function getSavedDrops(Request $request)
    {
        $me = $request->user();
        $myIdStr = (string) ($me->_id ?? $me->id);

        $drops = Drop::with('user')
            ->where('saved_by', $myIdStr)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'drops' => $drops
        ]);
    }

    // Obtener los drops reposteados por un usuario específico para su perfil
    public function getUserRepostedDrops(Request $request, $username)
    {
        $targetUser = User::where('username', $username)->first();
        
        if (!$targetUser) {
            return response()->json(['success' => false, 'message' => 'Usuario no encontrado'], 404);
        }

        $targetIdStr = (string) ($targetUser->_id ?? $targetUser->id);

        $drops = Drop::with('user')
            ->where('reposted_by', $targetIdStr)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'drops' => $drops
        ]);
    }
}