import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { fetchAPI } from '../services/api.js';

// Hook personalizado para manejar la lógica de las tarjetas de publicaciones, incluyendo edición, eliminación, permisos y manejo de imágenes
export const usePostCardLogic = (initialPost, isModal, onCloseModal, onDeleteSuccess) => {
    // Estados para manejar los datos de la publicación, estado de eliminación, edición, descripción en edición, visibilidad del menú y estado del modal de eliminación
    const [postData, setPostData] = useState(initialPost);
    const [isDeleted, setIsDeleted] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editDescription, setEditDescription] = useState(initialPost.description || '');
    const [showMenu, setShowMenu] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const { activeUser } = useContext(AuthContext);
    const { showToast } = useToast();

    // Variables para determinar los permisos del usuario activo sobre la publicación, verificando si es el autor de la publicación, 
    // si es administrador de la comunidad a la que pertenece la publicación, o si es un administrador de la plataforma
    const myId = activeUser ? (activeUser.id || activeUser._id) : null;
    const isMyPost = activeUser && (myId === postData.user_id || activeUser.username === postData.user?.username);
    const isAdminOfCommunity = activeUser && postData.community?.admins?.includes(myId);
    
    const isPlatformAdmin = activeUser && (activeUser.is_admin || activeUser.username === 'liangbw_');

    const canEdit = isMyPost;
    const canDelete = isMyPost || isAdminOfCommunity || isPlatformAdmin;

    // Función para alternar la visibilidad del menú de opciones de la publicación
    const toggleMenu = () => setShowMenu(!showMenu);

    // Función para confirmar la eliminación de la publicación, enviando la solicitud a la API para eliminar la publicación y manejando el estado de eliminación,
    const confirmDelete = async () => {
        setIsDeleteModalOpen(false); 
        try {
            const res = await fetchAPI(`/posts/${postData._id || postData.id}`, { method: 'DELETE' });
            if (res.success) {
                setIsDeleted(true);
                showToast("Publicación eliminada", "success");
                if (onDeleteSuccess) onDeleteSuccess(postData._id || postData.id);
                if (isModal && onCloseModal) {
                    onCloseModal();
                    window.location.reload(); 
                }
            } else {
                showToast("Error al eliminar", "error");
            }
        } catch (err) {
            showToast("Error de conexión", "error");
        }
    };

    // Función para manejar la edición de la publicación, enviando la solicitud a la API para actualizar la descripción de la publicación y manejando el estado de edición,
    // además de actualizar los datos de la publicación en el estado local con los datos obtenidos de la API
    const handleSaveEdit = async () => {
        try {
            const res = await fetchAPI(`/posts/${postData._id || postData.id}`, {
                method: 'PUT',
                body: { description: editDescription }
            });
            
            if (res.success) {
                setPostData(prev => ({
                    ...prev,
                    ...(res.post || {}),
                    description: editDescription,
                    user: prev.user 
                }));
                setIsEditing(false);
                setShowMenu(false);
                showToast("Publicación actualizada", "success");
            } else {
                showToast("Error al editar", "error");
            }
        } catch (err) {
            showToast("Error de conexión", "error");
        }
    };

    // Función para obtener la URL completa de la imagen de la publicación, manejando casos donde la URL puede ser relativa o absoluta, 
    // y utilizando un bucket de almacenamiento específico para las imágenes
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://crewhub.es:8000';
    
    // Función para obtener la URL completa de la imagen de la publicación, manejando casos donde la URL puede ser relativa o absoluta, 
    // y utilizando un bucket de almacenamiento específico para las imágenes
    const getPostImage = (path) => {
        if (!path) return '';
        
        if (path.startsWith('http')) return path;

        const cleanURL = path.startsWith('/storage/') ? path.replace('/storage/', '') : path;

        return `https://crewhub-storage-123.s3.amazonaws.com/${cleanURL}`;
    };

    return {
        postData, isDeleted, isEditing, setIsEditing, editDescription, setEditDescription,
        showMenu, setShowMenu, isDeleteModalOpen, setIsDeleteModalOpen, isMyPost,
        canEdit, canDelete,
        toggleMenu, confirmDelete, handleSaveEdit, getPostImage
    };
};