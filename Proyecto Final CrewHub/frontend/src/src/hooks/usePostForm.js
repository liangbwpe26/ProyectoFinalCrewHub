import { useState } from 'react';
import { fetchAPI } from '../services/api.js';

export const usePostForm = (token, onSuccessCallback) => {
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError("Solo se permiten imágenes (JPG, PNG, GIF).");
            return;
        }

        setError(null);
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const submitPost = async (e) => {
        e.preventDefault();
        if (!imageFile) {
            setError("Debes seleccionar una imagen para publicar.");
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', imageFile);
        if (description) formData.append('description', description);

        try {
            const data = await fetchAPI('/posts', {
                method: 'POST',
                body: formData
            }, token);

            if (data.success) {
                // Limpiamos el formulario
                setDescription("");
                setImageFile(null);
                setPreviewUrl(null);
                
                // Si el componente nos pasó una función para actualizar la UI, la llamamos
                if (onSuccessCallback) onSuccessCallback(data.post);
            } else {
                setError(data.message || 'Error al crear la publicación.');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    const cancelPost = () => {
        setDescription("");
        setImageFile(null);
        setPreviewUrl(null);
        setError(null);
    };

    return { 
        description, setDescription, 
        previewUrl, handleImageChange, 
        error, loading, 
        submitPost, cancelPost 
    };
};