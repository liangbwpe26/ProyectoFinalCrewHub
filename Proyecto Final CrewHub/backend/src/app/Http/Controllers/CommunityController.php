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
    /**
     * Get all communities ordered by creation date.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $communities = Community::orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'communities' => $communities]);
    }

    /**
     * Create a new community.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
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
            'admins' => [$userId],
            'require_post_approval' => true,
            'tags' => $request->tags ?? []
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Comunidad creada con éxito',
            'community' => $community
        ], 201);
    }

    /**
     * Get a specific community by slug.
     *
     * @param string $slug
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($slug)
    {
        $community = Community::where('slug', $slug)->first();

        if (!$community) {
            return response()->json(['success' => false, 'message' => 'Comunidad no encontrada'], 404);
        }

        return response()->json(['success' => true, 'community' => $community]);
    }

    /**
     * Toggle membership status for a community.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function toggleMembership($id)
    {
        $community = Community::find($id);

        if (!$community) {
            return response()->json(['success' => false, 'message' => 'Comunidad no encontrada'], 404);
        }

        $userId = Auth::id();
        $members = $community->members ?? [];

        if (in_array($userId, $members)) {
            $members = array_values(array_diff($members, [$userId]));
            $status = 'left';
        } else {
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

    /**
     * Delete a community. Only the creator can delete it.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
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
     * Get pending posts for approval. Only administrators can access.
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPendingPosts($id)
    {
        $community = Community::find($id);

        if (!$community) {
            return response()->json(['success' => false, 'message' => 'Comunidad no encontrada'], 404);
        }

        $userId = Auth::id();
        $admins = is_object($community->admins) ? (array) $community->admins : ($community->admins ?? []);

        if (!in_array($userId, $admins)) {
            return response()->json(['success' => false, 'message' => 'No autorizado. No eres administrador de esta comunidad.'], 403);
        }

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
     * Approve or reject a pending post. Only administrators can perform this action.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $postId
     * @return \Illuminate\Http\JsonResponse
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
            $post->delete();
            return response()->json([
                'success' => true,
                'message' => 'Publicación rechazada y eliminada con éxito.'
            ]);
        }
    }

    /**
     * Get members of a community with optional search filter.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
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

        $query = \App\Models\User::whereIn('_id', $memberIds);

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                    ->orWhere('display_name', 'like', "%{$search}%");
            });
        }

        $users = $query->get(['_id', 'username', 'display_name', 'profile_picture']);

        $users->transform(function ($user) use ($adminIds) {
            $user->is_admin = in_array((string) $user->_id, $adminIds);
            return $user;
        });

        $sortedUsers = $users->sortByDesc('is_admin')->values();

        return response()->json(['success' => true, 'members' => $sortedUsers]);
    }

    /**
     * Remove a member from the community. Only administrators can perform this action.
     *
     * @param int $id
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
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
     * Promote a member to administrator. Only administrators can perform this action.
     *
     * @param int $id
     * @param int $userId
     * @return \Illuminate\Http\JsonResponse
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

    /**
     * Update community settings including name, description, rules, and tags.
     * Only administrators can perform this action.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
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

    /**
     * Upload a banner image for the community. Only administrators can perform this action.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
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

    /**
     * Upload an avatar image for the community. Only administrators can perform this action.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
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