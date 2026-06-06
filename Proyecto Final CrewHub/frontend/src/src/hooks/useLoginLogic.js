import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';

export const useLoginLogic = () => {
    // Estado para almacenar las credenciales ingresadas por el usuario y el estado de carga durante el proceso de inicio de sesión
    const { loginAPI } = useContext(AuthContext);
    const [credentials, setCredentials] = useState({ login: "", password: "" });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Función para actualizar el estado de las credenciales a medida que el usuario ingresa los datos en el formulario
    const updateData = (event) => {
        let { name, value } = event.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    // Función para manejar el envío del formulario de inicio de sesión, enviando las credenciales a la API y 
    // manejando el estado de carga y errores según corresponda
    const handleLogin = async (e) => {
        e.preventDefault(); 
        if (!credentials.login || !credentials.password) {
            showToast("Todos los campos son obligatorios.", "error");
            return;
        }

        setLoading(true);
        try {
            const res = await loginAPI(credentials);
            if (res && res.success) {
                navigate("/");
            } else if (res && res.needs_verification) {
                navigate("/verify-email", { state: { email: res.email || credentials.login } });
            }
        } catch (error) {
            // El error genérico lo maneja el AuthContext
        } finally {
            setLoading(false);
        }
    };

    return { credentials, updateData, handleLogin, loading };
};