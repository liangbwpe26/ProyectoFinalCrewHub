<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;
use App\Models\Ticket;
use App\Models\User;
use App\Models\Notification;
use App\Events\NotificationSent;

/**
 * Controlador para gestionar reportes, tickets y sanciones de usuarios.
 * 
 * Maneja la creación de reportes, resolución de reportes y gestión de
 * sanciones a usuarios.
 */
class ReportController extends Controller
{
    /**
     * Crea un nuevo reporte sobre un usuario o contenido.
     *
     * @param Request $request Los datos del reporte con los campos:
     *                          - reported_id: ID del usuario reportado
     *                          - target_type: Tipo de contenido (user, post, drop, comment)
     *                          - target_id: ID del contenido reportado (opcional)
     *                          - reason: Razón del reporte
     *                          - details: Detalles adicionales (opcional, máx. 500 caracteres)
     * @return \Illuminate\Http\JsonResponse Respuesta con éxito o error
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'reported_id' => 'required|string',
                'target_type' => 'required|in:user,post,drop,comment',
                'target_id' => 'nullable|string',
                'reason' => 'required|string',
                'details' => 'nullable|string|max:500',
            ]);

            $me = $request->user();
            $myId = (string) ($me->_id ?? $me->id);

            // Evita que un usuario se reporte a sí mismo
            if ($myId === $request->reported_id) {
                return response()->json(['success' => false, 'message' => 'No puedes reportarte a ti mismo.']);
            }

            // Verifica si ya existe un reporte similar
            $query = Report::where('reporter_id', $myId)
                ->where('reported_id', $request->reported_id);
            if ($request->target_id) $query->where('target_id', $request->target_id);
            
            if ($query->exists()) {
                return response()->json(['success' => false, 'message' => 'Ya has reportado este contenido.']);
            }

            // Crea el reporte
            Report::create([
                'reporter_id' => $myId,
                'reported_id' => $request->reported_id,
                'target_type' => $request->target_type,
                'target_id' => $request->target_id,
                'reason' => $request->reason,
                'details' => $request->details,
                'status' => 'pending'
            ]);

            // Si hay 5 o más reportes, oculta automáticamente el contenido
            if ($request->target_id && in_array($request->target_type, ['post', 'drop'])) {
                $reportCount = Report::where('target_id', $request->target_id)->count();
                
                if ($reportCount >= 5) {
                    $model = ($request->target_type === 'post') ? \App\Models\Post::find($request->target_id) : \App\Models\Drop::find($request->target_id);
                    if ($model && !$model->is_hidden) {
                        $model->is_hidden = true;
                        $model->save();
                    }
                }
            }

            return response()->json(['success' => true, 'message' => 'Reporte enviado.']);
            
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error interno', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Obtiene todos los reportes pendientes.
     *
     * @param Request $request Requiere que el usuario sea administrador
     * @return \Illuminate\Http\JsonResponse Lista de reportes pendientes
     */
    public function index(Request $request)
    {
        if (!$request->user()->is_admin) {
            return response()->json(['success' => false, 'message' => 'Acceso denegado'], 403);
        }

        $reports = Report::with(['reporter', 'reportedUser'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'reports' => $reports]);
    }

    /**
     * Resuelve un reporte y notifica al reportero.
     *
     * @param Request $request La solicitud HTTP
     * @param string $id ID del reporte a resolver
     * @return \Illuminate\Http\JsonResponse Respuesta de éxito
     */
    public function resolve(Request $request, $id)
    {
        $me = $request->user();

        // Verifica permisos de administrador
        if (!$me->is_admin && $me->username !== 'liangbw_') {
            return response()->json(['success' => false, 'message' => 'Acceso denegado'], 403);
        }

        $report = Report::find($id);
        if (!$report) {
            return response()->json(['success' => false, 'message' => 'Reporte no encontrado'], 404);
        }

        $report->update(['status' => 'resolved']);

        $reporter = User::find($report->reporter_id);
        
        // Envía notificación al reportero si lo desea
        if ($reporter && $reporter->wantsNotification('report_resolved')) {
            $notif = Notification::create([
                'recipient_id' => $report->reporter_id,
                'sender_id' => $me->_id ?? $me->id,
                'type' => 'report_resolved',
                'is_read' => false
            ]);
            $notif->load('sender');
            
            try {
                broadcast(new NotificationSent($notif));
            } catch (\Exception $e) {
            }
        }

        return response()->json(['success' => true]);
    }

    /**
     * Obtiene todos los tickets pendientes.
     *
     * @param Request $request Requiere que el usuario sea administrador
     * @return \Illuminate\Http\JsonResponse Lista de tickets pendientes
     */
    public function getTickets(Request $request)
    {
        $me = $request->user();
        
        if (!$me->is_admin && $me->username !== 'liangbw_') {
            return response()->json(['success' => false], 403);
        }

        $tickets = Ticket::with('user')
                    ->where('status', 'pending')
                    ->orderBy('created_at', 'desc')
                    ->get();

        return response()->json(['success' => true, 'tickets' => $tickets]);
    }

    /**
     * Resuelve un ticket.
     *
     * @param Request $request La solicitud HTTP
     * @param string $id ID del ticket a resolver
     * @return \Illuminate\Http\JsonResponse Respuesta de éxito
     */
    public function resolveTicket(Request $request, $id)
    {
        $me = $request->user();
        
        if (!$me->is_admin && $me->username !== 'liangbw_') {
            return response()->json(['success' => false], 403);
        }

        $ticket = Ticket::find($id);
        if ($ticket) {
            $ticket->status = 'resolved';
            $ticket->save();
        }

        return response()->json(['success' => true]);
    }

    /**
     * Obtiene usuarios sancionados (con sanciones o baneados).
     *
     * @param Request $request Requiere que el usuario sea administrador
     * @return \Illuminate\Http\JsonResponse Lista de usuarios sancionados
     */
    public function getSanctionedUsers(Request $request)
    {
        $me = $request->user();
        if (!$me->is_admin && $me->username !== 'liangbw_') return response()->json(['success' => false], 403);

        $users = User::where('strikes', '>', 0)
                    ->orWhere('is_banned', true)
                    ->orderBy('strikes', 'desc')
                    ->get();

        return response()->json(['success' => true, 'users' => $users]);
    }

    /**
     * Alterna el estado de baneo de un usuario.
     *
     * @param Request $request La solicitud HTTP
     * @param string $id ID del usuario
     * @return \Illuminate\Http\JsonResponse Respuesta de éxito
     */
    public function toggleBan(Request $request, $id)
    {
        $me = $request->user();
        if (!$me->is_admin && $me->username !== 'liangbw_') return response()->json(['success' => false], 403);

        $user = User::find($id);
        if ($user) {
            $user->is_banned = !$user->is_banned;
            $user->save();
        }

        return response()->json(['success' => true]);
    }

    /**
     * Reinicia las sanciones de un usuario.
     *
     * @param Request $request La solicitud HTTP
     * @param string $id ID del usuario
     * @return \Illuminate\Http\JsonResponse Respuesta de éxito
     */
    public function resetStrikes(Request $request, $id)
    {
        $me = $request->user();
        if (!$me->is_admin && $me->username !== 'liangbw_') return response()->json(['success' => false], 403);

        $user = User::find($id);
        if ($user) {
            $user->strikes = 0;
            $user->is_banned = false;
            $user->save();
        }

        return response()->json(['success' => true]);
    }
}