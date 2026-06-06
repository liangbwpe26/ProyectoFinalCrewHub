import { useState, useEffect, useCallback, useContext } from 'react';
import { fetchAPI } from '../services/api.js';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';

export const useProfileLogic = (username, isMyProfile) => {
    // Estados para manejar los datos del perfil, posts, estado de carga, errores, modales de opciones y seguimiento, 
    // paginación de seguidores/following, pestañas activas para mostrar posts guardados y reposts, y modales para reportar y ver métricas
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

    // Efecto para cargar los posts guardados y reposts del usuario cuando se cambia la pestaña activa, asegurando que los datos 
    // se carguen solo cuando sea necesario y evitando recargas innecesarias
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

    // Efecto para cargar los reposts del usuario cuando se cambia a la pestaña de reposts, asegurando que los datos se carguen solo cuando sea necesario 
    // y evitando recargas innecesarias
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

    // Función para cargar los datos del perfil desde la API, incluyendo información del usuario y sus posts, manejando el estado de carga y errores según corresponda
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

    // Efecto para cargar los datos del perfil al montar el componente o cuando cambie el nombre de usuario, asegurando que los datos se actualicen 
    // correctamente y manejando el estado de carga y errores
    useEffect(() => {
        if (username) {
            loadProfileData();
        }
    }, [username, loadProfileData]);

    // Función para manejar el toggle de seguir/dejar de seguir al usuario del perfil, enviando la solicitud a la API y 
    // actualizando el estado local del perfil con el nuevo estado de seguimiento
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

    // Función para manejar el bloqueo/desbloqueo del usuario del perfil, enviando la solicitud a la API y actualizando el 
    // estado local del perfil para reflejar el nuevo estado de bloqueo
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

    // Función para agregar un nuevo post al inicio de la lista de posts del perfil, actualizando el estado local de posts 
    // con el nuevo post recibido y cerrando el modal de creación de post
    const addNewPostToProfile = (newPost) => {
        setPosts(prev => [newPost, ...prev]);
        setIsModalOpen(false);
    };

    // Función para abrir el modal de seguidores o siguiendo, configurando el tipo de modal, reseteando los datos de usuarios y paginación, 
    // y cargando los datos correspondientes desde la API
    const openFollowModal = (type) => {
        if (profile.blocked_by_me || profile.blocked_by_them) return;
        setFollowModalType(type);
        setFollowUsers([]);
        setFollowPage(1);
        setFollowHasMore(true);
        setIsFollowModalOpen(true);
        
        fetchFollowData(type, 1, true);
    };

    // Función para cerrar el modal de seguidores o siguiendo, reseteando los datos de usuarios y cerrando el modal
    const closeFollowModal = () => {
        setIsFollowModalOpen(false);
        setFollowUsers([]);
    };

    // Función para manejar la actualización de la categoría de negocio, enviando la solicitud a la API con la nueva categoría y 
    // actualizando el estado del usuario activo y mostrando mensajes de toast según corresponda
    const fetchFollowData = async (type, page, forceRefresh = false) => {
        if (isFollowLoading || (!forceRefresh && !followHasMore)) return;
        
        setIsFollowLoading(true);
        try {
            const offset = (page - 1) * 10;
            const endpoint = type === 'followers' 
                ? `/users/${username}/followers?offset=${offset}` 
                : `/users/${username}/following?offset=${offset}`;
                
            const data = await fetchAPI(endpoint);
            if (data.success) {
                setFollowUsers(prev => forceRefresh ? data.users : [...prev, ...data.users]);
                setFollowHasMore(data.hasMore); 
                setFollowPage(page);
            }
        } catch (error) { } finally {
            setIsFollowLoading(false);
        }
    };

    // Función para manejar el evento de scroll en el modal de seguidores o siguiendo, verificando si se ha llegado al final de la lista y si hay más usuarios para cargar,
    // en cuyo caso se llama a la función de carga para obtener la siguiente página de datos
    const handleFollowModalScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 50 && !isFollowLoading && followHasMore) {
            fetchFollowData(followModalType, followPage + 1);
        }
    };

    // Función para marcar todas las notificaciones de seguimiento como leídas, enviando la solicitud a la API y actualizando 
    // el estado local de solicitudes de seguimiento y conteo de notificaciones no leídas
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