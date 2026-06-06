import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAPI } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { ERRORS } from '../utils/errorMessages.js';

export const useHomeLogic = () => {
    // Estados para manejar la lógica de búsqueda, contactos mutuos, feed principal y paginación del feed
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

    // Función para cargar los contactos mutuos del usuario, enviando la solicitud a la API y actualizando el estado local con 
    // los datos obtenidos o mostrando un mensaje de error en caso de fallo
    const fetchMutuals = useCallback(async () => {
        try {
            const data = await fetchAPI('/mutuals');
            if (data.success) {
                setMutuals(data.mutuals);
            }
        } catch (error) {
            showToast("Error al cargar tus contactos.", 'error');
        }
    }, []);

    // Función para cargar los posts del feed principal desde la API, manejando la paginación con el offset y actualizando el 
    // estado local con los nuevos posts obtenidos, así como el estado de carga y si hay más posts para cargar
    const loadFeed = useCallback(async (currentOffset = 0) => {
        if (currentOffset === 0) setLoadingFeed(true);
        else setLoadingMoreFeed(true);

        try {
            const data = await fetchAPI(`/posts/feed?offset=${currentOffset}`);
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
    }, []);

    // Cargar los contactos mutuos y el feed principal al montar el componente, asegurando que ambos procesos se 
    // realicen de manera independiente y manejando sus estados de carga por separado
    useEffect(() => {
        fetchMutuals();
        loadFeed();
    }, [fetchMutuals, loadFeed]);

    // Función para agregar un nuevo post al inicio del feed principal, actualizando el estado local del feed con el nuevo post recibido
    const addNewPostToFeed = (newPost) => {
        setFeed(prevFeed => [newPost, ...prevFeed]);
    };

    // Función para manejar el evento de búsqueda, enviando la consulta a la API y actualizando el estado local 
    // con los resultados obtenidos o mostrando un mensaje de error en caso de fallo
    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const data = await fetchAPI(`/users/search?q=${encodeURIComponent(query)}`);
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

    // Función para alternar el estado de seguimiento de un usuario, enviando la solicitud a la API para seguir o 
    // dejar de seguir al usuario objetivo y actualizando el estado local de los resultados de búsqueda y contactos mutuos según corresponda
    const toggleFollow = async (userId, currentStatus) => {
        const targetId = userId; 
        const endpoint = (currentStatus === 'none') ? `/follow/${targetId}` : `/unfollow/${targetId}`;
        const method = (currentStatus === 'none') ? 'POST' : 'DELETE';

        try {
            const data = await fetchAPI(endpoint, { method });

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