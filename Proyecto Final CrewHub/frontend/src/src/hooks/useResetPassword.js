import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext.jsx';
import { fetchAPI } from '../services/api.js';

export const useResetPassword = (initialEmail) => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [email, setEmail] = useState(initialEmail || '');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (code.length < 5 || newPassword.length < 8 || !email || loading) return;

        setLoading(true);
        try {
            const data = await fetchAPI('/reset-password', {
                method: 'POST',
                body: { email, code, new_password: newPassword }
            });

            if (data.success) {
                showToast(data.message, 'success');
                navigate('/login'); 
            } else {
                showToast(data.message || 'Código incorrecto o expirado.', 'error');
            }
        } catch (error) {
            showToast('Error de conexión con el servidor.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCodeChange = (e) => {
        setCode(e.target.value.replace(/[^0-9]/g, ''));
    };

    return {
        email, setEmail,
        code, handleCodeChange,
        newPassword, setNewPassword,
        loading, handleSubmit
    };
};