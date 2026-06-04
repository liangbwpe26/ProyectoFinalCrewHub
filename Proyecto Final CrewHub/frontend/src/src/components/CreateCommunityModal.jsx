import React from 'react';
import { useCreateCommunity } from '../hooks/useCreateCommunity.js';

const CreateCommunityModal = ({ onClose, onCreated }) => {
    const { formData, handleChange, handleSubmit, loading, error } = useCreateCommunity((newCommunity) => {
        onCreated(newCommunity);
        onClose();
    });

    return (
        <div className="fixed inset-0 bg-black/80 z-[10000] flex justify-center items-center p-4 backdrop-blur-md animate-fade-in" onClick={onClose}>
            
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[500px] bg-[#121212]/95 backdrop-blur-2xl rounded-3xl border border-[#333] shadow-[0_15px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col transform transition-all">
                
                <div className="flex justify-between items-center p-6 border-b border-[#262626]">
                    <h3 className="m-0 text-xl text-white font-black tracking-wide">Crear Comunidad</h3>
                    <button onClick={onClose} className="bg-transparent border-none text-gray-500 hover:text-[#ff4d4d] text-2xl cursor-pointer font-bold transition-colors leading-none">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6">
                    
                    {error && (
                        <div className="p-4 rounded-xl bg-[#ff4d4d]/10 border border-[#ff4d4d]/30 text-[#ff4d4d] text-sm text-center font-bold shadow-inner">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-2.5">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">Nombre de la comunidad</label>
                        <input 
                            type="text" 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ej. Desarrolladores React" 
                            maxLength={50}
                            required
                            className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a]/50 text-white outline-none focus:border-[#0095f6] focus:bg-[#111] transition-all shadow-inner text-sm font-bold tracking-wide"
                        />
                    </div>

                    <div className="flex flex-col gap-2.5">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">Descripción</label>
                        <textarea 
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="¿De qué trata este espacio? Escribe las reglas o el objetivo..." 
                            maxLength={255}
                            required
                            rows="4"
                            className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a]/50 text-white outline-none focus:border-[#0095f6] focus:bg-[#111] transition-all shadow-inner text-sm resize-none custom-scrollbar leading-relaxed"
                        ></textarea>
                    </div>

                    <div className="flex gap-4 pt-4 mt-2 border-t border-[#262626]">
                        <button type="button" onClick={onClose} className="flex-1 py-4 rounded-full bg-transparent border border-[#333] text-gray-300 font-bold uppercase tracking-widest text-xs hover:bg-[#262626] hover:text-white transition-colors cursor-pointer">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading || !formData.name.trim() || !formData.description.trim()} className="flex-1 py-4 rounded-full bg-gradient-to-r from-[#0095f6] to-[#0077c5] border-none text-white font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(0,149,246,0.3)] disabled:bg-none disabled:bg-[#262626] disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer hover:scale-[1.02]">
                            {loading ? 'Creando...' : 'Crear ahora'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCommunityModal;