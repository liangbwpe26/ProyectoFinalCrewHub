<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Modelo Comment
 * 
 * Representa un comentario en la aplicación.
 * Permite gestionar comentarios asociados a posts, reacciones y respuestas.
 */
class Comment extends Model
{
    /**
     * Atributos asignables en masa
     * 
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id', 
        'post_id', 
        'content', 
        'parent_id',
        'drop_id',
    ];

    /**
     * Obtiene el usuario que creó el comentario
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user() {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Obtiene las reacciones asociadas al comentario
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function reactions() {
        return $this->hasMany(CommentReaction::class, 'comment_id');
    }

    /**
     * Obtiene las respuestas (comentarios hijo) ordenadas por fecha de creación
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function replies() {
        return $this->hasMany(Comment::class, 'parent_id')->orderBy('created_at', 'asc');
    }
}