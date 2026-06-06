<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FollowController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ChatController;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\PostController;
use App\Http\Controllers\PostInteractionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\StoryController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\DropController;
use App\Http\Controllers\ReportController;
use App\Http\Middleware\ProfanityFilter;
use App\Http\Controllers\MonetizationController;
use App\Http\Controllers\SettingsController;

// Rutas Públicas
Route::middleware(['api'])->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

Broadcast::routes(['middleware' => ['auth:sanctum']]);

// RUTAS PROTEGIDAS (Requieren Token de Sesión)
Route::middleware(['auth:sanctum', ProfanityFilter::class])->group(function () {

    // Obtener los datos del usuario logueado
    Route::get('/user', [AuthController::class, 'show']);
    Route::put('/user/interests', [UserController::class, 'updateInterests']);
    Route::get('/interests', [UserController::class, 'getAvailableInterests']);
    Route::put('/settings/account', [SettingsController::class, 'updateAccount']);
    Route::put('/settings/notifications', [SettingsController::class, 'updateNotifications']);
    Route::post('/support/tickets', [SettingsController::class, 'storeTicket']);

    // --- SISTEMA DE USUARIOS Y PERFILES ---
    Route::get('/users/search', [UserController::class, 'search']);
    Route::get('/suggestions', [UserController::class, 'suggestions']);
    Route::post('/users/update', [UserController::class, 'update']);
    
    Route::get('/users/{username}/reposts', [PostController::class, 'userReposts']);
    Route::get('/users/{username}/followers', [FollowController::class, 'getFollowers']);
    Route::get('/users/{username}/following', [FollowController::class, 'getFollowing']);
    Route::get('/users/{username}/reposted-drops', [DropController::class, 'getUserRepostedDrops']);

    // --- MONETIZACIÓN Y NEGOCIOS ---
    Route::post('/monetization/subscribe', [MonetizationController::class, 'subscribe']);
    Route::post('/monetization/business', [MonetizationController::class, 'upgradeToBusiness']);
    Route::post('/monetization/promote/{postId}', [MonetizationController::class, 'promotePost']);
    Route::post('/monetization/downgrade', [MonetizationController::class, 'downgradeBusiness']);
    Route::post('/users/{username}/block', [UserController::class, 'toggleBlock']);
    
    Route::get('/users/{username}', [UserController::class, 'show']);

    // --- SISTEMA DE SEGUIDORES ---
    Route::post('/follow/{id}', [FollowController::class, 'follow']);
    Route::delete('/unfollow/{id}', [FollowController::class, 'unfollow']);
    Route::get('/mutuals', [FollowController::class, 'getMutuals']);
    Route::get('/requests/pending', [FollowController::class, 'getPendingRequests']);
    Route::post('/requests/accept/{followerId}', [FollowController::class, 'acceptRequest']);
    Route::post('/requests/reject/{followerId}', [FollowController::class, 'rejectRequest']);

    // --- CHATS Y MENSAJERÍA ---
    Route::get('/conversations', [ChatController::class, 'getConversations']);
    Route::post('/chat/start/{friendId}', [ChatController::class, 'startConversation']);
    Route::get('/chats-unread', [ChatController::class, 'getUnreadCount']);
    Route::post('/chats/{username}/read', [ChatController::class, 'markChatAsRead']);
    
    Route::get('/chat/{conversationId}/messages', [ChatController::class, 'getMessages']);
    Route::post('/chat/{conversationId}/messages', [ChatController::class, 'sendMessage']);
    
    Route::get('/messages/{username}', [ChatController::class, 'getMessages']);
    Route::post('/messages/{username}', [ChatController::class, 'sendMessage']);
    Route::put('/messages/{messageId}', [ChatController::class, 'editMessage']);
    Route::delete('/messages/{messageId}', [ChatController::class, 'deleteMessage']);
    Route::post('/chat/story-reply/{userId}', [ChatController::class, 'replyToStory']);

    // --- PUBLICACIONES (POSTS) ---
    Route::get('/posts', [PostController::class, 'index']);
    Route::post('/posts', [PostController::class, 'store']);
    Route::get('/posts/feed', [PostController::class, 'index']);
    Route::get('/posts/{id}', [PostController::class, 'show']);
    Route::put('/posts/{id}', [PostController::class, 'update']);
    Route::delete('/posts/{id}', [PostController::class, 'destroy']);
    
    Route::post('/posts/{id}/repost', [PostController::class, 'toggleRepost']);
    Route::post('/posts/{postId}/save', [PostInteractionController::class, 'toggleSave']);
    Route::get('/saved-posts', [PostInteractionController::class, 'getSavedPosts']);

    // --- INTERACCIONES (REACCIONES Y COMENTARIOS DE POSTS) ---
    Route::post('/posts/{postId}/react', [PostInteractionController::class, 'toggleReaction']);
    Route::post('/posts/{postId}/comments', [PostInteractionController::class, 'addComment']);
    Route::get('/posts/{postId}/comments', [PostInteractionController::class, 'getComments']);
    Route::get('/comments/{commentId}/replies', [PostInteractionController::class, 'getReplies']);
    Route::get('/mentions/search', [PostInteractionController::class, 'searchMentions']);
    Route::delete('/comments/{id}', [PostController::class, 'deleteComment']);
    Route::post('/comments/{id}/react', [PostController::class, 'toggleCommentLike']);

    // --- DROPS ---
    Route::get('/drops/feed', [DropController::class, 'feed']);
    Route::get('/saved-drops', [DropController::class, 'getSavedDrops']);
    Route::get('/drops/{id}', [DropController::class, 'show']);
    Route::post('/drops', [DropController::class, 'store']);
    Route::post('/drops/{id}/view', [DropController::class, 'incrementView']);
    Route::post('/drops/{id}/like', [DropController::class, 'toggleLike']);
    Route::post('/drops/{id}/save', [DropController::class, 'toggleSave']);
    Route::post('/drops/{id}/repost', [DropController::class, 'toggleRepost']);
    Route::delete('/drops/{id}', [DropController::class, 'destroy']);
    Route::get('/drops/{id}/comments', [DropController::class, 'getComments']);
    Route::post('/drops/{id}/comments', [DropController::class, 'addComment']);
    Route::delete('/drops/comments/{id}', [DropController::class, 'deleteComment']);
    Route::post('/drops/comments/{id}/react', [DropController::class, 'toggleCommentLike']);

    // --- HISTORIAS ---
    Route::get('/stories/feed', [StoryController::class, 'getFeedStories']);
    Route::post('/stories', [StoryController::class, 'store']);
    Route::post('/stories/{id}/view', [StoryController::class, 'markAsViewed']);
    Route::delete('/stories/{id}', [StoryController::class, 'destroy']);
    Route::post('/stories/{id}/like', [StoryController::class, 'toggleLike']);
    Route::get('/stories/{id}/stats', [StoryController::class, 'getStats']);

    // --- COMUNIDADES ---
    Route::get('/communities', [CommunityController::class, 'index']);
    Route::post('/communities', [CommunityController::class, 'store']);
    Route::get('/communities/{slug}', [CommunityController::class, 'show']);
    Route::delete('/communities/{id}', [CommunityController::class, 'destroy']);
    Route::post('/communities/{id}/membership', [CommunityController::class, 'toggleMembership']);
    Route::get('/communities/{id}/members', [CommunityController::class, 'getMembers']);
    Route::post('/communities/{id}/members/{userId}/kick', [CommunityController::class, 'removeMember']);
    Route::post('/communities/{id}/members/{userId}/promote', [CommunityController::class, 'promoteToAdmin']);
    Route::post('/communities/{id}/settings', [CommunityController::class, 'updateSettings']);
    Route::post('/communities/{id}/banner', [CommunityController::class, 'uploadBanner']);
    Route::post('/communities/{id}/avatar', [CommunityController::class, 'uploadAvatar']);
    Route::get('/communities/{id}/pending-posts', [CommunityController::class, 'getPendingPosts']);
    Route::post('/posts/{postId}/moderate', [CommunityController::class, 'moderatePost']);

    // --- NOTIFICACIONES GLOBALES ---
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::put('/notifications/read', [NotificationController::class, 'markAsRead']);

    // --- REPORTES Y MODERACIÓN ---
    Route::post('/reports', [ReportController::class, 'store']);
    Route::get('/admin/reports', [ReportController::class, 'index']);
    Route::post('/admin/reports/{id}/resolve', [ReportController::class, 'resolve']);
    Route::get('/admin/tickets', [ReportController::class, 'getTickets']);
    Route::post('/admin/tickets/{id}/resolve', [ReportController::class, 'resolveTicket']);
    Route::get('/admin/users/sanctioned', [ReportController::class, 'getSanctionedUsers']);
    Route::post('/admin/users/{id}/toggle-ban', [ReportController::class, 'toggleBan']);
    Route::post('/admin/users/{id}/reset-strikes', [ReportController::class, 'resetStrikes']);
});