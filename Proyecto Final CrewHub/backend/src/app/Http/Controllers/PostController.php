<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\User;
use App\Models\Follow;
use App\Models\Reaction;
use App\Models\Comment;
use App\Models\SavedPost;

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
    $myIdStr = (string) ($me->_id ?? $me->id);
    
    // Obtenemos el filtro desde React (por defecto será 'all')
    $filter = $request->query('filter', 'all');
    
    // Paginación
    $offset = (int) $request->query('offset', 0);
    $limit = 10;

    // Iniciamos la consulta base
    $postsQuery = Post::with('user')->orderBy('created_at', 'desc');

    // APLICAMOS LOS FILTROS SEGÚN LA PESTAÑA
    if ($filter === 'interests' && !empty($me->interests)) {
        // Pestaña "Para ti": Busca posts que tengan una categoría/slug que coincida con los intereses del usuario
        // IMPORTANTE: Tus posts en MongoDB deben tener un campo 'category' (o similar) que guarde el interés.
        $postsQuery->whereIn('category', $me->interests);
    } 
    elseif ($filter === 'following') {
        // Pestaña "Siguiendo": Tu lógica original intacta
        $followingIds = Follow::where('follower_id', $myIdStr)
            ->where('status', 'accepted')
            ->pluck('followed_id')
            ->toArray();
            
        $followingIds[] = $myIdStr;

        $postsQuery->whereIn('user_id', $followingIds);
    }
    // Si $filter === 'all', no aplicamos whereIn, así que traerá TODO el contenido global (Explorar).

    // Ejecutamos conteo y paginación
    $totalPosts = $postsQuery->count();
    $posts = $postsQuery->skip($offset)->take($limit)->get();

    // Transformamos los posts con tu lógica intacta
    $posts->transform(function ($post) use ($myIdStr) {
        $postId = (string) ($post->_id ?? $post->id);
        $post->reactions_count = Reaction::where('post_id', $postId)->count();
        $post->comments_count = Comment::where('post_id', $postId)->count();
        $post->has_reacted = Reaction::where('post_id', $postId)->where('user_id', $myIdStr)->exists();
        $post->has_saved = SavedPost::where('post_id', $postId)->where('user_id', $myIdStr)->exists();
        return $post;
    });

    return response()->json([
        'success' => true,
        'posts' => $posts,
        'hasMore' => ($offset + $limit) < $totalPosts
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
        $post->has_saved = $me ? SavedPost::where('post_id', $post->_id)->where('user_id', $me->_id)->exists() : false;

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