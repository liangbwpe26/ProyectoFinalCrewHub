<?php

namespace App\Models;

// Asegúrate de usar el modelo correcto según tu base de datos (MongoDB o MySQL)
use MongoDB\Laravel\Eloquent\Model; 

class Repost extends Model
{
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