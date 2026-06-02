<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Drop extends Model
{
    protected $collection = 'drops';

    protected $fillable = [
        'user_id',
        'video_url',
        'description',
        'allow_downloads',
        'views_count'
    ];

    protected $casts = [
        'allow_downloads' => 'boolean',
        'views_count' => 'integer'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}