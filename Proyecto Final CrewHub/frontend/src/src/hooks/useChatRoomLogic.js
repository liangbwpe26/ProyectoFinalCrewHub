import { useState, useEffect, useRef } from 'react';
import { fetchAPI } from '../services/api.js';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { useToast } from '../contexts/ToastContext.jsx';
import { ERRORS } from '../utils/errorMessages.js';

window.Pusher = Pusher;

export const useChatRoomLogic = (targetUsername, token) => {
    const [messages, setMessages] = useState([]);
    const [conversationId, setConversationId] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);
    const { showToast } = useToast();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const markAsReadBackend = async () => {
        try {
            await fetchAPI(`/chats/${targetUsername}/read`, { method: 'POST' }, token);
            window.dispatchEvent(new Event('chatMessagesRead'));
            window.dispatchEvent(new Event('forceChatReload'));
        } catch (e) {}
    };

    useEffect(() => {
        const loadMessages = async () => {
            try {
                const data = await fetchAPI(`/messages/${targetUsername}`, {}, token);
                if (data.success) {
                    setMessages(data.messages);
                    setConversationId(data.conversation_id);
                    setTimeout(scrollToBottom, 100);
                    markAsReadBackend(); // Lo marcamos como leído al abrir
                } else {
                    showToast(data.message || ERRORS.DEFAULT, "error");
                }
            } catch (error) {
                showToast(ERRORS.SERVER_500, "error");
            }
        };
        loadMessages();
    }, [targetUsername, token]);

    useEffect(() => {
        if (!token || !conversationId) return;

        const echo = new Echo({
            broadcaster: 'reverb',
            key: import.meta.env.VITE_REVERB_APP_KEY,
            wsHost: import.meta.env.VITE_REVERB_HOST,
            wsPort: import.meta.env.VITE_REVERB_PORT,
            wssPort: import.meta.env.VITE_REVERB_PORT,
            forceTLS: false,
            enabledTransports: ['ws', 'wss'],
            authEndpoint: 'http://127.0.0.1:8000/api/broadcasting/auth',
            auth: { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
        });

        const channel = echo.private(`chat.${conversationId}`);

        channel.listen('.MessageSent', (e) => {
            setMessages((prev) => {
                const incomingId = e.message._id || e.message.id;
                if (prev.some(m => (m._id || m.id) === incomingId)) return prev;
                setTimeout(scrollToBottom, 50);
                return [...prev, e.message];
            });
            // Si llega algo mientras tengo el chat abierto, lo asumo leído
            markAsReadBackend();
        });

        channel.listen('.MessageEdited', (e) => {
            setMessages(prev => prev.map(msg => 
                (msg._id || msg.id) === (e.message._id || e.message.id) ? e.message : msg
            ));
        });

        channel.listen('.MessageDeleted', (e) => {
            setMessages(prev => prev.filter(msg => (msg._id || msg.id) !== e.messageId));
        });

        return () => {
            channel.stopListening('.MessageSent');
            channel.stopListening('.MessageEdited');
            channel.stopListening('.MessageDeleted');
            echo.leave(`chat.${conversationId}`);
        };
    }, [conversationId, token]);

    const handleSendMessage = async (e, imageFile = null) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() && !imageFile) return;

        const contentToSend = newMessage;
        setNewMessage("");

        const formData = new FormData();
        if (contentToSend) formData.append('content', contentToSend);
        if (imageFile) formData.append('image', imageFile);

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/messages/${targetUsername}`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json' 
                },
                body: formData
            });
            
            const data = await response.json();

            if (response.ok && data.success) {
                setMessages(prev => {
                    const incomingId = data.message._id || data.message.id;
                    if (prev.some(m => (m._id || m.id) === incomingId)) return prev;
                    return [...prev, data.message];
                });
                setTimeout(scrollToBottom, 50);
            } else {
                console.error("Detalle del error del servidor:", data);
                setNewMessage(contentToSend);
                showToast(data.message || data.error_detail || "Error al enviar el mensaje", "error");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            setNewMessage(contentToSend);
            showToast("Error interno del servidor", "error");
        }
    };

    const handleEditMessage = async (messageId, newContent) => {
        setMessages(prev => prev.map(msg =>
            (msg._id || msg.id) === messageId ? { ...msg, content: newContent, is_edited: true } : msg
        ));
        try {
            await fetchAPI(`/messages/${messageId}`, { method: 'PUT', body: { content: newContent } }, token);
            setTimeout(() => window.dispatchEvent(new Event('forceChatReload')), 300);
        } catch (error) { }
    };

    const handleDeleteMessage = async (messageId, type) => {
        setMessages(prev => prev.filter(msg => (msg._id || msg.id) !== messageId));
        try {
            await fetchAPI(`/messages/${messageId}?type=${type}`, { method: 'DELETE' }, token);
            setTimeout(() => window.dispatchEvent(new Event('forceChatReload')), 300);
        } catch (error) { }
    };

    return { messages, newMessage, setNewMessage, messagesEndRef, handleSendMessage, handleEditMessage, handleDeleteMessage };
};