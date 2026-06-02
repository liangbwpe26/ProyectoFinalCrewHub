import { useState } from 'react';
import { fetchAPI } from '../services/api.js';

export const useCreateCommunity = (onSuccessCallback) => {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

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