import React, { Fragment } from 'react';
import { usePrivacySettings } from '../hooks/usePrivacySettings.js';

// Componente: PrivacySettings
// Formulario para ajustar privacidad de mensajes y comentarios.
const PrivacySettings = () => {
    const { 
        privacyMessages, setPrivacyMessages, 
        privacyComments, setPrivacyComments, 
        isSaving, handleSave 
    } = usePrivacySettings();

    return (
        <Fragment>
            <div className="flex flex-col gap-6 max-w-[600px]">
                <h2 className="text-xl font-bold text-white mb-2 m-0 border-b border-[#333] pb-4">Privacidad y Seguridad</h2>
                <p className="text-gray-400 text-sm m-0 mb-2">Controla quién puede interactuar contigo en la plataforma.</p>

                <div className="flex flex-col gap-4 mb-4">
                    <label className="block text-white text-sm font-black tracking-wide mb-1">¿Quién puede enviarte mensajes directos?</label>
                    <div className="flex flex-col gap-3">
                        <label className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${privacyMessages === 'everyone' ? 'bg-[#0095f6]/10 border-[#0095f6]/50 shadow-inner' : 'bg-[#121212] border-[#333] hover:border-[#555]'}`}>
                            <input type="radio" name="messages" value="everyone" checked={privacyMessages === 'everyone'} onChange={(e) => setPrivacyMessages(e.target.value)} className="accent-[#0095f6] w-5 h-5 cursor-pointer" />
                            <span className={`text-sm font-bold ${privacyMessages === 'everyone' ? 'text-[#0095f6]' : 'text-gray-300'}`}>Todos</span>
                        </label>
                        
                        <label className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${privacyMessages === 'following' ? 'bg-[#0095f6]/10 border-[#0095f6]/50 shadow-inner' : 'bg-[#121212] border-[#333] hover:border-[#555]'}`}>
                            <input type="radio" name="messages" value="following" checked={privacyMessages === 'following'} onChange={(e) => setPrivacyMessages(e.target.value)} className="accent-[#0095f6] w-5 h-5 cursor-pointer" />
                            <span className={`text-sm font-bold ${privacyMessages === 'following' ? 'text-[#0095f6]' : 'text-gray-300'}`}>Solo personas que sigo</span>
                        </label>

                        <label className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${privacyMessages === 'none' ? 'bg-[#0095f6]/10 border-[#0095f6]/50 shadow-inner' : 'bg-[#121212] border-[#333] hover:border-[#555]'}`}>
                            <input type="radio" name="messages" value="none" checked={privacyMessages === 'none'} onChange={(e) => setPrivacyMessages(e.target.value)} className="accent-[#0095f6] w-5 h-5 cursor-pointer" />
                            <span className={`text-sm font-bold ${privacyMessages === 'none' ? 'text-[#0095f6]' : 'text-gray-300'}`}>Nadie</span>
                        </label>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <label className="block text-white text-sm font-black tracking-wide mb-1">¿Quién puede comentar tus publicaciones?</label>
                    <div className="flex flex-col gap-3">
                        <label className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${privacyComments === 'everyone' ? 'bg-[#0095f6]/10 border-[#0095f6]/50 shadow-inner' : 'bg-[#121212] border-[#333] hover:border-[#555]'}`}>
                            <input type="radio" name="comments" value="everyone" checked={privacyComments === 'everyone'} onChange={(e) => setPrivacyComments(e.target.value)} className="accent-[#0095f6] w-5 h-5 cursor-pointer" />
                            <span className={`text-sm font-bold ${privacyComments === 'everyone' ? 'text-[#0095f6]' : 'text-gray-300'}`}>Todos</span>
                        </label>
                        
                        <label className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${privacyComments === 'following' ? 'bg-[#0095f6]/10 border-[#0095f6]/50 shadow-inner' : 'bg-[#121212] border-[#333] hover:border-[#555]'}`}>
                            <input type="radio" name="comments" value="following" checked={privacyComments === 'following'} onChange={(e) => setPrivacyComments(e.target.value)} className="accent-[#0095f6] w-5 h-5 cursor-pointer" />
                            <span className={`text-sm font-bold ${privacyComments === 'following' ? 'text-[#0095f6]' : 'text-gray-300'}`}>Solo personas que sigo</span>
                        </label>

                        <label className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${privacyComments === 'none' ? 'bg-[#0095f6]/10 border-[#0095f6]/50 shadow-inner' : 'bg-[#121212] border-[#333] hover:border-[#555]'}`}>
                            <input type="radio" name="comments" value="none" checked={privacyComments === 'none'} onChange={(e) => setPrivacyComments(e.target.value)} className="accent-[#0095f6] w-5 h-5 cursor-pointer" />
                            <span className={`text-sm font-bold ${privacyComments === 'none' ? 'text-[#0095f6]' : 'text-gray-300'}`}>Nadie</span>
                        </label>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#262626] flex justify-end">
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="bg-gradient-to-r from-[#0095f6] to-[#0077c5] hover:scale-[1.02] text-white font-bold py-3 px-8 rounded-full cursor-pointer transition-all border-none disabled:opacity-50 shadow-[0_0_15px_rgba(0,149,246,0.3)]"
                    >
                        {isSaving ? 'Guardando...' : 'Guardar preferencias'}
                    </button>
                </div>
            </div>
        </Fragment>
    );
};

export default PrivacySettings;