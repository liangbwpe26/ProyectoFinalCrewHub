import { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { ERRORS } from '../utils/errorMessages.js';

export const useProfileForm = (initialData) => {
    const [displayName, setDisplayName] = useState(initialData?.display_name || "");
    const [dateOfBirth, setDateOfBirth] = useState(initialData?.date_of_birth ? initialData.date_of_birth.split('T')[0] : "");
    const [imageFile, setImageFile] = useState(null);
    const [isPrivate, setIsPrivate] = useState(initialData?.is_private || false);
    const [businessSlogan, setBusinessSlogan] = useState(initialData?.business_slogan || '');
    const [bannerFile, setBannerFile] = useState(null);
    const [previewBannerUrl, setPreviewBannerUrl] = useState(initialData?.banner_picture || '');

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

    const getAvatar = (user) => {
        if (!user) return `https://ui-avatars.com/api/?name=U&background=262626&color=fff&bold=true&size=150`;
        return user.profile_picture
            ? (user.profile_picture.startsWith('http') ? user.profile_picture : `${BACKEND_URL}${user.profile_picture}`)
            : `https://ui-avatars.com/api/?name=${user.username || 'U'}&background=262626&color=fff&bold=true&size=150`;
    };

    const [previewUrl, setPreviewUrl] = useState(getAvatar(initialData));
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (initialData && initialData.id) {
            setDisplayName(initialData.display_name || "");
            setDateOfBirth(initialData.date_of_birth ? initialData.date_of_birth.split('T')[0] : "");
            setIsPrivate(initialData.is_private || false);
            setPreviewUrl(getAvatar(initialData));
        }
    }, [initialData?.id]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBannerFile(file);
            setPreviewBannerUrl(URL.createObjectURL(file));
        }
    };

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
    };
};