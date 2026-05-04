import { useState } from 'react';
import { fetchAPI } from '../services/api.js';

export const useProfileForm = (token, initialData = {}) => {
    // Inicializamos con los datos del usuario si existen (útil para EditProfile)
    const [displayName, setDisplayName] = useState(initialData.display_name || "");
    const [dateOfBirth, setDateOfBirth] = useState(initialData.date_of_birth ? initialData.date_of_birth.split('T')[0] : "");
    const [imageFile, setImageFile] = useState(null);
    const [isPrivate, setIsPrivate] = useState(initialData.is_private || false);
    
    // Generamos el avatar por defecto
    const defaultAvatar = initialData.profile_picture 
        ? (initialData.profile_picture.startsWith('http') ? initialData.profile_picture : `http://127.0.0.1:8000${initialData.profile_picture}`)
        : `https://ui-avatars.com/api/?name=${initialData.username || 'U'}&background=262626&color=fff&bold=true&size=150`;

    const [previewUrl, setPreviewUrl] = useState(defaultAvatar);
    
    // Estados de UI
    const [errors, setErrors] = useState([]);
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    // Validación de imagen en el frontend
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setErrors(["Solo se permiten imágenes (JPG, PNG, GIF)."]);
            return;
        }
        if (file.size > 2 * 1024 * 1024) { // 2MB
            setErrors(["La imagen es demasiado pesada. Máximo 2MB."]);
            return;
        }

        setErrors([]);
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    // Envío del formulario centralizado
    const submitProfile = async (onSuccessCallback) => {
        setLoading(true);
        setErrors([]);
        setSuccessMsg('');

        const formData = new FormData();
        if (displayName) formData.append('display_name', displayName);
        if (dateOfBirth) formData.append('date_of_birth', dateOfBirth);
        if (imageFile) formData.append('profile_picture', imageFile);

        formData.append('is_private', isPrivate ? 'true' : 'false');

        try {
            // Pasamos formData directo. api.js es inteligente y no le pondrá 'Content-Type'
            const data = await fetchAPI('/profile/update', {
                method: 'POST',
                body: formData
            }, token);

            if (data.success) {
                setSuccessMsg('Perfil actualizado correctamente.');
                if (onSuccessCallback) onSuccessCallback(data.user);
            } else {
                setErrors([data.message || 'Error al actualizar el perfil.']);
            }
        } catch (err) {
            setErrors(['Error de conexión con el servidor.']);
        } finally {
            setLoading(false);
        }
    };

    return {
        displayName, setDisplayName,
        dateOfBirth, setDateOfBirth,
        previewUrl, handleImageChange,
        isPrivate, setIsPrivate,
        errors, successMsg, loading,
        submitProfile
    };
};