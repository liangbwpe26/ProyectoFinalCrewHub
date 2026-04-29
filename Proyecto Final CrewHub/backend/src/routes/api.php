<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FollowController; 
use App\Http\Controllers\UserController;
use App\Http\Controllers\ChatController;
use Illuminate\Support\Facades\Broadcast;

// Rutas Públicas
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Broadcast::routes(['middleware' => ['auth:sanctum']]);

// RUTAS PROTEGIDAS (Requieren Token de Sesión)
Route::middleware('auth:sanctum')->group(function () {
    
    // Obtener los datos del usuario logueado
    Route::get('/user', function (Request $request) {
        return collect($request->user())->except(['password_hash']);
    });

    // Rutas del Sistema de Seguidores
    Route::post('/follow/{id}', [FollowController::class, 'follow']);
    Route::delete('/unfollow/{id}', [FollowController::class, 'unfollow']);
    Route::get('/mutuals', [FollowController::class, 'getMutuals']);
    Route::get('/users/search', [UserController::class, 'search']);
    Route::post('/chat/start/{friendId}', [ChatController::class, 'startConversation']);
    Route::get('/chat/{conversationId}/messages', [ChatController::class, 'getMessages']);
    Route::post('/chat/{conversationId}/messages', [ChatController::class, 'sendMessage']);
});