<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Follow;
use App\Models\Message;
use App\Events\MessageSent;

class ChatController extends Controller
{
    public function startConversation(Request $request, $friendId)
    {
        $me = $request->user();
        $myId = (string) $me->_id;
        $theirId = (string) $friendId;

        $ids = [$myId, $theirId];
        sort($ids); 
        $roomHash = implode('-', $ids);

        $conversation = Conversation::where('is_group', false)
            ->where('room_hash', $roomHash)
            ->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'is_group' => false,
                'participant_ids' => [$myId, $theirId],
                'room_hash' => $roomHash,
                'last_message_at' => now(),
            ]);
        }

        return response()->json(['success' => true, 'conversation' => $conversation]);
    }

    public function getMessages(Request $request, $conversationId)
    {
        $me = $request->user();
        $myId = (string) $me->_id;

        $conversation = Conversation::find($conversationId);
        if (!$conversation || !collect($conversation->participant_ids ?? [])->contains($myId)) {
            return response()->json(['success' => false, 'message' => 'Acceso denegado.'], 403);
        }

        $messages = Message::where('conversation_id', $conversationId)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json(['success' => true, 'messages' => $messages]);
    }

    public function sendMessage(Request $request, $conversationId)
    {
        $request->validate(['content' => 'required|string|max:1000']);

        $me = $request->user();
        $myId = (string) $me->_id;

        $conversation = Conversation::find($conversationId);
        if (!$conversation || !collect($conversation->participant_ids ?? [])->contains($myId)) {
            return response()->json(['success' => false, 'message' => 'Acceso denegado.'], 403);
        }

        $message = Message::create([
            'conversation_id' => $conversationId,
            'sender_id' => $myId,
            'content' => $request->input('content'),
            'read_by' => [$myId], 
        ]);

        $conversation->update(['last_message_at' => now()]);

        event(new MessageSent($message));

        return response()->json(['success' => true, 'message' => $message]);
    }
}