<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Modelo de Reacción de Comentario
 *
 * Representa la reacción de un usuario a un comentario en la aplicación.
 *
 * @package App\Models
 */
class CommentReaction extends Model
{
    /**
     * Atributos que pueden ser asignados de forma masiva.
     *
     * @var array<string>
     */
    protected $fillable = ['user_id', 'comment_id'];
}