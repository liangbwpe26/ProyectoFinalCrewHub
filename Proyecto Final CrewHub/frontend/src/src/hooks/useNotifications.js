import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAPI } from '../services/api.js';
import echo from '../services/echo.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { ERRORS } from '../utils/errorMessages.js';

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
    
    const { showToast } = useToast();
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
            showToast("Error al cargar notificaciones.", 'error');
        }
    }, [token]);

    const markAllAsRead = async () => {
        if (unreadCount === 0) return;
        try {
            await fetchAPI('/notifications/read', { method: 'PUT' }, token);
            setUnreadCount(0);
        } catch (error) {
            showToast("No pudimos marcar las notificaciones como leídas.", 'error');
        }
    };

    const handleAccept = async (notification) => {
        const followerId = getSafeId(notification.sender_id) || getSafeId(notification.sender?._id);

        if (!followerId) {
            showToast(ERRORS.DEFAULT, 'error');
            return;
        }

        try {
            const data = await fetchAPI(`/requests/accept/${followerId}`, { method: 'POST' }, token);
            if (data.success) {
                const notifId = getSafeId(notification._id) || getSafeId(notification.id);
                setFollowRequests(prev => prev.filter(n => (getSafeId(n._id) || getSafeId(n.id)) !== notifId));
                showToast("Solicitud aceptada.", 'success');
            } else {
                showToast(data.message || ERRORS.DEFAULT, 'error');
            }
        } catch (error) {
            showToast(ERRORS.SERVER_500, 'error');
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
            } else {
                showToast(data.message || ERRORS.DEFAULT, 'error');
            }
        } catch (error) {
            showToast(ERRORS.SERVER_500, 'error');
        }
    };

    const openNotificationPost = async (postId, commentId, closeDropdown) => {
        if (closeDropdown) closeDropdown();
        
        const safePostId = getSafeId(postId);
        if (!safePostId) return;

        setIsLoadingPost(true);
        try {
            const data = await fetchAPI(`/posts/${safePostId}`, {}, token);
            if (data.success) {
                setSelectedPostModal(data.post);
                setTargetCommentId(getSafeId(commentId)); 
            } else {
                showToast(data.message || "No se pudo cargar la publicación.", 'error');
            }
        } catch (error) {
            showToast(ERRORS.SERVER_500, 'error');
        } finally {
            setIsLoadingPost(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    useEffect(() => {
        if (!token || !userId) return;

        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

        if (echo.connector && echo.connector.pusher) {
            echo.connector.pusher.config.authEndpoint = `${BACKEND_URL}/api/broadcasting/auth`;
            echo.connector.pusher.config.auth = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            };
        }

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
        mainNotifications, followRequests, unreadCount, handleAccept, handleReject, markAllAsRead,
        selectedPostModal, setSelectedPostModal, isLoadingPost, openNotificationPost, targetCommentId,
    };
};

export default useNotifications;