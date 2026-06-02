<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Report;

class ReportController extends Controller
{
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

            // Evitar auto-reportes
            if ($myId === $request->reported_id) {
                // Devolvemos 200 para que React pueda leer el JSON sin crashear el fetch
                return response()->json(['success' => false, 'message' => 'No puedes reportarte a ti mismo.']);
            }

            // Evitar Spam (Reportar lo mismo 2 veces)
            $query = Report::where('reporter_id', $myId)
                ->where('target_type', $request->target_type)
                ->where('reported_id', $request->reported_id);
            
            if ($request->target_id) {
                $query->where('target_id', $request->target_id);
            }

            if ($query->exists()) {
                return response()->json(['success' => false, 'message' => 'Ya has reportado este contenido. Nuestro equipo lo está revisando.']);
            }

            // Crear el reporte
            Report::create([
                'reporter_id' => $myId,
                'reported_id' => $request->reported_id,
                'target_type' => $request->target_type,
                'target_id' => $request->target_id,
                'reason' => $request->reason,
                'details' => $request->details,
                'status' => 'pending'
            ]);

            return response()->json(['success' => true, 'message' => 'Reporte enviado al equipo de moderación.']);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error interno al procesar el reporte',
                'error' => $e->getMessage()
            ], 500);
        }
    }

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

    public function resolve(Request $request, $id)
    {
        if (!$request->user()->is_admin) {
            return response()->json(['success' => false, 'message' => 'Acceso denegado'], 403);
        }

        $report = Report::find($id);
        if (!$report) return response()->json(['success' => false, 'message' => 'Reporte no encontrado'], 404);

        $report->update(['status' => 'resolved']);
        return response()->json(['success' => true]);
    }
}