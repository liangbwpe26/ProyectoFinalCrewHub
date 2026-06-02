import { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api.js';

export const useCommunities = () => {
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadCommunities = async () => {
        setLoading(true);
        try {
            const data = await fetchAPI('/communities');
            if (data.success) {
                setCommunities(data.communities);
            }
        } catch (error) {
            console.error("Error al cargar comunidades:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCommunities();
    }, []);

    return { communities, setCommunities, loading, loadCommunities };
};