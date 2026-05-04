import { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api.js';

export const useProfileLogic = (username, token) => {
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);

    // NUEVO: Estado para el modal de Ver Publicación
    const [selectedPost, setSelectedPost] = useState(null);

    const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
    const [followModalType, setFollowModalType] = useState('followers');
    const [followUsers, setFollowUsers] = useState([]);
    const [followOffset, setFollowOffset] = useState(0);
    const [followHasMore, setFollowHasMore] = useState(true);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchAPI(`/profile/${username}`, {}, token);
                if (data.success) {
                    const profileData = data.profile;
                    if (!profileData.follow_status) profileData.follow_status = 'none';
                    setProfile(profileData);
                    setPosts(profileData.posts || []);
                } else {
                    setError("Usuario no encontrado.");
                }
            } catch (err) {
                setError("Error de conexión con el servidor.");
            } finally {
                setLoading(false);
            }
        };

        if (token && username) {
            fetchProfile();
        }
    }, [username, token]);

    // NUEVA FUNCIÓN: Para seguir/dejar de seguir desde el perfil
    const toggleFollow = async () => {
        if (!profile) return;
        const currentStatus = profile.follow_status;
        const targetId = profile.id || profile._id;
        const endpoint = (currentStatus === 'none') ? `/follow/${targetId}` : `/unfollow/${targetId}`;
        const method = (currentStatus === 'none') ? 'POST' : 'DELETE';

        try {
            const data = await fetchAPI(endpoint, { method }, token);
            if (data.success) {
                const newStatus = (currentStatus === 'none') ? (data.status || 'accepted') : 'none';
                setProfile(prev => ({ ...prev, follow_status: newStatus }));
            }
        } catch (error) {
            console.error("Error al actualizar seguimiento:", error);
        }
    };

    // NUEVO: Función para inyectar la nueva foto en la cuadrícula al instante
    const addNewPostToProfile = (newPost) => {
        setPosts(prev => [newPost, ...prev]);
        setIsModalOpen(false);
    };

    // FUNCIÓN PARA CARGAR LOS DATOS (De 10 en 10)
    const loadFollowData = async (currentOffset = 0, type = followModalType) => {
        if (!profile) return;
        setIsFollowLoading(true);
        try {
            const endpoint = type === 'followers'
                ? `/users/${profile.username}/followers?offset=${currentOffset}`
                : `/users/${profile.username}/following?offset=${currentOffset}`;

            const data = await fetchAPI(endpoint, {}, token);

            if (data.success) {
                if (currentOffset === 0) {
                    setFollowUsers(data.users);
                } else {
                    setFollowUsers(prev => [...prev, ...data.users]);
                }
                setFollowHasMore(data.hasMore);
                setFollowOffset(currentOffset);
            }
        } catch (error) {
            console.error("Error cargando lista de usuarios", error);
        } finally {
            setIsFollowLoading(false);
        }
    };

    // ABRIR Y CERRAR EL MODAL
    const openFollowModal = (type) => {
        setFollowModalType(type);
        setFollowUsers([]);
        setFollowOffset(0);
        setFollowHasMore(true);
        setIsFollowModalOpen(true);
        loadFollowData(0, type);
    };

    const closeFollowModal = () => setIsFollowModalOpen(false);

    // EL SENSOR DE SCROLL INFINITO
    const handleFollowModalScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        // Si estamos a 50px de llegar al fondo, y hay más por cargar...
        if (scrollHeight - scrollTop <= clientHeight + 50 && !isFollowLoading && followHasMore) {
            // OJO: Le pasamos el type para que sepa exactamente qué está cargando
            loadFollowData(followOffset + 10, followModalType);
        }
    };

    const toggleModalUserFollow = async (targetUserId, currentStatus) => {
        try {
            const isUnfollowing = currentStatus === 'accepted' || currentStatus === 'pending';
            const endpoint = isUnfollowing ? `/unfollow/${targetUserId}` : `/follow/${targetUserId}`;
            
            // 👉 EL CAMBIO CLAVE: Elegimos el método correcto según la acción
            const httpMethod = isUnfollowing ? 'DELETE' : 'POST';
            
            const data = await fetchAPI(endpoint, { method: httpMethod }, token);

            if (data.success) {
                // Actualizamos el estado de la lista al instante
                setFollowUsers(prev => prev.map(user => {
                    const id = user._id || user.id;
                    if (id === targetUserId) {
                        return { ...user, follow_status: isUnfollowing ? 'none' : data.status };
                    }
                    return user;
                }));
            }
        } catch (error) {
            console.error("Error al cambiar estado de seguimiento en modal", error);
        }
    };

    return {
        profile, loading, error, toggleFollow,
        posts, isModalOpen, setIsModalOpen, addNewPostToProfile,
        selectedPost, setSelectedPost, isFollowModalOpen,
        followModalType,
        followUsers,
        isFollowLoading,
        followHasMore,
        openFollowModal,
        closeFollowModal,
        handleFollowModalScroll,
        toggleModalUserFollow,
    };
};