<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Conversation;

Broadcast::channel('chat.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);
    if (!$conversation) return false;
    
    // Verificamos si el usuario actual está dentro del arreglo de participantes
    return collect($conversation->participant_ids)->contains((string) $user->_id);
});

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    \Log::info("Validando canal. User: {$user->_id}, ID buscado: {$id}");
    return (string) $user->_id === (string) $id;
});

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (string) $user->id === (string) $id;
});

Broadcast::channel('chat.{conversationId}', function ($user, $conversationId) {

    return true; 
});
