import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';

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
            const response = await fetch('http://127.0.0.1:8000/api/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ email, code })
            });
            const data = await response.json();

            if (response.ok && data.success) {
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

    // Nueva función para solicitar otro código
    const handleResendCode = async () => {
        if (!email || resendLoading) return;
        
        setResendLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();

            if (response.ok && data.success) {
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
        resendLoading, handleResendCode // Exportamos la nueva función
    };
};