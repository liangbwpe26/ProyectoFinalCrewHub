<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Notification extends Model
{
    // app/Models/Notification.php
    protected $fillable = [
        'recipient_id', 
        'sender_id', 
        'type', 
        'post_id', 
        'comment_id',
        'is_read'
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function post()
    {
        return $this->belongsTo(Post::class, 'post_id');
    }
}