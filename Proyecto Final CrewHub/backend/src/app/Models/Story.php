<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Story extends Model
{
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