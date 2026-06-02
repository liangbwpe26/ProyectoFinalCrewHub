const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return null;
};

export const fetchAPI = async (endpoint, options = {}) => {
    const headers = {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...options.headers,
    };

    const xsrfToken = getCookie('XSRF-TOKEN');
    if (xsrfToken) {
        headers['X-XSRF-TOKEN'] = xsrfToken;
    }

    let body = options.body;
    if (body && !(body instanceof FormData) && typeof body === 'object') {
        body = JSON.stringify(body);
        headers['Content-Type'] = 'application/json';
    }

    const config = {
        ...options,
        headers,
        body,
        credentials: 'include',
    };

    const isSanctumRoute = endpoint.startsWith('/sanctum');
    const url = isSanctumRoute
        ? `${BACKEND_URL}${endpoint}`
        : `${BACKEND_URL}/api${endpoint}`;

    try {
        const response = await fetch(url, config);
        
        if (response.status === 204) return { success: true };

        const data = await response.json();

        if (response.status === 401) {
            throw new Error("No autenticado");
        }

        if (!response.ok) {
            throw new Error(data.message || "Error en la petición");
        }

        return data;
    } catch (error) {
        throw error;
    }
};