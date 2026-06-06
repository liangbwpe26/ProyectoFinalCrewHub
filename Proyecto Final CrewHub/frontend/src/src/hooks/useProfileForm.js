import { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { ERRORS } from '../utils/errorMessages.js';

export const useProfileForm = (initialData) => {
    // Estados para manejar los campos del formulario de perfil, archivos de imagen para avatar y banner, URLs de vista previa, 
    // y estado de carga durante la actualización del perfil
    const [displayName, setDisplayName] = useState(initialData?.display_name || "");
    const [dateOfBirth, setDateOfBirth] = useState(initialData?.date_of_birth ? initialData.date_of_birth.split('T')[0] : "");
    const [imageFile, setImageFile] = useState(null);
    const [isPrivate, setIsPrivate] = useState(initialData?.is_private || false);
    const [businessSlogan, setBusinessSlogan] = useState(initialData?.business_slogan || '');
    const [bannerFile, setBannerFile] = useState(null);
    const [previewBannerUrl, setPreviewBannerUrl] = useState(initialData?.banner_picture || '');

    const [cropImageSrc, setCropImageSrc] = useState(null);
    const [cropType, setCropType] = useState(null);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

    // Función para obtener la URL del avatar de un usuario, manejando casos donde no hay imagen de perfil
    const getAvatar = (user) => {
        if (!user) return `https://ui-avatars.com/api/?name=U&background=262626&color=fff&bold=true&size=150`;
        return user.profile_picture
            ? (user.profile_picture.startsWith('http') ? user.profile_picture : `${BACKEND_URL}${user.profile_picture}`)
            : `https://ui-avatars.com/api/?name=${user.username || 'U'}&background=262626&color=fff&bold=true&size=150`;
    };

    const [previewUrl, setPreviewUrl] = useState(getAvatar(initialData));
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    // Efecto para actualizar los estados de los campos del formulario y URLs de vista previa cuando los datos iniciales cambian,
    // asegurando que el formulario se sincronicen con los datos del usuario activo
    useEffect(() => {
        if (initialData && initialData.id) {
            setDisplayName(initialData.display_name || "");
            setDateOfBirth(initialData.date_of_birth ? initialData.date_of_birth.split('T')[0] : "");
            setIsPrivate(initialData.is_private || false);
            setPreviewUrl(getAvatar(initialData));
            setBusinessSlogan(initialData.business_slogan || '');
            setPreviewBannerUrl(initialData.banner_picture || '');
        }
    }, [initialData?.id]);

    // Función para manejar el cambio en el campo de selección de imagen de avatar, leyendo el archivo seleccionado y configurando la imagen para recorte
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setCropType('avatar');
            setCropImageSrc(reader.result);
        };
    };

    // Función para manejar el cambio en el campo de selección de imagen de banner, leyendo el archivo seleccionado y configurando la imagen para recorte
    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setCropType('banner');
            setCropImageSrc(reader.result);
        };
    };

    // Función para manejar la finalización del recorte de la imagen, actualizando el archivo de imagen correspondiente (avatar o banner) y 
    // configurando la URL de vista previa para mostrar la imagen recortada
    const handleCropComplete = (croppedFile) => {
        if (cropType === 'avatar') {
            setImageFile(croppedFile);
            setPreviewUrl(URL.createObjectURL(croppedFile));
        } else if (cropType === 'banner') {
            setBannerFile(croppedFile);
            setPreviewBannerUrl(URL.createObjectURL(croppedFile));
        }
        setCropImageSrc(null);
        setCropType(null);
    };

    // Función para manejar el envío del formulario de perfil, enviando los datos a la API para actualizar el perfil del usuario y 
    // manejando el estado de carga y errores según corresponda
    const submitProfile = async (onSuccessCallback) => {
        setLoading(true);
        const formData = new FormData();
        if (displayName) formData.append('display_name', displayName);
        if (dateOfBirth) formData.append('date_of_birth', dateOfBirth);
        if (imageFile) formData.append('profile_picture', imageFile);
        formData.append('is_private', isPrivate ? 'true' : 'false');
        formData.append('business_slogan', businessSlogan);
        if (bannerFile) {
            formData.append('banner_picture', bannerFile);
        }

        try {
            const data = await fetchAPI('/users/update', { method: 'POST', body: formData });
            if (data.success) {
                showToast('Perfil actualizado.', 'success');
                if (onSuccessCallback) onSuccessCallback(data.user);
            }
        } catch (err) {
            showToast(ERRORS.SERVER_500, 'error');
        } finally {
            setLoading(false);
        }
    };

    return {
        displayName, setDisplayName, dateOfBirth, setDateOfBirth,
        previewUrl, handleImageChange, isPrivate, setIsPrivate,
        loading, submitProfile, businessSlogan, setBusinessSlogan,
        previewBannerUrl, handleBannerChange,
        cropImageSrc, setCropImageSrc, handleCropComplete, cropType 
    };
};