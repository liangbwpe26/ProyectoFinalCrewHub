import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { fetchAPI } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';

export const usePrivacySettings = () => {
    // Estado para manejar las configuraciones de privacidad de mensajes y comentarios, así como el estado de carga durante la actualización de la configuración
    const { activeUser, setActiveUser } = useContext(AuthContext);
    const { showToast } = useToast();

    const [privacyMessages, setPrivacyMessages] = useState(activeUser?.privacy_messages || 'everyone');
    const [privacyComments, setPrivacyComments] = useState(activeUser?.privacy_comments || 'everyone');
    const [isSaving, setIsSaving] = useState(false);

    // Efecto para actualizar los estados de privacidad de mensajes y comentarios cuando el usuario activo cambia, 
    // asegurando que los valores se sincronicen con los datos del usuario activo
    useEffect(() => {
        if (activeUser) {
            setPrivacyMessages(activeUser.privacy_messages || 'everyone');
            setPrivacyComments(activeUser.privacy_comments || 'everyone');
        }
    }, [activeUser]);

    // Función para manejar la actualización de las configuraciones de privacidad, enviando los datos a la API para actualizar el perfil del usuario
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('privacy_messages', privacyMessages);
            formData.append('privacy_comments', privacyComments);

            const data = await fetchAPI('/users/update', {
                method: 'POST',
                body: formData
            });

            if (data.success) {
                if (setActiveUser) setActiveUser(data.user);
                showToast("Privacidad actualizada correctamente", "success");
            } else {
                showToast(data.message || "Error al actualizar", "error");
            }
        } catch (error) {
            showToast("Error de conexión con el servidor", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return {
        privacyMessages, setPrivacyMessages,
        privacyComments, setPrivacyComments,
        isSaving, handleSave
    };
};