<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Conversation extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'conversations';

    protected $fillable = [
        'is_group',
        'name',
        'participant_ids',
        'room_hash', // <-- NUEVO CAMPO AÑADIDO
        'last_message_at',
    ];

    protected $casts = [
        'is_group' => 'boolean',
        'last_message_at' => 'datetime',
        'participant_ids' => 'array',
    ];
}