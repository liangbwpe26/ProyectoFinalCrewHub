<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Message extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'messages';

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'content',
        'is_read',
        'is_edited',
        'read_by',
        'deleted_by',
        'story_media_path',
        'story_media_type',
        'image_path',
    ];

    protected $casts = [
        'read_by' => 'array',
    ];
}