<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Community extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'communities';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'banner_path',
        'creator_id',
        'members',
        'admins',
        'require_post_approval',
        'tags',
        'banner_path',
        'rules',
        'avatar_path',
    ];

    protected $attributes = [
        'members' => '[]',
        'admins' => '[]',
        'require_post_approval' => true,
        'tags' => '[]',
    ];

    protected function casts(): array
    {
        return [
            'members' => 'array',
            'admins' => 'array',
            'require_post_approval' => 'boolean',
            'tags' => 'array',
        ];
    }
}