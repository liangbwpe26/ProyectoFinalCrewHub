import { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api.js';

// Hook personalizado para gestionar la funcionalidad del feed de historias
export const useStoriesBar = (refreshKey = 0) => {
    // Gestión del estado para las historias
    const [storiesGroups, setStoriesGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingStoryOf, setViewingStoryOf] = useState(null);

    // Configuración de la URL del backend
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://crewhub.es:8000';

    // Obtiene las historias desde la API
    const loadStories = async () => {
        setLoading(true);
        try {
            const data = await fetchAPI('/stories/feed');
            if (data.success) {
                setStoriesGroups(data.feed || []);
            }
        } catch (error) {
            console.error("Error al cargar historias", error);
        } finally {
            setLoading(false);
        }
    };

    // Carga las historias cuando el componente se monta o cambia la clave de actualización
    useEffect(() => {
        loadStories();
    }, [refreshKey]); 

    // Genera la URL del avatar para una entidad (usuario o comunidad)
    const getAvatar = (entity, isCommunity) => {
        if (!entity) return `https://ui-avatars.com/api/?name=U&background=262626&color=fff&bold=true`;
        
        const picture = entity.profile_picture;
        const name = entity.display_name || entity.username;

        // Utiliza la imagen existente o genera un avatar de marcador de posición
        if (picture) return picture.startsWith('http') ? picture : `${BACKEND_URL}${picture}`;
        
        const initial = name ? name.charAt(0).toUpperCase() : (isCommunity ? 'C' : 'U');
        return `https://ui-avatars.com/api/?name=${initial}&background=${isCommunity ? '1a1a1a' : '262626'}&color=fff&bold=true`;
    };

    // Abre el visor de historias para una entidad específica
    const openStory = (entityId) => setViewingStoryOf(entityId);
    
    // Cierra el visor de historias y actualiza las historias
    const closeStory = () => { setViewingStoryOf(null); loadStories(); };

    // Marca una historia como visualizada
    const onStoryViewed = async (storyId) => {
        try { await fetchAPI(`/stories/${storyId}/view`, { method: 'POST' }); } catch (e) {}
    };

    // Elimina una historia
    const onDeleteStory = async (storyId) => {
        try { return await fetchAPI(`/stories/${storyId}`, { method: 'DELETE' }); } 
        catch (e) { return { success: false }; }
    };

    // Alterna el estado de "me gusta" en una historia
    const onToggleLike = async (storyId) => {
        try { await fetchAPI(`/stories/${storyId}/like`, { method: 'POST' }); } catch (e) {}
    };

    // Obtiene estadísticas de una historia (visualizaciones, me gusta, espectadores)
    const onGetStats = async (storyId) => {
        try { return await fetchAPI(`/stories/${storyId}/stats`); } 
        catch (e) { return { success: false, viewers: [], views_count: 0, likes_count: 0 }; }
    };

    // Envía una respuesta de mensaje directo a una historia
    const onReply = async (targetUserId, content, mediaPath, mediaType) => {
        try {
            const body = { content, story_media_path: mediaPath, story_media_type: mediaType };
            return await fetchAPI(`/chat/story-reply/${targetUserId}`, { method: 'POST', body });
        } catch (e) { return { success: false }; }
    };

    // Retorna la interfaz del hook
    return {
        storiesGroups, loading, viewingStoryOf,
        getAvatar, openStory, closeStory,
        onStoryViewed, onDeleteStory, onToggleLike, onGetStats, onReply
    };
};