// Importaciones necesarias para el hook personalizado de comunidades
import { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api.js';

// Hook personalizado para manejar la lógica de las comunidades
export const useCommunities = () => {
    // Estado para almacenar la lista de comunidades y el estado de carga
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);

    // Función para cargar las comunidades desde la API
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

    // Cargar las comunidades al montar el componente
    useEffect(() => {
        loadCommunities();
    }, []);

    // Retornar los datos y funciones necesarias para manejar la lógica de las comunidades
    return { communities, setCommunities, loading, loadCommunities };
};