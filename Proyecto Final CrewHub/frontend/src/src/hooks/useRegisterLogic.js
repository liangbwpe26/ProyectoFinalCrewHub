import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';

const initialUserData = { username: "", email: "", password: "" };
const FORBIDDEN_USERNAMES = ['login', 'register', 'chat', 'home', 'api', 'admin', 'perfil', 'config', 'index'];

export const useRegisterLogic = () => {
    const { registerAPI } = useContext(AuthContext);
    const [userData, setUserData] = useState(initialUserData);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const updateData = (event) => {
        let { name, value } = event.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const validateUsername = (username) => {
        const cleanUsername = username.trim().toLowerCase();
        if (cleanUsername.length < 3 || cleanUsername.length > 20) return "El usuario debe tener entre 3 y 20 caracteres.";
        if (!/^[a-z0-9_]+$/.test(cleanUsername)) return "Solo se permiten minúsculas, números y guiones bajos (_).";
        if (FORBIDDEN_USERNAMES.includes(cleanUsername)) return "Este nombre de usuario no está disponible.";
        return null;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        const usernameError = validateUsername(userData.username);
        if (usernameError) {
            showToast(usernameError, "error");
            return;
        }

        if (!userData.username || !userData.email || !userData.password) {
            showToast("Todos los campos son obligatorios.", "error");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...userData,
                password_confirmation: userData.password
            };

            const res = await registerAPI(payload);
            if (res && res.success) {
                navigate("/verify-email", { state: { email: res.email || userData.email } });
            } else if (res && !res.success) {
                showToast(res.message || "Error al registrar el usuario.", "error");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Ocurrió un error inesperado de conexión.";
            showToast(errorMessage, "error");
        } finally {
            setLoading(false);
        }
    };

    return { userData, updateData, handleRegister, loading };
};