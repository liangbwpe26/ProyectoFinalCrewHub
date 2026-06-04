import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../structure/Navbar.jsx';
import { useAdminPanel } from '../../hooks/useAdminPanel.js';

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
            <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col">
                <Navbar />
                
                <main className="flex-1 w-full max-w-[1000px] mx-auto pt-[100px] px-4 pb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-[#ff4d4d]/20 rounded-xl flex items-center justify-center text-[#ff4d4d]">
                            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                        </div>
                        <h1 className="text-2xl font-black m-0">Panel de Administración</h1>
                    </div>

                    <div className="flex gap-4 mb-6 border-b border-[#262626] overflow-x-auto custom-scrollbar">
                        <button onClick={() => setActiveTab('reports')} className={`pb-3 font-bold uppercase tracking-wider text-xs md:text-sm transition-colors border-b-2 whitespace-nowrap cursor-pointer ${activeTab === 'reports' ? 'border-[#ff4d4d] text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                            Reportes ({reports.length})
                        </button>
                        <button onClick={() => setActiveTab('tickets')} className={`pb-3 font-bold uppercase tracking-wider text-xs md:text-sm transition-colors border-b-2 whitespace-nowrap cursor-pointer ${activeTab === 'tickets' ? 'border-[#0095f6] text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                            Tickets ({tickets.length})
                        </button>
                        <button onClick={() => setActiveTab('users')} className={`pb-3 font-bold uppercase tracking-wider text-xs md:text-sm transition-colors border-b-2 whitespace-nowrap cursor-pointer ${activeTab === 'users' ? 'border-[#ff9f00] text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                            Usuarios Sancionados ({sanctionedUsers.length})
                        </button>
                    </div>

                    <div className="bg-[#121212] border border-[#262626] rounded-2xl overflow-hidden shadow-2xl">
                        {loading ? (
                            <div className="p-10 text-center text-gray-500">Cargando base de datos...</div>
                        ) : activeTab === 'reports' ? (
                            reports.length === 0 ? <div className="p-16 text-center text-gray-500">No hay reportes pendientes.</div> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-[#151515] text-gray-400">
                                            <tr>
                                                <th className="p-4 font-bold">Tipo</th>
                                                <th className="p-4 font-bold">Motivo</th>
                                                <th className="p-4 font-bold">Acusado</th>
                                                <th className="p-4 font-bold text-right">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#262626]">
                                            {reports.map(report => (
                                                <tr key={report._id || report.id} className="hover:bg-[#1a1a1a]">
                                                    <td className="p-4 font-bold uppercase text-xs text-gray-400">{report.target_type}</td>
                                                    <td className="p-4 text-white">{report.reason}</td>
                                                    <td className="p-4 text-[#0095f6]">@{report.reported_user?.username || 'Desconocido'}</td>
                                                    <td className="p-4 text-right">
                                                        <button onClick={() => handleDeleteContent(report)} className="bg-[#ff4d4d] text-white px-3 py-1.5 rounded-lg text-xs font-bold mr-2 cursor-pointer">Eliminar</button>
                                                        <button onClick={() => handleResolveReport(report._id || report.id)} className="bg-transparent text-gray-400 border border-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer">Descartar</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        ) : activeTab === 'tickets' ? (
                            tickets.length === 0 ? <div className="p-16 text-center text-gray-500">No hay tickets pendientes.</div> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-[#151515] text-gray-400">
                                            <tr>
                                                <th className="p-4 font-bold">Usuario</th>
                                                <th className="p-4 font-bold">Asunto y Mensaje</th>
                                                <th className="p-4 font-bold text-right">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#262626]">
                                            {tickets.map(ticket => (
                                                <tr key={ticket._id || ticket.id} className="hover:bg-[#1a1a1a]">
                                                    <td className="p-4 text-white font-bold">@{ticket.user?.username || 'Desconocido'}</td>
                                                    <td className="p-4 text-white">
                                                        <strong>{ticket.subject}</strong><br/>
                                                        <span className="text-gray-500 text-xs">{ticket.message}</span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button onClick={() => handleResolveTicket(ticket._id || ticket.id)} className="bg-[#0095f6] text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer">Resolver</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        ) : (
                            sanctionedUsers.length === 0 ? <div className="p-16 text-center text-gray-500">No hay usuarios con sanciones.</div> : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-[#151515] text-gray-400">
                                            <tr>
                                                <th className="p-4 font-bold">Usuario</th>
                                                <th className="p-4 font-bold">Estado</th>
                                                <th className="p-4 font-bold">Strikes</th>
                                                <th className="p-4 font-bold text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#262626]">
                                            {sanctionedUsers.map(user => (
                                                <tr key={user._id || user.id} className="hover:bg-[#1a1a1a]">
                                                    <td className="p-4">
                                                        <Link to={`/${user.username}`} className="text-white font-bold no-underline hover:underline">@{user.username}</Link>
                                                        <span className="block text-gray-500 text-xs">{user.email}</span>
                                                    </td>
                                                    <td className="p-4">
                                                        {user.is_banned ? (
                                                            <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-xs font-black uppercase">Baneado</span>
                                                        ) : (
                                                            <span className="bg-orange-500/20 text-orange-500 px-2 py-1 rounded text-xs font-black uppercase">En Peligro</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex gap-1">
                                                            <div className={`w-3 h-3 rounded-full ${user.strikes >= 1 ? 'bg-red-500' : 'bg-[#333]'}`}></div>
                                                            <div className={`w-3 h-3 rounded-full ${user.strikes >= 2 ? 'bg-red-500' : 'bg-[#333]'}`}></div>
                                                            <div className={`w-3 h-3 rounded-full ${user.strikes >= 3 ? 'bg-red-500' : 'bg-[#333]'}`}></div>
                                                        </div>
                                                        <span className="text-xs text-gray-500 mt-1 block">{user.strikes || 0} / 3 Faltas</span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button 
                                                            onClick={() => handleToggleBan(user._id || user.id)} 
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold mr-2 cursor-pointer border ${user.is_banned ? 'bg-transparent text-gray-300 border-gray-600 hover:bg-gray-800' : 'bg-[#ff4d4d] text-white border-transparent hover:bg-red-600'}`}
                                                        >
                                                            {user.is_banned ? 'Desbanear' : 'Banear Ya'}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleResetStrikes(user._id || user.id)} 
                                                            className="bg-transparent text-[#00ba7c] border border-[#00ba7c]/30 hover:bg-[#00ba7c] hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                                                        >
                                                            Perdonar (0 Strikes)
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