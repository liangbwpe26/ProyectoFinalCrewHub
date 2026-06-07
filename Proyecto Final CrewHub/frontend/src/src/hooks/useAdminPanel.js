import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { fetchAPI } from '../services/api.js';

// El hook useAdminPanel maneja la lógica relacionada con el panel de administración, incluyendo la verificación de permisos, 
// la carga de datos y las acciones para resolver reportes, tickets y gestionar usuarios sancionados.
export const useAdminPanel = () => {
    // Obtiene el usuario activo del contexto de autenticación y la función de navegación para redirigir si el usuario no tiene permisos.
    const { activeUser } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [activeTab, setActiveTab] = useState('reports'); 
    const [reports, setReports] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [sanctionedUsers, setSanctionedUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Verifica si el usuario activo es un administrador o tiene un nombre de usuario específico, y si no, lo redirige a la página principal.
    useEffect(() => {
        if (activeUser && !activeUser.is_admin && activeUser.username !== 'liangbw_') {
            navigate('/');
        }
    }, [activeUser, navigate]);

    // Función para cargar los datos de reportes, tickets y usuarios sancionados desde la API, y actualizar el estado correspondiente.
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

    // Carga los datos al montar el componente y cada vez que el usuario activo cambie, siempre y cuando el usuario tenga permisos de administrador.
    useEffect(() => {
        if (activeUser?.is_admin || activeUser?.username === 'liangbw_') {
            fetchData();
        }
    }, [activeUser]);

    // Función para resolver un reporte, que hace una petición a la API y actualiza el estado de reportes si la resolución es exitosa.
    const handleResolveReport = async (reportId) => {
        try {
            const res = await fetchAPI(`/admin/reports/${reportId}/resolve`, { method: 'POST' });
            if (res.success) setReports(prev => prev.filter(r => (r._id || r.id) !== reportId));
        } catch (error) {
            console.error(error);
        }
    };

    // Función para eliminar el contenido reportado, que determina el endpoint correcto según el tipo de contenido, hace la petición de eliminación y resuelve el reporte si la eliminación es exitosa.
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

    // Función para resolver un ticket, que hace una petición a la API y actualiza el estado de tickets si la resolución es exitosa.
    const handleResolveTicket = async (ticketId) => {
        try {
            const res = await fetchAPI(`/admin/tickets/${ticketId}/resolve`, { method: 'POST' });
            if (res.success) setTickets(prev => prev.filter(t => (t._id || t.id) !== ticketId));
        } catch (error) {
            console.error(error);
        }
    };

    // Función para alternar el estado de baneo de un usuario, que hace una petición a la API y recarga los datos si la operación es exitosa.
    const handleToggleBan = async (userId) => {
        try {
            const res = await fetchAPI(`/admin/users/${userId}/toggle-ban`, { method: 'POST' });
            if (res.success) fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    // Función para resetear los strikes de un usuario, que hace una petición a la API y recarga los datos si la operación es exitosa.
    const handleResetStrikes = async (userId) => {
        if (!window.confirm("¿Seguro de perdonar a este usuario y dejar sus strikes en 0?")) return;
        try {
            const res = await fetchAPI(`/admin/users/${userId}/reset-strikes`, { method: 'POST' });
            if (res.success) fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    // Retorna el estado y las funciones necesarias para el panel de administración, incluyendo el usuario activo, 
    // la pestaña activa, los datos cargados y las funciones para manejar las acciones administrativas.
    return {
        activeUser,
        activeTab, setActiveTab,
        reports, tickets, sanctionedUsers, loading,
        handleResolveReport, handleDeleteContent,
        handleResolveTicket,
        handleToggleBan, handleResetStrikes
    };
};