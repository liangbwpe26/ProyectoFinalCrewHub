<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Drop;
use App\Models\Comment;
use App\Models\Notification;
use App\Events\NotificationSent;
use Illuminate\Support\Facades\Storage;
use App\Models\User;

/**
 * Controlador de drops responsable de manejar feeds, reacciones,
 * comentarios y notificaciones relacionadas.
 */
class DropController extends Controller
{
    /**
     * Convierte un valor a un array seguro para evitar errores
     * con datos serializados o nulos.
     *
     * @param mixed $value Valor a convertir.
     * @return array Valor convertido en array.
     */
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

    /**
     * Retorna el feed de drops activos paginados.
     *
     * @param Request $request Solicitud HTTP actual.
     * @return \Illuminate\Http\JsonResponse Respuesta JSON con drops.
     */
    public function feed(Request $request)
    {
        $me = $request->user();
        $myIdStr = (string) ($me->_id ?? $me->id);
        $limit = 5;
        $offset = (int) $request->query('offset', 0);

        $drops = Drop::with('user')
            ->where('is_hidden', '!=', true)
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

    /**
     * Muestra un drop específico con datos agregados.
     *
     * @param Request $request Solicitud HTTP actual.
     * @param mixed $id Identificador del drop.
     * @return \Illuminate\Http\JsonResponse Respuesta JSON con el drop.
     */
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
            'video' => 'required|mimetypes:video/mp4,video/quicktime,video/webm,video/x-matroska|max:102400',
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

    /**
     * Elimina un drop si el usuario es propietario.
     *
     * @param Request $request Solicitud HTTP actual.
     * @param mixed $id Identificador del drop.
     * @return \Illuminate\Http\JsonResponse Respuesta JSON con el resultado.
     */
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
        Comment::where('drop_id', $id)->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Activa o desactiva el like de un drop.
     *
     * @param Request $request Solicitud HTTP actual.
     * @param mixed $id Identificador del drop.
     * @return \Illuminate\Http\JsonResponse Respuesta JSON con el estado del like.
     */
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

    /**
     * Activa o desactiva el guardado de un drop.
     *
     * @param Request $request Solicitud HTTP actual.
     * @param mixed $id Identificador del drop.
     * @return \Illuminate\Http\JsonResponse Respuesta JSON con el estado del guardado.
     */
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

    /**
     * Activa o desactiva el repost de un drop.
     *
     * @param Request $request Solicitud HTTP actual.
     * @param mixed $id Identificador del drop.
     * @return \Illuminate\Http\JsonResponse Respuesta JSON con el estado del repost.
     */
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

    /**
     * Obtiene los comentarios asociados a un drop.
     *
     * @param Request $request Solicitud HTTP actual.
     * @param mixed $id Identificador del drop.
     * @return \Illuminate\Http\JsonResponse Respuesta JSON con los comentarios.
     */
    public function getComments(Request $request, $id)
    {
        $me = $request->user();
        $myId = $me ? (string) ($me->_id ?? $me->id) : null;

        $comments = Comment::with('user')->where('drop_id', $id)->orderBy('created_at', 'desc')->get();

        $comments->transform(function ($comment) use ($myId) {
            $likedBy = $comment->liked_by ?? [];
            if (is_object($likedBy)) $likedBy = (array) $likedBy;
            if (is_string($likedBy) && json_decode($likedBy, true)) {
                $likedBy = json_decode($likedBy, true);
            }

            $comment->reactions_count = count($likedBy);
            $comment->has_reacted = $myId ? in_array($myId, $likedBy) : false;

            return $comment;
        });

        return response()->json(['success' => true, 'comments' => $comments]);
    }
    /**
     * Agrega un comentario a un drop y dispara notificaciones.
     *
     * @param Request $request Solicitud HTTP con el contenido.
     * @param mixed $id Identificador del drop.
     * @return \Illuminate\Http\JsonResponse Respuesta JSON con el comentario agregado.
     */
    public function addComment(Request $request, $id)
    {
        $request->validate(['content' => 'required|string|max:500']);
        $me = $request->user();
        $content = $request->input('content');
        
        $comment = Comment::create([
            'drop_id' => $id,
            'user_id' => (string) ($me->_id ?? $me->id),
            'content' => $content
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

        preg_match_all('/@([a-zA-Z0-9_]+)/', $content, $matches);
        $mentionedUsernames = array_unique($matches[1]);

        if (!empty($mentionedUsernames)) {
            $mentionedUsers = User::whereIn('username', $mentionedUsernames)->get();

            foreach ($mentionedUsers as $mentionedUser) {
                $mentionedUserId = (string) ($mentionedUser->_id ?? $mentionedUser->id);
                $myId = (string) ($me->_id ?? $me->id);

                if ($mentionedUserId !== $myId) {
                    $mentionNotif = Notification::create([
                        'recipient_id' => $mentionedUserId,
                        'sender_id' => $myId,
                        'type' => 'mention',
                        'drop_id' => $drop->_id,
                        'is_read' => false
                    ]);
                    $mentionNotif->load('sender');
                    try { broadcast(new NotificationSent($mentionNotif)); } catch (\Exception $e) {}
                }
            }
        }

        return response()->json(['success' => true, 'comment' => $comment->load('user')]);
    }

    /**
     * Retorna los drops guardados por el usuario autenticado.
     *
     * @param Request $request Solicitud HTTP actual.
     * @return \Illuminate\Http\JsonResponse Respuesta JSON con los drops guardados.
     */
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

    /**
     * Retorna los drops repostados por un usuario específico.
     *
     * @param Request $request Solicitud HTTP actual.
     * @param string $username Nombre de usuario objetivo.
     * @return \Illuminate\Http\JsonResponse Respuesta JSON con los drops repostados.
     */
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

    /**
     * Elimina un comentario si el usuario tiene permisos.
     *
     * @param Request $request Solicitud HTTP actual.
     * @param mixed $id Identificador del comentario.
     * @return \Illuminate\Http\JsonResponse Respuesta JSON con el resultado.
     */
    public function deleteComment(Request $request, $id)
    {
        $me = $request->user();
        $myId = (string) ($me->_id ?? $me->id);
        
        $comment = Comment::find($id);
        
        if (!$comment) {
            return response()->json(['success' => false, 'message' => 'Comentario no encontrado'], 404);
        }

        $drop = Drop::find($comment->drop_id);
        
        $isCommentOwner = (string) $comment->user_id === $myId;
        $isDropOwner = $drop && (string) $drop->user_id === $myId;

        if (!$isCommentOwner && !$isDropOwner) {
            return response()->json(['success' => false, 'message' => 'No tienes permiso para borrar esto'], 403);
        }

        $comment->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Activa o desactiva el like de un comentario.
     *
     * @param Request $request Solicitud HTTP actual.
     * @param mixed $id Identificador del comentario.
     * @return \Illuminate\Http\JsonResponse Respuesta JSON con el estado del like.
     */
    public function toggleCommentLike(Request $request, $id)
    {
        $comment = Comment::find($id);
        if (!$comment) return response()->json(['success' => false], 404);

        $myId = (string) ($request->user()->_id ?? $request->user()->id);
        $array = is_array($comment->liked_by) ? $comment->liked_by : (array)$comment->liked_by;
        $isActive = in_array($myId, $array);

        if ($isActive) {
            $array = array_values(array_diff($array, [$myId]));
            Notification::where('sender_id', $myId)->where('comment_id', $id)->where('type', 'comment_reaction')->delete();
        } else {
            $array[] = $myId;
            if ($comment->user_id !== $myId) {

                $notif = Notification::create([
                    'recipient_id' => $comment->user_id,
                    'sender_id' => $myId,
                    'type' => 'comment_reaction',
                    'drop_id' => $comment->drop_id, 
                    'comment_id' => $comment->_id,
                    'is_read' => false
                ]);
                $notif->load('sender');
                try { broadcast(new NotificationSent($notif)); } catch (\Exception $e) {}
            }
        }

        $comment->forceFill(['liked_by' => array_values($array)])->save();
        return response()->json(['success' => true, 'reacted' => !$isActive]);
    }
}