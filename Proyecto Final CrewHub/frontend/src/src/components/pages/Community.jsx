import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../structure/Layout.jsx';
import { useCommunity } from '../../hooks/useCommunity.js';
import PostCard from '../PostCard.jsx';
import CreatePost from '../CreatePost.jsx';
import StoryManager from '../StoryManager.jsx';

// Componente: Community
// Vista de una comunidad: feed, miembros y moderación.
const Community = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const {
        community, loading, error, toggleMembership, activeUser,
        posts, setPosts, pendingPosts, loadingPosts, loadPendingPosts, loadPosts, moderatePost,
        membersList, loadingMembers, loadMembers, kickMember, promoteMember,
        updateSettings, uploadBanner, uploadingBanner, uploadAvatar, deleteCommunity
    } = useCommunity(slug);

    const [activeTab, setActiveTab] = useState('feed');
    const [searchQuery, setSearchQuery] = useState('');
    const [alertMessage, setAlertMessage] = useState(null);
    const [activeTagFilter, setActiveTagFilter] = useState('');

    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editRules, setEditRules] = useState('');
    const [editTags, setEditTags] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const [selectedStoryFile, setSelectedStoryFile] = useState(null);

    const fileInputRef = useRef(null);
    const bannerInputRef = useRef(null);
    const avatarInputRef = useRef(null);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://crewhub.es:8000';

    const getAvatar = (user) => {
        if (user && user.profile_picture) return user.profile_picture.startsWith('http') ? user.profile_picture : `${BACKEND_URL}${user.profile_picture}`;
        return `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=262626&color=fff&bold=true`;
    };

    useEffect(() => {
        if (activeTab === 'pending') loadPendingPosts();
        if (activeTab === 'members') loadMembers(searchQuery);
        if (activeTab === 'settings' && community) {
            setEditName(community.name || '');
            setEditDescription(community.description || '');
            setEditRules(community.rules || '');
            setEditTags(community.tags ? community.tags.join(', ') : '');
        }
    }, [activeTab, community]);

    useEffect(() => {
        if (activeTab === 'members') {
            const delay = setTimeout(() => loadMembers(searchQuery), 500);
            return () => clearTimeout(delay);
        }
    }, [searchQuery]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedStoryFile(file);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleBannerChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const response = await uploadBanner(file);
            if (response && response.success) setAlertMessage({ title: 'Portada actualizada', text: 'El diseño de la comunidad ha cambiado.', type: 'success' });
            if (bannerInputRef.current) bannerInputRef.current.value = '';
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const response = await uploadAvatar(file);
            if (response && response.success) setAlertMessage({ title: 'Foto actualizada', text: 'La imagen de perfil ha cambiado.', type: 'success' });
            if (avatarInputRef.current) avatarInputRef.current.value = '';
        }
    };

    const handleSaveSettings = async () => {
        const response = await updateSettings({
            name: editName,
            description: editDescription,
            rules: editRules,
            tags: editTags
        });
        if (response && response.success) {
            setAlertMessage({ title: 'Ajustes guardados', text: 'La información del grupo ha sido actualizada.', type: 'success' });
        }
    };

    const handleDeleteCommunity = async () => {
        if (window.confirm("¿Estás completamente seguro de querer eliminar esta comunidad? Esta acción no se puede deshacer y se borrarán todas las publicaciones asociadas.")) {
            setIsDeleting(true);
            const response = await deleteCommunity();
            if (response && response.success) {
                navigate('/communities');
            } else {
                setIsDeleting(false);
                setAlertMessage({ title: 'Error', text: 'No se pudo eliminar la comunidad.', type: 'error' });
            }
        }
    };

    const handleTagFilter = (tag) => {
        const newTag = activeTagFilter === tag ? '' : tag;
        setActiveTagFilter(newTag);
        loadPosts(community._id || community.id, newTag);
    };

    if (loading || isDeleting) return <Layout><div className="w-full max-w-[600px] mx-auto pt-20 flex flex-col items-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-500 mb-4"></div><p className="text-gray-400 font-bold tracking-widest uppercase">{isDeleting ? 'Eliminando...' : 'Cargando...'}</p></div></Layout>;
    if (error || !community) return <Layout><div className="w-full max-w-[600px] mx-auto pt-20 text-center"><h2 className="text-white text-xl font-bold mb-4">Comunidad no encontrada</h2></div></Layout>;

    const currentUserId = activeUser?.id || activeUser?._id;
    const isMember = community.members?.includes(currentUserId);
    const isAdmin = community.admins?.includes(currentUserId);
    const isCreator = community.creator_id === currentUserId;

    const handlePostCreated = (newPost, status) => {
        if (status === 'approved') {
            if (!activeTagFilter || newPost.community_tag === activeTagFilter) setPosts([newPost, ...posts]);
        } else {
            setAlertMessage({ title: 'Enviado a revisión', text: 'Pendiente de aprobación.', type: 'info' });
        }
    };

    const bannerStyle = community.banner_path
        ? { backgroundImage: `url(${community.banner_path.startsWith('http') ? community.banner_path : BACKEND_URL + community.banner_path})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : {};

    return (
        <Layout>
            <div className="w-full max-w-[600px] mx-auto flex flex-col pb-12 px-2 md:px-0 relative z-10">

                {selectedStoryFile && (
                    <StoryManager
                        file={selectedStoryFile}
                        community={community}
                        onClose={(success) => {
                            setSelectedStoryFile(null);
                            if (success) {
                                setAlertMessage({ title: 'Historia en línea', text: 'Se ha publicado en la comunidad. Vuelve al inicio para verla.', type: 'success' });
                            }
                        }}
                    />
                )}

                <div className="mb-4 mt-2">
                    <Link to="/communities" className="text-gray-500 hover:text-white no-underline text-sm font-bold transition-colors flex items-center gap-2">
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
                        Volver a Comunidades
                    </Link>
                </div>

                <div className="bg-[#121212]/80 backdrop-blur-xl border border-[#262626] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col mb-6">
                    <div className="h-32 md:h-48 w-full relative bg-gradient-to-r from-[#0095f6] to-[#005bb5]" style={bannerStyle}>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent opacity-60"></div>
                        {uploadingBanner && <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center text-white font-bold text-sm">Subiendo...</div>}
                    </div>

                    <div className="px-5 md:px-8 pb-6 md:pb-8 relative">
                        <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-[#1a1a1a] border-[4px] border-[#121212] flex items-center justify-center text-3xl md:text-5xl font-black text-gray-400 absolute -top-10 md:-top-14 shadow-xl group overflow-hidden">
                            {community.avatar_path ? (
                                <img src={community.avatar_path.startsWith('http') ? community.avatar_path : `${BACKEND_URL}${community.avatar_path}`} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span>{community.name.charAt(0).toUpperCase()}</span>
                            )}

                            {isAdmin && (
                                <label className="absolute bottom-1 right-1 w-8 h-8 bg-gradient-to-r from-[#0095f6] to-[#0077c5] rounded-full border-2 border-[#121212] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg z-10" title="Subir historia a la comunidad">
                                    <span className="text-white font-bold text-sm leading-none mb-0.5">+</span>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />
                                </label>
                            )}
                        </div>

                        <div className="flex justify-end pt-3 md:pt-4">
                            {isCreator ? (
                                <span className="px-6 py-2 md:py-2.5 rounded-full font-bold text-xs md:text-sm bg-[#1a1a1a]/80 text-[#00ba7c] border border-[#00ba7c]/30 shadow-md flex items-center gap-2">
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                                    Creador
                                </span>
                            ) : (
                                <button onClick={toggleMembership} className={`px-6 py-2 md:py-2.5 rounded-full font-bold text-xs md:text-sm transition-all cursor-pointer shadow-md ${isMember ? 'bg-[#1a1a1a]/80 text-white border border-[#333] hover:bg-[#ff4d4d]/10 hover:text-[#ff4d4d] hover:border-[#ff4d4d]/30' : 'bg-gradient-to-r from-[#0095f6] to-[#0077c5] text-white border-none hover:scale-105 shadow-[0_0_15px_rgba(0,149,246,0.3)]'}`}>
                                    {isMember ? 'Salir del grupo' : 'Unirse al grupo'}
                                </button>
                            )}
                        </div>

                        <div className="mt-4 md:mt-6">
                            <h1 className="text-2xl md:text-4xl font-black text-white m-0 tracking-wide">{community.name}</h1>
                            <p className="text-gray-400 text-sm md:text-base mt-2 mb-4 leading-relaxed">{community.description}</p>

                            <div className="flex gap-3 items-center">
                                <div className="text-xs font-bold tracking-widest text-[#00ba7c] bg-[#00ba7c]/10 border border-[#00ba7c]/20 px-3 py-1 rounded-md uppercase">
                                    {community.members?.length || 0} Miembros
                                </div>
                                {isAdmin && <div className="bg-[#ff4d4d]/10 text-[#ff4d4d] px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase border border-[#ff4d4d]/20">Administrador</div>}
                            </div>
                        </div>
                    </div>
                </div>

                {isAdmin && (
                    <div className="flex w-full bg-[#121212]/80 backdrop-blur-xl border border-[#262626] rounded-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.5)] mb-6 flex-wrap">
                        <button onClick={() => setActiveTab('feed')} className={`flex-1 py-4 font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${activeTab === 'feed' ? 'bg-[#1a1a1a] text-white shadow-[inset_0_2px_0_0_#0095f6] border-none' : 'bg-transparent text-gray-500 border-none hover:bg-[#151515] hover:text-gray-300'}`}>Muro</button>
                        <button onClick={() => setActiveTab('pending')} className={`flex-1 py-4 font-bold uppercase text-xs tracking-wider transition-all cursor-pointer border-l border-[#262626] flex justify-center items-center gap-2 ${activeTab === 'pending' ? 'bg-[#1a1a1a] text-white shadow-[inset_0_2px_0_0_#ff4d4d] border-t-0 border-b-0' : 'bg-transparent text-gray-500 border-t-0 border-b-0 hover:bg-[#151515]'}`}>
                            Solicitudes {pendingPosts.length > 0 && <span className="bg-[#ff4d4d] text-white px-1.5 py-0.5 rounded-full text-[10px] shadow-sm">{pendingPosts.length}</span>}
                        </button>
                        <button onClick={() => setActiveTab('members')} className={`flex-1 py-4 font-bold uppercase text-xs tracking-wider transition-all cursor-pointer border-l border-[#262626] ${activeTab === 'members' ? 'bg-[#1a1a1a] text-white shadow-[inset_0_2px_0_0_#00ba7c] border-t-0 border-b-0' : 'bg-transparent text-gray-500 border-t-0 border-b-0 hover:bg-[#151515]'}`}>Miembros</button>
                        <button onClick={() => setActiveTab('settings')} className={`flex-1 py-4 font-bold uppercase text-xs tracking-wider transition-all cursor-pointer border-l border-[#262626] ${activeTab === 'settings' ? 'bg-[#1a1a1a] text-white shadow-[inset_0_2px_0_0_#f5a623] border-t-0 border-b-0' : 'bg-transparent text-gray-500 border-t-0 border-b-0 hover:bg-[#151515]'}`}>Ajustes</button>
                    </div>
                )}

                {activeTab === 'feed' ? (
                    <div className="flex flex-col gap-6">
                        {community.rules && (
                            <div className="bg-[#1a1a1a]/80 backdrop-blur-md border border-[#333] rounded-2xl p-5 shadow-lg">
                                <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="text-[#f5a623]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                    Reglas de la Comunidad
                                </h3>
                                <p className="text-gray-300 text-sm whitespace-pre-wrap m-0 leading-relaxed italic border-l-2 border-[#f5a623] pl-3">{community.rules}</p>
                            </div>
                        )}

                        {isMember && (
                            <div className="mb-2">
                                <CreatePost onPostCreated={handlePostCreated} communityId={community._id || community.id} communityTags={community.tags || []} />
                            </div>
                        )}

                        {community.tags && community.tags.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                                <button onClick={() => handleTagFilter('')} className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeTagFilter === '' ? 'bg-[#0095f6] text-white border-[#0095f6] shadow-[0_0_10px_rgba(0,149,246,0.3)]' : 'bg-[#121212]/80 backdrop-blur-md text-gray-400 border-[#333] hover:text-white hover:border-[#555]'}`}>Todo</button>
                                {community.tags.map(tag => (
                                    <button key={tag} onClick={() => handleTagFilter(tag)} className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeTagFilter === tag ? 'bg-[#0095f6] text-white border-[#0095f6] shadow-[0_0_10px_rgba(0,149,246,0.3)]' : 'bg-[#121212]/80 backdrop-blur-md text-gray-400 border-[#333] hover:text-white hover:border-[#555]'}`}>
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        )}

                        {loadingPosts ? (
                            <div className="flex justify-center items-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0095f6]"></div>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center text-gray-500 py-10 bg-[#121212]/80 backdrop-blur-xl border border-[#262626] rounded-2xl font-bold shadow-lg">No hay publicaciones con esta etiqueta.</div>
                        ) : (
                            posts.map(post => <PostCard key={post.id || post._id} initialPost={post} getAvatar={getAvatar} />)
                        )}
                    </div>
                ) : activeTab === 'members' ? (
                    <div className="bg-[#121212]/80 backdrop-blur-xl border border-[#262626] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 border-b border-[#333] pb-6">
                            <h3 className="text-white text-lg font-black m-0 tracking-wide">Miembros ({membersList.length})</h3>
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                <input
                                    type="text"
                                    placeholder="Buscar miembro..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full md:w-[200px] pl-9 pr-4 py-2.5 rounded-full border border-[#333] bg-[#0a0a0a]/50 text-white outline-none focus:border-[#00ba7c] transition-colors text-sm shadow-inner placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        {loadingMembers ? (
                            <div className="text-center py-8 text-gray-500 font-bold">Cargando miembros...</div>
                        ) : membersList.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No se encontraron miembros.</div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {membersList.map(member => {
                                    // Evaluamos si el miembro es admin específicamente de esta comunidad o si es el creador
                                    const memberId = member._id || member.id;
                                    const isCommunityAdmin = community.admins?.includes(memberId) || community.creator_id === memberId;

                                    return (
                                        <div key={memberId} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#1a1a1a]/80 transition-colors border border-transparent hover:border-[#333] group">
                                            <Link to={`/${member.username}`} className="flex items-center gap-3 no-underline text-white flex-1 min-w-0">
                                                <img src={getAvatar(member)} alt={member.username} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shrink-0 border border-[#333] shadow-sm" />
                                                <div className="flex flex-col min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <strong className="text-sm truncate group-hover:underline tracking-wide">{member.display_name || member.username}</strong>
                                                        {isCommunityAdmin && <span className="bg-[#00ba7c]/10 text-[#00ba7c] text-[9px] px-2 py-0.5 rounded-md uppercase font-black tracking-widest border border-[#00ba7c]/20">Admin</span>}
                                                    </div>
                                                    <span className="text-xs text-gray-500 truncate">@{member.username}</span>
                                                </div>
                                            </Link>

                                            {isAdmin && memberId !== currentUserId && (
                                                <div className="flex gap-2 shrink-0 ml-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    {!isCommunityAdmin && (
                                                        <button onClick={() => promoteMember(memberId)} className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#00ba7c]/10 text-[#00ba7c] border border-[#00ba7c]/30 hover:bg-[#00ba7c] hover:text-white cursor-pointer transition-all shadow-sm">
                                                            Promover
                                                        </button>
                                                    )}
                                                    <button onClick={() => kickMember(memberId)} className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#ff4d4d]/10 text-[#ff4d4d] border border-[#ff4d4d]/30 hover:bg-[#ff4d4d] hover:text-white cursor-pointer transition-all shadow-sm">
                                                        Expulsar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : activeTab === 'pending' && isAdmin ? (
                    <div className="bg-[#121212]/80 backdrop-blur-xl border border-[#262626] rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                        <h3 className="text-white text-lg font-black m-0 mb-6 tracking-wide border-b border-[#333] pb-4">Solicitudes Pendientes ({pendingPosts.length})</h3>
                        {pendingPosts.length === 0 ? (
                            <div className="text-center py-10 text-gray-500 font-bold">No hay publicaciones pendientes de revisión.</div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {pendingPosts.map(post => (
                                    <div key={post._id || post.id} className="border border-[#333] rounded-2xl p-4 bg-[#1a1a1a]/50">
                                        <PostCard initialPost={post} getAvatar={getAvatar} />
                                        
                                        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[#333]">
                                            <button 
                                                onClick={() => moderatePost(post._id || post.id, 'reject')} 
                                                className="px-5 py-2 rounded-full font-bold text-xs bg-transparent border border-[#ff4d4d]/50 text-[#ff4d4d] hover:bg-[#ff4d4d] hover:text-white transition-colors cursor-pointer"
                                            >
                                                Rechazar
                                            </button>
                                            <button 
                                                onClick={() => moderatePost(post._id || post.id, 'approve')} 
                                                className="px-5 py-2 rounded-full font-bold text-xs bg-[#00ba7c] border-none text-white hover:bg-[#009b67] transition-colors cursor-pointer shadow-[0_0_10px_rgba(0,186,124,0.3)]"
                                            >
                                                Aprobar Publicación
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : activeTab === 'settings' && isAdmin ? (
                    <div className="bg-[#121212]/80 backdrop-blur-xl border border-[#262626] rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                        <h3 className="text-white text-xl font-black mb-6 mt-0 border-b border-[#333] pb-4">Ajustes del Grupo</h3>

                        <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-[#333] pb-6">
                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2 ml-1">Foto de Perfil</label>
                                    <label className="bg-[#1a1a1a]/50 backdrop-blur-md border border-[#333] text-white text-sm font-bold py-3 px-4 rounded-xl cursor-pointer hover:border-[#0095f6] hover:bg-[#1a1a1a] transition-colors block text-center shadow-inner">
                                        Cambiar icono
                                        <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                                    </label>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2 ml-1">Portada (Banner)</label>
                                    <label className="bg-[#1a1a1a]/50 backdrop-blur-md border border-[#333] text-white text-sm font-bold py-3 px-4 rounded-xl cursor-pointer hover:border-[#0095f6] hover:bg-[#1a1a1a] transition-colors block text-center shadow-inner">
                                        Cambiar fondo
                                        <input type="file" ref={bannerInputRef} onChange={handleBannerChange} accept="image/*" className="hidden" />
                                    </label>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">Nombre de la Comunidad</label>
                                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a]/50 shadow-inner text-white outline-none focus:border-[#0095f6] focus:bg-[#111] transition-all text-sm font-bold tracking-wide" />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">Descripción</label>
                                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows="3" className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a]/50 shadow-inner text-white outline-none focus:border-[#0095f6] focus:bg-[#111] transition-all text-sm resize-none leading-relaxed"></textarea>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">Reglas (Opcional)</label>
                                <textarea value={editRules} onChange={e => setEditRules(e.target.value)} rows="4" className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a]/50 shadow-inner text-white outline-none focus:border-[#0095f6] focus:bg-[#111] transition-all text-sm resize-none leading-relaxed" placeholder="Escribe las normas del grupo..."></textarea>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">Etiquetas (Separadas por comas)</label>
                                <input type="text" value={editTags} onChange={e => setEditTags(e.target.value)} className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a]/50 shadow-inner text-white outline-none focus:border-[#0095f6] focus:bg-[#111] transition-all text-sm" placeholder="Noticias, Gameplay, Reseñas..." />
                            </div>

                            <button onClick={handleSaveSettings} className="bg-gradient-to-r from-[#f5a623] to-[#d68b1a] text-white font-black uppercase tracking-wider py-4 rounded-xl hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(245,166,35,0.3)] border-none mt-2 cursor-pointer">
                                Guardar Ajustes
                            </button>

                            <div className="mt-8 pt-8 border-t border-[#333]">
                                <button onClick={handleDeleteCommunity} className="w-full bg-transparent border border-[#ff4d4d]/50 text-[#ff4d4d] font-bold py-4 rounded-xl hover:bg-[#ff4d4d] hover:text-white transition-colors cursor-pointer">
                                    Eliminar Comunidad Permanentemente
                                </button>
                                <p className="text-gray-500 text-[11px] text-center mt-3 uppercase tracking-widest font-bold">Acción destructiva e irreversible.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-500 text-center py-10 bg-[#121212] rounded-xl border border-[#262626]">Navega a otra pestaña.</div>
                )}

                {alertMessage && (
                    <div className="fixed inset-0 bg-black/80 z-[10000] flex justify-center items-center p-4 backdrop-blur-sm" onClick={() => setAlertMessage(null)}>
                        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[400px] bg-[#121212]/95 backdrop-blur-2xl rounded-3xl border border-[#333] shadow-[0_15px_50px_rgba(0,0,0,0.8)] p-8 text-center flex flex-col items-center">
                            <div className={`w-20 h-20 rounded-full flex justify-center items-center mb-5 border-[4px] shadow-inner ${alertMessage.type === 'success' ? 'bg-[#0095f6]/10 text-[#0095f6] border-[#0095f6]/30' : alertMessage.type === 'error' ? 'bg-[#ff4d4d]/10 text-[#ff4d4d] border-[#ff4d4d]/30' : 'bg-[#f5a623]/10 text-[#f5a623] border-[#f5a623]/30'}`}>
                                {alertMessage.type === 'success' ? (
                                    <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                ) : alertMessage.type === 'error' ? (
                                    <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                ) : (
                                    <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                )}
                            </div>
                            <h3 className="text-white text-2xl font-black m-0 mb-2 tracking-wide">{alertMessage.title}</h3>
                            <p className="text-gray-400 text-sm m-0 mb-8 leading-relaxed">{alertMessage.text}</p>
                            <button onClick={() => setAlertMessage(null)} className={`w-full text-white font-bold py-3.5 rounded-full transition-colors cursor-pointer border-none ${alertMessage.type === 'error' ? 'bg-[#ff4d4d] hover:bg-red-600 shadow-[0_0_15px_rgba(255,77,77,0.3)]' : 'bg-[#0095f6] hover:bg-blue-600 shadow-[0_0_15px_rgba(0,149,246,0.3)]'}`}>Entendido</button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Community;