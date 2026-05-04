<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Follow extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'follows';
    protected $guarded = [];
    protected $fillable = [
        'follower_id', // El ID del usuario que da clic a "Seguir"
        'followed_id', // El ID del usuario que recibe el seguimiento
        'status', // 'pending' o 'accepted' (si es privado, empieza como 'pending')
    ];

    public function follower()
    {
        return $this->belongsTo(User::class, 'follower_id');
    }

    // El usuario que "es seguido" (el perfil que miramos)
    public function followed()
    {
        return $this->belongsTo(User::class, 'followed_id');
    }
    
}