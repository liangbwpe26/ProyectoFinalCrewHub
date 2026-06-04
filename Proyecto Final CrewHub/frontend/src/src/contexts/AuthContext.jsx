import React, { createContext, useState, useEffect } from "react";
import { fetchAPI } from "../services/api";
import { useToast } from "./ToastContext.jsx";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [activeUser, setActiveUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // 1. VERIFICAR SESIÓN
    useEffect(() => {
        const verifySession = async () => {
            try {
                const data = await fetchAPI('/user');
                setActiveUser(data);
            } catch (error) {
                setActiveUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifySession();
    }, []);

    // 2. INICIAR SESIÓN
    const loginAPI = async (credentials) => {
        await fetchAPI('/sanctum/csrf-cookie');

        const data = await fetchAPI('/login', {
            method: 'POST',
            body: credentials
        });

        if (data.success || data.user) {
            try {
                const sessionUser = await fetchAPI('/user');
                if (sessionUser && !sessionUser.message) {
                    setActiveUser(sessionUser);
                    return { success: true, data: { user: sessionUser } };
                }
            } catch (error) {
                throw new Error("No se pudo establecer la sesión segura.");
            }
        } else if (data.needs_verification) {
            return { success: false, needs_verification: true, email: data.email };
        }

        throw new Error(data.message || "Credenciales incorrectas");
    };

    // 3. REGISTRO
    const registerAPI = async (userData) => {
        await fetchAPI('/sanctum/csrf-cookie');

        const data = await fetchAPI('/register', {
            method: 'POST',
            body: userData
        });

        return data; 
    };

    // 4. CERRAR SESIÓN
    const logout = async () => {
        try {
            await fetchAPI('/logout', { method: 'POST' });
        } catch (error) {
            console.error("Error al cerrar sesión en el servidor", error);
        } finally {
            setActiveUser(null);
            window.location.href = '/login';
        }
    };

    const login = (userData) => {
        setActiveUser(userData);
    };

    const contextValue = {
        activeUser,
        setActiveUser,
        loginAPI,
        registerAPI,
        logout,
        login,
        loading
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;