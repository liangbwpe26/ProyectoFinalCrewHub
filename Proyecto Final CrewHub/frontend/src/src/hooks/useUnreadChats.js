import { useState, useEffect, useContext, useCallback } from 'react';
import { fetchAPI } from '../services/api.js';
import { AuthContext } from '../contexts/AuthContext.jsx';
import echo from '../services/echo.js';

export const useUnreadChats = () => {
    const { token, activeUser } = useContext(AuthContext);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = useCallback(async () => {
        if (!token) return;
        try {
            const t = new Date().getTime();
            const data = await fetchAPI(`/chats-unread?t=${t}`, {}, token);
            if (data.success) {
                setUnreadCount(data.unread_count);
            }
        } catch (error) {
            console.error("Error obteniendo contador de chat:", error);
        }
    }, [token]);

    useEffect(() => {
        fetchUnreadCount();

        // Escucha global cuando tú abres un chat y lo marcas como leído
        const handleReload = () => fetchUnreadCount();
        window.addEventListener('chatMessagesRead', handleReload);
        
        return () => window.removeEventListener('chatMessagesRead', handleReload);
    }, [fetchUnreadCount]);

    useEffect(() => {
        if (!token || !activeUser) return;
        const userId = activeUser._id || activeUser.id;
        const channelName = `App.Models.User.${userId}`;
        const channel = echo.private(channelName);

        // Si llega un mensaje nuevo o borran uno, recalculamos el globito rojo
        channel.listen('.MessageSent', () => setTimeout(fetchUnreadCount, 200));
        channel.listen('.MessageDeleted', () => setTimeout(fetchUnreadCount, 200));

        return () => {
            channel.stopListening('.MessageSent');
            channel.stopListening('.MessageDeleted');
        };
    }, [token, activeUser, fetchUnreadCount]);

    return { unreadCount };
};