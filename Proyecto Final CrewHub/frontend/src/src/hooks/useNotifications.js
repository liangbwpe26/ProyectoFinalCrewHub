import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAPI } from '../services/api.js';
import echo from '../services/echo.js';

// 👉 LA LLAVE MAESTRA: Extrae el ID real ya sea un string o un objeto $oid de MongoDB
export const getSafeId = (idField) => {
    if (!idField) return null;
    if (typeof idField === 'object' && idField.$oid) return idField.$oid;
    return String(idField);
};

const useNotifications = (token, userId) => {
    const [mainNotifications, setMainNotifications] = useState([]);
    const [followRequests, setFollowRequests] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [selectedPostModal, setSelectedPostModal] = useState(null);
    const [isLoadingPost, setIsLoadingPost] = useState(false);
    const [targetCommentId, setTargetCommentId] = useState(null);

    const processedIds = useRef(new Set());

    const fetchAll = useCallback(async () => {
        if (!token) return;
        try {
            const data = await fetchAPI('/notifications', {}, token);
            if (data.success) {
                setMainNotifications(data.main);
                setFollowRequests(data.requests);
                setUnreadCount(data.unread_count);
            }
        } catch (error) {
            console.error("Error cargando notificaciones", error);
        }
    }, [token]);

    const markAllAsRead = async () => {
        if (unreadCount === 0) return;
        try {
            await fetchAPI('/notifications/read', { method: 'PUT' }, token);
            setUnreadCount(0);
        } catch (error) {
            console.error("Error al marcar como leído", error);
        }
    };

    const handleAccept = async (notification) => {
        // Usamos la llave maestra para sacar el ID puro
        const followerId = getSafeId(notification.sender_id) || getSafeId(notification.sender?._id);

        if (!followerId) {
            console.error("❌ Error: ID no encontrado", notification);
            return;
        }

        try {
            const data = await fetchAPI(`/requests/accept/${followerId}`, { method: 'POST' }, token);
            if (data.success) {
                const notifId = getSafeId(notification._id) || getSafeId(notification.id);
                setFollowRequests(prev => prev.filter(n => (getSafeId(n._id) || getSafeId(n.id)) !== notifId));
            }
        } catch (error) {
            console.error("Error al aceptar solicitud:", error);
        }
    };

    const handleReject = async (notification) => {
        const followerId = getSafeId(notification.sender_id) || getSafeId(notification.sender?._id);
        if (!followerId) return;

        try {
            const data = await fetchAPI(`/requests/reject/${followerId}`, { method: 'POST' }, token);
            if (data.success) {
                const notifId = getSafeId(notification._id) || getSafeId(notification.id);
                setFollowRequests(prev => prev.filter(n => (getSafeId(n._id) || getSafeId(n.id)) !== notifId));
            }
        } catch (error) {
            console.error("Error al rechazar solicitud:", error);
        }
    };

    const openNotificationPost = async (postId, commentId, closeDropdown) => {
        if (closeDropdown) closeDropdown();
        
        // Aseguramos que el ID del post sea un string válido para la URL
        const safePostId = getSafeId(postId);
        if (!safePostId) return;

        setIsLoadingPost(true);
        try {
            const data = await fetchAPI(`/posts/${safePostId}`, {}, token);
            if (data.success) {
                setSelectedPostModal(data.post);
                setTargetCommentId(getSafeId(commentId)); // También limpiamos el ID del comentario
            }
        } catch (error) {
            console.error("Error abriendo post", error);
        } finally {
            setIsLoadingPost(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    useEffect(() => {
        if (!token || !userId) return;

        const channelName = `App.Models.User.${userId}`;
        const channel = echo.private(channelName);

        channel.stopListening('.notification.sent');

        channel.listen('.notification.sent', (e) => {
            const data = typeof e === 'string' ? JSON.parse(e) : e;
            const newNotif = data.notification;
            if (!newNotif) return;

            if (data.unread_count !== undefined) {
                setUnreadCount(data.unread_count);
            }

            // Usamos la llave maestra aquí también
            const newId = getSafeId(newNotif._id) || getSafeId(newNotif.id);

            if (newId && processedIds.current.has(newId)) return;
            if (newId) processedIds.current.add(newId);

            if (newNotif.type === 'follow_request') {
                setFollowRequests(prev => {
                    if (prev.some(n => (getSafeId(n._id) || getSafeId(n.id)) === newId)) return prev;
                    return [newNotif, ...prev];
                });
            } else {
                setMainNotifications(prev => {
                    if (prev.some(n => (getSafeId(n._id) || getSafeId(n.id)) === newId)) return prev;
                    return [newNotif, ...prev];
                });
            }
        });

        return () => {
            channel.stopListening('.notification.sent');
            echo.leave(channelName);
        };
    }, [token, userId]);

    return {
        mainNotifications,
        followRequests,
        unreadCount,
        handleAccept,
        handleReject,
        markAllAsRead,
        selectedPostModal,
        setSelectedPostModal,
        isLoadingPost,
        openNotificationPost,
        targetCommentId,
    };
};

export default useNotifications;