import React, { useContext, useRef, useState, Fragment } from 'react';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import StoriesBar from '../StoriesBar.jsx';
import StoryManager from '../StoryManager.jsx';
import './LeftSidebar.css';

const LeftSidebar = () => {
    const { activeUser } = useContext(AuthContext);
    const fileInputRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0); // Estado para forzar recarga

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

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
                <div className="bg-[#121212] border border-[#262626] rounded-[24px] p-5 flex flex-col h-[65%] shadow-lg">

                    {/* Avatar clickable que dispara la subida */}
                    <div
                        className="flex items-center gap-3 mb-4 p-2 cursor-pointer hover:bg-[#1a1a1a] rounded-xl transition"
                        onClick={triggerFileInput}
                    >
                        <div className="relative">
                            <img src={getAvatar(activeUser)} className="w-12 h-12 rounded-full object-cover border border-[#333]" alt="Tu perfil" />
                            <div className="absolute -bottom-1 -right-1 bg-[#0095f6] text-white rounded-full w-5 h-5 flex items-center justify-center text-[12px] font-bold border-2 border-[#121212]">
                                +
                            </div>
                        </div>
                        <div>
                            <p className="text-white text-sm font-bold m-0">Tu historia</p>
                            <p className="text-gray-500 text-[11px] m-0">Click para subir</p>
                        </div>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                    />

                    <h2 className="text-center text-xs font-bold mb-4 border-b border-[#262626] pb-3 text-white">
                        Historias
                    </h2>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {/* Le pasamos la llave a la barra */}
                        <StoriesBar refreshKey={refreshKey} />
                    </div>
                </div>

                {selectedFile && (
                    <StoryManager
                        file={selectedFile}
                        onClose={(shouldRefresh) => {
                            setSelectedFile(null);
                            // Si se subió con éxito, aumentamos la llave y la barra se recargará
                            if (shouldRefresh) setRefreshKey(prev => prev + 1);
                        }}
                    />
                )}
            </aside>
        </Fragment>
    );
};

export default LeftSidebar;