import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import StoriesBar from '../StoriesBar.jsx';
import NotificationBell from '../NotificationBell.jsx';
import './LeftSidebar.css';

const LeftSidebar = () => {
    const { activeUser, logout, token } = useContext(AuthContext);
    const [showUserMenu, setShowUserMenu] = useState(false);
    
    // Referencia para detectar clics fuera del menú de usuario
    const menuRef = useRef(null);

    // Efecto para cerrar el menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Variable de entorno dinámica
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

    const getAvatar = (user) => {
        if (user && user.profile_picture) {
            if (user.profile_picture.startsWith('http')) return user.profile_picture;
            return `${BACKEND_URL}${user.profile_picture}`;
        }
        const name = user && user.username ? user.username : 'U';
        return `https://ui-avatars.com/api/?name=${name}&background=262626&color=fff&bold=true`;
    };

    return (
        <aside className="w-[260px] hidden lg:flex flex-col h-[calc(100vh-100px)] sticky top-[80px] justify-between pb-6">
            
            {/* Arriba: Historias */}
            <div className="bg-[#121212] border border-[#262626] rounded-[24px] p-5 flex flex-col h-[65%] shadow-lg">
                <h2 className="text-center text-xs font-bold mb-4 border-b border-[#262626] pb-3 text-white">
                    Historias (Seguidos)
                </h2>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <StoriesBar />
                </div>
            </div>

            {/* Abajo: Opciones (Notificaciones y Perfil) */}
            <div className="mt-auto flex flex-col items-center gap-6 relative">
                
                {token && activeUser && (
                    <>
                        {/* Campana de Notificaciones - Grande */}
                        <div className="bg-[#121212] border border-[#262626] rounded-full p-4 hover:border-[#444] transition cursor-pointer shadow-lg flex items-center justify-center">
                            <NotificationBell />
                        </div>

                        {/* Botón del Perfil - Grande */}
                        <div className="relative" ref={menuRef}>
                            <div 
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="w-20 h-20 rounded-full border-4 border-[#262626] cursor-pointer hover:border-[#0095f6] transition shadow-lg overflow-hidden flex items-center justify-center"
                            >
                                <img src={getAvatar(activeUser)} alt="Mi Perfil" className="w-full h-full object-cover" />
                            </div>

                            {/* Menú Desplegable abriendo hacia la derecha */}
                            {showUserMenu && (
                                <div className="absolute bottom-20 left-[80%] ml-4 bg-[#121212] border border-[#333] rounded-xl min-w-[180px] z-[1000] overflow-hidden shadow-2xl">
                                    <Link 
                                        to={`/${activeUser.username}`} 
                                        onClick={() => setShowUserMenu(false)} 
                                        className="block px-5 py-4 text-white no-underline text-xs font-bold border-b border-[#262626] hover:bg-[#1a1a1a] transition"
                                    >
                                        Ver perfil
                                    </Link>
                                    <Link 
                                        to="/settings/edit-profile" 
                                        onClick={() => setShowUserMenu(false)} 
                                        className="block px-5 py-4 text-white no-underline text-xs font-bold border-b border-[#262626] hover:bg-[#1a1a1a] transition"
                                    >
                                        Configuración
                                    </Link>
                                    <button 
                                        onClick={() => { setShowUserMenu(false); logout(); }} 
                                        className="w-full px-5 py-4 bg-transparent border-none text-[#ff4d4d] cursor-pointer text-left text-xs font-bold hover:bg-[#1a1a1a] transition"
                                    >
                                        Cerrar sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            
        </aside>
    );
};

export default LeftSidebar;