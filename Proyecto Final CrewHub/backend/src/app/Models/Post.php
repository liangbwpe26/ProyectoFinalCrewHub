<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Post extends Model
{
    protected $fillable = [
        'user_id',
        'content',
        'image_path',
        'description',
        'category',
        'community_id',
        'status',
        'original_post_id',
        'is_promoted',
        'promoted_until',
    ];

    protected $attributes = [
        'status' => 'approved',
        'is_promoted' => false,
        'promoted_until' => null,
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function community()
    {
        return $this->belongsTo(Community::class, 'community_id');
    }

    public function originalPost()
    {
        return $this->belongsTo(Post::class, 'original_post_id');
    }

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'is_promoted' => 'boolean',
            'promoted_until' => 'datetime',
        ];
    }
}