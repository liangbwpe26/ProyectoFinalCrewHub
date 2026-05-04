<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Post extends Model
{
    // Los campos que permitimos guardar
    protected $fillable = [
        'user_id',
        'image_path',
        'description'
    ];

    // Relación: Un post pertenece a un Usuario
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}