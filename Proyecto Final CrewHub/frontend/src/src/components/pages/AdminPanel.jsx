import React, { useState, useEffect, useContext, Fragment } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { fetchAPI } from '../../services/api.js';
import Navbar from '../structure/Navbar.jsx';

const AdminPanel = () => {
    const { activeUser } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (activeUser && !activeUser.is_admin && activeUser.username !== 'liangbw_') {
            navigate('/');
        }
    }, [activeUser, navigate]);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await fetchAPI('/admin/reports');
                if (data.success) {
                    setReports(data.reports);
                }
            } catch (error) {
                console.error("Error al cargar reportes", error);
            } finally {
                setLoading(false);
            }
        };

        if (activeUser?.is_admin || activeUser?.username === 'liangbw_') {
            fetchReports();
        }
    }, [activeUser]);

    const handleResolve = async (reportId) => {
        try {
            const data = await fetchAPI(`/admin/reports/${reportId}/resolve`, { method: 'POST' });
            if (data.success) {
                setReports(prev => prev.filter(r => (r._id || r.id) !== reportId));
            }
        } catch (error) {
            console.error("Error al resolver", error);
        }
    };

    if (!activeUser?.is_admin && activeUser?.username !== 'liangbw_') return null;

    return (
        <Fragment>
            <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col">
                <Navbar />
                
                <main className="flex-1 w-full max-w-[1000px] mx-auto pt-[100px] px-4 pb-12">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-[#ff4d4d]/20 rounded-xl flex items-center justify-center text-[#ff4d4d]">
                            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>
                        </div>
                        <h1 className="text-2xl font-black m-0">Panel de Moderación</h1>
                    </div>

                    <div className="bg-[#121212] border border-[#262626] rounded-2xl overflow-hidden shadow-2xl">
                        <div className="p-5 border-b border-[#262626] bg-[#1a1a1a]">
                            <h2 className="text-sm font-bold uppercase tracking-widest m-0 text-gray-400">Reportes Pendientes ({reports.length})</h2>
                        </div>

                        {loading ? (
                            <div className="p-10 text-center text-gray-500">Cargando base de datos...</div>
                        ) : reports.length === 0 ? (
                            <div className="p-16 text-center">
                                <div className="text-[#00ba7c] mb-3">
                                    <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <h3 className="text-white font-bold text-lg m-0">Todo en orden</h3>
                                <p className="text-gray-500 text-sm mt-2">No hay reportes pendientes de revisión.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-[#151515] text-gray-400">
                                        <tr>
                                            <th className="p-4 font-bold">Tipo</th>
                                            <th className="p-4 font-bold">Motivo</th>
                                            <th className="p-4 font-bold">Reportado (Acusado)</th>
                                            <th className="p-4 font-bold">Denunciante</th>
                                            <th className="p-4 font-bold text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#262626]">
                                        {reports.map(report => (
                                            <tr key={report._id || report.id} className="hover:bg-[#1a1a1a] transition-colors">
                                                <td className="p-4">
                                                    <span className="bg-[#262626] text-white px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                                                        {report.target_type}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <strong className="block text-white">{report.reason}</strong>
                                                    {report.details && <span className="text-xs text-gray-500 block truncate max-w-[200px] mt-1">{report.details}</span>}
                                                </td>
                                                <td className="p-4">
                                                    <Link to={`/${report.reported_user?.username}`} className="text-[#0095f6] no-underline hover:underline font-bold">
                                                        @{report.reported_user?.username || 'Desconocido'}
                                                    </Link>
                                                </td>
                                                <td className="p-4 text-gray-400">
                                                    @{report.reporter?.username || 'Desconocido'}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button 
                                                        onClick={() => handleResolve(report._id || report.id)}
                                                        className="bg-[#ff4d4d]/10 text-[#ff4d4d] border border-[#ff4d4d]/30 hover:bg-[#ff4d4d] hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer"
                                                    >
                                                        Descartar / Resolver
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </Fragment>
    );
};

export default AdminPanel;