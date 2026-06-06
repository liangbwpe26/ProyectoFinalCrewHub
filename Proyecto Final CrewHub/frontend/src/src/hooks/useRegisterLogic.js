import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';

// Estado inicial para el formulario de registro, con campos para nombre de usuario, correo electrónico y contraseña
const initialUserData = { username: "", email: "", password: "" };
const FORBIDDEN_USERNAMES = ['login', 'register', 'chat', 'home', 'api', 'admin', 'perfil', 'config', 'index'];

export const useRegisterLogic = () => {
    // Acceso a la función de registro de la API desde el contexto de autenticación, estado para manejar los datos del formulario y el estado de carga,
    // así como funciones para navegar entre páginas y mostrar mensajes de toast
    const { registerAPI } = useContext(AuthContext);
    const [userData, setUserData] = useState(initialUserData);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Función para actualizar el estado de los datos del formulario a medida que el usuario ingresa información, utilizando 
    // el nombre del campo para actualizar el valor correspondiente en el estado
    const updateData = (event) => {
        let { name, value } = event.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    // Función para validar el nombre de usuario ingresado por el usuario, verificando que cumpla con los requisitos de longitud, 
    // caracteres permitidos y que no esté en la lista de nombres prohibidos
    const validateUsername = (username) => {
        const cleanUsername = username.trim().toLowerCase();
        if (cleanUsername.length < 3 || cleanUsername.length > 20) return "El usuario debe tener entre 3 y 20 caracteres.";
        if (!/^[a-z0-9_]+$/.test(cleanUsername)) return "Solo se permiten minúsculas, números y guiones bajos (_).";
        if (FORBIDDEN_USERNAMES.includes(cleanUsername)) return "Este nombre de usuario no está disponible.";
        return null;
    };

    // Función para manejar el envío del formulario de registro, validando los datos ingresados y enviando la solicitud a la API para registrar al usuario,
    // manejando el estado de carga y mostrando mensajes de toast según corresponda
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