<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Follow extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'follows';
    protected $guarded = [];
    protected $fillable = [
        'follower_id',
        'followed_id',
        'status',
    ];

    public function follower()
    {
        return $this->belongsTo(User::class, 'follower_id');
    }

    public function followed()
    {
        return $this->belongsTo(User::class, 'followed_id');
    }
    
}