import { useState, useEffect, useCallback, useContext } from 'react';
import { fetchAPI } from '../services/api.js';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';

export const useProfileLogic = (username, isMyProfile) => {
    const { activeUser } = useContext(AuthContext);
    const { showToast } = useToast();

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isOptionsOpen, setIsOptionsOpen] = useState(false);

    const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
    const [followModalType, setFollowModalType] = useState('followers');
    const [followUsers, setFollowUsers] = useState([]);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const [followPage, setFollowPage] = useState(1);
    const [followHasMore, setFollowHasMore] = useState(true);

    const [activeTab, setActiveTab] = useState('posts');
    const [savedPosts, setSavedPosts] = useState([]);
    const [savedDrops, setSavedDrops] = useState([]);
    const [loadingSaved, setLoadingSaved] = useState(false);

    const [repostedPosts, setRepostedPosts] = useState([]);
    const [loadingReposts, setLoadingReposts] = useState(false);

    const [selectedDropId, setSelectedDropId] = useState(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);


    useEffect(() => {
        if (activeTab === 'saved' && savedPosts.length === 0 && savedDrops.length === 0 && isMyProfile) {
            const fetchSaved = async () => {
                setLoadingSaved(true);
                try {
                    const [postsData, dropsData] = await Promise.all([
                        fetchAPI('/saved-posts'),
                        fetchAPI('/saved-drops').catch(() => ({ success: true, drops: [] }))
                    ]);
                    if (postsData.success) setSavedPosts(postsData.posts);
                    if (dropsData.success) setSavedDrops(dropsData.drops || []);
                } catch (error) { } finally {
                    setLoadingSaved(false);
                }
            };
            fetchSaved();
        }
    }, [activeTab, savedPosts.length, savedDrops.length, isMyProfile]);

    useEffect(() => {
        if (activeTab === 'reposts' && repostedPosts.length === 0) {
            const fetchReposts = async () => {
                setLoadingReposts(true);
                try {
                    const [postsData, dropsData] = await Promise.all([
                        fetchAPI(`/users/${username}/reposts`),
                        fetchAPI(`/users/${username}/reposted-drops`).catch(() => ({ success: true, drops: [] }))
                    ]);

                    let combinedReposts = [];
                    if (postsData.success) combinedReposts = [...combinedReposts, ...(postsData.posts || [])];
                    if (dropsData.success) combinedReposts = [...combinedReposts, ...(dropsData.drops || [])];

                    combinedReposts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    setRepostedPosts(combinedReposts);
                } catch (error) { } finally {
                    setLoadingReposts(false);
                }
            };
            fetchReposts();
        }
    }, [activeTab, repostedPosts.length, username]);

    const loadProfileData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAPI(`/users/${username}`);
            if (data.success) {
                setProfile(data.profile);
                setPosts(data.posts || []);
            } else {
                setError(data.message || 'Usuario no encontrado');
            }
        } catch (err) {
            setError('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    }, [username]);

    useEffect(() => {
        if (username) {
            loadProfileData();
        }
    }, [username, loadProfileData]);

    const toggleFollow = async () => {
        if (!profile || profile.blocked_by_me || profile.blocked_by_them) return;

        try {
            const userId = profile._id || profile.id;

            const data = await fetchAPI(`/follow/${userId}`, { method: 'POST' });

            if (data.success) {
                setProfile(prev => ({
                    ...prev,
                    follow_status: data.status,
                    followers_count: data.status === 'accepted' ? prev.followers_count + 1 :
                        (prev.follow_status === 'accepted' ? prev.followers_count - 1 : prev.followers_count)
                }));
            }
        } catch (error) { }
    };

    const handleBlockUser = async () => {
        setIsOptionsOpen(false);
        try {
            const data = await fetchAPI(`/users/${profile.username}/block`, { method: 'POST' });
            if (data.success) {
                showToast(data.is_blocked ? "Usuario bloqueado" : "Usuario desbloqueado", "success");
                loadProfileData();
            }
        } catch (error) {
            showToast("Error al procesar la solicitud", "error");
        }
    };

    const addNewPostToProfile = (newPost) => {
        setPosts(prev => [newPost, ...prev]);
        setIsModalOpen(false);
    };

    const openFollowModal = (type) => {
        if (profile.blocked_by_me || profile.blocked_by_them) return;
        setFollowModalType(type);
        setFollowUsers([]);
        setFollowPage(1);
        setFollowHasMore(true);
        setIsFollowModalOpen(true);
        fetchFollowData(type, 1);
    };

    const closeFollowModal = () => {
        setIsFollowModalOpen(false);
        setFollowUsers([]);
    };

    const fetchFollowData = async (type, page) => {
        if (isFollowLoading || !followHasMore) return;
        setIsFollowLoading(true);
        try {
            const endpoint = type === 'followers' ? `/users/${username}/followers?page=${page}` : `/users/${username}/following?page=${page}`;
            const data = await fetchAPI(endpoint);
            if (data.success) {
                setFollowUsers(prev => page === 1 ? data.users : [...prev, ...data.users]);
                setFollowHasMore(data.has_more);
                setFollowPage(page);
            }
        } catch (error) { } finally {
            setIsFollowLoading(false);
        }
    };

    const handleFollowModalScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 50 && !isFollowLoading && followHasMore) {
            fetchFollowData(followModalType, followPage + 1);
        }
    };

    const toggleModalUserFollow = async (userId, currentStatus) => {
        try {
            const data = await fetchAPI(`/follow/${userId}`, { method: 'POST' });
            if (data.success) {
                setFollowUsers(prev => prev.map(u => {
                    const id = u.user_id || u._id || u.id;
                    if (id === userId) return { ...u, follow_status: data.status };
                    return u;
                }));
            }
        } catch (error) { }
    };

    return {
        profile, loading, error, toggleFollow, handleBlockUser, isOptionsOpen, setIsOptionsOpen,
        posts, isModalOpen, setIsModalOpen, addNewPostToProfile,
        selectedPost, setSelectedPost, isFollowModalOpen,
        followModalType, followUsers, isFollowLoading, followHasMore,
        openFollowModal, closeFollowModal, handleFollowModalScroll,
        toggleModalUserFollow, activeTab, setActiveTab,
        savedPosts, savedDrops, loadingSaved,
        repostedPosts, loadingReposts,
        selectedDropId, setSelectedDropId,
        isReportModalOpen, setIsReportModalOpen, isMetricsModalOpen, setIsMetricsModalOpen
    };
};