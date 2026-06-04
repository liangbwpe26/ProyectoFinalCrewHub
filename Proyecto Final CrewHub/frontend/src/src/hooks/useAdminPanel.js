import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { fetchAPI } from '../services/api.js';

export const useAdminPanel = () => {
    const { activeUser } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('reports'); 
    const [reports, setReports] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [sanctionedUsers, setSanctionedUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (activeUser && !activeUser.is_admin && activeUser.username !== 'liangbw_') {
            navigate('/');
        }
    }, [activeUser, navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const resReports = await fetchAPI('/admin/reports');
            if (resReports.success) setReports(resReports.reports);

            const resTickets = await fetchAPI('/admin/tickets');
            if (resTickets.success) setTickets(resTickets.tickets);

            const resUsers = await fetchAPI('/admin/users/sanctioned');
            if (resUsers.success) setSanctionedUsers(resUsers.users);

        } catch (error) {
            console.error("Error al cargar datos", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeUser?.is_admin || activeUser?.username === 'liangbw_') {
            fetchData();
        }
    }, [activeUser]);

    const handleResolveReport = async (reportId) => {
        try {
            const res = await fetchAPI(`/admin/reports/${reportId}/resolve`, { method: 'POST' });
            if (res.success) setReports(prev => prev.filter(r => (r._id || r.id) !== reportId));
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteContent = async (report) => {
        if (!window.confirm(`¿Seguro que deseas eliminar este contenido?`)) return;
        try {
            let endpoint = '';
            if (report.target_type === 'post') endpoint = `/posts/${report.target_id}`;
            else if (report.target_type === 'drop') endpoint = `/drops/${report.target_id}`;
            
            if (endpoint) {
                const res = await fetchAPI(endpoint, { method: 'DELETE' });
                if (res.success) {
                    await handleResolveReport(report._id || report.id);
                    fetchData();
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleResolveTicket = async (ticketId) => {
        try {
            const res = await fetchAPI(`/admin/tickets/${ticketId}/resolve`, { method: 'POST' });
            if (res.success) setTickets(prev => prev.filter(t => (t._id || t.id) !== ticketId));
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleBan = async (userId) => {
        try {
            const res = await fetchAPI(`/admin/users/${userId}/toggle-ban`, { method: 'POST' });
            if (res.success) fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleResetStrikes = async (userId) => {
        if (!window.confirm("¿Seguro de perdonar a este usuario y dejar sus strikes en 0?")) return;
        try {
            const res = await fetchAPI(`/admin/users/${userId}/reset-strikes`, { method: 'POST' });
            if (res.success) fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    return {
        activeUser,
        activeTab, setActiveTab,
        reports, tickets, sanctionedUsers, loading,
        handleResolveReport, handleDeleteContent,
        handleResolveTicket,
        handleToggleBan, handleResetStrikes
    };
};