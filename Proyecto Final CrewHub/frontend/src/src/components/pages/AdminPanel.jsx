import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../structure/Navbar.jsx';
import { useAdminPanel } from '../../hooks/useAdminPanel.js';

// Componente: AdminPanel
// Panel administrativo para gestionar reports, tickets y usuarios sancionados.
const AdminPanel = () => {
    const {
        activeUser,
        activeTab, setActiveTab,
        reports, tickets, sanctionedUsers, loading,
        handleResolveReport, handleDeleteContent,
        handleResolveTicket,
        handleToggleBan, handleResetStrikes
    } = useAdminPanel();

    if (!activeUser?.is_admin && activeUser?.username !== 'liangbw_') return null;

    return (
        <Fragment>
            <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1f1f1f] via-[#0a0a0a] to-black text-white font-sans flex flex-col">
                <Navbar />
                
                <main className="flex-1 w-full max-w-[1000px] mx-auto pt-[100px] px-4 pb-12 relative z-10">
                    
                    <div className="flex items-center gap-4 mb-8 bg-[#121212]/80 backdrop-blur-md p-6 rounded-2xl border border-[#262626] shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                        <div className="w-12 h-12 bg-[#ff4d4d]/10 border border-[#ff4d4d]/30 rounded-xl flex items-center justify-center text-[#ff4d4d] shadow-[0_0_15px_rgba(255,77,77,0.2)]">
                            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-black m-0 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Panel de Administración</h1>
                            <p className="text-xs text-[#ff4d4d] font-bold uppercase tracking-widest m-0 mt-1">Nivel de Acceso: Moderador Global</p>
                        </div>
                    </div>

                    <div className="flex gap-2 mb-6 bg-[#1a1a1a]/50 backdrop-blur-md p-1.5 rounded-xl border border-[#333] w-fit overflow-x-auto custom-scrollbar">
                        <button onClick={() => setActiveTab('reports')} className={`px-5 py-2.5 font-bold uppercase tracking-wider text-xs md:text-sm transition-all rounded-lg whitespace-nowrap cursor-pointer border-none ${activeTab === 'reports' ? 'bg-[#ff4d4d] text-white shadow-[0_0_10px_rgba(255,77,77,0.3)]' : 'bg-transparent text-gray-500 hover:text-white hover:bg-[#262626]'}`}>
                            Reportes ({reports.length})
                        </button>
                        <button onClick={() => setActiveTab('tickets')} className={`px-5 py-2.5 font-bold uppercase tracking-wider text-xs md:text-sm transition-all rounded-lg whitespace-nowrap cursor-pointer border-none ${activeTab === 'tickets' ? 'bg-[#0095f6] text-white shadow-[0_0_10px_rgba(0,149,246,0.3)]' : 'bg-transparent text-gray-500 hover:text-white hover:bg-[#262626]'}`}>
                            Tickets ({tickets.length})
                        </button>
                        <button onClick={() => setActiveTab('users')} className={`px-5 py-2.5 font-bold uppercase tracking-wider text-xs md:text-sm transition-all rounded-lg whitespace-nowrap cursor-pointer border-none ${activeTab === 'users' ? 'bg-[#ff9f00] text-white shadow-[0_0_10px_rgba(255,159,0,0.3)]' : 'bg-transparent text-gray-500 hover:text-white hover:bg-[#262626]'}`}>
                            Usuarios Sancionados ({sanctionedUsers.length})
                        </button>
                    </div>

                    <div className="bg-[#121212]/80 backdrop-blur-xl border border-[#262626] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                        {loading ? (
                            <div className="p-16 flex flex-col items-center justify-center text-gray-500">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-500 mb-4"></div>
                                <span className="text-xs font-bold tracking-widest uppercase">Cargando datos...</span>
                            </div>
                        ) : activeTab === 'reports' ? (
                            reports.length === 0 ? <div className="p-16 text-center text-gray-500 font-bold tracking-widest uppercase text-sm">No hay reportes pendientes</div> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-[#1a1a1a]/80 text-gray-400 border-b border-[#333]">
                                            <tr>
                                                <th className="p-5 font-bold tracking-widest uppercase text-[10px]">Tipo</th>
                                                <th className="p-5 font-bold tracking-widest uppercase text-[10px]">Motivo</th>
                                                <th className="p-5 font-bold tracking-widest uppercase text-[10px]">Acusado</th>
                                                <th className="p-5 font-bold tracking-widest uppercase text-[10px] text-right">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#262626]">
                                            {reports.map(report => (
                                                <tr key={report._id || report.id} className="hover:bg-[#1a1a1a]/80 transition-colors">
                                                    <td className="p-5 font-black uppercase text-[11px] text-gray-400">
                                                        <span className="bg-[#262626] px-2 py-1 rounded-md">{report.target_type}</span>
                                                    </td>
                                                    <td className="p-5 text-white font-medium">{report.reason}</td>
                                                    <td className="p-5 text-[#0095f6] font-bold">@{report.reported_user?.username || 'Desconocido'}</td>
                                                    <td className="p-5 text-right">
                                                        <button onClick={() => handleDeleteContent(report)} className="bg-[#ff4d4d]/10 text-[#ff4d4d] border border-[#ff4d4d]/30 hover:bg-[#ff4d4d] hover:text-white transition-colors px-4 py-2 rounded-lg text-xs font-bold mr-2 cursor-pointer shadow-sm">Eliminar</button>
                                                        <button onClick={() => handleResolveReport(report._id || report.id)} className="bg-transparent text-gray-400 border border-[#444] hover:border-gray-200 hover:text-white transition-colors px-4 py-2 rounded-lg text-xs font-bold cursor-pointer">Descartar</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        ) : activeTab === 'tickets' ? (
                            tickets.length === 0 ? <div className="p-16 text-center text-gray-500 font-bold tracking-widest uppercase text-sm">No hay tickets pendientes</div> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-[#1a1a1a]/80 text-gray-400 border-b border-[#333]">
                                            <tr>
                                                <th className="p-5 font-bold tracking-widest uppercase text-[10px]">Usuario</th>
                                                <th className="p-5 font-bold tracking-widest uppercase text-[10px]">Asunto y Mensaje</th>
                                                <th className="p-5 font-bold tracking-widest uppercase text-[10px] text-right">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#262626]">
                                            {tickets.map(ticket => (
                                                <tr key={ticket._id || ticket.id} className="hover:bg-[#1a1a1a]/80 transition-colors">
                                                    <td className="p-5 text-white font-bold">@{ticket.user?.username || 'Desconocido'}</td>
                                                    <td className="p-5 text-white">
                                                        <strong className="block mb-1">{ticket.subject}</strong>
                                                        <span className="text-gray-400 text-xs italic">"{ticket.message}"</span>
                                                    </td>
                                                    <td className="p-5 text-right">
                                                        <button onClick={() => handleResolveTicket(ticket._id || ticket.id)} className="bg-[#0095f6]/10 text-[#0095f6] border border-[#0095f6]/30 hover:bg-[#0095f6] hover:text-white transition-colors px-4 py-2 rounded-lg text-xs font-bold cursor-pointer shadow-sm">Resolver</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        ) : (
                            sanctionedUsers.length === 0 ? <div className="p-16 text-center text-gray-500 font-bold tracking-widest uppercase text-sm">No hay usuarios con sanciones</div> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-[#1a1a1a]/80 text-gray-400 border-b border-[#333]">
                                            <tr>
                                                <th className="p-5 font-bold tracking-widest uppercase text-[10px]">Usuario</th>
                                                <th className="p-5 font-bold tracking-widest uppercase text-[10px]">Estado</th>
                                                <th className="p-5 font-bold tracking-widest uppercase text-[10px]">Faltas (Strikes)</th>
                                                <th className="p-5 font-bold tracking-widest uppercase text-[10px] text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#262626]">
                                            {sanctionedUsers.map(user => (
                                                <tr key={user._id || user.id} className="hover:bg-[#1a1a1a]/80 transition-colors">
                                                    <td className="p-5">
                                                        <Link to={`/${user.username}`} className="text-white font-bold no-underline hover:text-[#0095f6] transition-colors">@{user.username}</Link>
                                                        <span className="block text-gray-500 text-[11px] mt-0.5">{user.email}</span>
                                                    </td>
                                                    <td className="p-5">
                                                        {user.is_banned ? (
                                                            <span className="bg-red-500/10 text-red-500 border border-red-500/30 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">Baneado</span>
                                                        ) : (
                                                            <span className="bg-orange-500/10 text-orange-500 border border-orange-500/30 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">En Peligro</span>
                                                        )}
                                                    </td>
                                                    <td className="p-5">
                                                        <div className="flex gap-1.5 mb-1.5">
                                                            <div className={`w-3.5 h-3.5 rounded-full shadow-inner ${user.strikes >= 1 ? 'bg-red-500 shadow-[0_0_8px_rgba(255,0,0,0.5)]' : 'bg-[#333]'}`}></div>
                                                            <div className={`w-3.5 h-3.5 rounded-full shadow-inner ${user.strikes >= 2 ? 'bg-red-500 shadow-[0_0_8px_rgba(255,0,0,0.5)]' : 'bg-[#333]'}`}></div>
                                                            <div className={`w-3.5 h-3.5 rounded-full shadow-inner ${user.strikes >= 3 ? 'bg-red-500 shadow-[0_0_8px_rgba(255,0,0,0.5)]' : 'bg-[#333]'}`}></div>
                                                        </div>
                                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{user.strikes || 0} / 3 Faltas</span>
                                                    </td>
                                                    <td className="p-5 text-right">
                                                        <button 
                                                            onClick={() => handleToggleBan(user._id || user.id)} 
                                                            className={`px-4 py-2 rounded-lg text-xs font-bold mr-2 cursor-pointer transition-colors border shadow-sm ${user.is_banned ? 'bg-transparent text-gray-300 border-[#555] hover:bg-gray-800' : 'bg-[#ff4d4d]/10 text-[#ff4d4d] border-[#ff4d4d]/30 hover:bg-[#ff4d4d] hover:text-white'}`}
                                                        >
                                                            {user.is_banned ? 'Desbanear' : 'Banear Ya'}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleResetStrikes(user._id || user.id)} 
                                                            className="bg-[#00ba7c]/10 text-[#00ba7c] border border-[#00ba7c]/30 hover:bg-[#00ba7c] hover:text-white transition-colors px-4 py-2 rounded-lg text-xs font-bold cursor-pointer shadow-sm"
                                                        >
                                                            Perdonar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        )}
                    </div>
                </main>
            </div>
        </Fragment>
    );
};

export default AdminPanel;