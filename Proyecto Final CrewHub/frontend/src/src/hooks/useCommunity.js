// Importaciones necesarias para el hook personalizado de una comunidad específica
import { useState, useEffect, useContext } from 'react';
import { fetchAPI } from '../services/api.js';
import { AuthContext } from '../contexts/AuthContext.jsx';

// Hook personalizado para manejar la lógica de una comunidad específica, incluyendo carga de datos, manejo de membresía, moderación de posts, etc.
export const useCommunity = (slug) => {
    // Obtener el usuario activo desde el contexto de autenticación
    const { activeUser } = useContext(AuthContext);
    const [community, setCommunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [posts, setPosts] = useState([]);
    const [pendingPosts, setPendingPosts] = useState([]);
    const [loadingPosts, setLoadingPosts] = useState(false);
    const [membersList, setMembersList] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [uploadingStory, setUploadingStory] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);

    // Función para cargar los posts de la comunidad, con opción de filtrar por etiqueta
    const loadPosts = async (communityId, tag = '') => {
        setLoadingPosts(true);
        try {
            const endpoint = tag 
                ? `/posts?community_id=${communityId}&community_tag=${encodeURIComponent(tag)}`
                : `/posts?community_id=${communityId}`;
            const data = await fetchAPI(endpoint);
            if (data.success) setPosts(data.posts);
        } catch (err) {
            console.error("Error cargando posts", err);
        } finally {
            setLoadingPosts(false);
        }
    };

    // Función para cargar los datos de la comunidad desde la API, incluyendo información básica y posts asociados
    const loadCommunity = async () => {
        setLoading(true);
        try {
            const data = await fetchAPI(`/communities/${slug}`);
            if (data.success) {
                setCommunity(data.community);
                loadPosts(data.community._id || data.community.id);
            } else {
                setError('Comunidad no encontrada');
            }
        } catch (err) {
            setError('Error al cargar la comunidad');
        } finally {
            setLoading(false);
        }
    };

    // Cargar los datos de la comunidad al montar el componente o cuando cambie el slug
    useEffect(() => {
        if (slug) loadCommunity();
    }, [slug]);

    // Función para cargar los posts pendientes de moderación, solo para administradores de la comunidad
    const loadPendingPosts = async () => {
        if (!community) return;
        const communityId = community._id || community.id;
        try {
            const data = await fetchAPI(`/communities/${communityId}/pending-posts`);
            if (data.success) setPendingPosts(data.posts);
        } catch (err) {}
    };

    // Función para aprobar o rechazar un post pendiente, actualizando el estado local de posts y posts pendientes según corresponda
    const moderatePost = async (postId, action) => {
        try {
            const data = await fetchAPI(`/posts/${postId}/moderate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });

            if (data.success) {
                const moderatedPost = pendingPosts.find(p => (p._id || p.id) === postId);
                setPendingPosts(prev => prev.filter(p => (p._id || p.id) !== postId));
                if (action === 'approve' && moderatedPost) {
                    setPosts(prev => [moderatedPost, ...prev]);
                }
            }
        } catch (err) {}
    };

    // Función para unirse o salir de la comunidad, actualizando el estado local de la comunidad y su lista de miembros según corresponda
    const toggleMembership = async () => {
        if (!community || !activeUser) return;
        try {
            const communityId = community._id || community.id;
            const data = await fetchAPI(`/communities/${communityId}/membership`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (data.success) {
                const userId = activeUser.id || activeUser._id;
                let updatedMembers = [...(community.members || [])];
                if (data.status === 'joined') updatedMembers.push(userId);
                else updatedMembers = updatedMembers.filter(id => id !== userId);
                setCommunity({ ...community, members: updatedMembers });
            }
        } catch (err) {}
    };

    // Función para cargar la lista de miembros de la comunidad, con opción de búsqueda por nombre de usuario
    const loadMembers = async (searchQuery = '') => {
        if (!community) return;
        setLoadingMembers(true);
        try {
            const communityId = community._id || community.id;
            const data = await fetchAPI(`/communities/${communityId}/members?q=${searchQuery}`);
            if (data.success) setMembersList(data.members);
        } catch (err) {} finally {
            setLoadingMembers(false);
        }
    };

    // Función para expulsar a un miembro de la comunidad, actualizando el estado local de la lista de miembros y la información de la comunidad según corresponda
    const kickMember = async (userId) => {
        if (!community) return;
        try {
            const communityId = community._id || community.id;
            const data = await fetchAPI(`/communities/${communityId}/members/${userId}/kick`, { method: 'POST' });
            if (data.success) {
                setMembersList(prev => prev.filter(m => (m._id || m.id) !== userId));
                setCommunity(prev => ({...prev, members: prev.members.filter(id => id !== userId)}));
            }
        } catch (err) {}
    };

    // Función para promover a un miembro a administrador de la comunidad, actualizando el estado local de la lista de miembros según corresponda
    const promoteMember = async (userId) => {
        if (!community) return;
        try {
            const communityId = community._id || community.id;
            const data = await fetchAPI(`/communities/${communityId}/members/${userId}/promote`, { method: 'POST' });
            if (data.success) {
                setMembersList(prev => prev.map(m => (m._id || m.id) === userId ? { ...m, is_admin: true } : m));
            }
        } catch (err) {}
    };

    // Función para subir una historia a la comunidad, manejando el estado de carga y retornando el resultado de la operación
    const uploadCommunityStory = async (file) => {
        if (!community || !file) return { success: false };
        setUploadingStory(true);
        const formData = new FormData();
        formData.append('media', file);
        formData.append('community_id', community._id || community.id);
        
        try {
            const data = await fetchAPI('/stories', {
                method: 'POST',
                body: formData
            });
            return data;
        } catch (err) {
            return { success: false };
        } finally {
            setUploadingStory(false);
        }
    };

    // Función para actualizar la configuración de la comunidad, enviando los datos modificados a la API y actualizando el estado local de la comunidad según corresponda
    const updateSettings = async (settingsData) => {
        if (!community) return { success: false };
        try {
            const communityId = community._id || community.id;
            const data = await fetchAPI(`/communities/${communityId}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settingsData)
            });
            if (data.success) setCommunity(data.community);
            return data;
        } catch (err) {
            return { success: false };
        }
    };

    // Función para subir un nuevo banner para la comunidad, manejando el estado de carga y actualizando el estado local de la comunidad con la nueva ruta del banner si la operación es exitosa
    const uploadBanner = async (file) => {
        if (!community || !file) return { success: false };
        setUploadingBanner(true);
        const formData = new FormData();
        formData.append('banner', file);
        try {
            const communityId = community._id || community.id;
            const data = await fetchAPI(`/communities/${communityId}/banner`, {
                method: 'POST',
                body: formData
            });
            if (data.success) setCommunity(prev => ({ ...prev, banner_path: data.banner_path }));
            return data;
        } catch (err) {
            return { success: false };
        } finally {
            setUploadingBanner(false);
        }
    };

    // Función para subir un nuevo avatar para la comunidad, manejando el estado de carga y actualizando el estado local de la comunidad con la nueva ruta del avatar si la operación es exitosa
    const uploadAvatar = async (file) => {
        if (!community || !file) return { success: false };
        const formData = new FormData();
        formData.append('avatar', file);
        try {
            const communityId = community._id || community.id;
            const data = await fetchAPI(`/communities/${communityId}/avatar`, {
                method: 'POST',
                body: formData
            });
            if (data.success) setCommunity(prev => ({ ...prev, avatar_path: data.avatar_path }));
            return data;
        } catch (err) {
            return { success: false };
        }
    };

    // Función para eliminar la comunidad, enviando la solicitud a la API y retornando el resultado de la operación sin 
    // modificar el estado local, ya que se asume que el componente padre manejará la redirección o actualización de la lista de comunidades tras la eliminación
    const deleteCommunity = async () => {
        if (!community) return { success: false };
        try {
            const communityId = community._id || community.id;
            const data = await fetchAPI(`/communities/${communityId}`, {
                method: 'DELETE'
            });
            return data;
        } catch (err) {
            return { success: false };
        }
    };

    // Retornar los datos y funciones necesarias para manejar la lógica de la comunidad específica, 
    // incluyendo información de la comunidad, estado de carga, manejo de membresía, moderación de posts, gestión de miembros, etc.
    return { 
        community, loading, error, toggleMembership, activeUser,
        posts, setPosts, pendingPosts, loadingPosts, loadPendingPosts, loadPosts, moderatePost,
        membersList, loadingMembers, loadMembers, kickMember, promoteMember,
        uploadCommunityStory, uploadingStory,
        updateSettings, uploadBanner, uploadingBanner, uploadAvatar, deleteCommunity
    };
};