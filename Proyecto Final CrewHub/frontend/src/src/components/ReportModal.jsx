import React, { useState, Fragment } from 'react';
import { fetchAPI } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';

const REASONS = [
    "Es spam o fraude",
    "Contenido de odio o acoso",
    "Violencia o daño físico",
    "Desnudez o contenido sexual",
    "Información falsa",
    "No me gusta"
];

// Componente: ReportModal
// Modal para enviar un reporte sobre publicación, comentario o usuario.
const ReportModal = ({ targetType, targetId, reportedUserId, onClose }) => {
    const [selectedReason, setSelectedReason] = useState("");
    const [details, setDetails] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async () => {
        if (!selectedReason) {
            showToast("Por favor selecciona un motivo.", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            const data = await fetchAPI('/reports', {
                method: 'POST',
                body: {
                    target_type: targetType,
                    target_id: targetId,
                    reported_id: reportedUserId,
                    reason: selectedReason,
                    details: details
                }
            });

            if (data.success) {
                showToast("Reporte enviado. Gracias por mantener la comunidad segura.", "success");
                onClose();
            } else {
                showToast(data.message || "Error al enviar el reporte", "error");
            }
        } catch (error) {
            showToast("Error de conexión", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Fragment>
            <div className="fixed inset-0 bg-black/80 z-[99999] flex justify-center items-center p-5 backdrop-blur-md animate-fade-in" onClick={onClose}>
                <div className="w-full max-w-[450px] bg-[#121212]/95 backdrop-blur-2xl border border-[#333] rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden transform transition-all" onClick={e => e.stopPropagation()}>
                    
                    <div className="flex justify-between items-center p-6 border-b border-[#262626]">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#ff4d4d]/10 border border-[#ff4d4d]/30 flex items-center justify-center text-[#ff4d4d]">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>
                            </div>
                            <h3 className="m-0 text-white font-black tracking-wide text-lg">Reportar</h3>
                        </div>
                        <button onClick={onClose} className="bg-transparent text-gray-500 hover:text-white border-none text-2xl cursor-pointer font-bold transition-colors leading-none">✕</button>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto custom-scrollbar max-h-[60vh]">
                        <p className="text-gray-400 text-sm mt-0 mb-6 font-medium leading-relaxed">
                            ¿Por qué reportas este {targetType === 'user' ? 'usuario' : 'contenido'}? Tu reporte es completamente anónimo.
                        </p>

                        <div className="flex flex-col gap-3 mb-6">
                            {REASONS.map((reason, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => setSelectedReason(reason)}
                                    className={`text-left px-5 py-4 rounded-xl border transition-all text-sm font-bold cursor-pointer ${selectedReason === reason ? 'border-[#ff4d4d] bg-[#ff4d4d]/10 text-[#ff4d4d] shadow-inner' : 'border-[#333] bg-[#1a1a1a]/50 text-gray-300 hover:border-[#ff4d4d]/50 hover:bg-[#1a1a1a]'}`}
                                >
                                    {reason}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">Detalles (Opcional)</label>
                            <textarea 
                                placeholder="Explica brevemente la situación..." 
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                className="w-full p-4 bg-[#0a0a0a]/50 shadow-inner border border-[#333] rounded-xl text-white text-sm outline-none focus:border-[#ff4d4d] focus:bg-[#111] transition-all resize-none h-24 custom-scrollbar"
                            />
                        </div>
                    </div>

                    <div className="p-6 border-t border-[#262626] bg-[#0a0a0a]/50">
                        <button 
                            onClick={handleSubmit} 
                            disabled={isSubmitting || !selectedReason}
                            className={`w-full py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all border-none ${(!selectedReason || isSubmitting) ? 'bg-[#262626] text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-[#ff4d4d] to-[#d43838] text-white hover:scale-[1.02] cursor-pointer shadow-[0_0_20px_rgba(255,77,77,0.3)]'}`}
                        >
                            {isSubmitting ? 'Enviando...' : 'Enviar reporte'}
                        </button>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default ReportModal;