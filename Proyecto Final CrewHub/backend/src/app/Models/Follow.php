<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Follow extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'follows';

    protected $fillable = [
        'follower_id', // El ID del usuario que da clic a "Seguir"
        'followed_id', // El ID del usuario que recibe el seguimiento
    ];
}