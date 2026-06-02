import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../structure/Layout.jsx';
import { useCommunity } from '../../hooks/useCommunity.js';
import PostCard from '../PostCard.jsx';
import CreatePost from '../CreatePost.jsx';

const Community = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { 
        community, loading, error, toggleMembership, activeUser,
        posts, setPosts, pendingPosts, loadingPosts, loadPendingPosts, loadPosts, moderatePost,
        membersList, loadingMembers, loadMembers, kickMember, promoteMember,
        uploadCommunityStory, uploadingStory,
        updateSettings, uploadBanner, uploadingBanner, uploadAvatar, deleteCommunity
    } = useCommunity(slug);

    const [activeTab, setActiveTab] = useState('feed');
    const [searchQuery, setSearchQuery] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [alertMessage, setAlertMessage] = useState(null);
    const [activeTagFilter, setActiveTagFilter] = useState('');

    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editRules, setEditRules] = useState('');
    const [editTags, setEditTags] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const fileInputRef = useRef(null);
    const bannerInputRef = useRef(null);
    const avatarInputRef = useRef(null);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

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

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const response = await uploadCommunityStory(file);
            if (response && response.success) setAlertMessage({ title: 'Historia en línea', text: 'Se ha publicado en la comunidad.', type: 'success' });
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

    if (loading || isDeleting) return <Layout><div className="w-full max-w-[600px] mx-auto pt-20 text-center"><p className="text-gray-400 font-bold tracking-widest uppercase">{isDeleting ? 'Eliminando...' : 'Cargando...'}</p></div></Layout>;
    if (error || !community) return <Layout><div className="w-full max-w-[600px] mx-auto pt-20 text-center"><h2 className="text-white text-xl font-bold mb-4">Comunidad no encontrada</h2></div></Layout>;

    const currentUserId = activeUser?.id || activeUser?._id;
    const isMember = community.members?.includes(currentUserId);
    const isAdmin = community.admins?.includes(currentUserId);

    const handlePostCreated = (newPost, status) => {
        if (status === 'approved') {
            if (!activeTagFilter || newPost.community_tag === activeTagFilter) setPosts([newPost, ...posts]);
        } else {
            setAlertMessage({ title: 'Enviado a revisión', text: 'Pendiente de aprobación.', type: 'info' });
        }
    };

    const bannerStyle = community.banner_path 
        ? { backgroundImage: `url(${BACKEND_URL}${community.banner_path})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : {};

    return (
        <Layout>
            <div className="w-full max-w-[600px] mx-auto flex flex-col pb-12 px-2 md:px-0">
                <div className="mb-4 mt-2">
                    <Link to="/communities" className="text-gray-500 hover:text-white no-underline text-sm font-bold transition-colors">Volver</Link>
                </div>

                <div className="bg-[#121212] border border-[#262626] rounded-2xl overflow-hidden shadow-2xl flex flex-col mb-6">
                    {/* PORTADA (BANNER) */}
                    <div className="h-32 md:h-40 w-full relative bg-gradient-to-r from-[#0095f6] to-[#005bb5]" style={bannerStyle}>
                        {uploadingBanner && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-sm">Subiendo...</div>}
                    </div>
                    
                    <div className="px-5 md:px-8 pb-6 md:pb-8 relative">
                        {/* FOTO DE PERFIL */}
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[#1a1a1a] border-4 border-[#121212] flex items-center justify-center text-3xl md:text-4xl font-black text-gray-400 absolute -top-10 md:-top-12 shadow-lg relative group overflow-hidden">
                            {community.avatar_path ? (
                                <img src={`${BACKEND_URL}${community.avatar_path}`} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span>{community.name.charAt(0).toUpperCase()}</span>
                            )}
                            
                            {/* Botón para subir historias (Solo Admins) */}
                            {isAdmin && (
                                <label className="absolute bottom-1 right-1 w-7 h-7 bg-[#0095f6] rounded-full border-2 border-[#121212] flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors shadow-lg z-10" title="Subir historia a la comunidad">
                                    <span className="text-white font-bold text-sm leading-none mb-0.5">+</span>
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />
                                </label>
                            )}
                        </div>

                        <div className="flex justify-end pt-3 md:pt-4">
                            <button onClick={toggleMembership} className={`px-5 py-2 md:py-2.5 rounded-full font-bold text-xs md:text-sm transition-colors cursor-pointer border shadow-lg ${isMember ? 'bg-[#1a1a1a] text-white border-[#333] hover:bg-[#262626]' : 'bg-[#0095f6] text-white border-[#0095f6] hover:bg-blue-600'}`}>
                                {isMember ? 'Eres miembro' : 'Unirse al grupo'}
                            </button>
                        </div>

                        <div className="mt-2 md:mt-4">
                            <h1 className="text-2xl md:text-3xl font-black text-white m-0 tracking-wide">{community.name}</h1>
                            <p className="text-gray-400 text-sm md:text-base mt-2 mb-4 leading-relaxed">{community.description}</p>
                            {uploadingStory && <p className="text-[#0095f6] text-xs font-bold mb-4 uppercase tracking-widest">Subiendo historia...</p>}
                            <div className="flex gap-4 items-center">
                                <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                    <span className="text-white text-sm mr-1">{community.members?.length || 0}</span> Tripulantes
                                </div>
                                {isAdmin && <div className="bg-[#ff4d4d]/10 text-[#ff4d4d] px-3 py-1 rounded-md text-[10px] font-black tracking-widest uppercase border border-[#ff4d4d]/20">Administrador</div>}
                            </div>
                        </div>
                    </div>
                </div>

                {isAdmin && (
                    <div className="flex w-full bg-[#121212] border border-[#262626] rounded-xl overflow-hidden shadow-lg mb-6 flex-wrap">
                        <button onClick={() => setActiveTab('feed')} className={`flex-1 py-4 font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${activeTab === 'feed' ? 'bg-[#1a1a1a] text-white shadow-[inset_0_2px_0_0_#0095f6] border-none' : 'bg-transparent text-gray-500 border-none'}`}>Muro</button>
                        <button onClick={() => setActiveTab('pending')} className={`flex-1 py-4 font-bold uppercase text-xs tracking-wider transition-all cursor-pointer border-l border-[#262626] ${activeTab === 'pending' ? 'bg-[#1a1a1a] text-white shadow-[inset_0_2px_0_0_#ff4d4d] border-t-0 border-b-0' : 'bg-transparent text-gray-500 border-t-0 border-b-0'}`}>
                            Solicitudes {pendingPosts.length > 0 && <span className="bg-[#ff4d4d] text-white px-2 py-0.5 rounded-full ml-1">{pendingPosts.length}</span>}
                        </button>
                        <button onClick={() => setActiveTab('members')} className={`flex-1 py-4 font-bold uppercase text-xs tracking-wider transition-all cursor-pointer border-l border-[#262626] ${activeTab === 'members' ? 'bg-[#1a1a1a] text-white shadow-[inset_0_2px_0_0_#0095f6] border-t-0 border-b-0' : 'bg-transparent text-gray-500 border-t-0 border-b-0'}`}>Miembros</button>
                        <button onClick={() => setActiveTab('settings')} className={`flex-1 py-4 font-bold uppercase text-xs tracking-wider transition-all cursor-pointer border-l border-[#262626] ${activeTab === 'settings' ? 'bg-[#1a1a1a] text-white shadow-[inset_0_2px_0_0_#f5a623] border-t-0 border-b-0' : 'bg-transparent text-gray-500 border-t-0 border-b-0'}`}>Ajustes</button>
                    </div>
                )}

                {/* ZONA DE CONTENIDO */}
                {!isMember ? (
                    <div className="bg-[#121212] border border-[#262626] rounded-2xl p-8 text-center shadow-lg">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center text-gray-500">
                                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                            </div>
                            <h3 className="text-white font-bold m-0">Grupo privado</h3>
                            <p className="text-gray-500 text-sm m-0">Únete a la comunidad para ver y compartir publicaciones.</p>
                        </div>
                    </div>
                ) : activeTab === 'feed' ? (
                    <div className="flex flex-col gap-6">
                        {community.rules && (
                            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-5 shadow-lg">
                                <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                    Reglas de la Comunidad
                                </h3>
                                <p className="text-gray-400 text-sm whitespace-pre-wrap m-0">{community.rules}</p>
                            </div>
                        )}

                        <div className="mb-2">
                            <CreatePost onPostCreated={handlePostCreated} communityId={community._id || community.id} communityTags={community.tags || []} />
                        </div>

                        {community.tags && community.tags.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                                <button onClick={() => handleTagFilter('')} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition border ${activeTagFilter === '' ? 'bg-[#0095f6] text-white border-[#0095f6]' : 'bg-[#121212] text-gray-400 border-[#333] hover:text-white'}`}>Todo</button>
                                {community.tags.map(tag => (
                                    <button key={tag} onClick={() => handleTagFilter(tag)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition border ${activeTagFilter === tag ? 'bg-[#0095f6] text-white border-[#0095f6]' : 'bg-[#121212] text-gray-400 border-[#333] hover:text-white'}`}>
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        )}

                        {loadingPosts ? (
                            <p className="text-center text-gray-500 font-bold uppercase tracking-widest text-sm">Cargando muro...</p>
                        ) : posts.length === 0 ? (
                            <div className="text-center text-gray-500 py-10 bg-[#121212] border border-[#262626] rounded-xl font-bold">No hay publicaciones con esta etiqueta.</div>
                        ) : (
                            posts.map(post => <PostCard key={post.id || post._id} initialPost={post} getAvatar={getAvatar} />)
                        )}
                    </div>
                ) : activeTab === 'settings' && isAdmin ? (
                    <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 shadow-lg">
                        <h3 className="text-white text-lg font-bold mb-6 mt-0 border-b border-[#333] pb-4">Ajustes del Grupo</h3>
                        
                        <div className="flex flex-col gap-6">
                            {/* Imágenes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-[#333] pb-6">
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Foto de Perfil</label>
                                    <label className="bg-[#1a1a1a] border border-[#333] text-white text-sm font-bold py-3 px-4 rounded-xl cursor-pointer hover:bg-[#262626] transition block text-center">
                                        Cambiar icono
                                        <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                                    </label>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Portada (Banner)</label>
                                    <label className="bg-[#1a1a1a] border border-[#333] text-white text-sm font-bold py-3 px-4 rounded-xl cursor-pointer hover:bg-[#262626] transition block text-center">
                                        Cambiar fondo
                                        <input type="file" ref={bannerInputRef} onChange={handleBannerChange} accept="image/*" className="hidden" />
                                    </label>
                                </div>
                            </div>

                            {/* Información General */}
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Nombre de la Comunidad</label>
                                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a] text-white outline-none focus:border-[#0095f6] transition text-sm" />
                            </div>
                            
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Descripción</label>
                                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows="3" className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a] text-white outline-none focus:border-[#0095f6] transition text-sm resize-none"></textarea>
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Reglas</label>
                                <textarea value={editRules} onChange={e => setEditRules(e.target.value)} rows="4" className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a] text-white outline-none focus:border-[#0095f6] transition text-sm resize-none" placeholder="Escribe las normas del grupo..."></textarea>
                            </div>
                            
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-2">Etiquetas (Separadas por comas)</label>
                                <input type="text" value={editTags} onChange={e => setEditTags(e.target.value)} className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a] text-white outline-none focus:border-[#0095f6] transition text-sm" placeholder="Noticias, Gameplay, Reseñas..." />
                            </div>
                            
                            <button onClick={handleSaveSettings} className="bg-[#0095f6] text-white font-bold py-3.5 rounded-full hover:bg-blue-600 transition shadow-lg shadow-blue-500/20 mt-2">Guardar Cambios</button>

                            {/* Zona de Peligro */}
                            <div className="mt-8 pt-6 border-t border-[#333]">
                                <button onClick={handleDeleteCommunity} className="w-full bg-transparent border border-[#ff4d4d] text-[#ff4d4d] font-bold py-3.5 rounded-full hover:bg-[#ff4d4d] hover:text-white transition">
                                    Eliminar Comunidad
                                </button>
                                <p className="text-gray-500 text-xs text-center mt-3">Al eliminar el grupo, todo su contenido desaparecerá para siempre.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Contenido original de las pestañas Pending y Members (Se mantiene igual, oculto aquí por longitud visual) */
                    <div className="text-gray-500 text-center py-10 bg-[#121212] rounded-xl border border-[#262626]">Navega a otra pestaña.</div>
                )}

                {/* MODAL DE ALERTAS */}
                {alertMessage && (
                    <div className="fixed inset-0 bg-black/80 z-[10000] flex justify-center items-center p-4 backdrop-blur-sm" onClick={() => setAlertMessage(null)}>
                        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[400px] bg-[#121212] rounded-3xl border border-[#333] shadow-2xl p-8 text-center flex flex-col items-center">
                            <div className={`w-20 h-20 rounded-full flex justify-center items-center mb-5 border-4 ${alertMessage.type === 'success' ? 'bg-[#0095f6]/10 text-[#0095f6] border-[#0095f6]/30' : alertMessage.type === 'error' ? 'bg-[#ff4d4d]/10 text-[#ff4d4d] border-[#ff4d4d]/30' : 'bg-[#f5a623]/10 text-[#f5a623] border-[#f5a623]/30'}`}>
                                {alertMessage.type === 'success' ? (
                                    <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                ) : alertMessage.type === 'error' ? (
                                    <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                ) : (
                                    <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                )}
                            </div>
                            <h3 className="text-white text-2xl font-black m-0 mb-3">{alertMessage.title}</h3>
                            <p className="text-gray-400 text-sm m-0 mb-8 leading-relaxed">{alertMessage.text}</p>
                            <button onClick={() => setAlertMessage(null)} className={`w-full text-white font-bold py-3.5 rounded-full transition-colors cursor-pointer ${alertMessage.type === 'error' ? 'bg-[#ff4d4d] hover:bg-red-600' : 'bg-[#0095f6] hover:bg-blue-600 shadow-lg shadow-blue-500/20'}`}>Entendido</button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Community;