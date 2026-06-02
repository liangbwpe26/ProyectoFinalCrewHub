import { useState, useEffect, useCallback, useContext } from 'react';
import { fetchAPI } from '../services/api';
import { AuthContext } from '../contexts/AuthContext.jsx';
import echo from '../services/echo.js'; 

export const useChatsLogic = (activeUsernameTarget = null) => {
    const [chatList, setChatList] = useState([]);
    const [loading, setLoading] = useState(true);
    const { activeUser } = useContext(AuthContext);

    const loadChatData = useCallback(async () => {
        try {
            const t = new Date().getTime(); 
            const [convRes, mutualsRes] = await Promise.all([
                fetchAPI(`/conversations?t=${t}`),
                fetchAPI(`/mutuals?t=${t}`)
            ]);

            let activeConversations = convRes.success ? convRes.conversations : [];
            let mutualFriends = mutualsRes.success ? mutualsRes.mutuals : [];

            const activeUserIds = new Set(activeConversations.map(c => c.user._id || c.user.id));

            const newChatOptions = mutualFriends
                .filter(friend => !activeUserIds.has(friend._id || friend.id))
                .map(friend => ({
                    conversation_id: null,
                    user: friend,
                    last_message: null,
                    unread: false 
                }));

            setChatList(prev => {
                const newList = [...activeConversations, ...newChatOptions];
                if (JSON.stringify(prev) === JSON.stringify(newList)) return prev;
                return newList;
            });

        } catch (error) {
            console.error("Error cargando bandeja:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadChatData();
    }, [loadChatData]);

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
        if (!activeUser) return;
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
    }, [activeUser, loadChatData]);

    const markAsRead = useCallback((username) => {
        setChatList(prev => prev.map(chat => 
            chat.user.username === username ? { ...chat, unread: false } : chat
        ));
    }, []);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
    
    const getAvatar = (user) => {
        if (!user) return '';
        if (user.profile_picture) return user.profile_picture.startsWith('http') ? user.profile_picture : `${BACKEND_URL}${user.profile_picture}`;
        return `https://ui-avatars.com/api/?name=${user.username}&background=262626&color=fff`;
    };

    return { chatList, loading, getAvatar, markAsRead, loadChatData };
};