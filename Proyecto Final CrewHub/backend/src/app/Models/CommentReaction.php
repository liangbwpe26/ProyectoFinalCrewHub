<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class CommentReaction extends Model
{
    protected $fillable = ['user_id', 'comment_id'];
}