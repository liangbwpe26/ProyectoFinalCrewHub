import React, { Fragment, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import EditProfile from './EditProfile.jsx';
import Navbar from '../structure/Navbar.jsx';
import PrivacySettings from '../PrivacySettings.jsx';
import { useSettings } from '../../hooks/useSettings.js';

const Settings = () => {
    const { tab } = useParams();
    const activeTab = tab || 'edit-profile'; 
    const { logout } = useContext(AuthContext);

    const {
        alertMessage, isLoading,
        email, setEmail,
        currentPassword, setCurrentPassword,
        newPassword, setNewPassword,
        confirmPassword, setConfirmPassword,
        notifPrefs, setNotifPrefs,
        ticketSubject, setTicketSubject,
        ticketMessage, setTicketMessage,
        handleUpdateAccount, handleUpdateNotifications, handleSubmitTicket
    } = useSettings();

    return (
        <Fragment>
            <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col relative">
                <Navbar />

                {alertMessage && (
                    <div className={`fixed top-20 right-5 z-[9999] px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 transition-all animate-fade-in ${alertMessage.type === 'success' ? 'bg-[#0a0a0a] border-[#00ba7c] text-[#00ba7c]' : 'bg-[#0a0a0a] border-[#ff4d4d] text-[#ff4d4d]'}`}>
                        <strong className="text-white">{alertMessage.title}:</strong> <span className="text-gray-300">{alertMessage.text}</span>
                    </div>
                )}

                <div className="flex flex-1 w-full max-w-[1000px] mx-auto pt-[100px] px-5 pb-10 flex-col md:flex-row gap-8">
                    
                    <div className="w-full md:w-[250px] border-r-0 md:border-r border-[#262626] pr-0 md:pr-5 flex flex-col gap-2 shrink-0">
                        <h2 className="m-0 mb-4 text-2xl font-bold text-white tracking-wide">Configuración</h2>
                        
                        <Link 
                            to="/settings/edit-profile" 
                            className={`p-3 rounded-xl no-underline text-sm font-bold transition-all ${activeTab === 'edit-profile' ? 'bg-[#1a1a1a] text-white shadow-md' : 'text-gray-400 hover:bg-[#121212] hover:text-gray-200'}`}
                        >
                            Editar perfil
                        </Link>
                        
                        <Link 
                            to="/settings/account" 
                            className={`p-3 rounded-xl no-underline text-sm font-bold transition-all ${activeTab === 'account' ? 'bg-[#1a1a1a] text-white shadow-md' : 'text-gray-400 hover:bg-[#121212] hover:text-gray-200'}`}
                        >
                            Cuenta y seguridad
                        </Link>

                        <Link 
                            to="/settings/notifications" 
                            className={`p-3 rounded-xl no-underline text-sm font-bold transition-all ${activeTab === 'notifications' ? 'bg-[#1a1a1a] text-white shadow-md' : 'text-gray-400 hover:bg-[#121212] hover:text-gray-200'}`}
                        >
                            Notificaciones
                        </Link>

                        <Link 
                            to="/settings/privacy" 
                            className={`p-3 rounded-xl no-underline text-sm font-bold transition-all ${activeTab === 'privacy' ? 'bg-[#1a1a1a] text-white shadow-md' : 'text-gray-400 hover:bg-[#121212] hover:text-gray-200'}`}
                        >
                            Privacidad
                        </Link>

                        <Link 
                            to="/settings/support" 
                            className={`p-3 rounded-xl no-underline text-sm font-bold transition-all ${activeTab === 'support' ? 'bg-[#1a1a1a] text-white shadow-md' : 'text-gray-400 hover:bg-[#121212] hover:text-gray-200'}`}
                        >
                            Soporte / Tickets
                        </Link>

                        <button 
                            onClick={logout}
                            className="mt-auto md:mt-10 p-3 rounded-xl border border-[#ff4d4d]/50 bg-[#ff4d4d]/10 text-[#ff4d4d] cursor-pointer font-bold text-sm text-left transition-all hover:bg-[#ff4d4d]/20"
                        >
                            Cerrar sesión
                        </button>
                    </div>

                    <div className="flex-1 md:pl-5">
                        
                        {/* 1. TUS PESTAÑAS ORIGINALES */}
                        {activeTab === 'edit-profile' && <EditProfile />}
                        {activeTab === 'privacy' && <PrivacySettings />}
                        
                        {/* 2. NUEVA PESTAÑA: CUENTA Y SEGURIDAD */}
                        {activeTab === 'account' && (
                            <form onSubmit={handleUpdateAccount} className="flex flex-col gap-6 max-w-[600px]">
                                <h2 className="text-xl font-bold text-white mb-2 m-0 border-b border-[#333] pb-4">Ajustes de Cuenta</h2>
                                
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Correo Electrónico</label>
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3.5 rounded-xl border border-[#333] bg-[#121212] text-white outline-none focus:border-[#0095f6] transition text-sm" required />
                                </div>

                                <div className="mt-2">
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Contraseña Actual (Requerida para guardar)</label>
                                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full p-3.5 rounded-xl border border-[#333] bg-[#121212] text-white outline-none focus:border-[#0095f6] transition text-sm" placeholder="••••••••" required />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    <div>
                                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Nueva Contraseña</label>
                                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-3.5 rounded-xl border border-[#333] bg-[#121212] text-white outline-none focus:border-[#0095f6] transition text-sm" placeholder="(Opcional)" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Confirmar Nueva Contraseña</label>
                                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-3.5 rounded-xl border border-[#333] bg-[#121212] text-white outline-none focus:border-[#0095f6] transition text-sm" placeholder="(Opcional)" />
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-[#262626] flex justify-end">
                                    <button type="submit" disabled={isLoading} className="bg-[#0095f6] hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full transition-colors cursor-pointer border-none shadow-lg shadow-blue-500/20 disabled:opacity-50">
                                        {isLoading ? 'Guardando...' : 'Actualizar Cuenta'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* 3. NUEVA PESTAÑA: NOTIFICACIONES */}
                        {activeTab === 'notifications' && (
                            <div className="flex flex-col gap-6 max-w-[600px]">
                                <h2 className="text-xl font-bold text-white mb-2 m-0 border-b border-[#333] pb-4">Filtro de Notificaciones</h2>
                                <p className="text-gray-400 text-sm m-0 mb-2">Selecciona qué interacciones encenderán la campana en tu panel.</p>

                                <div className="flex flex-col gap-4">
                                    <label className="flex items-center justify-between p-4 bg-[#121212] border border-[#333] rounded-xl cursor-pointer hover:border-[#555] transition">
                                        <div>
                                            <strong className="text-white block">Me gustas y Reacciones</strong>
                                            <span className="text-gray-500 text-xs mt-1 block">Avisar cuando interactúen con tus posts o drops.</span>
                                        </div>
                                        <input type="checkbox" checked={notifPrefs.likes} onChange={e => setNotifPrefs({...notifPrefs, likes: e.target.checked})} className="w-5 h-5 accent-[#0095f6] cursor-pointer" />
                                    </label>

                                    <label className="flex items-center justify-between p-4 bg-[#121212] border border-[#333] rounded-xl cursor-pointer hover:border-[#555] transition">
                                        <div>
                                            <strong className="text-white block">Nuevos Seguidores</strong>
                                            <span className="text-gray-500 text-xs mt-1 block">Avisar cuando te sigan o envíen solicitud.</span>
                                        </div>
                                        <input type="checkbox" checked={notifPrefs.follows} onChange={e => setNotifPrefs({...notifPrefs, follows: e.target.checked})} className="w-5 h-5 accent-[#0095f6] cursor-pointer" />
                                    </label>

                                    <label className="flex items-center justify-between p-4 bg-[#121212] border border-[#333] rounded-xl cursor-pointer hover:border-[#555] transition">
                                        <div>
                                            <strong className="text-white block">Mensajes de Chat</strong>
                                            <span className="text-gray-500 text-xs mt-1 block">Alertas de nuevos mensajes directos.</span>
                                        </div>
                                        <input type="checkbox" checked={notifPrefs.messages} onChange={e => setNotifPrefs({...notifPrefs, messages: e.target.checked})} className="w-5 h-5 accent-[#0095f6] cursor-pointer" />
                                    </label>

                                    <label className="flex items-center justify-between p-4 bg-[#121212] border border-[#333] rounded-xl cursor-pointer hover:border-[#555] transition">
                                        <div>
                                            <strong className="text-white block">Comunidades</strong>
                                            <span className="text-gray-500 text-xs mt-1 block">Avisos importantes de tus grupos.</span>
                                        </div>
                                        <input type="checkbox" checked={notifPrefs.communities} onChange={e => setNotifPrefs({...notifPrefs, communities: e.target.checked})} className="w-5 h-5 accent-[#0095f6] cursor-pointer" />
                                    </label>
                                </div>

                                <div className="mt-4 pt-4 border-t border-[#262626] flex justify-end">
                                    <button onClick={handleUpdateNotifications} disabled={isLoading} className="bg-[#00ba7c] hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-colors cursor-pointer border-none shadow-lg shadow-green-500/20 disabled:opacity-50">
                                        {isLoading ? 'Guardando...' : 'Guardar Preferencias'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 4. NUEVA PESTAÑA: SOPORTE Y TICKETS */}
                        {activeTab === 'support' && (
                            <form onSubmit={handleSubmitTicket} className="flex flex-col gap-6 max-w-[600px]">
                                <h2 className="text-xl font-bold text-white mb-2 m-0 border-b border-[#333] pb-4">Centro de Soporte</h2>
                                <p className="text-gray-400 text-sm m-0">¿Tienes un problema con la plataforma o presenciaste un bug? Levanta un ticket para el equipo de administradores.</p>

                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Asunto del problema</label>
                                    <input type="text" value={ticketSubject} onChange={e => setTicketSubject(e.target.value)} className="w-full p-3.5 rounded-xl border border-[#333] bg-[#121212] text-white outline-none focus:border-[#0095f6] transition text-sm" placeholder="Ej: Error al configurar mi cuenta premium" required />
                                </div>

                                <div className="mt-2">
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Descripción detallada</label>
                                    <textarea value={ticketMessage} onChange={e => setTicketMessage(e.target.value)} rows="6" className="w-full p-3.5 rounded-xl border border-[#333] bg-[#121212] text-white outline-none focus:border-[#0095f6] transition text-sm resize-none custom-scrollbar" placeholder="Explica detalladamente lo que pasó..." required></textarea>
                                </div>

                                <div className="mt-4 pt-4 border-t border-[#262626] flex justify-end">
                                    <button type="submit" disabled={isLoading} className="bg-[#ff9f00] hover:bg-orange-500 text-white font-bold py-3 px-8 rounded-full transition-colors cursor-pointer border-none shadow-lg shadow-orange-500/20 disabled:opacity-50">
                                        {isLoading ? 'Enviando...' : 'Enviar Ticket'}
                                    </button>
                                </div>
                            </form>
                        )}

                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default Settings;