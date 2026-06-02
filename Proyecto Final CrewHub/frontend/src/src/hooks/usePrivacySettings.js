import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { fetchAPI } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';

export const usePrivacySettings = () => {
    const { activeUser, setActiveUser } = useContext(AuthContext);
    const { showToast } = useToast();

    const [privacyMessages, setPrivacyMessages] = useState(activeUser?.privacy_messages || 'everyone');
    const [privacyComments, setPrivacyComments] = useState(activeUser?.privacy_comments || 'everyone');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (activeUser) {
            setPrivacyMessages(activeUser.privacy_messages || 'everyone');
            setPrivacyComments(activeUser.privacy_comments || 'everyone');
        }
    }, [activeUser]);

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