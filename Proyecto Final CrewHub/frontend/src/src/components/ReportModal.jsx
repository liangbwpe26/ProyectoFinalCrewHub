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
                showToast("Reporte enviado correctamente. Gracias por ayudar a mantener la comunidad segura.", "success");
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
            <div className="fixed inset-0 bg-black/90 z-[99999] flex justify-center items-center p-5 backdrop-blur-sm" onClick={onClose}>
                <div className="w-full max-w-[450px] bg-[#121212] border border-[#262626] rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                    
                    <div className="flex justify-between items-center p-5 border-b border-[#262626]">
                        <h3 className="m-0 text-white font-bold text-lg">Reportar</h3>
                        <button onClick={onClose} className="bg-transparent text-gray-500 hover:text-white border-none text-xl cursor-pointer font-bold transition">X</button>
                    </div>

                    <div className="p-5 flex-1 overflow-y-auto custom-scrollbar max-h-[60vh]">
                        <p className="text-gray-400 text-sm mt-0 mb-4">
                            ¿Por qué reportas este {targetType === 'user' ? 'usuario' : 'contenido'}? Tu reporte es anónimo.
                        </p>

                        <div className="flex flex-col gap-2 mb-4">
                            {REASONS.map((reason, idx) => (
                                <button 
                                    key={idx} 
                                    onClick={() => setSelectedReason(reason)}
                                    className={`text-left px-4 py-3 rounded-xl border transition text-sm font-bold cursor-pointer ${selectedReason === reason ? 'border-[#ff4d4d] bg-[#ff4d4d]/10 text-[#ff4d4d]' : 'border-[#333] bg-[#1a1a1a] text-gray-300 hover:border-gray-500'}`}
                                >
                                    {reason}
                                </button>
                            ))}
                        </div>

                        <textarea 
                            placeholder="Detalles adicionales (opcional)..." 
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            className="w-full p-4 bg-[#0a0a0a] border border-[#333] rounded-xl text-white text-sm outline-none focus:border-[#ff4d4d] transition resize-none h-24"
                        />
                    </div>

                    <div className="p-5 border-t border-[#262626] bg-[#121212]">
                        <button 
                            onClick={handleSubmit} 
                            disabled={isSubmitting || !selectedReason}
                            className={`w-full py-3.5 rounded-full font-bold text-sm transition border-none ${(!selectedReason || isSubmitting) ? 'bg-[#262626] text-gray-500 cursor-not-allowed' : 'bg-[#ff4d4d] text-white hover:bg-red-600 cursor-pointer'}`}
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