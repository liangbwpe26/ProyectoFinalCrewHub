// src/services/api.js

// Usamos la variable de entorno, si no existe, usamos localhost por defecto
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
const BASE_URL = `${BACKEND_URL}/api`;

export const fetchAPI = async (endpoint, options = {}, currentToken = null) => {
    const token = currentToken || localStorage.getItem('token');

    const headers = {
        'Accept': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.body && !(options.body instanceof FormData) && typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
        headers['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (response.status === 401) {
            console.warn("Sesión expirada o no autorizada. Redirigiendo al login...");
        }

        return data;
    } catch (error) {
        console.error(`Error en la petición a ${endpoint}:`, error);
        throw error;
    }
};