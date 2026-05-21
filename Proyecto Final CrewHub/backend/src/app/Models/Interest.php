<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Interest extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'interests';

    protected $fillable = [
        'name',
        'slug',
        'icon_name',
    ];
}
