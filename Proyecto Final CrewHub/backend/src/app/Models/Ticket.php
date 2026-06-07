<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Ticket extends Model
{
    /**
     * Ticket de soporte o consulta enviado por un usuario.
     *
     * Campos rellenables:
     * - user_id: ID del usuario que creó el ticket
     * - subject: asunto del ticket
     * - message: mensaje o descripción
     * - status: estado del ticket
     *
     * Relaciones:
     * - user(): usuario creador del ticket
     *
     * @package App\Models
     */
    protected $connection = 'mongodb';
    protected $collection = 'tickets';

    protected $fillable = [
        'user_id',
        'subject',
        'message',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}