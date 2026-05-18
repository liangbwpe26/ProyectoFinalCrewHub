<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class MessageDeleted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public $messageId;
    public $conversationId;
    public $senderId;
    public $receiverId;

    public function __construct($messageId, $conversationId, $senderId = null, $receiverId = null)
    {
        $this->messageId = $messageId;
        $this->conversationId = $conversationId;
        $this->senderId = $senderId;
        $this->receiverId = $receiverId;
    }

    public function broadcastOn()
    {
        $channels = [ new PrivateChannel('chat.' . $this->conversationId) ];
        
        if ($this->senderId) $channels[] = new PrivateChannel('App.Models.User.' . $this->senderId);
        if ($this->receiverId) $channels[] = new PrivateChannel('App.Models.User.' . $this->receiverId);
        
        return $channels;
    }

    public function broadcastAs()
    {
        return 'MessageDeleted';
    }
}