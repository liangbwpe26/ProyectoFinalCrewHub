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
        // Le decimos a Sanctum que use el modelo que acabamos de crear
        Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);
    }
}