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
            const res = await fetch('http://127.0.0.1:8000/api/stories', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (data.success) loadStories(); 
            return data;
        } catch (error) {
            return { success: false, message: "Error de conexión" };
        }
    };

    const markStoryAsViewed = async (storyId) => {
        try {
            await fetchAPI(`/stories/${storyId}/view`, { method: 'POST' }, token);
        } catch (error) {}
    };

    // 🔥 NUEVA FUNCIÓN PARA ELIMINAR
    const deleteStory = async (storyId) => {
        try {
            const data = await fetchAPI(`/stories/${storyId}`, { method: 'DELETE' }, token);
            if (data.success) loadStories(); // Recarga el feed automáticamente
            return data;
        } catch (error) {
            return { success: false, message: "Error de conexión" };
        }
    };

    return { storiesFeed, loadingStories, loadStories, uploadStory, markStoryAsViewed, deleteStory };
};