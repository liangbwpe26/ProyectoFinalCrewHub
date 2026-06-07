<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\User;
use App\Models\Message;
use App\Events\MessageSent;
use App\Events\MessageEdited;
use App\Events\MessageDeleted;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

/**
 * Controlador para la lógica de chat, conversaciones y mensajes.
 */
class ChatController extends Controller
{
    /**
     * Obtiene una conversación existente entre dos usuarios o la crea si no existe.
     *
     * @param mixed $myId Identificador del usuario actual.
     * @param mixed $theirId Identificador del usuario objetivo.
     * @return Conversation
     */
    private function getOrCreateConversation($myId, $theirId)
    {
        $ids = [(string) $myId, (string) $theirId];
        sort($ids);
        $roomHash = implode('-', $ids);

        $conversation = Conversation::where('is_group', false)
            ->where('room_hash', $roomHash)
            ->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'is_group' => false,
                'participant_ids' => $ids,
                'room_hash' => $roomHash,
                'last_message_at' => now(),
            ]);
        }
        return $conversation;
    }

    /**
     * Prepara los datos de un mensaje para su emisión por WebSocket.
     *
     * @param Message $msg Mensaje a preparar.
     * @return array
     */
    private function prepareMessageForBroadcast($msg)
    {
        $data = $msg->toArray();
        $data['_id'] = (string) $msg->id;
        $data['id'] = (string) $msg->id;
        $data['sender_id'] = (string) $msg->sender_id;
        $data['conversation_id'] = (string) $msg->conversation_id;
        return $data;
    }

    /**
     * Obtiene el identificador del receptor en una conversación privada.
     *
     * @param Conversation|null $conversation Conversación a examinar.
     * @param string $myIdStr Identificador del usuario actual.
     * @return string|null
     */
    private function getReceiverId($conversation, $myIdStr)
    {
        if (!$conversation)
            return null;
        foreach ($conversation->participant_ids as $id) {
            if ((string) $id !== $myIdStr)
                return (string) $id;
        }
        return null;
    }

    /**
     * Verifica si un usuario puede enviar un mensaje a otro según su privacidad.
     *
     * @param string $senderIdStr Identificador del remitente.
     * @param mixed $targetUser Usuario destino cuya configuración de privacidad se evalúa.
     * @return bool
     */
    private function canMessage($senderIdStr, $targetUser)
    {
        if ($senderIdStr === (string) ($targetUser->_id ?? $targetUser->id))
            return true;

        $privacy = $targetUser->privacy_messages ?? 'everyone';

        if ($privacy === 'none')
            return false;

        if ($privacy === 'following') {
            return \App\Models\Follow::where('follower_id', (string) ($targetUser->_id ?? $targetUser->id))
                ->where('followed_id', $senderIdStr)
                ->where('status', 'accepted')
                ->exists();
        }

        return true;
    }

    /**
     * Obtiene el número total de conversaciones con mensajes no leídos.
     *
     * @param Request $request Solicitud HTTP actual.
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUnreadCount(Request $request)
    {
        $me = $request->user();
        $myIdStr = (string) $me->id;

        $conversations = Conversation::where('room_hash', 'like', "%{$myIdStr}%")->get();
        $unreadCount = 0;

        foreach ($conversations as $conv) {
            $recentMessages = Message::where('conversation_id', (string) $conv->id)
                ->orderBy('created_at', 'desc')
                ->take(30)
                ->get();

            $validLastMessage = null;
            foreach ($recentMessages as $msg) {
                $deletedBy = $msg->deleted_by ?? [];
                if (is_object($deletedBy))
                    $deletedBy = (array) $deletedBy;
                if (!in_array($myIdStr, $deletedBy)) {
                    $validLastMessage = $msg;
                    break;
                }
            }

            if ($validLastMessage && $validLastMessage->sender_id !== $myIdStr) {
                $readBy = $validLastMessage->read_by ?? [];
                if (is_object($readBy))
                    $readBy = (array) $readBy;

                if (!in_array($myIdStr, $readBy)) {
                    $unreadCount++;
                }
            }
        }

        return response()->json(['success' => true, 'unread_count' => $unreadCount]);
    }


    /**
     * Marca todos los mensajes de una conversación como leídos para el usuario actual.
     *
     * @param Request $request Solicitud HTTP actual.
     * @param string $username Nombre de usuario del interlocutor.
     * @return \Illuminate\Http\JsonResponse
     */
    public function markChatAsRead(Request $request, $username)
    {
        $me = $request->user();
        $targetUser = User::where('username', $username)->first();
        if (!$targetUser)
            return response()->json(['success' => false]);

        $conversation = $this->getOrCreateConversation($me->id, $targetUser->id);

        $unreadMessages = Message::where('conversation_id', (string) $conversation->id)
            ->where('sender_id', '!=', (string) $me->id)
            ->get();

        foreach ($unreadMessages as $msg) {
            $readBy = $msg->read_by ?? [];
            if (is_object($readBy))
                $readBy = (array) $readBy;
            if (!in_array((string) $me->id, $readBy)) {
                $readBy[] = (string) $me->id;
                $msg->forceFill(['read_by' => array_values($readBy)])->save();
            }
        }
        return response()->json(['success' => true]);
    }

    /**
     * Recupera los mensajes de una conversación con otro usuario.
     *
     * @param Request $request Solicitud HTTP actual.
     * @param string $username Nombre de usuario del interlocutor.
     * @return \Illuminate\Http\JsonResponse
     */
    public function getMessages(Request $request, $username)
    {
        $me = $request->user();
        $myIdStr = (string) $me->id;

        $targetUser = User::where('username', $username)->first();
        if (!$targetUser)
            return response()->json(['success' => false, 'message' => 'Usuario no encontrado.'], 404);

        $conversation = $this->getOrCreateConversation($me->id, $targetUser->id);

        $messages = Message::where('conversation_id', (string) $conversation->id)
            ->orderBy('created_at', 'asc')
            ->get();

        $validMessages = [];
        foreach ($messages as $msg) {
            $deletedBy = $msg->deleted_by ?? [];
            if (is_object($deletedBy))
                $deletedBy = (array) $deletedBy;

            $isDeletedForMe = false;
            foreach ($deletedBy as $dId) {
                if ((string) $dId === $myIdStr) {
                    $isDeletedForMe = true;
                    break;
                }
            }
            if (!$isDeletedForMe)
                $validMessages[] = $msg;
        }

        return response()->json([
            'success' => true,
            'conversation_id' => (string) $conversation->id,
            'messages' => $validMessages
        ]);
    }

    /**
     * Envía un mensaje a otro usuario y dispara el evento correspondiente.
     *
     * @param Request $request Solicitud HTTP con los datos del mensaje.
     * @param string $username Nombre de usuario del destinatario.
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendMessage(Request $request, $username)
    {
        try {
            $request->validate([
                'content' => 'nullable|string|max:1000',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120'
            ]);

            if (!$request->input('content') && !$request->hasFile('image')) {
                return response()->json(['success' => false, 'message' => 'El mensaje no puede estar vacío.'], 400);
            }

            $me = $request->user();
            $targetUser = User::where('username', $username)->first();

            if (!$targetUser)
                return response()->json(['success' => false, 'message' => 'Usuario no encontrado.'], 404);

            if (!$this->canMessage((string) $me->id, $targetUser)) {
                return response()->json(['success' => false, 'message' => 'La configuración de privacidad de este usuario no permite que le envíes mensajes.'], 403);
            }

            $conversation = $this->getOrCreateConversation($me->id, $targetUser->id);

            $imagePath = null;
            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('chat_images', 's3');
                $imagePath = Storage::disk('s3')->url($path);
            }

            $message = Message::create([
                'conversation_id' => (string) $conversation->id,
                'sender_id' => (string) $me->id,
                'content' => $request->input('content'),
                'image_path' => $imagePath,
                'read_by' => [(string) $me->id],
            ]);

            $conversation->update(['last_message_at' => now()]);

            $cleanMessage = $message->fresh();
            $cleanArray = $this->prepareMessageForBroadcast($cleanMessage);

            try {
                event(new MessageSent($cleanArray, (string) $targetUser->id));
            } catch (\Exception $e) {
                Log::error('Error de WebSockets: ' . $e->getMessage());
            }

            return response()->json(['success' => true, 'message' => $cleanMessage]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error_detail' => $e->getMessage()], 500);
        }
    }

    /**
     * Obtiene la lista de conversaciones del usuario actual.
     *
     * @param Request $request Solicitud HTTP actual.
     * @return \Illuminate\Http\JsonResponse
     */
    public function getConversations(Request $request)
    {
        $me = $request->user();
        $myIdStr = (string) $me->id;

        $conversations = Conversation::where('room_hash', 'like', "%{$myIdStr}%")->get();
        $chatList = [];

        foreach ($conversations as $conv) {
            $otherUserId = $this->getReceiverId($conv, $myIdStr);

            if (!$otherUserId)
                continue;

            $otherUser = User::find($otherUserId);
            if (!$otherUser)
                continue;

            $recentMessages = Message::where('conversation_id', (string) $conv->id)
                ->orderBy('created_at', 'desc')
                ->take(30)
                ->get();

            $validLastMessage = null;
            foreach ($recentMessages as $msg) {
                $deletedBy = $msg->deleted_by ?? [];
                if (is_object($deletedBy))
                    $deletedBy = (array) $deletedBy;

                $isDeletedForMe = false;
                foreach ($deletedBy as $dId) {
                    if ((string) $dId === $myIdStr) {
                        $isDeletedForMe = true;
                        break;
                    }
                }

                if (!$isDeletedForMe) {
                    $validLastMessage = $msg;
                    break;
                }
            }

            $unread = false;
            if ($validLastMessage && $validLastMessage->sender_id !== $myIdStr) {
                $readBy = $validLastMessage->read_by ?? [];
                if (is_object($readBy))
                    $readBy = (array) $readBy;
                if (!in_array($myIdStr, $readBy)) {
                    $unread = true;
                }
            }

            $chatList[] = [
                'conversation_id' => (string) $conv->id,
                'user' => $otherUser,
                'last_message' => $validLastMessage,
                'unread' => $unread,
            ];
        }

        usort($chatList, function ($a, $b) {
            $timeA = $a['last_message'] ? Carbon::parse($a['last_message']->created_at)->timestamp : 0;
            $timeB = $b['last_message'] ? Carbon::parse($b['last_message']->created_at)->timestamp : 0;
            return $timeB <=> $timeA;
        });

        return response()->json(['success' => true, 'conversations' => $chatList]);
    }

    /**
     * Edita un mensaje enviado por el usuario actual dentro del tiempo permitido.
     *
     * @param Request $request Solicitud HTTP con el contenido actualizado.
     * @param mixed $messageId Identificador del mensaje a editar.
     * @return \Illuminate\Http\JsonResponse
     */
    public function editMessage(Request $request, $messageId)
    {
        $me = $request->user();
        $msg = Message::find($messageId);

        if (!$msg || $msg->sender_id !== (string) $me->id)
            return response()->json(['success' => false], 403);
        if ($msg->created_at->diffInSeconds(now()) > 180)
            return response()->json(['success' => false], 400);

        $msg->forceFill([
            'content' => $request->input('content'),
            'is_edited' => true
        ])->save();

        $cleanMsg = $msg->fresh();
        $cleanArray = $this->prepareMessageForBroadcast($cleanMsg);

        $conversation = Conversation::find($msg->conversation_id);
        $receiverId = $this->getReceiverId($conversation, (string) $me->id);

        event(new MessageEdited($cleanArray, $receiverId));
        return response()->json(['success' => true, 'message' => $cleanMsg]);
    }

    /**
     * Elimina un mensaje de forma local o para todos según el tipo de eliminación.
     *
     * @param Request $request Solicitud HTTP con el tipo de eliminación.
     * @param mixed $messageId Identificador del mensaje a eliminar.
     * @return \Illuminate\Http\JsonResponse
     */
    public function deleteMessage(Request $request, $messageId)
    {
        $me = $request->user();
        $msg = Message::find($messageId);
        $type = $request->query('type') ?? $request->input('type') ?? $request->type;

        if (!$msg)
            return response()->json(['success' => false], 404);

        $conversationId = (string) $msg->conversation_id;
        $conversation = Conversation::find($conversationId);
        $receiverId = $this->getReceiverId($conversation, (string) $me->id);

        if ($type === 'everyone') {
            if ($msg->sender_id !== (string) $me->id)
                return response()->json(['success' => false], 403);
            $msg->delete();
            event(new MessageDeleted((string) $messageId, $conversationId, (string) $me->id, $receiverId));
        } else {
            $deletedBy = $msg->deleted_by ?? [];
            if (is_object($deletedBy))
                $deletedBy = (array) $deletedBy;
            elseif (!is_array($deletedBy))
                $deletedBy = [];

            if (!in_array((string) $me->id, $deletedBy)) {
                $deletedBy[] = (string) $me->id;
                $msg->forceFill(['deleted_by' => array_values($deletedBy)])->save();
                Message::where('_id', $messageId)->orWhere('id', $messageId)->update([
                    'deleted_by' => array_values($deletedBy)
                ]);
            }
        }
        return response()->json(['success' => true]);
    }

    /**
     * Envía una respuesta a una historia como mensaje directo.
     *
     * @param Request $request Solicitud HTTP con el contenido de la respuesta y datos de la historia.
     * @param mixed $userId Identificador del usuario que creó la historia.
     * @return \Illuminate\Http\JsonResponse
     */
    public function replyToStory(Request $request, $userId)
    {
        $me = $request->user();

        $request->validate([
            'content' => 'required|string|max:500',
            'story_media_path' => 'required|string',
            'story_media_type' => 'required|string',
        ]);

        $targetUser = User::find($userId);
        if (!$targetUser) {
            return response()->json(['success' => false, 'message' => 'Usuario no encontrado.'], 404);
        }

        if (!$this->canMessage((string)$me->id, $targetUser)) {
            return response()->json(['success' => false, 'message' => 'La configuración de privacidad de este usuario no permite que le envíes mensajes.'], 403);
        }

        $conversation = $this->getOrCreateConversation($me->id, $targetUser->id);

        $message = Message::create([
            'conversation_id' => (string) $conversation->id,
            'sender_id' => (string) $me->id,
            'content' => $request->input('content'),
            'story_media_path' => $request->input('story_media_path'),
            'story_media_type' => $request->input('story_media_type'),
            'read_by' => [(string) $me->id],
        ]);

        $conversation->update(['last_message_at' => now()]);

        $cleanMessage = $message->fresh();
        $cleanArray = $this->prepareMessageForBroadcast($cleanMessage);

        event(new MessageSent($cleanArray, (string) $targetUser->id));

        return response()->json([
            'success' => true,
            'message' => $cleanMessage
        ]);
    }
}