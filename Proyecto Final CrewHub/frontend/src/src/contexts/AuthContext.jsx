import React, { createContext, useState, useEffect } from "react";
import { fetchAPI } from "../services/api"; 
import { useToast } from "./ToastContext.jsx";
import { ERRORS } from "../utils/errorMessages.js";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [activeUser, setActiveUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const { showToast } = useToast();

    useEffect(() => {
        const verifySession = async () => {
            if (token) {
                try {
                    const userData = await fetchAPI('/user', {}, token);
                    setActiveUser(userData);
                } catch (error) {
                    showToast("Tu sesión ha expirado.", "error");
                    logout(); 
                }
            }
            setLoading(false); 
        };

        verifySession();
    }, [token]);

    const login = (userData, authToken) => {
        localStorage.setItem('token', authToken);
        setToken(authToken);
        setActiveUser(userData);
    };

    const loginAPI = async (credentials) => {
        try {
            const data = await fetchAPI('/login', {
                method: 'POST',
                body: credentials
            });

            if (data.token) {
                login(data.user, data.token);
                showToast("¡Bienvenido de vuelta!", "success");
                return { success: true, data };
            } else if (data.needs_verification) {
                showToast(data.message, "error");
                return { success: false, needs_verification: true, email: data.email };
            } else {
                throw new Error(data.message || "Error al iniciar sesión");
            }
        } catch (error) {
            showToast(error.message || ERRORS.DEFAULT, "error");
            throw error; 
        }
    };

    const registerAPI = async (userData) => {
        try {
            const data = await fetchAPI('/register', {
                method: 'POST',
                body: userData
            });

            if (data.success) {
                showToast(data.message, "success");
                return { success: true, email: data.email }; 
            } else {
                throw new Error(data.message || "Error al registrarse");
            }
        } catch (error) {
            showToast(error.message || ERRORS.DEFAULT, "error");
            throw error; 
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setActiveUser(null);
    };

    const contextValue = { token, activeUser, setActiveUser, loginAPI, registerAPI, logout, login, loading };

    return (
        <AuthContext.Provider value={contextValue}>
            {!loading && children} 
        </AuthContext.Provider>
    );
};

export default AuthProvider;