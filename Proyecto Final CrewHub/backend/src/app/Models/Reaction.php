<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Reaction extends Model
{
    /**
     * Reacción de un usuario a una publicación.
     *
     * Campos rellenables:
     * - user_id: ID del usuario que reacciona
     * - post_id: ID de la publicación
     *
     * @package App\Models
     */
    protected $fillable = [
        'user_id',
        'post_id'
    ];
}