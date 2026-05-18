<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\User;
use App\Models\Follow;
use App\Models\Reaction;
use App\Models\Comment;

class PostController extends Controller
{
    // 1. CREAR UNA PUBLICACIÓN
    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:5120', // Máximo 5MB
            'description' => 'nullable|string|max:1000'
        ]);

        $me = $request->user();

        // Guardar la imagen en la carpeta storage/app/public/posts
        $path = $request->file('image')->store('posts', 'public');

        $post = Post::create([
            'user_id' => $me->_id,
            'image_path' => '/storage/' . $path,
            'description' => $request->input('description')
        ]);

        // Cargamos los datos del usuario para devolverlos inmediatamente a React
        $post->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Publicación creada con éxito',
            'post' => $post
        ]);
    }

    // 2. OBTENER EL MURO (FEED)
    public function index(Request $request)
    {
        $me = $request->user();

        // A. Obtener IDs de las personas que sigo (y me aceptaron)
        $followingIds = Follow::where('follower_id', $me->_id)
            ->where(function($query) {
                $query->where('status', 'accepted')->orWhereNull('status');
            })->pluck('followed_id')->toArray();

        // B. Sumar mi propio ID a la lista (quiero ver mis posts en el muro)
        $followingIds[] = $me->_id;

        // C. Obtener IDs de todos los usuarios públicos
        $publicUserIds = User::where(function($query) {
            $query->where('is_private', false)->orWhereNull('is_private');
        })->pluck('_id')->toArray();

        // Mezclamos ambas listas y quitamos duplicados
        $allowedIds = array_values(array_unique(array_merge($followingIds, $publicUserIds)));

        // D. Buscar los posts, ordenarlos por fecha y traer los datos del creador
        $posts = Post::with('user')
            ->whereIn('user_id', $allowedIds)
            ->orderBy('created_at', 'desc')
            ->take(50)
            ->get();

        // NUEVO: Añadimos las estadísticas de reacciones a cada post
        $posts->transform(function($post) use ($me) {
            $post->reactions_count = Reaction::where('post_id', $post->_id)->count();
            $post->comments_count = Comment::where('post_id', $post->_id)->count();
            $post->has_reacted = Reaction::where('post_id', $post->_id)
                                         ->where('user_id', $me->_id)
                                         ->exists();
            return $post;
        });

        return response()->json([
            'success' => true,
            'posts' => $posts
        ]);
    }

    // Obtener un solo post por su ID
    public function show(Request $request, $id)
    {
        $me = $request->user();
        $post = Post::with('user')->find($id);

        if (!$post) {
            return response()->json(['success' => false, 'message' => 'No encontrado'], 404);
        }

        $post->reactions_count = Reaction::where('post_id', $post->_id)->count();
        $post->has_reacted = $me ? Reaction::where('post_id', $post->_id)->where('user_id', $me->_id)->exists() : false;
        
        // NUEVO: Contamos TODOS los comentarios (padres e hijos) de este post
        $post->comments_count = Comment::where('post_id', $post->_id)->count();

        return response()->json(['success' => true, 'post' => $post]);
    }

    public function update(Request $request, $id)
    {
        $post = Post::find($id);
        if (!$post) return response()->json(['success' => false, 'message' => 'No encontrado'], 404);
        
        if ((string)$post->user_id !== (string) $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $request->validate(['description' => 'nullable|string|max:1000']);
        $post->description = $request->input('description');
        $post->save();

        return response()->json(['success' => true, 'post' => $post]);
    }

    public function destroy(Request $request, $id)
    {
        $post = Post::find($id);
        if (!$post) return response()->json(['success' => false], 404);

        if ((string)$post->user_id !== (string) $request->user()->id) {
            return response()->json(['success' => false], 403);
        }

        $post->delete();
        return response()->json(['success' => true]);
    }
}