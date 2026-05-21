import { useState, useCallback } from 'react';
import { fetchAPI } from '../services/api.js';

export const useStories = (token) => {
    const [storiesFeed, setStoriesFeed] = useState([]);
    const [loadingStories, setLoadingStories] = useState(true);

    const loadStories = useCallback(async () => {
        if (!token) return;
        try {
            const data = await fetchAPI('/stories', {}, token);
            if (data.success) {
                setStoriesFeed(data.feed);
            }
        } catch (error) {
            console.error("Error al cargar historias:", error);
        } finally {
            setLoadingStories(false);
        }
    }, [token]);

    const uploadStory = async (file) => {
        const formData = new FormData();
        formData.append('media', file);

        try {
            const data = await fetchAPI('/stories', {
                method: 'POST',
                body: formData
            }, token);
            
            if (data.success) loadStories();
            return data;
        } catch (error) {
            return { success: false, message: "Error de conexión" };
        }
    };

    const markStoryAsViewed = async (storyId) => {
        try {
            await fetchAPI(`/stories/${storyId}/view`, { method: 'POST' }, token);
        } catch (error) { }
    };

    const toggleStoryLike = async (storyId) => {
        setStoriesFeed(prev => prev.map(group => {
            const updatedStories = group.stories.map(s => {
                const id = s._id || s.id;
                if (id === storyId) {
                    const isCurrentlyLiked = s.has_liked;
                    return {
                        ...s,
                        has_liked: !isCurrentlyLiked,
                        likes_count: !isCurrentlyLiked ? (s.likes_count || 0) + 1 : Math.max(0, (s.likes_count || 1) - 1)
                    };
                }
                return s;
            });
            return { ...group, stories: updatedStories };
        }));

        try {
            await fetchAPI(`/stories/${storyId}/like`, { method: 'POST' }, token);
        } catch (error) {
            console.error("Error al dar like a la historia", error);
        }
    };

    const deleteStory = async (storyId) => {
        try {
            const data = await fetchAPI(`/stories/${storyId}`, { method: 'DELETE' }, token);
            if (data.success) loadStories();
            return data;
        } catch (error) {
            return { success: false, message: "Error de conexión" };
        }
    };

    const getStoryStats = async (storyId) => {
        try {
            const data = await fetchAPI(`/stories/${storyId}/stats`, {}, token);
            return data;
        } catch (error) {
            return { success: false };
        }
    };

    const replyToStory = async (targetUserId, content, mediaPath, mediaType) => {
        try {
            const body = {
                content: content,
                story_media_path: mediaPath,
                story_media_type: mediaType
            };
            const data = await fetchAPI(`/chat/story-reply/${targetUserId}`, { method: 'POST', body }, token);
            return data;
        } catch (error) {
            return { success: false };
        }
    };

    return { storiesFeed, loadingStories, loadStories, uploadStory, markStoryAsViewed, deleteStory, toggleStoryLike, getStoryStats, replyToStory };
};