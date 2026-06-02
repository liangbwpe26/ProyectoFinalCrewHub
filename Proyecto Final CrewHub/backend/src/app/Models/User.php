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
        'blocked_users',
        'privacy_messages', 
        'privacy_comments',
        'is_business',
        'is_verified',
        'business_category',
        'banner_picture',
        'business_slogan',
        'ad_plan',
    ];

    protected $attributes = [
        'interests' => '[]',
        'privacy_messages' => 'everyone',
        'privacy_comments' => 'everyone',
        'is_business' => false,
        'is_verified' => false,
        'business_category' => null,
    ];

    protected $appends = [
        'is_admin'
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
            'is_business' => 'boolean',
            'is_verified' => 'boolean',
        ];
    }

    public function getIsAdminAttribute()
    {
        $admins = ['liangbw_']; 
        
        return in_array($this->username, $admins);
    }
}