import React, { createContext, useState, useEffect } from "react";
import { fetchAPI } from "../services/api";
import { useToast } from "./ToastContext.jsx";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // Estado del usuario activo
    const [activeUser, setActiveUser] = useState(null);
    // Estado de carga inicial
    const [loading, setLoading] = useState(true);
    // Hook para mostrar toasts (actualmente no usado en este archivo)
    const { showToast } = useToast();

    // 1. VERIFICAR SESIÓN
    useEffect(() => {
        const verifySession = async () => {
            try {
                // Obtener información del usuario desde la API
                const data = await fetchAPI('/user');
                // Establecer usuario activo si existe
                setActiveUser(data);
            } catch (error) {
                // Si hay error, limpiar usuario
                setActiveUser(null);
            } finally {
                // Marcar carga finalizada
                setLoading(false);
            }
        };

        verifySession();
    }, []);

    // 2. INICIAR SESIÓN
    const loginAPI = async (credentials) => {
        // Obtener cookie CSRF antes de enviar credenciales
        await fetchAPI('/sanctum/csrf-cookie');

        // Enviar solicitud de login
        const data = await fetchAPI('/login', {
            method: 'POST',
            body: credentials
        });

        // Si la respuesta indica éxito
        if (data.success || data.user) {
            try {
                // Obtener usuario de la sesión y actualizar estado
                const sessionUser = await fetchAPI('/user');
                if (sessionUser && !sessionUser.message) {
                    setActiveUser(sessionUser);
                    return { success: true, data: { user: sessionUser } };
                }
            } catch (error) {
                // Error al obtener la sesión segura
                throw new Error("No se pudo establecer la sesión segura.");
            }
        } else if (data.needs_verification) {
            // Caso: el usuario necesita verificar su correo
            return { success: false, needs_verification: true, email: data.email };
        }

        // Lanzar error por credenciales inválidas
        throw new Error(data.message || "Credenciales incorrectas");
    };

    // 3. REGISTRO
    const registerAPI = async (userData) => {
        // Obtener CSRF antes del registro
        await fetchAPI('/sanctum/csrf-cookie');

        // Enviar datos de registro
        const data = await fetchAPI('/register', {
            method: 'POST',
            body: userData
        });

        // Devolver respuesta del registro
        return data; 
    };

    // 4. CERRAR SESIÓN
    const logout = async () => {
        try {
            // Solicitar cierre de sesión al servidor
            await fetchAPI('/logout', { method: 'POST' });
        } catch (error) {
            // Registrar error en consola si falla el logout
            console.error("Error al cerrar sesión en el servidor", error);
        } finally {
            // Limpiar estado y redirigir a la página de login
            setActiveUser(null);
            window.location.href = '/login';
        }
    };

    // Función para establecer manualmente el usuario activo
    const login = (userData) => {
        setActiveUser(userData);
    };

    // Valor que se provee a los consumidores del contexto
    const contextValue = {
        activeUser,
        setActiveUser,
        loginAPI,
        registerAPI,
        logout,
        login,
        loading
    };

    // Renderizar proveedor solo cuando la carga inicial termina
    return (
        <AuthContext.Provider value={contextValue}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;