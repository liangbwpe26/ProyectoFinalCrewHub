import { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api.js';

export const useStoriesBar = (refreshKey = 0) => {
    const [storiesGroups, setStoriesGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingStoryOf, setViewingStoryOf] = useState(null);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://crewhub.es:8000';

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

    useEffect(() => {
        loadStories();
    }, [refreshKey]); 

    const getAvatar = (entity, isCommunity) => {
        if (!entity) return `https://ui-avatars.com/api/?name=U&background=262626&color=fff&bold=true`;
        
        const picture = entity.profile_picture;
        const name = entity.display_name || entity.username;

        if (picture) return picture.startsWith('http') ? picture : `${BACKEND_URL}${picture}`;
        
        const initial = name ? name.charAt(0).toUpperCase() : (isCommunity ? 'C' : 'U');
        return `https://ui-avatars.com/api/?name=${initial}&background=${isCommunity ? '1a1a1a' : '262626'}&color=fff&bold=true`;
    };

    const openStory = (entityId) => setViewingStoryOf(entityId);
    const closeStory = () => { setViewingStoryOf(null); loadStories(); };

    const onStoryViewed = async (storyId) => {
        try { await fetchAPI(`/stories/${storyId}/view`, { method: 'POST' }); } catch (e) {}
    };

    const onDeleteStory = async (storyId) => {
        try { return await fetchAPI(`/stories/${storyId}`, { method: 'DELETE' }); } 
        catch (e) { return { success: false }; }
    };

    const onToggleLike = async (storyId) => {
        try { await fetchAPI(`/stories/${storyId}/like`, { method: 'POST' }); } catch (e) {}
    };

    const onGetStats = async (storyId) => {
        try { return await fetchAPI(`/stories/${storyId}/stats`); } 
        catch (e) { return { success: false, viewers: [], views_count: 0, likes_count: 0 }; }
    };

    const onReply = async (targetUserId, content, mediaPath, mediaType) => {
        try {
            const body = { content, story_media_path: mediaPath, story_media_type: mediaType };
            return await fetchAPI(`/chat/story-reply/${targetUserId}`, { method: 'POST', body });
        } catch (e) { return { success: false }; }
    };

    return {
        storiesGroups, loading, viewingStoryOf,
        getAvatar, openStory, closeStory,
        onStoryViewed, onDeleteStory, onToggleLike, onGetStats, onReply
    };
};