const BACKEND_URL = 'https://crewhub.es'; // Constante con la URL del backend, se puede cambiar fácilmente para desarrollo local o producción.

// Función para obtener el valor de una cookie por su nombre, útil para obtener el token CSRF.
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return null;
};

// Función principal para hacer peticiones al backend, maneja la configuración de headers, cuerpo y manejo de errores.
export const fetchAPI = async (endpoint, options = {}) => {
    const headers = {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...options.headers,
    };

    // Agrega el token CSRF a los headers si está disponible, necesario para rutas protegidas por Sanctum.
    const xsrfToken = getCookie('XSRF-TOKEN');
    if (xsrfToken) {
        headers['X-XSRF-TOKEN'] = xsrfToken;
    }

    // Si el cuerpo de la petición es un objeto (y no un FormData), lo convertimos a JSON y ajustamos el header Content-Type.
    let body = options.body;
    if (body && !(body instanceof FormData) && typeof body === 'object') {
        body = JSON.stringify(body);
        headers['Content-Type'] = 'application/json';
    }

    // Configuración final de la petición, incluyendo headers, cuerpo y credenciales para enviar cookies.
    const config = {
        ...options,
        headers,
        body,
        credentials: 'include',
    };

    // Determina la URL completa de la petición, si es una ruta de Sanctum no se le agrega el prefijo /api.
    const isSanctumRoute = endpoint.startsWith('/sanctum');
    const url = isSanctumRoute
        ? `${BACKEND_URL}${endpoint}`
        : `${BACKEND_URL}/api${endpoint}`;

    // Realiza la petición usando fetch y maneja la respuesta, lanzando errores si la respuesta no es exitosa.
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