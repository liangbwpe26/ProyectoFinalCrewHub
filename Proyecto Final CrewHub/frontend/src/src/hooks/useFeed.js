import { useState, useEffect, useCallback } from 'react';
import { fetchAPI } from '../services/api.js';

export const useFeed = () => {
    const [posts, setPosts] = useState([]);
    const [filter, setFilter] = useState('all'); 
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadPosts = useCallback(async (reset = false) => {
        const currentOffset = reset ? 0 : posts.length;
        
        if (reset) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const data = await fetchAPI(`/posts?filter=${filter}&offset=${currentOffset}`);
            
            if (data.success) {
                if (reset) {
                    setPosts(data.posts);
                } else {
                    setPosts(prev => [...prev, ...data.posts]);
                }
                setHasMore(data.hasMore);
            }
        } catch (error) {
            console.error("Error cargando el feed:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filter, posts.length]);

    useEffect(() => {
        loadPosts(true); 
    }, [filter, loadPosts]); 

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            loadPosts(false);
        }
    };

    return { 
        posts, filter, setFilter, loading, loadingMore, hasMore, loadMore 
    };
};