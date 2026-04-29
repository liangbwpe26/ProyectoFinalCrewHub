<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Conversation;

Broadcast::channel('chat.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);
    if (!$conversation) return false;
    
    // Verificamos si el usuario actual está dentro del arreglo de participantes
    return collect($conversation->participant_ids)->contains((string) $user->_id);
});