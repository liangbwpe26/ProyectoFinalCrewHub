<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Message extends Model
{
    /**
     * Modelo de mensajes de una conversación.
     *
     * Campos rellenables:
     * - conversation_id: ID de la conversación
     * - sender_id: ID del remitente
     * - content: contenido del mensaje
     * - is_read: indicador de leído
     * - is_edited: indicador de edición
     * - read_by: array con IDs de usuarios que leyeron
     * - deleted_by: IDs de usuarios que borraron el mensaje
     * - story_media_path, story_media_type, image_path: rutas/tipos de medios
     *
     * @property array $read_by
     * @package App\Models
     */
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