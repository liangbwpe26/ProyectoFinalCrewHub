import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAPI } from '../services/api.js';

export const useHomeLogic = (token) => {
    const navigate = useNavigate();
    
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
            console.error("Error obteniendo mutuals:", error);
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
            console.error("Error obteniendo el muro:", error);
        } finally {
            setLoadingFeed(false);
        }
    }, [token]);

    // Ejecutar al cargar el componente
    useEffect(() => {
        fetchMutuals();
        fetchFeed();
    }, [fetchMutuals, fetchFeed]);

    // 3. Función para añadir un post recién creado sin recargar
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
            console.error("Error buscando usuarios:", error);
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
                // Actualizamos los mutuals por si dejamos de seguir a un amigo
                fetchMutuals();
            }
        } catch (error) {
            console.error("Error al actualizar seguimiento:", error);
        }
    };

    // 6. Iniciar Chat
    const startChat = async (friendId) => {
        try {
            const data = await fetchAPI(`/chat/start/${friendId}`, { method: 'POST' }, token);
            if (data.success) {
                const chatId = data.conversation.id || data.conversation._id;
                navigate(`/chat/${chatId}`);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error al iniciar el chat:", error);
        }
    };

    return {
        searchQuery,
        searchResults,
        isSearching,
        mutuals,
        feed,
        loadingFeed,
        addNewPostToFeed,
        handleSearch,
        toggleFollow,
        startChat
    };
};