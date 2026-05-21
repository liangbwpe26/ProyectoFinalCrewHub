<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Story extends Model
{
    protected $collection = 'stories';

    protected $fillable = [
        'user_id',
        'media_path',
        'media_type',
        'expires_at',
        'viewed_by',
        'liked_by',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'viewed_by' => 'array',
        'liked_by' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}