<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ChatController;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PostInteractionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\StoryController;

// Rutas Públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/resend-verification', [AuthController::class, 'resendVerificationCode']);

Broadcast::routes(['middleware' => ['auth:sanctum']]);

// RUTAS PROTEGIDAS (Requieren Token de Sesión)
Route::middleware('auth:sanctum')->group(function () {

    // Obtener los datos del usuario logueado
    Route::get('/user', function (Request $request) {
        return collect($request->user())->except(['password_hash']);
    });

    Route::put('/user/interests', [UserController::class, 'updateInterests']);
    Route::get('/interests', [UserController::class, 'getAvailableInterests']);

    // Rutas del Sistema de Seguidores
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
    Route::get('/posts', [PostController::class, 'index']);
    Route::post('/posts', [PostController::class, 'store']);
    Route::get('/posts/feed', [PostController::class, 'index']);


    // Reacciones y Comentarios en Posts
    Route::post('/posts/{postId}/react', [PostInteractionController::class, 'toggleReaction']);
    Route::post('/posts/{postId}/comments', [PostInteractionController::class, 'addComment']);
    Route::get('/posts/{postId}/comments', [PostInteractionController::class, 'getComments']);

    // Rutas para Menciones, Respuestas y Notificaciones
    Route::get('/mentions/search', [PostInteractionController::class, 'searchMentions']);
    Route::post('/comments/{commentId}/react', [PostInteractionController::class, 'toggleCommentReaction']);

    // Centro de Notificaciones Global
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/read', [NotificationController::class, 'markAsRead']);

    // Obtener todas las respuestas de un comentario
    Route::get('/comments/{commentId}/replies', [PostInteractionController::class, 'getReplies']);

    // Vista individual de una publicación
    Route::get('/posts/{id}', [PostController::class, 'show']);

    // Rutas para ver las listas de seguidores/seguidos
    Route::get('/users/{username}/followers', [FollowController::class, 'getFollowers']);
    Route::get('/users/{username}/following', [FollowController::class, 'getFollowing']);

    // Rutas de la Bandeja de Entrada y Chats
    Route::get('/conversations', [ChatController::class, 'getConversations']); // Lista lateral de chats
    Route::get('/messages/{username}', [ChatController::class, 'getMessages']); // Cargar un chat específico
    Route::post('/messages/{username}', [ChatController::class, 'sendMessage']); // Enviar mensaje
    Route::post('/posts/{postId}/save', [PostInteractionController::class, 'toggleSave']);
    Route::get('/saved-posts', [PostInteractionController::class, 'getSavedPosts']);

    // Rutas para Editar y Eliminar mensajes
    Route::put('/messages/{messageId}', [ChatController::class, 'editMessage']); // Editar mensaje (usa PUT)
    Route::delete('/messages/{messageId}', [ChatController::class, 'deleteMessage']); // Eliminar mensaje

    Route::get('/chats-unread', [ChatController::class, 'getUnreadCount']);
    Route::post('/chats/{username}/read', [ChatController::class, 'markChatAsRead']);

    // Rutas para editar y eliminar publicaciones
    Route::put('/posts/{id}', [PostController::class, 'update']);
    Route::delete('/posts/{id}', [PostController::class, 'destroy']);

    // Rutas para Historias (Stories)
    Route::post('/stories', [StoryController::class, 'store']);
    Route::get('/stories', [StoryController::class, 'getFeedStories']);
    Route::post('/stories/{id}/view', [StoryController::class, 'markAsViewed']);
    Route::delete('/stories/{id}', [StoryController::class, 'destroy']);
    Route::post('/stories/{id}/like', [StoryController::class, 'toggleLike']);
    Route::get('/stories/{id}/stats', [StoryController::class, 'getStats']);
    Route::post('/chat/story-reply/{userId}', [ChatController::class, 'replyToStory']);
});