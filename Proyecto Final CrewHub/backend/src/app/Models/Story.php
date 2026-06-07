<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Story extends Model
{
    /**
     * Historia efímera publicada por un usuario en una comunidad.
     *
     * Campos rellenables:
     * - user_id: autor de la story
     * - community_id: comunidad asociada (opcional)
     * - media_path: ruta del medio (imagen/video)
     * - media_type: tipo de medio
     * - expires_at: fecha y hora de expiración
     * - viewed_by: usuarios que vieron la story
     * - liked_by: usuarios que dieron like
     *
     * Relaciones:
     * - user(): autor
     * - community(): comunidad asociada
     *
     * @package App\Models
     */
    protected $collection = 'stories';

    protected $fillable = [
        'user_id',
        'community_id',
        'media_path',
        'media_type',
        'expires_at',
        'viewed_by',
        'liked_by'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function community()
    {
        return $this->belongsTo(Community::class, 'community_id');
    }
}