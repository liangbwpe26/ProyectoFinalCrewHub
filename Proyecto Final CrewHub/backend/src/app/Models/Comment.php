<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Comment extends Model
{
    protected $fillable = [
        'user_id', 
        'post_id', 
        'content', 
        'parent_id',
        'drop_id',
        ];

    public function user() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reactions() {
        return $this->hasMany(CommentReaction::class, 'comment_id');
    }

    public function replies() {
        return $this->hasMany(Comment::class, 'parent_id')->orderBy('created_at', 'asc');
    }
}