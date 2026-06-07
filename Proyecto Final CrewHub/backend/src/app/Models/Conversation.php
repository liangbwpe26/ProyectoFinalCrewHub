<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Modelo Conversation
 *
 * Representa una conversación almacenada en MongoDB.
 *
 * Propiedades principales (campos de la colección):
 * @property bool   $is_group         Indica si la conversación es de grupo
 * @property string $name             Nombre de la conversación (opcional para chats 1:1)
 * @property array  $participant_ids  IDs de los participantes
 * @property string $room_hash        Hash único de la sala
 * @property \Illuminate\Support\Carbon|null $last_message_at Fecha/hora del último mensaje
 */
class Conversation extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'conversations';

    protected $fillable = [
        'is_group',
        'name',
        'participant_ids',
        'room_hash',
        'last_message_at',
    ];

    protected $casts = [
        'is_group' => 'boolean',
        'last_message_at' => 'datetime',
        'participant_ids' => 'array',
    ];
}