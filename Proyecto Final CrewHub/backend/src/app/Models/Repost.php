<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model; 

class Repost extends Model
{
    /**
     * Repost: referencia de un usuario a una publicación existente.
     *
     * Campos rellenables:
     * - user_id: usuario que comparte
     * - post_id: publicación compartida
     *
     * Relaciones:
     * - user(): usuario que comparte
     * - post(): publicación relacionada
     *
     * @package App\Models
     */
    protected $collection = 'reposts';
    
    protected $fillable = [
        'user_id',
        'post_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function post()
    {
        return $this->belongsTo(Post::class, 'post_id');
    }
}