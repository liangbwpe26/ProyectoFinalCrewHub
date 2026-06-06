// Importaciones necesarias para el hook personalizado useChatRoomLogic, 
// incluyendo React, la función para hacer peticiones a la API, el servicio de Echo para WebSockets, 
// el contexto de Toast para mostrar notificaciones, el contexto de autenticación para obtener el usuario activo y los mensajes de error predefinidos.
import { useState, useEffect, useRef, useContext } from 'react';
import { fetchAPI } from '../services/api.js';
import echo from '../services/echo.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { ERRORS } from '../utils/errorMessages.js';

// El hook useChatRoomLogic maneja la lógica relacionada con la sala de chat, incluyendo la carga de mensajes, 
// el envío de nuevos mensajes, la edición y eliminación de mensajes, y la suscripción a eventos de WebSockets 
// para actualizar la conversación en tiempo real.
export const useChatRoomLogic = (targetUsername) => {
    // Estado para almacenar los mensajes de la conversación, el ID de la conversación, el nuevo mensaje a enviar y el estado de carga del chat.
    const [messages, setMessages] = useState([]);
    const [conversationId, setConversationId] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [isLoadingChat, setIsLoadingChat] = useState(true);
    
    const messagesEndRef = useRef(null);
    const { showToast } = useToast();
    const { activeUser } = useContext(AuthContext);

    // Función para hacer scroll automático al final de la lista de mensajes, utilizada después de cargar los mensajes o recibir uno nuevo.
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    
    // Función para marcar los mensajes como leídos en el backend, que hace una petición a la API y 
    // dispara eventos personalizados para actualizar el estado de lectura en otros componentes.
    const markAsReadBackend = async () => {
        try {
            await fetchAPI(`/chats/${targetUsername}/read`, { method: 'POST' });
            window.dispatchEvent(new Event('chatMessagesRead'));
            window.dispatchEvent(new Event('forceChatReload'));
        } catch (e) {}
    };

    // Efecto para cargar los mensajes de la conversación cada vez que el targetUsername cambie, mostrando un indicador de carga mientras se realiza la petición.
    useEffect(() => {
        const loadMessages = async () => {
            setIsLoadingChat(true);
            setMessages([]); 
            
            try {
                const data = await fetchAPI(`/messages/${targetUsername}`);
                if (data.success) {
                    setMessages(data.messages);
                    setConversationId(data.conversation_id);
                    setTimeout(scrollToBottom, 100);
                    markAsReadBackend(); 
                } else {
                    showToast(data.message || ERRORS.DEFAULT, "error");
                }
            } catch (error) {
                showToast(ERRORS.SERVER_500, "error");
            } finally {
                setIsLoadingChat(false); 
            }
        };
        
        loadMessages();
    }, [targetUsername]);

    // Efecto para suscribirse a los eventos de WebSockets relacionados con la conversación, 
    // actualizando el estado de mensajes en tiempo real y limpiando la suscripción al desmontar o cambiar de conversación.
    useEffect(() => {
        if (!conversationId) return;

        const channel = echo.private(`chat.${conversationId}`);

        channel.listen('.MessageSent', (e) => {
            setMessages((prev) => {
                const incomingId = e.message._id || e.message.id;
                if (prev.some(m => (m._id || m.id) === incomingId)) return prev;
                setTimeout(scrollToBottom, 50);
                return [...prev, e.message];
            });
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
    }, [conversationId]);

    // Función para manejar el envío de un nuevo mensaje, que valida el contenido, 
    // hace una petición a la API para enviar el mensaje y actualiza el estado de mensajes si el envío es exitoso, mostrando notificaciones en caso de error.
    const handleSendMessage = async (e, imageFile = null) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() && !imageFile) return;

        const contentToSend = newMessage;
        setNewMessage("");

        const formData = new FormData();
        if (contentToSend) formData.append('content', contentToSend);
        if (imageFile) formData.append('image', imageFile);

        try {
            const data = await fetchAPI(`/messages/${targetUsername}`, {
                method: 'POST',
                body: formData
            });

            if (data.success) {
                setMessages(prev => {
                    const incomingId = data.message._id || data.message.id;
                    if (prev.some(m => (m._id || m.id) === incomingId)) return prev;
                    return [...prev, data.message];
                });
                setTimeout(scrollToBottom, 50);
            } else {
                setNewMessage(contentToSend);
                showToast(data.message || data.error_detail || "Error al enviar el mensaje", "error");
            }
        } catch (error) {
            setNewMessage(contentToSend);
            showToast("Error interno del servidor", "error");
        }
    };

    // Función para manejar la edición de un mensaje, que actualiza el estado localmente para reflejar el 
    // cambio de inmediato y hace una petición a la API para guardar la edición, recargando el chat después para asegurar la consistencia.
    const handleEditMessage = async (messageId, newContent) => {
        setMessages(prev => prev.map(msg => (msg._id || msg.id) === messageId ? { ...msg, content: newContent, is_edited: true } : msg));
        try {
            await fetchAPI(`/messages/${messageId}`, { method: 'PUT', body: { content: newContent } });
            setTimeout(() => window.dispatchEvent(new Event('forceChatReload')), 300);
        } catch (error) { }
    };

    // Función para manejar la eliminación de un mensaje, que actualiza el estado localmente para eliminar 
    // el mensaje de inmediato y hace una petición a la API para eliminarlo, recargando el chat después para asegurar la consistencia.
    const handleDeleteMessage = async (messageId, type) => {
        setMessages(prev => prev.filter(msg => (msg._id || msg.id) !== messageId));
        try {
            await fetchAPI(`/messages/${messageId}?type=${type}`, { method: 'DELETE' });
            setTimeout(() => window.dispatchEvent(new Event('forceChatReload')), 300);
        } catch (error) { }
    };

    // Retorna el estado y las funciones necesarias para manejar la lógica de la sala de chat, incluyendo los mensajes, 
    // el nuevo mensaje a enviar, la referencia para el scroll, y las funciones para enviar, editar y eliminar mensajes, así como el estado de carga del chat.
    return { messages, newMessage, setNewMessage, messagesEndRef, handleSendMessage, handleEditMessage, handleDeleteMessage, isLoadingChat };
};