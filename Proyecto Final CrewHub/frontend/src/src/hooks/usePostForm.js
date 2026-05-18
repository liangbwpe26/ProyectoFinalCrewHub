import { useState } from 'react';
import { fetchAPI } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { ERRORS } from '../utils/errorMessages.js';

export const usePostForm = (token, onSuccessCallback) => {
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const { showToast } = useToast();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showToast("Solo se permiten imágenes (JPG, PNG, GIF).", "error");
            return;
        }

        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const submitPost = async (e) => {
        e.preventDefault();
        if (!imageFile) {
            showToast("Debes seleccionar una imagen para publicar.", "error");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('image', imageFile);
        if (description) formData.append('description', description);

        try {
            const data = await fetchAPI('/posts', { method: 'POST', body: formData }, token);

            if (data.success) {
                setDescription("");
                setImageFile(null);
                setPreviewUrl(null);
                showToast("¡Publicación subida con éxito!", "success");
                if (onSuccessCallback) onSuccessCallback(data.post);
            } else {
                showToast(data.message || ERRORS.DEFAULT, "error");
            }
        } catch (err) {
            showToast(ERRORS.SERVER_500, "error");
        } finally {
            setLoading(false);
        }
    };

    const cancelPost = () => {
        setDescription("");
        setImageFile(null);
        setPreviewUrl(null);
    };

    return { 
        description, setDescription, 
        previewUrl, handleImageChange, 
        loading, submitPost, cancelPost 
    };
};