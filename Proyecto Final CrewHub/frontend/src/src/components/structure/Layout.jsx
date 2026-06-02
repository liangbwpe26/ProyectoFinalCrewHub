import React, { useContext, useState, useRef, useEffect } from 'react';
import Navbar from './Navbar.jsx';
import LeftSidebar from './LeftSidebar.jsx';
import RightSidebar from './RightSidebar.jsx';
import NotificationBell from '../NotificationBell.jsx'; 
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { Link } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
    // 1. Extraemos logout del AuthContext
    const { activeUser, logout } = useContext(AuthContext);
    
    // 2. Añadimos estado y ref para el menú móvil
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const menuRef = useRef(null);

    // 3. Efecto para cerrar el menú si se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMobileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

    const getAvatar = (user) => {
        if (user && user.profile_picture) {
            if (user.profile_picture.startsWith('http')) return user.profile_picture;
            return `${BACKEND_URL}${user.profile_picture}`;
        }
        return `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=262626&color=fff`;
    };

    return (
        <div className="min-h-screen bg-[#2b2b2b] text-white font-sans flex flex-col md:pt-[70px] pt-[60px] pb-[70px] md:pb-0">
            
            {/* --- CABECERA MÓVIL --- */}
            <div className="md:hidden fixed top-0 w-full z-50 bg-[#121212] border-b border-[#262626] h-[60px] flex items-center justify-between px-4">
                <Link to="/" className="font-black text-lg tracking-widest uppercase text-white no-underline">
                    Crew Hub
                </Link>
                
                {activeUser && (
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        
                        {/* 4. Cambiamos el Link por un div con el menú desplegable */}
                        <div className="relative" ref={menuRef}>
                            <div 
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
                                className="w-8 h-8 rounded-full border-2 border-[#262626] overflow-hidden cursor-pointer"
                            >
                                <img src={getAvatar(activeUser)} alt="Perfil" className="w-full h-full object-cover" />
                            </div>

                            {/* Menú emergente adaptado para móvil (se abre hacia abajo y a la izquierda) */}
                            {showMobileMenu && (
                                <div className="absolute top-10 right-0 mt-2 bg-[#121212] border border-[#333] rounded-xl min-w-[180px] z-[1000] overflow-hidden shadow-2xl">
                                    <Link 
                                        to={`/${activeUser.username}`} 
                                        onClick={() => setShowMobileMenu(false)} 
                                        className="block px-5 py-4 text-white no-underline text-xs font-bold border-b border-[#262626] hover:bg-[#1a1a1a] transition"
                                    >
                                        Ver perfil
                                    </Link>
                                    <Link 
                                        to="/settings/edit-profile" 
                                        onClick={() => setShowMobileMenu(false)} 
                                        className="block px-5 py-4 text-white no-underline text-xs font-bold border-b border-[#262626] hover:bg-[#1a1a1a] transition"
                                    >
                                        Configuración
                                    </Link>
                                    <button 
                                        onClick={() => { setShowMobileMenu(false); logout(); }} 
                                        className="w-full px-5 py-4 bg-transparent border-none text-[#ff4d4d] cursor-pointer text-left text-xs font-bold hover:bg-[#1a1a1a] transition"
                                    >
                                        Cerrar sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <Navbar />
            
            <div className="flex-1 flex justify-center md:justify-between px-0 md:px-8 py-0 md:py-6 max-w-[1400px] mx-auto w-full gap-8">
                <LeftSidebar />

                <main className="flex-1 max-w-[600px] w-full mt-2 md:mt-4">
                    {children}
                </main>

                <RightSidebar />
            </div>
        </div>
    );
};

export default Layout;