<?php

namespace App\Http\Controllers;

use App\Models\Community;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class CommunityController extends Controller
{
    // 1. Listar todas las comunidades (Explorar)
    public function index()
    {
        $communities = Community::orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'communities' => $communities]);
    }

    // 2. Crear una nueva comunidad
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:50|unique:communities,name',
            'description' => 'required|string|max:255',
            'tags' => 'array'
        ]);

        $userId = Auth::id();

        $community = Community::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'creator_id' => $userId,
            'members' => [$userId],
            'admins' => [$userId], // El creador nace siendo administrador
            'require_post_approval' => true,
            'tags' => $request->tags ?? []
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Comunidad creada con éxito',
            'community' => $community
        ], 201);
    }

    // 3. Ver una comunidad específica por su SLUG
    public function show($slug)
    {
        $community = Community::where('slug', $slug)->first();

        if (!$community) {
            return response()->json(['success' => false, 'message' => 'Comunidad no encontrada'], 404);
        }

        return response()->json(['success' => true, 'community' => $community]);
    }

    // 4. Unirse o Salir de una comunidad
    public function toggleMembership($id)
    {
        $community = Community::find($id);

        if (!$community) {
            return response()->json(['success' => false, 'message' => 'Comunidad no encontrada'], 404);
        }

        $userId = Auth::id();
        $members = $community->members ?? [];

        if (in_array($userId, $members)) {
            // Si ya es miembro, lo sacamos (Salir)
            $members = array_values(array_diff($members, [$userId]));
            $status = 'left';
        } else {
            // Si no es miembro, lo agregamos (Unirse)
            $members[] = $userId;
            $status = 'joined';
        }

        $community->update(['members' => $members]);

        return response()->json([
            'success' => true,
            'status' => $status,
            'members_count' => count($members)
        ]);
    }

    // 5. Eliminar comunidad (Solo el creador)
    public function destroy($id)
    {
        $community = Community::find($id);

        if (!$community) {
            return response()->json(['success' => false, 'message' => 'Comunidad no encontrada'], 404);
        }

        if ($community->creator_id !== Auth::id()) {
            return response()->json(['success' => false, 'message' => 'No tienes permiso para eliminar esta comunidad'], 403);
        }

        $community->delete();

        return response()->json(['success' => true, 'message' => 'Comunidad eliminada']);
    }

    /**
     * Obtener las publicaciones pendientes de aprobación (Solo para administradores)
     */
    public function getPendingPosts($id)
    {
        $community = Community::find($id);

        if (!$community) {
            return response()->json(['success' => false, 'message' => 'Comunidad no encontrada'], 404);
        }

        $userId = Auth::id();
        $admins = is_object($community->admins) ? (array) $community->admins : ($community->admins ?? []);

        // Seguridad: Verificar si el usuario que consulta es administrador del grupo
        if (!in_array($userId, $admins)) {
            return response()->json(['success' => false, 'message' => 'No autorizado. No eres administrador de esta comunidad.'], 403);
        }

        // Buscamos las publicaciones con estado 'pending' que pertenecen a esta comunidad
        $pendingPosts = \App\Models\Post::with('user')
            ->where('community_id', $id)
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'posts' => $pendingPosts
        ]);
    }

    /**
     * Aprobar o rechazar una publicación pendiente
     */
    public function moderatePost(Request $request, $postId)
    {
        $request->validate([
            'action' => 'required|in:approve,reject'
        ]);

        $post = Post::find($postId);

        if (!$post || !$post->community_id) {
            return response()->json(['success' => false, 'message' => 'Publicación no encontrada o no pertenece a una comunidad'], 404);
        }

        $community = Community::find($post->community_id);
        if (!$community) {
            return response()->json(['success' => false, 'message' => 'Comunidad asociada no encontrada'], 404);
        }

        $userId = Auth::id();
        $admins = is_object($community->admins) ? (array) $community->admins : ($community->admins ?? []);

        // Seguridad: Solo un administrador de esta comunidad específica puede moderar
        if (!in_array($userId, $admins)) {
            return response()->json(['success' => false, 'message' => 'No tienes permisos para moderar en esta comunidad.'], 403);
        }

        if ($request->action === 'approve') {
            $post->update(['status' => 'approved']);
            return response()->json([
                'success' => true,
                'message' => 'Publicación aprobada correctamente. Ahora es visible en el feed.'
            ]);
        } else {
            // Si el administrador la rechaza, la eliminamos directamente de la base de datos
            $post->delete();
            return response()->json([
                'success' => true,
                'message' => 'Publicación rechazada y eliminada con éxito.'
            ]);
        }
    }

    /**
     * Obtener los miembros de una comunidad (con buscador opcional)
     */
    public function getMembers(Request $request, $id)
    {
        $community = Community::find($id);
        if (!$community) {
            return response()->json(['success' => false, 'message' => 'Comunidad no encontrada'], 404);
        }

        $search = $request->query('q', '');
        $memberIds = is_object($community->members) ? (array) $community->members : ($community->members ?? []);
        $adminIds = is_object($community->admins) ? (array) $community->admins : ($community->admins ?? []);

        // Buscamos a los usuarios que pertenezcan a la lista de miembros
        $query = \App\Models\User::whereIn('_id', $memberIds);

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                    ->orWhere('display_name', 'like', "%{$search}%");
            });
        }

        $users = $query->get(['_id', 'username', 'display_name', 'profile_picture']);

        // Añadimos una bandera para saber si cada usuario es administrador
        $users->transform(function ($user) use ($adminIds) {
            $user->is_admin = in_array((string) $user->_id, $adminIds);
            return $user;
        });

        // Ordenamos para que los administradores salgan primero
        $sortedUsers = $users->sortByDesc('is_admin')->values();

        return response()->json(['success' => true, 'members' => $sortedUsers]);
    }

    /**
     * Expulsar a un miembro
     */
    public function removeMember($id, $userId)
    {
        $community = Community::find($id);
        if (!$community)
            return response()->json(['success' => false], 404);

        $myId = Auth::id();
        $adminIds = is_object($community->admins) ? (array) $community->admins : ($community->admins ?? []);

        if (!in_array($myId, $adminIds)) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        $members = is_object($community->members) ? (array) $community->members : ($community->members ?? []);
        $members = array_values(array_diff($members, [$userId]));
        $adminIds = array_values(array_diff($adminIds, [$userId]));

        $community->update(['members' => $members, 'admins' => $adminIds]);

        return response()->json(['success' => true]);
    }

    /**
     * Promover a Administrador
     */
    public function promoteToAdmin($id, $userId)
    {
        $community = Community::find($id);
        if (!$community)
            return response()->json(['success' => false], 404);

        $myId = Auth::id();
        $adminIds = is_object($community->admins) ? (array) $community->admins : ($community->admins ?? []);

        if (!in_array($myId, $adminIds)) {
            return response()->json(['success' => false, 'message' => 'No autorizado'], 403);
        }

        if (!in_array($userId, $adminIds)) {
            $adminIds[] = $userId;
            $community->update(['admins' => $adminIds]);
        }

        return response()->json(['success' => true]);
    }

    // Actualizar reglas y etiquetas
    public function updateSettings(Request $request, $id)
    {
        $community = Community::find($id);
        if (!$community)
            return response()->json(['success' => false], 404);

        $adminIds = is_object($community->admins) ? (array) $community->admins : ($community->admins ?? []);
        if (!in_array(Auth::id(), $adminIds))
            return response()->json(['success' => false], 403);

        $tagsArray = array_filter(array_map('trim', explode(',', $request->input('tags', ''))));

        $community->update([
            'name' => $request->input('name', $community->name),
            'description' => $request->input('description', $community->description),
            'rules' => $request->input('rules'),
            'tags' => array_values($tagsArray)
        ]);

        return response()->json(['success' => true, 'community' => $community]);
    }

    // Subir imagen de portada
    public function uploadBanner(Request $request, $id)
    {
        $community = Community::find($id);
        $adminIds = is_object($community->admins) ? (array) $community->admins : ($community->admins ?? []);
        if (!in_array(Auth::id(), $adminIds))
            return response()->json(['success' => false], 403);

        $request->validate(['banner' => 'required|image|max:5120']);
        $path = $request->file('banner')->store('communities/banners', 's3');
        $community->update(['banner_path' => Storage::disk('s3')->url($path)]);
        return response()->json(['success' => true, 'banner_path' => $community->banner_path]);
    }

    public function uploadAvatar(Request $request, $id)
    {
        $community = Community::find($id);
        $adminIds = is_object($community->admins) ? (array) $community->admins : ($community->admins ?? []);
        if (!in_array(Auth::id(), $adminIds))
            return response()->json(['success' => false], 403);

        $request->validate(['avatar' => 'required|image|max:5120']);
        $path = $request->file('avatar')->store('communities/avatars', 's3');
        $community->update(['avatar_path' => Storage::disk('s3')->url($path)]);
        return response()->json(['success' => true, 'avatar_path' => $community->avatar_path]);
    }
}