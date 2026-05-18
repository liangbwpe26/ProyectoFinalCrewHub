export const ERRORS = {
    // Errores de Red / Servidor
    NETWORK: "Error de conexión. Revisa tu internet.",
    SERVER_500: "Algo salió mal en el servidor. Intenta de nuevo.",
    
    // Errores de Chat
    USER_NOT_FOUND: "El usuario no existe o fue eliminado.",
    EMPTY_MESSAGE: "No puedes enviar un mensaje vacío.",
    EDIT_EXPIRED: "No puedes editar esto.",
    UNAUTHORIZED: "No tienes permiso para realizar esta acción.",
    
    // Error por defecto
    DEFAULT: "Ocurrió un error inesperado. Intenta más tarde."
};

// Función helper para intentar extraer el error del backend o dar uno por defecto
export const getErrorMessage = (errorData, defaultKey = 'DEFAULT') => {
    // Si el backend nos mandó un mensaje de error específico, lo usamos (opcional)
    if (errorData && errorData.message) return errorData.message;
    
    // Si no, buscamos en nuestro diccionario
    return ERRORS[defaultKey] || ERRORS.DEFAULT;
};