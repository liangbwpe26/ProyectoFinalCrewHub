<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Modelo de Drop que representa los documentos de la colección drops.
 *
 * @package App\Models
 */
class Drop extends Model
{
    /**
     * Nombre de la colección MongoDB asociada al modelo.
     *
     * @var string
     */
    protected $collection = 'drops';

    /**
     * Atributos que pueden asignarse en masa.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'video_url',
        'description',
        'allow_downloads',
        'views_count'
    ];

    /**
     * Conversión de tipos para atributos específicos.
     *
     * @var array
     */
    protected $casts = [
        'allow_downloads' => 'boolean',
        'views_count' => 'integer'
    ];

    /**
     * Relación inversa con el usuario propietario del drop.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}