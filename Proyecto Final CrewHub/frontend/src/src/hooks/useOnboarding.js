import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { fetchAPI } from '../services/api.js';

export const useOnboarding = () => {
    // Contexto para acceder al usuario activo y función para actualizarlo, así como la función de navegación de React Router
    const { activeUser, setActiveUser } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [availableInterests, setAvailableInterests] = useState([]);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Efecto para cargar los intereses disponibles desde la API al montar el componente, actualizando el estado local con los datos obtenidos
    useEffect(() => {
        const fetchInterests = async () => {
            try {
                const data = await fetchAPI('/interests');
                if (data.success) {
                    setAvailableInterests(data.interests);
                }
            } catch (error) {
                console.error("Error cargando intereses:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInterests();
    }, []);

    // Función para manejar la selección o deselección de intereses por parte del usuario, actualizando el estado local de intereses seleccionados
    const toggleInterest = (slug) => {
        if (selectedInterests.includes(slug)) {
            setSelectedInterests(selectedInterests.filter(item => item !== slug));
        } else {
            setSelectedInterests([...selectedInterests, slug]);
        }
    };

    // Función para manejar el guardado de los intereses seleccionados, enviando la solicitud a la API para actualizar los intereses del usuario, 
    // y actualizando el usuario activo en el contexto con los datos obtenidos, además de navegar a la página principal
    const handleSaveInterests = async () => {
        if (selectedInterests.length < 3) return; 
        
        setSaving(true);
        try {
            const data = await fetchAPI('/user/interests', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ interests: selectedInterests })
            });

            if (data.success) {
                setActiveUser(data.user);
                navigate('/');
            }
        } catch (error) {
            console.error("Error guardando intereses:", error);
            setSaving(false);
        }
    };

    return {
        availableInterests,
        selectedInterests,
        loading,
        saving,
        toggleInterest,
        handleSaveInterests
    };
};