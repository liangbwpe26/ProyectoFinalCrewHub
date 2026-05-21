import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAPI } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { ERRORS } from '../utils/errorMessages.js';

export const useHomeLogic = (token) => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [mutuals, setMutuals] = useState([]);
    
    const [feed, setFeed] = useState([]);
    const [loadingFeed, setLoadingFeed] = useState(true);
    
    const [feedOffset, setFeedOffset] = useState(0);
    const [feedHasMore, setFeedHasMore] = useState(true);
    const [loadingMoreFeed, setLoadingMoreFeed] = useState(false);

    const fetchMutuals = useCallback(async () => {
        if (!token) return;
        try {
            const data = await fetchAPI('/mutuals', {}, token);
            if (data.success) {
                setMutuals(data.mutuals);
            }
        } catch (error) {
            showToast("Error al cargar tus contactos.", 'error');
        }
    }, [token]);

    const loadFeed = useCallback(async (currentOffset = 0) => {
        if (!token) return;
        
        if (currentOffset === 0) setLoadingFeed(true);
        else setLoadingMoreFeed(true);

        try {
            const data = await fetchAPI(`/posts/feed?offset=${currentOffset}`, {}, token);
            if (data.success) {
                if (currentOffset === 0) {
                    setFeed(data.posts);
                } else {
                    setFeed(prev => [...prev, ...data.posts]);
                }
                setFeedHasMore(data.hasMore);
                setFeedOffset(currentOffset);
            }
        } catch (error) {
            console.error("Error cargando el feed principal", error);
        } finally {
            setLoadingFeed(false);
            setLoadingMoreFeed(false);
        }
    }, [token]);

    useEffect(() => {
        fetchMutuals();
        loadFeed();
    }, [fetchMutuals, loadFeed]);

    const addNewPostToFeed = (newPost) => {
        setFeed(prevFeed => [newPost, ...prevFeed]);
    };

    // 4. Buscador
    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const data = await fetchAPI(`/users/search?q=${encodeURIComponent(query)}`, {}, token);
            if (data.success) {
                setSearchResults(data.users);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            showToast("Error al buscar usuarios.", 'error');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const toggleFollow = async (userId, currentStatus) => {
        const targetId = userId; 
        const endpoint = (currentStatus === 'none') ? `/follow/${targetId}` : `/unfollow/${targetId}`;
        const method = (currentStatus === 'none') ? 'POST' : 'DELETE';

        try {
            const data = await fetchAPI(endpoint, { method }, token);

            if (data.success) {
                const newStatus = (currentStatus === 'none') ? (data.status || 'accepted') : 'none';

                setSearchResults(prev => prev.map(user => {
                    const currentId = user.id || user._id;
                    if (currentId === targetId) {
                        return { ...user, follow_status: newStatus };
                    }
                    return user;
                }));
                fetchMutuals();
            } else {
                showToast(data.message || ERRORS.DEFAULT, 'error');
            }
        } catch (error) {
            showToast("Error al actualizar estado de seguimiento.", 'error');
        }
    };

    return {
        searchQuery, searchResults, isSearching, mutuals, feed, loadingFeed,
        addNewPostToFeed, handleSearch, toggleFollow,
        feedOffset, feedHasMore, loadingMoreFeed, loadFeed
    };
};