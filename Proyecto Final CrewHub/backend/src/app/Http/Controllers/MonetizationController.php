<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;

class MonetizationController extends Controller
{
    // Simular el pago para tener el check azul (Verified)
    public function subscribe(Request $request)
    {
        $user = $request->user();

        if ($user->is_verified) {
            return response()->json([
                'success' => false, 
                'message' => 'Aguanta tu coche, ya tienes tu check azul.'
            ], 400);
        }

        // Aquí iría la lógica de Stripe, pero pasamos de frente al éxito
        $user->forceFill(['is_verified' => true])->save();

        return response()->json([
            'success' => true, 
            'message' => 'Tarjeta procesada. Ahora eres VIP, sobrino.', 
            'user' => $user->fresh()
        ]);
    }

    // Simular el pago para volverse cuenta Business
    // Pasarse a cuenta Business (Ahora es GRATIS)
    public function upgradeToBusiness(Request $request)
    {
        $request->validate([
            'business_category' => 'required|string|max:50'
        ]);

        $user = $request->user();

        if ($user->is_business) {
            return response()->json([
                'success' => false, 
                'message' => 'Ya eres cuenta Business, lorna.'
            ], 400);
        }

        $user->forceFill([
            'is_business' => true,
            'business_category' => $request->business_category
        ])->save();

        return response()->json([
            'success' => true, 
            'message' => 'Bienvenido a las grandes ligas. Cuenta Business activada gratis.', 
            'user' => $user->fresh()
        ]);
    }

    // Simular el pago para promocionar un Post específico
    public function promotePost(Request $request, $postId)
    {
        $request->validate([
            'days' => 'required|integer|min:1|max:30'
        ]);

        $user = $request->user();

        if (!$user->is_business) {
            return response()->json([
                'success' => false, 
                'message' => 'Qué palta, solo las cuentas Business pueden meterle pauta a sus publicaciones.'
            ], 403);
        }

        $post = Post::where('_id', $postId)->orWhere('id', $postId)->first();

        // Validamos que el post exista y sea del pata que quiere pagar
        if (!$post || (string)$post->user_id !== (string)($user->_id ?? $user->id)) {
            return response()->json([
                'success' => false, 
                'message' => 'Post no encontrado o no te pertenece.'
            ], 404);
        }

        // Le ponemos esteroides al post sumándole los días que pagó
        $post->forceFill([
            'is_promoted' => true,
            'promoted_until' => now()->addDays($request->days)
        ])->save();

        return response()->json([
            'success' => true, 
            'message' => 'Bolas procesadas. Tu post ahora es patrocinado.'
        ]);
    }

    public function subscribeAds(Request $request)
    {
        $request->validate(['plan' => 'required|in:emprendedor,tiburon']);
        $user = $request->user();

        if (!$user->is_business) {
            return response()->json(['success' => false, 'message' => 'Primero vuélvete Business gratis, lorna.'], 403);
        }

        $user->forceFill(['ad_plan' => $request->plan])->save();

        return response()->json([
            'success' => true, 
            'message' => 'Plan ' . strtoupper($request->plan) . ' activado. Prepárate para facturar.', 
            'user' => $user->fresh()
        ]);
    }

    // Volver a ser un usuario normal (Desactivar Business)
    public function downgradeBusiness(Request $request)
    {
        $user = $request->user();

        $user->forceFill([
            'is_business' => false,
            'business_category' => null,
            'ad_plan' => null
        ])->save();

        return response()->json([
            'success' => true, 
            'message' => 'Tienda cerrada. Volviste a ser un usuario estándar.', 
            'user' => $user->fresh()
        ]);
    }
}