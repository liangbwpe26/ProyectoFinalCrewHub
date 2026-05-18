import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { fetchAPI } from '../services/api.js';

export const usePostCardLogic = (initialPost, isModal, onCloseModal, onDeleteSuccess) => {
    const [postData, setPostData] = useState(initialPost);
    const [isDeleted, setIsDeleted] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editDescription, setEditDescription] = useState(initialPost.description || '');
    const [showMenu, setShowMenu] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const { token, activeUser } = useContext(AuthContext);
    const { showToast } = useToast();

    // Verificamos si el usuario actual es el dueño del post para mostrar los 3 puntos
    const isMyPost = activeUser && (activeUser.id === postData.user_id || activeUser.username === postData.user?.username);

    const toggleMenu = () => setShowMenu(!showMenu);

    const confirmDelete = async () => {
        setIsDeleteModalOpen(false); 
        try {
            const res = await fetchAPI(`/posts/${postData._id || postData.id}`, { method: 'DELETE' }, token);
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

    const handleSaveEdit = async () => {
        try {
            const res = await fetchAPI(`/posts/${postData._id || postData.id}`, {
                method: 'PUT',
                body: { description: editDescription }
            }, token);
            
            if (res.success) {
                setPostData(prev => ({
                    ...prev,
                    ...(res.post || {}),
                    description: editDescription,
                    user: prev.user // Protegemos el objeto usuario de ser sobreescrito
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

    const getPostImage = (path) => path?.startsWith("http") ? path : `http://127.0.0.1:8000${path}`;

    return {
        postData,
        isDeleted,
        isEditing, setIsEditing,
        editDescription, setEditDescription,
        showMenu, setShowMenu,
        isDeleteModalOpen, setIsDeleteModalOpen,
        isMyPost,
        toggleMenu,
        confirmDelete,
        handleSaveEdit,
        getPostImage
    };
};