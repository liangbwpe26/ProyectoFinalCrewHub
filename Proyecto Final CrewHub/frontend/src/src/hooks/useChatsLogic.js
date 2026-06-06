// Importaciones necesarias para el hook personalizado de lógica de chats
import { useState, useEffect, useCallback, useContext } from 'react';
import { fetchAPI } from '../services/api';
import { AuthContext } from '../contexts/AuthContext.jsx';
import echo from '../services/echo.js'; 

// Hook personalizado para manejar la lógica de los chats
export const useChatsLogic = (activeUsernameTarget = null) => {
    // Estado para almacenar la lista de chats y el estado de carga
    const [chatList, setChatList] = useState([]);
    const [loading, setLoading] = useState(true);
    const { activeUser } = useContext(AuthContext);

    // Función para cargar los datos de los chats, incluyendo conversaciones activas y amigos mutuos
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

    // Cargar los datos de los chats al montar el componente y configurar listeners para eventos de recarga
    useEffect(() => {
        loadChatData();
    }, [loadChatData]);

    // Configurar listeners para eventos personalizados que indiquen que se deben recargar los datos de los chats
    useEffect(() => {
        const handleForceReload = () => loadChatData();
        window.addEventListener('forceChatReload', handleForceReload);
        window.addEventListener('chatMessagesRead', handleForceReload);
        return () => {
            window.removeEventListener('forceChatReload', handleForceReload);
            window.removeEventListener('chatMessagesRead', handleForceReload);
        };
    }, [loadChatData]);

    // Configurar listeners para eventos de WebSocket relacionados con mensajes en tiempo real
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

    // Función para marcar un chat como leído, actualizando el estado local de la lista de chats
    const markAsRead = useCallback((username) => {
        setChatList(prev => prev.map(chat => 
            chat.user.username === username ? { ...chat, unread: false } : chat
        ));
    }, []);

    // Función para obtener la URL del avatar de un usuario, manejando casos donde no hay imagen de perfil
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
    
    // Función para obtener la URL del avatar de un usuario, manejando casos donde no hay imagen de perfil
    const getAvatar = (user) => {
        if (!user) return '';
        if (user.profile_picture) return user.profile_picture.startsWith('http') ? user.profile_picture : `${BACKEND_URL}${user.profile_picture}`;
        return `https://ui-avatars.com/api/?name=${user.username}&background=262626&color=fff`;
    };

    // Retornar los datos y funciones necesarias para manejar la lógica de los chats
    return { chatList, loading, getAvatar, markAsRead, loadChatData };
};