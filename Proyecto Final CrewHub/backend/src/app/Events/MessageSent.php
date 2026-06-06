<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class MessageSent implements ShouldBroadcastNow
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
        $channels = [
            new PrivateChannel('chat.' . $this->message['conversation_id']),
            new PrivateChannel('App.Models.User.' . $this->message['sender_id'])
        ];

        if ($this->receiverId) {
            $channels[] = new PrivateChannel('App.Models.User.' . $this->receiverId);
        }

        return $channels;
    }

    public function broadcastAs()
    {
        return 'MessageSent';
    }
}