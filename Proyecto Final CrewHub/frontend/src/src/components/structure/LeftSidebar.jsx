import React, { useContext, useRef, useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import StoriesBar from '../StoriesBar.jsx';
import StoryManager from '../StoryManager.jsx';
import './LeftSidebar.css';

// Componente: LeftSidebar
// Barra lateral izquierda con avatar, subida de medios y navegación rápida.
const LeftSidebar = () => {
    const { activeUser } = useContext(AuthContext);
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://crewhub.es:8000';

    const getAvatar = (user) => {
        if (user && user.profile_picture) {
            if (user.profile_picture.startsWith('http')) return user.profile_picture;
            return `${BACKEND_URL}${user.profile_picture}`;
        }
        return `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=262626&color=fff&bold=true`;
    };

    const triggerFileInput = () => fileInputRef.current.click();

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    return (
        <Fragment>
            <aside className="w-[260px] hidden lg:flex flex-col h-[calc(100vh-100px)] sticky top-[80px] justify-between pb-6">
                
                <div className="bg-[#121212]/80 backdrop-blur-xl border border-[#262626] rounded-[24px] p-5 flex flex-col h-[65%] shadow-[0_8px_30px_rgb(0,0,0,0.5)]">

                    <div
                        className="flex items-center gap-3 mb-4 p-2 cursor-pointer hover:bg-[#1a1a1a]/80 rounded-xl transition"
                        onClick={triggerFileInput}
                    >
                        <div className="relative">
                            <img src={getAvatar(activeUser)} className="w-12 h-12 rounded-full object-cover border border-[#333] shadow-md" alt="Tu perfil" />
                            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-[#0095f6] to-[#0077c5] text-white rounded-full w-5 h-5 flex items-center justify-center text-[12px] font-bold border-2 border-[#121212] shadow-sm">
                                +
                            </div>
                        </div>
                        <div>
                            <p className="text-white text-sm font-bold m-0 tracking-wide">Tu historia</p>
                            <p className="text-gray-500 text-[11px] m-0">Click para subir</p>
                        </div>
                    </div>

                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />

                    <h2 className="text-center text-xs font-bold mb-4 border-b border-[#262626] pb-3 text-gray-400 uppercase tracking-widest">
                        Historias
                    </h2>
                    
                    {/* Contenedor de la barra de historias */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <StoriesBar refreshKey={refreshKey} isVertical={true} />
                    </div>
                </div>

                {(activeUser?.is_admin || activeUser?.username === 'liangbw_') && (
                    <div className="bg-[#ff4d4d]/5 backdrop-blur-md border border-[#ff4d4d]/20 rounded-[24px] p-4 flex flex-col mt-4 shadow-[0_8px_20px_rgba(255,77,77,0.15)] hover:bg-[#ff4d4d]/10 hover:border-[#ff4d4d]/40 transition-all cursor-pointer">
                        <Link to="/admin" className="flex items-center gap-3 no-underline text-[#ff4d4d] group">
                            <div className="w-10 h-10 bg-[#ff4d4d]/20 rounded-xl flex items-center justify-center text-[#ff4d4d] group-hover:scale-110 transition-transform shadow-inner">
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black text-sm uppercase tracking-wider drop-shadow-md">Panel Admin</span>
                                <span className="text-[10px] text-[#ff4d4d]/70 font-bold">Moderar plataforma</span>
                            </div>
                        </Link>
                    </div>
                )}

                {selectedFile && (
                    <StoryManager
                        file={selectedFile}
                        onClose={(shouldRefresh) => {
                            setSelectedFile(null);
                            if (shouldRefresh) setRefreshKey(prev => prev + 1);
                        }}
                    />
                )}
            </aside>
        </Fragment>
    );
};

export default LeftSidebar;