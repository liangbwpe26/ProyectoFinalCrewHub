import { useState, useEffect, useContext } from 'react';
import { fetchAPI } from '../services/api.js';
import { AuthContext } from '../contexts/AuthContext.jsx';

export const useCommunity = (slug) => {
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

    // Ahora loadPosts acepta un tag opcional
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

    useEffect(() => {
        if (slug) loadCommunity();
    }, [slug]);

    const loadPendingPosts = async () => {
        if (!community) return;
        const communityId = community._id || community.id;
        try {
            const data = await fetchAPI(`/communities/${communityId}/pending-posts`);
            if (data.success) setPendingPosts(data.posts);
        } catch (err) {}
    };

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

    return { 
        community, loading, error, toggleMembership, activeUser,
        posts, setPosts, pendingPosts, loadingPosts, loadPendingPosts, loadPosts, moderatePost,
        membersList, loadingMembers, loadMembers, kickMember, promoteMember,
        uploadCommunityStory, uploadingStory,
        updateSettings, uploadBanner, uploadingBanner, uploadAvatar, deleteCommunity
    };
};