import { useState, useEffect, useCallback } from 'react';
import { fetchAPI } from '../services/api.js';

export const useFeed = (token) => {
    const [posts, setPosts] = useState([]);
    const [filter, setFilter] = useState('all'); 
    
    // Estados para la carga y paginación
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadPosts = useCallback(async (reset = false) => {
        // Si reseteamos (al cambiar pestaña), empezamos desde 0. Si no, tomamos la longitud actual.
        const currentOffset = reset ? 0 : posts.length;
        
        if (reset) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            // Le pasamos el filtro Y el offset a tu API de Laravel
            const data = await fetchAPI(`/posts?filter=${filter}&offset=${currentOffset}`, {}, token);
            
            if (data.success) {
                if (reset) {
                    setPosts(data.posts);
                } else {
                    // Si estamos cargando más, sumamos los nuevos a los que ya teníamos
                    setPosts(prev => [...prev, ...data.posts]);
                }
                setHasMore(data.hasMore); // Capturamos tu booleano de Laravel
            }
        } catch (error) {
            console.error("Error cargando el feed:", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filter, token, posts.length]);

    // Escuchamos cambios en el filtro para resetear el feed
    useEffect(() => {
        if (token) {
            loadPosts(true); 
        }
    // eslint-disable-next-line
    }, [filter, token]); 

    // Función para llamar al hacer scroll hacia abajo o darle al botón "Cargar más"
    const loadMore = () => {
        if (!loadingMore && hasMore) {
            loadPosts(false);
        }
    };

    return { 
        posts, 
        filter, 
        setFilter, 
        loading, 
        loadingMore, 
        hasMore, 
        loadMore 
    };
};