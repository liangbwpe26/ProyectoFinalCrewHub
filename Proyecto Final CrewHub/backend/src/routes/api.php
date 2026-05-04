<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ChatController;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\ProfileController;

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
    // Rutas de Perfil
    Route::get('/profile/{username}', [ProfileController::class, 'show']);
    Route::post('/profile/update', [ProfileController::class, 'update']);

    // Rutas para gestionar solicitudes de seguimiento
    Route::get('/requests/pending', [FollowController::class, 'getPendingRequests']);
    Route::post('/requests/accept/{followerId}', [FollowController::class, 'acceptRequest']);
    Route::post('/requests/reject/{followerId}', [FollowController::class, 'rejectRequest']);

    // Rutas para Publicaciones (Posts)
    Route::post('/posts', [App\Http\Controllers\PostController::class, 'store']);
    Route::get('/posts/feed', [App\Http\Controllers\PostController::class, 'index']);

    // Reacciones y Comentarios en Posts
    Route::post('/posts/{postId}/react', [App\Http\Controllers\PostInteractionController::class, 'toggleReaction']);
    Route::post('/posts/{postId}/comments', [App\Http\Controllers\PostInteractionController::class, 'addComment']);
    Route::get('/posts/{postId}/comments', [App\Http\Controllers\PostInteractionController::class, 'getComments']);

    // Rutas para Menciones, Respuestas y Notificaciones
    Route::get('/mentions/search', [App\Http\Controllers\PostInteractionController::class, 'searchMentions']);
    Route::post('/comments/{commentId}/react', [App\Http\Controllers\PostInteractionController::class, 'toggleCommentReaction']);

    // Centro de Notificaciones Global
    Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'index']);
    Route::put('/notifications/read', [App\Http\Controllers\NotificationController::class, 'markAsRead']);

    // Obtener todas las respuestas de un comentario
    Route::get('/comments/{commentId}/replies', [App\Http\Controllers\PostInteractionController::class, 'getReplies']);

    // Vista individual de una publicación
    Route::get('/posts/{id}', [App\Http\Controllers\PostController::class, 'show']);

    // Rutas para ver las listas de seguidores/seguidos
    Route::get('/users/{username}/followers', [FollowController::class, 'getFollowers']);
    Route::get('/users/{username}/following', [FollowController::class, 'getFollowing']);
});