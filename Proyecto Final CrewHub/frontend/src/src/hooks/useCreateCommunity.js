import { useState } from 'react';
import { fetchAPI } from '../services/api.js';

// Hook personalizado para manejar la lógica de creación de comunidades
export const useCreateCommunity = (onSuccessCallback) => {
    // Estado para almacenar los datos del formulario, el estado de carga y cualquier error que ocurra durante la creación de la comunidad
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Función para manejar los cambios en los campos del formulario, actualizando el estado local con los nuevos valores
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Función para manejar el envío del formulario, enviando los datos a la API para crear una nueva comunidad y manejando el estado de carga y errores según corresponda
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetchAPI('/communities', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    tags: []
                })
            });

            if (response.success) {
                setFormData({ name: '', description: '' });
                if (onSuccessCallback) onSuccessCallback(response.community);
            }
        } catch (err) {
            setError(err.message || 'Ocurrió un error al crear la comunidad.');
        } finally {
            setLoading(false);
        }
    };

    return { formData, handleChange, handleSubmit, loading, error };
};