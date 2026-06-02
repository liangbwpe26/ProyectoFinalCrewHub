import React, { Fragment } from 'react';
import { usePrivacySettings } from '../hooks/usePrivacySettings.js';

const PrivacySettings = () => {
    const { 
        privacyMessages, setPrivacyMessages, 
        privacyComments, setPrivacyComments, 
        isSaving, handleSave 
    } = usePrivacySettings();

    return (
        <Fragment>
            <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 shadow-2xl">
                <h2 className="text-white mt-0 mb-6 text-xl font-black">Privacidad y Seguridad</h2>

                <div className="mb-8">
                    <label className="block text-white text-sm font-bold mb-3">¿Quién puede enviarte mensajes directos?</label>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-3 cursor-pointer text-gray-300 text-sm hover:text-white transition group">
                            <input 
                                type="radio" name="messages" value="everyone" 
                                checked={privacyMessages === 'everyone'} 
                                onChange={(e) => setPrivacyMessages(e.target.value)} 
                                className="accent-[#0095f6] w-4 h-4 cursor-pointer" 
                            />
                            Todos
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer text-gray-300 text-sm hover:text-white transition group">
                            <input 
                                type="radio" name="messages" value="following" 
                                checked={privacyMessages === 'following'} 
                                onChange={(e) => setPrivacyMessages(e.target.value)} 
                                className="accent-[#0095f6] w-4 h-4 cursor-pointer" 
                            />
                            Solo personas que sigo
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer text-gray-300 text-sm hover:text-white transition group">
                            <input 
                                type="radio" name="messages" value="none" 
                                checked={privacyMessages === 'none'} 
                                onChange={(e) => setPrivacyMessages(e.target.value)} 
                                className="accent-[#0095f6] w-4 h-4 cursor-pointer" 
                            />
                            Nadie
                        </label>
                    </div>
                </div>

                <div className="mb-8">
                    <label className="block text-white text-sm font-bold mb-3">¿Quién puede comentar en tus publicaciones?</label>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-3 cursor-pointer text-gray-300 text-sm hover:text-white transition group">
                            <input 
                                type="radio" name="comments" value="everyone" 
                                checked={privacyComments === 'everyone'} 
                                onChange={(e) => setPrivacyComments(e.target.value)} 
                                className="accent-[#0095f6] w-4 h-4 cursor-pointer" 
                            />
                            Todos
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer text-gray-300 text-sm hover:text-white transition group">
                            <input 
                                type="radio" name="comments" value="following" 
                                checked={privacyComments === 'following'} 
                                onChange={(e) => setPrivacyComments(e.target.value)} 
                                className="accent-[#0095f6] w-4 h-4 cursor-pointer" 
                            />
                            Solo personas que sigo
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer text-gray-300 text-sm hover:text-white transition group">
                            <input 
                                type="radio" name="comments" value="none" 
                                checked={privacyComments === 'none'} 
                                onChange={(e) => setPrivacyComments(e.target.value)} 
                                className="accent-[#0095f6] w-4 h-4 cursor-pointer" 
                            />
                            Nadie
                        </label>
                    </div>
                </div>

                <div className="border-t border-[#262626] pt-5 flex justify-end">
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        className="bg-[#0095f6] hover:bg-blue-600 text-white font-bold text-sm px-6 py-2.5 rounded-full cursor-pointer transition border-none disabled:opacity-50 shadow-lg shadow-blue-500/20"
                    >
                        {isSaving ? 'Guardando...' : 'Guardar preferencias'}
                    </button>
                </div>
            </div>
        </Fragment>
    );
};

export default PrivacySettings;