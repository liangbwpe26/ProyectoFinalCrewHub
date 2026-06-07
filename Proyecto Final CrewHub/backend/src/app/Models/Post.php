<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Post extends Model
{
    /**
     * Modelo de publicación (post) generado por usuarios.
     *
     * Campos comunes:
     * - user_id: autor de la publicación
     * - content: texto del post
     * - image_path: ruta de imagen asociada
     * - description: descripción breve
     * - category: categoría del post
     * - community_id: comunidad asociada
     * - status: estado ('approved' por defecto)
     * - original_post_id: referencia a un post original (repost)
     * - is_promoted, promoted_until: promoción del post
     *
     * Relaciones:
     * - user(): autor
     * - community(): comunidad asociada
     * - originalPost(): post original si es repost
     *
     * @package App\Models
     */
    protected $fillable = [
        'user_id',
        'content',
        'image_path',
        'description',
        'category',
        'community_id',
        'status',
        'original_post_id',
        'is_promoted',
        'promoted_until',
    ];

    protected $attributes = [
        'status' => 'approved',
        'is_promoted' => false,
        'promoted_until' => null,
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function community()
    {
        return $this->belongsTo(Community::class, 'community_id');
    }

    public function originalPost()
    {
        return $this->belongsTo(Post::class, 'original_post_id');
    }

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'is_promoted' => 'boolean',
            'promoted_until' => 'datetime',
        ];
    }
}