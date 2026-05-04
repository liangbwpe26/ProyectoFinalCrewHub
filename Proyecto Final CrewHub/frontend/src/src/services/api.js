// src/services/api.js

const BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Función centralizada para todas las peticiones al backend.
 * 
 * @param {string} endpoint - La ruta de la API (ej: '/mutuals')
 * @param {object} options - Opciones adicionales como method, body, etc.
 * @param {string} currentToken - El token de sesión (opcional si lo sacamos del localStorage)
 */
export const fetchAPI = async (endpoint, options = {}, currentToken = null) => {
    // 1. Manejo del Token: Intenta usar el que pasas por parámetro, 
    // o busca uno guardado en localStorage (muy común en React).
    const token = currentToken || localStorage.getItem('token');

    // 2. Cabeceras por defecto
    const headers = {
        'Accept': 'application/json',
        ...options.headers,
    };

    // 3. Inyección automática del Token
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // 4. Transformación automática de JSON (Evita tener que hacer JSON.stringify a cada rato)
    // Nota: Si es FormData (como cuando subimos fotos), el navegador pone el Content-Type solo.
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

        // 5. Manejo de Errores Globales (Ej: El token expiró)
        if (response.status === 401) {
            console.warn("Sesión expirada o no autorizada. Redirigiendo al login...");
            // Aquí en el futuro podemos disparar una limpieza automática de sesión
        }

        return data;
    } catch (error) {
        console.error(`Error en la petición a ${endpoint}:`, error);
        throw error;
    }
};