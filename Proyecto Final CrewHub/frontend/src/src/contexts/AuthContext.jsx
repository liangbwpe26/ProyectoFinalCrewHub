import React, { createContext, useState, useEffect } from "react";
import { fetchAPI } from "../services/api"; // Importamos nuestro servicio maestro

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    // 1. Estados iniciales limpios
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [activeUser, setActiveUser] = useState(null);
    const [loading, setLoading] = useState(true); // Para evitar "parpadeos" al recargar

    // 2. Efecto para validar la sesión al cargar la app
    useEffect(() => {
        const verifySession = async () => {
            if (token) {
                try {
                    // Le pedimos al backend los datos del usuario usando el token
                    const userData = await fetchAPI('/user', {}, token);
                    setActiveUser(userData);
                } catch (error) {
                    console.error("Token inválido o expirado:", error);
                    logout(); // Si el token no sirve, limpiamos la sesión
                }
            }
            setLoading(false); // Ya terminamos de verificar
        };

        verifySession();
    }, [token]);

    // 3. Funciones de Autenticación (Ahora usando fetchAPI)
    const loginAPI = async (credentials) => {
        try {
            const data = await fetchAPI('/login', {
                method: 'POST',
                body: credentials
            });

            if (data.token) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
                setActiveUser(data.user);
                return data; // Devolvemos data para manejar el éxito en Login.jsx
            } else {
                throw new Error(data.message || "Error al iniciar sesión");
            }
        } catch (error) {
            throw error; // Lanzamos el error para que Login.jsx lo atrape y muestre
        }
    };

    const registerAPI = async (userData) => {
        try {
            const data = await fetchAPI('/register', {
                method: 'POST',
                body: userData
            });

            if (data.token) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
                setActiveUser(data.user);
                return data; 
            } else {
                throw new Error(data.message || "Error al registrarse");
            }
        } catch (error) {
            throw error; 
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setActiveUser(null);
    };

    // 4. Qué exporta el contexto
    const contextValue = {
        token,
        activeUser,
        setActiveUser, // Necesario para SetupProfile y EditProfile
        loginAPI,
        registerAPI,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {/* Si está validando la sesión al recargar, no renderiza los hijos aún */}
            {!loading && children} 
        </AuthContext.Provider>
    );
};

export default AuthProvider;