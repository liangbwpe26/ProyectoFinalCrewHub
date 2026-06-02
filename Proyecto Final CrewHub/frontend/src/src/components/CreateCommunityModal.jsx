import React from 'react';
import { useCreateCommunity } from '../hooks/useCreateCommunity.js';

const CreateCommunityModal = ({ onClose, onCreated }) => {
    const { formData, handleChange, handleSubmit, loading, error } = useCreateCommunity((newCommunity) => {
        onCreated(newCommunity);
        onClose();
    });

    return (
        <div className="fixed inset-0 bg-black/80 z-[10000] flex justify-center items-center p-4 backdrop-blur-sm" onClick={onClose}>
            
            {/* Contenedor principal que detiene el clic para no cerrar el modal */}
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[500px] bg-[#121212] rounded-2xl border border-[#333] shadow-2xl overflow-hidden flex flex-col">
                
                {/* Cabecera */}
                <div className="flex justify-between items-center p-5 border-b border-[#262626]">
                    <h3 className="m-0 text-xl text-white font-bold tracking-wide">Crear Comunidad</h3>
                    <button onClick={onClose} className="bg-transparent border-none text-gray-500 hover:text-white text-xl cursor-pointer font-bold transition-colors">
                        ✕
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
                    
                    {error && (
                        <div className="p-3 rounded-lg bg-[#ff4d4d]/10 border border-[#ff4d4d]/50 text-[#ff4d4d] text-sm text-center font-bold">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Nombre de la comunidad</label>
                        <input 
                            type="text" 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ej. Desarrolladores React" 
                            maxLength={50}
                            required
                            className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a] text-white outline-none focus:border-[#0095f6] transition-colors text-sm"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Descripción</label>
                        <textarea 
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="¿De qué trata este espacio? Escribe las reglas o el objetivo..." 
                            maxLength={255}
                            required
                            rows="4"
                            className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a] text-white outline-none focus:border-[#0095f6] transition-colors text-sm resize-none custom-scrollbar"
                        ></textarea>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-full bg-transparent border border-[#333] text-white font-bold hover:bg-[#1a1a1a] transition-colors cursor-pointer text-sm">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading || !formData.name.trim() || !formData.description.trim()} className="flex-1 py-3.5 rounded-full bg-[#0095f6] border-none text-white font-bold transition-colors shadow-lg shadow-blue-500/20 disabled:bg-[#262626] disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer text-sm">
                            {loading ? 'Creando...' : 'Crear ahora'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateCommunityModal;