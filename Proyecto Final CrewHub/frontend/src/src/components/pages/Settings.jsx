import React, { Fragment, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import EditProfile from './EditProfile.jsx';
import Navbar from '../structure/Navbar.jsx';

const Settings = () => {
    const { tab } = useParams();
    // Si entran a /settings sin nada más, por defecto cargamos editar perfil
    const activeTab = tab || 'edit-profile'; 
    const { logout } = useContext(AuthContext);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col relative">
            <Navbar />

            <div className="flex flex-1 w-full max-w-[1000px] mx-auto pt-[100px] px-5 pb-10 flex-col md:flex-row gap-8">
                
                {/* BARRA LATERAL IZQUIERDA (Menú de Ajustes) */}
                <div className="w-full md:w-[250px] border-r-0 md:border-r border-[#262626] pr-0 md:pr-5 flex flex-col gap-2 shrink-0">
                    <h2 className="m-0 mb-4 text-2xl font-bold text-white tracking-wide">Configuración</h2>
                    
                    <Link 
                        to="/settings/edit-profile" 
                        className={`p-3 rounded-xl no-underline text-sm font-bold transition-all ${activeTab === 'edit-profile' ? 'bg-[#1a1a1a] text-white shadow-md' : 'text-gray-400 hover:bg-[#121212] hover:text-gray-200'}`}
                    >
                        Editar perfil
                    </Link>
                    
                    <Link 
                        to="/settings/privacy" 
                        className={`p-3 rounded-xl no-underline text-sm font-bold transition-all ${activeTab === 'privacy' ? 'bg-[#1a1a1a] text-white shadow-md' : 'text-gray-400 hover:bg-[#121212] hover:text-gray-200'}`}
                    >
                        Privacidad y seguridad
                    </Link>

                    {/* Botón rojo para cerrar sesión */}
                    <button 
                        onClick={logout}
                        className="mt-auto p-3 rounded-xl border border-[#ff4d4d]/50 bg-[#ff4d4d]/10 color text-[#ff4d4d] cursor-pointer font-bold text-sm text-left transition-all hover:bg-[#ff4d4d]/20"
                    >
                        Cerrar sesión
                    </button>
                </div>

                {/* PANEL DERECHO (Contenido Dinámico) */}
                <div className="flex-1 md:pl-5">
                    {activeTab === 'edit-profile' && <EditProfile />}
                    
                    {activeTab === 'privacy' && (
                        <div className="text-gray-400">
                            <h2 className="text-white mt-0 mb-4 text-xl font-bold">Privacidad</h2>
                            <p>Opciones de seguridad en construcción...</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Settings;