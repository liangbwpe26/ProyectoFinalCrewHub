<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Message;

// 'ShouldBroadcastNow' hace que el mensaje vuele al instante sin esperar en colas
class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    public function broadcastOn(): array
    {
        // Emitimos en un canal "privado" exclusivo para esta sala
        return [
            new PrivateChannel('chat.' . $this->message->conversation_id),
        ];
    }

    // Le damos un nombre limpio al evento para que React lo entienda fácil
    public function broadcastAs(): string
    {
        return 'MessageSent';
    }
}