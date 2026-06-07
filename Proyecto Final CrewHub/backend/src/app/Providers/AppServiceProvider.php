<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;

use App\Models\PersonalAccessToken; 

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Indica a Laravel Sanctum que utilice nuestro modelo de token personalizado
        // que persiste tokens en MongoDB.
        Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);
    }
}