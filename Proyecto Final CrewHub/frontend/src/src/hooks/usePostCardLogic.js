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
    
    const { activeUser } = useContext(AuthContext);
    const { showToast } = useToast();

    // LÓGICA DE PERMISOS BLINDADA
    const myId = activeUser ? (activeUser.id || activeUser._id) : null;
    const isMyPost = activeUser && (myId === postData.user_id || activeUser.username === postData.user?.username);
    const isAdminOfCommunity = activeUser && postData.community?.admins?.includes(myId);
    
    const isPlatformAdmin = activeUser && (activeUser.is_admin || activeUser.username === 'liangbw_');

    const canEdit = isMyPost;
    const canDelete = isMyPost || isAdminOfCommunity || isPlatformAdmin;

    const toggleMenu = () => setShowMenu(!showMenu);

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

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://crewhub.es:8000';
    
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