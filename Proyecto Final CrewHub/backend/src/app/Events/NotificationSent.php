<?php

namespace App\Events;

use App\Models\Notification;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationSent implements ShouldBroadcastNow 
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $notification;

    public function __construct(Notification $notification)
    {
        $this->notification = $notification;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('App.Models.User.' . $this->notification->recipient_id),
        ];
    }

    public function broadcastWith(): array
    {
        $this->notification->load(['sender', 'post']);
        
        $unreadCount = Notification::where('recipient_id', $this->notification->recipient_id)
                                   ->where('is_read', false)
                                   ->count();

        return [
            'notification' => $this->notification->toArray(),
            'unread_count' => $unreadCount
        ];
    }

    public function broadcastAs(): string
    {
        return 'notification.sent';
    }
}