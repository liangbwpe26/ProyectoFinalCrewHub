import { useState } from 'react';
import { fetchAPI } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { ERRORS } from '../utils/errorMessages.js';

export const usePostForm = (token, initialData = {}) => {
    const [displayName, setDisplayName] = useState(initialData.display_name || "");
    const [dateOfBirth, setDateOfBirth] = useState(initialData.date_of_birth ? initialData.date_of_birth.split('T')[0] : "");
    const [imageFile, setImageFile] = useState(null);
    const [isPrivate, setIsPrivate] = useState(initialData.is_private || false);
    
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

    const defaultAvatar = initialData.profile_picture 
        ? (initialData.profile_picture.startsWith('http') ? initialData.profile_picture : `${BACKEND_URL}${initialData.profile_picture}`)
        : `https://ui-avatars.com/api/?name=${initialData.username || 'U'}&background=262626&color=fff&bold=true&size=150`;

    const [previewUrl, setPreviewUrl] = useState(defaultAvatar);
    const [loading, setLoading] = useState(false);
    
    const [cropImageSrc, setCropImageSrc] = useState(null);

    const { showToast } = useToast();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast("Solo se permiten imágenes (JPG, PNG, GIF).", "error");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            showToast("La imagen es demasiado pesada. Máximo 2MB.", "error");
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setCropImageSrc(reader.result);
        };
    };

    const handleCropComplete = (croppedFile) => {
        setImageFile(croppedFile);
        setPreviewUrl(URL.createObjectURL(croppedFile));
        setCropImageSrc(null);
    };

    const submitProfile = async (onSuccessCallback) => {
        setLoading(true);

        const formData = new FormData();
        if (displayName) formData.append('display_name', displayName);
        if (dateOfBirth) formData.append('date_of_birth', dateOfBirth);
        if (imageFile) formData.append('profile_picture', imageFile);
        formData.append('is_private', isPrivate ? 'true' : 'false');

        try {
            const data = await fetchAPI('/profile/update', { method: 'POST', body: formData }, token);

            if (data.success) {
                showToast('Perfil actualizado correctamente.', 'success');
                if (onSuccessCallback) onSuccessCallback(data.user);
            } else {
                showToast(data.message || 'Error al actualizar el perfil.', 'error');
            }
        } catch (err) {
            showToast(ERRORS.SERVER_500, 'error');
        } finally {
            setLoading(false);
        }
    };

    return {
        displayName, setDisplayName,
        dateOfBirth, setDateOfBirth,
        previewUrl, handleImageChange,
        isPrivate, setIsPrivate,
        loading, submitProfile,
        cropImageSrc, setCropImageSrc, handleCropComplete
    };
};