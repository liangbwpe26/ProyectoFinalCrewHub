import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAPI } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { ERRORS } from '../utils/errorMessages.js';

export const useHomeLogic = (token) => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    // Estados del Buscador y Contactos
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [mutuals, setMutuals] = useState([]);
    
    // Estados del Muro (Feed)
    const [feed, setFeed] = useState([]);
    const [loadingFeed, setLoadingFeed] = useState(true);

    // 1. Obtener amigos (Mutuals)
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

    // 2. Obtener el Muro de publicaciones
    const fetchFeed = useCallback(async () => {
        if (!token) return;
        setLoadingFeed(true);
        try {
            const data = await fetchAPI('/posts/feed', {}, token);
            if (data.success) {
                setFeed(data.posts);
            }
        } catch (error) {
            showToast("No pudimos cargar tu feed. Intenta recargar la página.", 'error');
        } finally {
            setLoadingFeed(false);
        }
    }, [token]);

    useEffect(() => {
        fetchMutuals();
        fetchFeed();
    }, [fetchMutuals, fetchFeed]);

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

    // 5. Seguir / Dejar de seguir / Cancelar Solicitud
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
    };
};