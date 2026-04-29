<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Message extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'messages';

    protected $fillable = [
        'conversation_id', // A qué chat pertenece
        'sender_id',       // Quién lo envió
        'content',         // El texto del mensaje
        'read_by',         // Arreglo de IDs para saber quién ya lo vio (tick azul)
    ];

    protected $casts = [
        'read_by' => 'array',
    ];
}