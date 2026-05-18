<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class MessageEdited implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public $message;
    public $receiverId;

    public function __construct(array $message, $receiverId = null)
    {
        $this->message = $message;
        $this->receiverId = $receiverId;
    }

    public function broadcastOn()
    {
        // Avisamos a la sala de chat Y a la bandeja del que editó
        $channels = [
            new PrivateChannel('chat.' . $this->message['conversation_id']),
            new PrivateChannel('App.Models.User.' . $this->message['sender_id'])
        ];

        // Si tenemos la ID de la otra persona, le avisamos a su bandeja
        if ($this->receiverId) {
            $channels[] = new PrivateChannel('App.Models.User.' . $this->receiverId);
        }

        return $channels;
    }

    public function broadcastAs()
    {
        return 'MessageEdited';
    }
}