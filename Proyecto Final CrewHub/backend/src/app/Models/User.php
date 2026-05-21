<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use MongoDB\Laravel\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $connection = 'mongodb';
    protected $collection = 'users';

    protected $fillable = [
        'username',
        'email',
        'password',
        'display_name', 
        'profile_picture',
        'date_of_birth',
        'email_verified_at',
        'verification_code',
        'reset_password_code',
        'interests',
    ];

    protected $attributes = [
        'interests' => '[]',
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    protected function casts(): array
    {
        return [
            'fecha_registro' => 'datetime',
            'date_of_birth' => 'date',
            'interests' => 'array',
        ];
    }
}