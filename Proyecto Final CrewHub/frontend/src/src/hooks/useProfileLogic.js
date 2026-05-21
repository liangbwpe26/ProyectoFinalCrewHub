import { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { ERRORS } from '../utils/errorMessages.js';

export const useProfileLogic = (username, token) => {
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);

    const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
    const [followModalType, setFollowModalType] = useState('followers');
    const [followUsers, setFollowUsers] = useState([]);
    const [followOffset, setFollowOffset] = useState(0);
    const [followHasMore, setFollowHasMore] = useState(true);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    const { showToast } = useToast();

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
                    showToast(ERRORS.USER_NOT_FOUND, 'error');
                }
            } catch (err) {
                setError("Error de conexión con el servidor.");
                showToast(ERRORS.SERVER_500, 'error');
            } finally {
                setLoading(false);
            }
        };

        if (token && username) fetchProfile();
    }, [username, token]);

    const toggleFollow = async () => {
        if (!profile) return;
        const currentStatus = profile.follow_status;
        
        const targetId = profile.user_id || profile._id || profile.id;
        
        console.log("DEBUG BOTÓN PERFIL -> ID enviado:", targetId, "| Objeto completo:", profile);

        const endpoint = (currentStatus === 'none') ? `/follow/${targetId}` : `/unfollow/${targetId}`;
        const method = (currentStatus === 'none') ? 'POST' : 'DELETE';

        try {
            const data = await fetchAPI(endpoint, { method }, token);
            if (data.success) {
                const newStatus = (currentStatus === 'none') ? (data.status || 'accepted') : 'none';
                setProfile(prev => ({ ...prev, follow_status: newStatus }));
            } else {
                showToast(data.message || ERRORS.DEFAULT, 'error');
            }
        } catch (error) {
            showToast("Error al actualizar seguimiento.", 'error');
        }
    };

    const addNewPostToProfile = (newPost) => {
        setPosts(prev => [newPost, ...prev]);
        setIsModalOpen(false);
    };

    const loadFollowData = async (currentOffset = 0, type = followModalType) => {
        if (!profile) return;
        setIsFollowLoading(true);
        try {
            const endpoint = type === 'followers'
                ? `/users/${profile.username}/followers?offset=${currentOffset}`
                : `/users/${profile.username}/following?offset=${currentOffset}`;

            const data = await fetchAPI(endpoint, {}, token);

            if (data.success) {
                if (currentOffset === 0) setFollowUsers(data.users);
                else setFollowUsers(prev => [...prev, ...data.users]);
                
                setFollowHasMore(data.hasMore);
                setFollowOffset(currentOffset);
            } else {
                showToast(data.message || "Error al cargar la lista de usuarios.", 'error');
            }
        } catch (error) {
            showToast(ERRORS.SERVER_500, 'error');
        } finally {
            setIsFollowLoading(false);
        }
    };

    const openFollowModal = (type) => {
        setFollowModalType(type);
        setFollowUsers([]);
        setFollowOffset(0);
        setFollowHasMore(true);
        setIsFollowModalOpen(true);
        loadFollowData(0, type);
    };

    const closeFollowModal = () => setIsFollowModalOpen(false);

    const handleFollowModalScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 50 && !isFollowLoading && followHasMore) {
            loadFollowData(followOffset + 10, followModalType);
        }
    };

    const toggleModalUserFollow = async (targetUserId, currentStatus) => {
        try {
            console.log("DEBUG MODAL SEGUIDORES -> ID enviado:", targetUserId);

            const isUnfollowing = currentStatus === 'accepted' || currentStatus === 'pending';
            const endpoint = isUnfollowing ? `/unfollow/${targetUserId}` : `/follow/${targetUserId}`;
            const httpMethod = isUnfollowing ? 'DELETE' : 'POST';
            
            const data = await fetchAPI(endpoint, { method: httpMethod }, token);

            if (data.success) {
                setFollowUsers(prev => prev.map(user => {
                    const id = user.user_id || user._id || user.id;
                    if (id === targetUserId) {
                        return { ...user, follow_status: isUnfollowing ? 'none' : data.status };
                    }
                    return user;
                }));
            } else {
                showToast(data.message || ERRORS.DEFAULT, 'error');
            }
        } catch (error) {
            showToast("Error al cambiar estado de seguimiento.", 'error');
        }
    };

    return {
        profile, loading, error, toggleFollow,
        posts, isModalOpen, setIsModalOpen, addNewPostToProfile,
        selectedPost, setSelectedPost, isFollowModalOpen, followModalType,
        followUsers, isFollowLoading, followHasMore,
        openFollowModal, closeFollowModal, handleFollowModalScroll, toggleModalUserFollow,
    };
};