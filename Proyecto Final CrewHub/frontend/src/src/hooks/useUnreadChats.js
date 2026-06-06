// Hook personalizado para obtener el número de chats sin leer
import { useState, useEffect, useContext, useCallback } from 'react';
import { fetchAPI } from '../services/api.js';
import { AuthContext } from '../contexts/AuthContext.jsx';
import echo from '../services/echo.js';

// useUnreadChats: devuelve { unreadCount } y mantiene actualizado el contador
export const useUnreadChats = () => {
    // Obtenemos el usuario activo desde el contexto de autenticación
    const { activeUser } = useContext(AuthContext);
    // Estado local para el contador de mensajes no leídos
    const [unreadCount, setUnreadCount] = useState(0);

    // Función que consulta la API para obtener el número de chats no leídos
    const fetchUnreadCount = useCallback(async () => {
        if (!activeUser) return; // si no hay usuario activo, no hacemos nada
        try {
            // Añadimos un timestamp para evitar cacheo
            const t = new Date().getTime();
            const data = await fetchAPI(`/chats-unread?t=${t}`);
            if (data.success) {
                // Actualizamos el estado con el contador recibido
                setUnreadCount(data.unread_count);
            }
        } catch (error) {
            // Log en consola si ocurre un error al consultar la API
            console.error("Error obteniendo contador de chat:", error);
        }
    }, [activeUser]);

    // Efecto para cargar inicialmente el contador y escuchar eventos de recarga
    useEffect(() => {
        fetchUnreadCount(); // carga inicial

        // Evento personalizado en window que fuerza recarga del contador
        const handleReload = () => fetchUnreadCount();
        window.addEventListener('chatMessagesRead', handleReload);
        
        // Cleanup: quitar el listener al desmontar o cambiar dependencia
        return () => window.removeEventListener('chatMessagesRead', handleReload);
    }, [fetchUnreadCount]);

    // Efecto para suscribirse a eventos en tiempo real (Pusher/Laravel Echo)
    useEffect(() => {
        if (!activeUser) return; // si no hay usuario, no nos suscribimos
        const userId = activeUser._id || activeUser.id; // compatibilidad con distintas propiedades
        const channelName = `App.Models.User.${userId}`;
        const channel = echo.private(channelName);

        // Cuando llegue un mensaje o se elimine, esperamos 200ms y volvemos a consultar
        channel.listen('.MessageSent', () => setTimeout(fetchUnreadCount, 200));
        channel.listen('.MessageDeleted', () => setTimeout(fetchUnreadCount, 200));

        // Cleanup: dejar de escuchar los eventos al desmontar o cambiar dependencias
        return () => {
            channel.stopListening('.MessageSent');
            channel.stopListening('.MessageDeleted');
        };
    }, [activeUser, fetchUnreadCount]);

    // Devolvemos el contador para que lo consuman los componentes
    return { unreadCount };
};