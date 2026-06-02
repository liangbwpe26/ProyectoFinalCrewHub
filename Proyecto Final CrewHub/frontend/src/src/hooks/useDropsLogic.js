import { useState, useEffect, useCallback } from 'react';
import { fetchAPI } from '../services/api.js';

export const useDropsLogic = () => {
    const [drops, setDrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    
    const [isGlobalMuted, setIsGlobalMuted] = useState(true);

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

    useEffect(() => {
        loadDrops(0);
    }, [loadDrops]);

    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 50 && !loading && hasMore) {
            loadDrops(offset + 5);
        }
    };

    const toggleAction = async (dropId, actionType) => { 
        setDrops(prev => prev.map(drop => {
            if ((drop._id || drop.id) === dropId) {
                const isActive = drop[`has_${actionType}`];
                return {
                    ...drop,
                    [`has_${actionType}`]: !isActive,
                    [`${actionType}s_count`]: !isActive 
                        ? (drop[`${actionType}s_count`] || 0) + 1 
                        : Math.max(0, (drop[`${actionType}s_count`] || 1) - 1)
                };
            }
            return drop;
        }));

        try {
            await fetchAPI(`/drops/${dropId}/${actionType}`, { method: 'POST' });
        } catch (error) {}
    };

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

    const loadComments = async (dropId) => {
        try {
            const data = await fetchAPI(`/drops/${dropId}/comments`);
            return data.success ? data.comments : [];
        } catch (e) {
            return [];
        }
    };

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

    const addNewDrop = (newDrop) => {
        setDrops(prev => [newDrop, ...prev]);
    };

    return {
        drops, loading, hasMore, isDownloading, isGlobalMuted, setIsGlobalMuted,
        handleScroll, downloadVideo, toggleAction, deleteDrop, addNewDrop, loadComments, postComment
    };
};