<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Reaction extends Model
{
    protected $fillable = [
        'user_id',
        'post_id'
    ];
}