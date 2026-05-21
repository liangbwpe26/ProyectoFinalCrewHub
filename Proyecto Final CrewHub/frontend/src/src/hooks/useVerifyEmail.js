import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { fetchAPI } from '../services/api.js';

export const useVerifyEmail = (initialEmail) => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const { showToast } = useToast();

    const [email, setEmail] = useState(initialEmail || '');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        if (code.length < 5 || !email || loading) return;

        setLoading(true);
        try {
            const data = await fetchAPI('/verify-email', {
                method: 'POST',
                body: { email, code }
            });

            if (data.success) {
                showToast(data.message, 'success');
                login(data.user, data.token);
                navigate('/');
            } else {
                showToast(data.message || 'Código incorrecto.', 'error');
            }
        } catch (error) {
            showToast('Error de conexión con el servidor.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!email || resendLoading) return;
        
        setResendLoading(true);
        try {
            const data = await fetchAPI('/resend-verification', {
                method: 'POST',
                body: { email }
            });

            if (data.success) {
                showToast(data.message, 'success');
            } else {
                showToast(data.message || 'Error al reenviar el código.', 'error');
            }
        } catch (error) {
            showToast('Error de conexión.', 'error');
        } finally {
            setResendLoading(false);
        }
    };

    const handleCodeChange = (e) => {
        setCode(e.target.value.replace(/[^0-9]/g, ''));
    };

    return {
        email, setEmail,
        code, handleCodeChange,
        loading, handleVerify,
        resendLoading, handleResendCode
    };
};