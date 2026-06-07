import { useState, useEffect, useCallback } from 'react';
import { fetchAPI } from '../services/api.js';

// Hook personalizado para manejar la lógica de los drops
export const useDropsLogic = () => {
    // Estado para almacenar la lista de drops, el estado de carga, el offset para paginación, si hay más drops para cargar, si se está descargando un video y si el audio global está silenciado
    const [drops, setDrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    
    const [isGlobalMuted, setIsGlobalMuted] = useState(true);

    // Función para cargar los drops desde la API, manejando la paginación con el offset y actualizando el estado local con los nuevos drops obtenidos
    const loadDrops = useCallback(async (currentOffset = 0) => {
        try {
            const data = await fetchAPI(`/drops/feed?offset=${currentOffset}`);
            if (data.success) {
                setDrops(prev => currentOffset === 0 ? data.drops : [...prev, ...data.drops]);
                setHasMore(data.hasMore);
                setOffset(currentOffset);
            }
        } catch (error) {
            console.error("Error al obtener drops:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Cargar los drops al montar el componente y configurar la función de carga para manejar la paginación
    useEffect(() => {
        loadDrops(0);
    }, [loadDrops]);

    // Función para manejar el evento de scroll, verificando si se ha llegado al final de la lista de drops y si hay más drops para cargar, en cuyo caso se llama a la función de carga con el nuevo offset
    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 50 && !loading && hasMore) {
            loadDrops(offset + 5);
        }
    };

    // Función para alternar el estado de like o dislike de un drop, actualizando el estado local del drop correspondiente y enviando la solicitud a la API para registrar la acción del usuario
    const toggleAction = async (dropId, actionType) => { 
        // Mapeamos el tipo de acción al nombre de la propiedad del estado (like -> liked, save -> saved, repost -> reposted)
        const stateSuffix = actionType === 'like' ? 'liked' : actionType === 'save' ? 'saved' : 'reposted';
        const countKey = `${actionType}s_count`; // likes_count, saves_count, reposts_count

        setDrops(prev => prev.map(drop => {
            if ((drop._id || drop.id) === dropId) {
                const isActive = drop[`has_${stateSuffix}`];
                return {
                    ...drop,
                    [`has_${stateSuffix}`]: !isActive,
                    [countKey]: !isActive 
                        ? (drop[countKey] || 0) + 1 
                        : Math.max(0, (drop[countKey] || 1) - 1)
                };
            }
            return drop;
        }));

        try {
            await fetchAPI(`/drops/${dropId}/${actionType}`, { method: 'POST' });
        } catch (error) {
            console.error(`Error al procesar la acción ${actionType}`, error);
        }
    };

    // Función para eliminar un drop, enviando la solicitud a la API y actualizando el estado local para remover el drop eliminado de la lista
    const deleteDrop = async (dropId) => {
        try {
            const data = await fetchAPI(`/drops/${dropId}`, { method: 'DELETE' });
            if (data.success) {
                setDrops(prev => prev.filter(d => (d._id || d.id) !== dropId));
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    };

    // Función para descargar el video de un drop, manejando el estado de descarga para evitar múltiples descargas simultáneas y utilizando la API de blobs para crear un enlace de descarga para el usuario
    const downloadVideo = async (videoUrl) => {
        if (isDownloading) return;
        setIsDownloading(true);
        try {
            const response = await fetch(videoUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `crewhub_drop_${Date.now()}.mp4`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {} finally {
            setIsDownloading(false);
        }
    };

    // Función para cargar los comentarios de un drop específico, enviando la solicitud a la API y retornando la lista 
    // de comentarios obtenida o un array vacío en caso de error
    const loadComments = async (dropId) => {
        try {
            const data = await fetchAPI(`/drops/${dropId}/comments`);
            return data.success ? data.comments : [];
        } catch (e) {
            return [];
        }
    };

    // Función para publicar un nuevo comentario en un drop, enviando la solicitud a la API con el contenido del comentario y 
    // actualizando el estado local del drop para incrementar el contador de comentarios si la operación es exitosa
    const postComment = async (dropId, content) => {
        try {
            const data = await fetchAPI(`/drops/${dropId}/comments`, { method: 'POST', body: { content } });
            if (data.success) {
                setDrops(prev => prev.map(d => (d._id || d.id) === dropId ? { ...d, comments_count: (d.comments_count || 0) + 1 } : d));
                return data.comment;
            }
            return null;
        } catch (e) {
            return null;
        }
    };

    // Función para agregar un nuevo drop a la lista de drops, actualizando el estado local para incluir el nuevo drop al inicio de la lista
    const addNewDrop = (newDrop) => {
        setDrops(prev => [newDrop, ...prev]);
    };

    return {
        drops, loading, hasMore, isDownloading, isGlobalMuted, setIsGlobalMuted,
        handleScroll, downloadVideo, toggleAction, deleteDrop, addNewDrop, loadComments, postComment
    };
};