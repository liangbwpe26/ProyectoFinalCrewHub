import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAPI } from '../services/api.js';
import echo from '../services/echo.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { ERRORS } from '../utils/errorMessages.js';

// Hook personalizado para manejar la lógica de las notificaciones, incluyendo la carga inicial, manejo de solicitudes de seguimiento,
export const getSafeId = (idField) => {
    if (!idField) return null;
    if (typeof idField === 'object' && idField.$oid) return idField.$oid;
    return String(idField);
};

const useNotifications = (userId) => {
    // Estados para manejar las notificaciones principales, solicitudes de seguimiento, conteo de no leídas, y detalles para modales de publicaciones y drops
    const [mainNotifications, setMainNotifications] = useState([]);
    const [followRequests, setFollowRequests] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    
    const [selectedPostModal, setSelectedPostModal] = useState(null);
    const [selectedDropId, setSelectedDropId] = useState(null);
    
    const [isLoadingPost, setIsLoadingPost] = useState(false);
    const [targetCommentId, setTargetCommentId] = useState(null);
    
    const { showToast } = useToast();
    const processedIds = useRef(new Set());

    // Función para cargar todas las notificaciones desde la API, incluyendo las notificaciones principales, 
    // solicitudes de seguimiento y conteo de no leídas, y actualizar el estado local con los datos obtenidos
    const fetchAll = useCallback(async () => {
        try {
            const data = await fetchAPI('/notifications');
            if (data.success) {
                setMainNotifications(data.main || []);
                setFollowRequests(data.requests || []);
                setUnreadCount(data.unread_count || 0);
            }
        } catch (error) {
            console.error("Error cargando notificaciones:", error);
        }
    }, []);

    // Función para marcar todas las notificaciones como leídas, enviando la solicitud a la API y actualizando el conteo de no leídas en el estado local
    const markAllAsRead = async () => {
        if (unreadCount === 0) return;
        try {
            await fetchAPI('/notifications/read', { method: 'PUT' });
            setUnreadCount(0);
        } catch (error) {}
    };

    // Funciones para manejar la aceptación o rechazo de solicitudes de seguimiento, enviando las solicitudes correspondientes 
    // a la API y actualizando el estado local de solicitudes de seguimiento y mostrando mensajes de toast según corresponda
    const handleAccept = async (notification) => {
        const followerId = getSafeId(notification.sender_id) || getSafeId(notification.sender?._id);
        if (!followerId) return;
        try {
            const data = await fetchAPI(`/requests/accept/${followerId}`, { method: 'POST' });
            if (data.success) {
                const notifId = getSafeId(notification._id) || getSafeId(notification.id);
                setFollowRequests(prev => prev.filter(n => (getSafeId(n._id) || getSafeId(n.id)) !== notifId));
                showToast("Solicitud aceptada.", 'success');
            }
        } catch (error) {
            showToast(ERRORS.SERVER_500, 'error');
        }
    };

    // Función para manejar el rechazo de solicitudes de seguimiento, enviando la solicitud correspondiente a la API y 
    // actualizando el estado local de solicitudes de seguimiento
    const handleReject = async (notification) => {
        const followerId = getSafeId(notification.sender_id) || getSafeId(notification.sender?._id);
        if (!followerId) return;
        try {
            const data = await fetchAPI(`/requests/reject/${followerId}`, { method: 'POST' });
            if (data.success) {
                const notifId = getSafeId(notification._id) || getSafeId(notification.id);
                setFollowRequests(prev => prev.filter(n => (getSafeId(n._id) || getSafeId(n.id)) !== notifId));
            }
        } catch (error) {}
    };

    // Función para abrir el modal de una publicación desde una notificación, verificando si la notificación corresponde 
    // a un drop o a un post, y cargando los detalles necesarios desde la API para mostrar en el modal, además de manejar el 
    // estado de carga y mostrar mensajes de error según corresponda
    const openNotificationPost = async (postId, dropId, commentId, closeDropdown) => {
        if (closeDropdown) closeDropdown();
        
        if (dropId) {
            const safeDropId = getSafeId(dropId);
            if (safeDropId) {
                setSelectedDropId(safeDropId);
                setTargetCommentId(getSafeId(commentId)); 
            }
            return;
        }

        const safePostId = getSafeId(postId);
        if (!safePostId) return showToast("No se pudo identificar la publicación.", 'error');

        setIsLoadingPost(true);
        try {
            const data = await fetchAPI(`/posts/${safePostId}`);
            if (data.success && data.post) {
                setSelectedPostModal(data.post);
                setTargetCommentId(getSafeId(commentId)); 
            } else {
                showToast(data.message || "La publicación ya no existe o es privada.", 'error');
            }
        } catch (error) {
            showToast(ERRORS.SERVER_500, 'error');
        } finally {
            setIsLoadingPost(false);
        }
    };

    // Efecto para cargar las notificaciones al montar el componente, y efecto para configurar la conexión a Echo y 
    // manejar las notificaciones en tiempo real, actualizando el estado local según corresponda y limpiando la conexión al desmontar el componente
    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // Efecto para configurar la conexión a Echo y manejar las notificaciones en tiempo real, actualizando el estado 
    // local según corresponda y limpiando la conexión al desmontar el componente
    useEffect(() => {
        if (!userId || !echo) return;

        const channelName = `App.Models.User.${userId}`;
        const channel = echo.private(channelName);

        const handleNewNotif = (payload) => {
            const newNotif = payload.notification || payload;
            if (!newNotif) return;

            setUnreadCount(payload.unread_count !== undefined ? payload.unread_count : prev => prev + 1);

            const newId = getSafeId(newNotif._id) || getSafeId(newNotif.id);
            if (newId && processedIds.current.has(newId)) return;
            if (newId) processedIds.current.add(newId);

            if (newNotif.type === 'follow_request') {
                setFollowRequests(prev => [newNotif, ...prev]);
            } else {
                setMainNotifications(prev => [newNotif, ...prev]);
            }
        };

        channel.notification(handleNewNotif);
        channel.listen('.notification.sent', (e) => handleNewNotif(typeof e === 'string' ? JSON.parse(e) : e));

        return () => {
            channel.stopListening('.notification.sent');
            echo.leave(channelName);
        };
    }, [userId]);

    return {
        mainNotifications, followRequests, unreadCount, handleAccept, handleReject, markAllAsRead,
        selectedPostModal, setSelectedPostModal, isLoadingPost, openNotificationPost, targetCommentId,
        selectedDropId, setSelectedDropId
    };
};

export default useNotifications;