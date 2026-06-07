<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class SavedPost extends Model
{
    /**
     * Publicación guardada por un usuario.
     *
     * Campos rellenables:
     * - user_id: ID del usuario que guardó
     * - post_id: ID de la publicación guardada
     *
     * Relaciones:
     * - post(): publicación guardada
     *
     * @package App\Models
     */
    protected $connection = 'mongodb';
    protected $collection = 'saved_posts';

    protected $fillable = [
        'user_id',
        'post_id'
    ];
    public function post()
    {
        return $this->belongsTo(Post::class, 'post_id');
    }
}