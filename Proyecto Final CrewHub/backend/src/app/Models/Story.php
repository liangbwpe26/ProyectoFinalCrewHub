<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Story extends Model
{
    protected $collection = 'stories';

    protected $fillable = [
        'user_id',
        'media_path',
        'media_type', // Puede ser 'image' o 'video'
        'expires_at', // Aquí guardaremos la fecha actual + 8 horas
        'viewed_by',  // Arreglo con los IDs de quienes ya la vieron
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'viewed_by' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}