import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext.jsx';
import { fetchAPI } from '../services/api.js';

export const useForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || loading) return;

        setLoading(true);
        try {
            const data = await fetchAPI('/forgot-password', {
                method: 'POST',
                body: { email }
            });

            if (data.success) {
                showToast("Si el correo existe, hemos enviado un código.", 'success');
                navigate('/reset-password', { state: { email } });
            } else {
                showToast(data.message || 'Error al procesar la solicitud.', 'error');
            }
        } catch (error) {
            showToast('Error de conexión con el servidor.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return { email, setEmail, loading, handleSubmit };
};