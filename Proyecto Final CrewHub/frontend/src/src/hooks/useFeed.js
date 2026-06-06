import { useState, useEffect, useCallback } from 'react';
import { fetchAPI } from '../services/api.js';

export const useFeed = () => {
    // Estado para almacenar la lista de posts, el filtro actual, el estado de carga, el estado de carga adicional para paginación y si hay más posts para cargar
    const [posts, setPosts] = useState([]);
    const [filter, setFilter] = useState('all'); 
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Función para cargar los posts desde la API, manejando la paginación con el offset y actualizando el estado local con los nuevos posts obtenidos
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

    // Cargar los posts al montar el componente y cada vez que cambie el filtro, reseteando la lista de 
    // posts para mostrar los nuevos resultados según el filtro seleccionado
    useEffect(() => {
        loadPosts(true); 
    }, [filter, loadPosts]); 

    // Función para cargar más posts cuando se alcance el final de la lista, verificando si hay más posts para cargar y si no se está cargando actualmente
    const loadMore = () => {
        if (!loadingMore && hasMore) {
            loadPosts(false);
        }
    };

    return { 
        posts, filter, setFilter, loading, loadingMore, hasMore, loadMore 
    };
};