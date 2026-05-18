import { useState, useEffect, useCallback, useContext } from 'react';
import { fetchAPI } from '../services/api';
import { AuthContext } from '../contexts/AuthContext.jsx';
import echo from '../services/echo.js'; 

export const useChatsLogic = (token, activeUsernameTarget = null) => {
    const [chatList, setChatList] = useState([]);
    const [loading, setLoading] = useState(true);
    const { activeUser } = useContext(AuthContext);

    const loadChatData = useCallback(async () => {
        if (!token) return;
        try {
            const t = new Date().getTime(); 
            const [convRes, mutualsRes] = await Promise.all([
                fetchAPI(`/conversations?t=${t}`, {}, token),
                fetchAPI(`/mutuals?t=${t}`, {}, token)
            ]);

            let activeConversations = [];
            let mutualFriends = [];

            if (convRes.success) activeConversations = convRes.conversations;
            if (mutualsRes.success) mutualFriends = mutualsRes.mutuals;

            const activeUserIds = new Set(activeConversations.map(c => c.user._id || c.user.id));

            const newChatOptions = mutualFriends
                .filter(friend => !activeUserIds.has(friend._id || friend.id))
                .map(friend => ({
                    conversation_id: null,
                    user: friend,
                    last_message: null,
                    unread: false 
                }));

            // 🔥 AHORA LOS "NO LEÍDOS" VIENEN DIRECTO DEL BACKEND
            const formattedActive = activeConversations.map(c => ({
                ...c, 
                unread: c.unread 
            }));

            setChatList([...formattedActive, ...newChatOptions]);

        } catch (error) {
            console.error("Error cargando bandeja:", error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => { loadChatData(); }, [loadChatData]);

    useEffect(() => {
        const handleForceReload = () => loadChatData();
        window.addEventListener('forceChatReload', handleForceReload);
        window.addEventListener('chatMessagesRead', handleForceReload);
        return () => {
            window.removeEventListener('forceChatReload', handleForceReload);
            window.removeEventListener('chatMessagesRead', handleForceReload);
        };
    }, [loadChatData]);

    useEffect(() => {
        if (!token || !activeUser) return;
        const userId = activeUser._id || activeUser.id;
        const channelName = `App.Models.User.${userId}`;
        const channel = echo.private(channelName);

        channel.listen('.MessageSent', () => setTimeout(loadChatData, 200));
        channel.listen('.MessageEdited', () => setTimeout(loadChatData, 200));
        channel.listen('.MessageDeleted', () => setTimeout(loadChatData, 200));

        return () => {
            channel.stopListening('.MessageSent');
            channel.stopListening('.MessageEdited');
            channel.stopListening('.MessageDeleted');
        };
    }, [token, activeUser, loadChatData]);

    const markAsRead = (username) => {
        setChatList(prev => prev.map(chat => 
            chat.user.username === username ? { ...chat, unread: false } : chat
        ));
    };

    const getAvatar = (user) => {
        if (!user) return '';
        if (user.profile_picture) return user.profile_picture.startsWith('http') ? user.profile_picture : `http://127.0.0.1:8000${user.profile_picture}`;
        return `https://ui-avatars.com/api/?name=${user.username}&background=262626&color=fff`;
    };

    return { chatList, loading, getAvatar, markAsRead, loadChatData };
};