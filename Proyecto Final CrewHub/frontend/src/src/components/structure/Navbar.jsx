import React, { useContext, useState, useRef, useEffect, Fragment } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import useNotifications, { getSafeId } from '../../hooks/useNotifications.js';
import SingleDropModal from '../SingleDropModal.jsx';
import PostCard from '../PostCard.jsx'; 

const Navbar = () => {
    const { activeUser, logout } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

    const [isNotiOpen, setIsNotiOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [notiTab, setNotiTab] = useState('all');

    const notiRef = useRef(null);
    const profileRef = useRef(null);
    const mobileMenuRef = useRef(null);

    const {
        mainNotifications, followRequests, unreadCount, handleAccept, handleReject,
        markAllAsRead, selectedPostModal, setSelectedPostModal, openNotificationPost,
        targetCommentId, selectedDropId, setSelectedDropId
    } = useNotifications(activeUser?.id || activeUser?._id);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notiRef.current && !notiRef.current.contains(event.target)) setIsNotiOpen(false);
            if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
            if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) setIsMobileMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsNotiOpen(false);
        setIsProfileOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        if (logout) logout();
        navigate('/login');
    };

    const getAvatar = (user) => {
        if (user?.profile_picture) return user.profile_picture.startsWith('http') ? user.profile_picture : `${BACKEND_URL}${user.profile_picture}`;
        return `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=262626&color=fff&bold=true`;
    };

    const isActive = (path) => location.pathname.startsWith(path) ? 'text-[#0095f6] drop-shadow-[0_0_8px_rgba(0,149,246,0.6)]' : 'text-gray-400 hover:text-white transition-all';
    const isMobileActive = (path) => location.pathname.startsWith(path) ? 'bg-[#1a1a1a] text-[#0095f6] border-l-4 border-[#0095f6]' : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a] border-l-4 border-transparent';

    return (
        <Fragment>
            <nav className="fixed top-0 left-0 w-full h-16 bg-[#121212]/80 backdrop-blur-xl border-b border-[#262626] z-50 shadow-sm">
                
                <div className="flex items-center justify-between px-4 md:px-8 w-full h-full">
                    
                    <div className="flex-1 flex justify-start items-center gap-3">
                        <button 
                            onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); setIsNotiOpen(false); setIsProfileOpen(false); }} 
                            className="md:hidden text-white hover:text-[#0095f6] transition-colors cursor-pointer bg-transparent border-none p-1"
                        >
                            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                        
                        <Link to="/home" className="text-white font-black text-lg md:text-xl tracking-widest no-underline drop-shadow-md">CREW HUB</Link>
                    </div>

                    <div className="hidden md:flex flex-1 justify-center items-center gap-8">
                        <Link to="/conversations" className={`flex items-center gap-2 no-underline font-bold text-xs tracking-widest transition-colors ${isActive('/conversations')}`}>
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg> CHATS
                        </Link>
                        <Link to="/drops" className={`flex items-center gap-2 no-underline font-bold text-xs tracking-widest transition-colors ${isActive('/drops')}`}>
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg> DROPS
                        </Link>
                        <Link to="/communities" className={`flex items-center gap-2 no-underline font-bold text-xs tracking-widest transition-colors ${isActive('/communities')}`}>
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg> COMUNIDADES
                        </Link>
                    </div>

                    <div className="flex-1 flex justify-end items-center gap-2 md:gap-4 relative">
                        <Link
                            to="/explore"
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-transparent text-gray-400 hover:text-white transition-colors cursor-pointer hover:bg-[#262626]"
                            title="Explorar"
                        >
                            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </Link>

                        <div ref={notiRef} className="relative">
                            <button
                                onClick={() => {
                                    setIsNotiOpen(!isNotiOpen); setIsProfileOpen(false); setIsMobileMenuOpen(false);
                                    if (!isNotiOpen && unreadCount > 0) markAllAsRead();
                                }}
                                className={`flex items-center justify-center w-10 h-10 rounded-full border transition-colors cursor-pointer relative ${isNotiOpen ? 'bg-[#1a1a1a] border-[#0095f6] text-[#0095f6] shadow-[0_0_15px_rgba(0,149,246,0.2)]' : 'bg-transparent border-transparent text-white hover:bg-[#262626]'}`}
                            >
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" /></svg>
                                {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-[#ff4d4d] text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold border-2 border-[#121212]">{unreadCount}</span>}
                            </button>

                            {isNotiOpen && (
                                <div className="absolute top-14 -right-12 md:right-0 w-[320px] md:w-[350px] bg-[#121212]/95 backdrop-blur-2xl border border-[#333] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.8)] overflow-hidden z-[100] flex flex-col">
                                    <div className="flex w-full border-b border-[#262626]">
                                        <button onClick={() => setNotiTab('all')} className={`flex-1 py-3 font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${notiTab === 'all' ? 'bg-[#1a1a1a] text-white shadow-[inset_0_2px_0_0_#0095f6] border-none' : 'bg-transparent text-gray-500 border-none hover:bg-[#151515]'}`}>Todas</button>
                                        <button onClick={() => setNotiTab('requests')} className={`flex-1 py-3 font-bold uppercase text-xs tracking-wider transition-all cursor-pointer border-l border-[#262626] flex justify-center items-center gap-2 ${notiTab === 'requests' ? 'bg-[#1a1a1a] text-white shadow-[inset_0_2px_0_0_#0095f6] border-t-0 border-b-0 border-r-0' : 'bg-transparent text-gray-500 border-t-0 border-b-0 border-r-0 hover:bg-[#151515]'}`}>
                                            Solicitudes {followRequests.length > 0 && <span className="bg-[#ff4d4d] text-white px-1.5 py-0.5 rounded-full text-[10px] shadow-sm">{followRequests.length}</span>}
                                        </button>
                                    </div>

                                    <div className="max-h-[380px] overflow-y-auto custom-scrollbar p-2">
                                        {notiTab === 'all' ? (
                                            mainNotifications.length === 0 ? (
                                                <p className="text-center text-gray-500 text-sm py-6">No tienes notificaciones nuevas.</p>
                                            ) : (
                                                mainNotifications.map(notif => {
                                                    const postId = notif.post_id || notif.post?._id || notif.post?.id;
                                                    const dropId = notif.drop_id || notif.drop?._id || notif.drop?.id;

                                                    return (
                                                        <div
                                                            key={getSafeId(notif._id) || getSafeId(notif.id)}
                                                            onClick={() => {
                                                                // 🔥 INYECTAMOS postId y dropId SEPARADOS
                                                                openNotificationPost(postId, dropId, notif.comment_id, () => setIsNotiOpen(false));
                                                            }}
                                                            className="flex items-center gap-3 p-3 hover:bg-[#1a1a1a] rounded-xl transition cursor-pointer mb-1 border border-transparent hover:border-[#333]"
                                                        >
                                                            <div className="w-10 h-10 rounded-full bg-[#262626] flex items-center justify-center shrink-0 overflow-hidden border border-[#333]">
                                                                {notif.sender ? <img src={getAvatar(notif.sender)} alt="avatar" className="w-full h-full object-cover" /> : <span className="text-white font-black">!</span>}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-white text-[13px] m-0 leading-tight">
                                                                    <strong className="mr-1">{notif.sender?.username || 'Sistema'}</strong>
                                                                    {
                                                                        notif.type === 'tag' ? 'te etiquetó en un comentario.' :
                                                                        notif.type === 'reply' ? 'respondió a tu comentario.' :
                                                                        notif.type === 'comment_reaction' ? 'reaccionó a tu comentario.' :
                                                                        notif.type === 'drop_reaction' ? 'le dio me gusta a tu Drop.' :
                                                                        notif.type === 'drop_comment' ? 'comentó en tu Drop.' :
                                                                        notif.type === 'report_resolved' ? 'resolvió tu reporte. ¡Gracias por ayudar!' :
                                                                        notif.type === 'strike_warning' ? 'eliminó tu publicación por violar las normas. (+1 Strike)' :
                                                                        notif.type === 'story_reaction' ? 'reaccionó a tu historia.' :
                                                                        notif.type === 'story_reply' ? 'respondió a tu historia.' :
                                                                        'le dio me gusta a tu post.'
                                                                    }
                                                                </p>
                                                                <span className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">{new Date(notif.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                            {notif.post && notif.post.image_path && (
                                                                <img
                                                                    src={notif.post.image_path.startsWith('http') ? notif.post.image_path : `${BACKEND_URL}${notif.post.image_path}`}
                                                                    className="w-10 h-10 rounded-lg object-cover shrink-0 ml-1 border border-[#333]"
                                                                />
                                                            )}
                                                            {notif.drop && notif.drop.video_url && (
                                                                <video
                                                                    src={notif.drop.video_url}
                                                                    className="w-10 h-10 rounded-lg object-cover shrink-0 ml-1 border border-[#333]"
                                                                />
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            )
                                        ) : (
                                            followRequests.length === 0 ? (
                                                <p className="text-center text-gray-500 text-sm py-6">No hay solicitudes pendientes.</p>
                                            ) : (
                                                followRequests.map(req => (
                                                    <div key={getSafeId(req._id) || getSafeId(req.id)} className="flex items-center justify-between p-3 bg-[#0a0a0a] border border-[#262626] rounded-xl mb-2">
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <img src={getAvatar(req.sender)} alt="avatar" className="w-10 h-10 rounded-full object-cover shrink-0" />
                                                            <div className="min-w-0">
                                                                <strong className="text-white text-sm block truncate leading-tight">{req.sender?.username}</strong>
                                                                <span className="text-gray-500 text-xs truncate">quiere seguirte</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 shrink-0 ml-2">
                                                            <button onClick={() => handleAccept(req)} className="w-8 h-8 rounded-full bg-[#0095f6] hover:bg-blue-600 text-white border-none cursor-pointer flex justify-center items-center transition shadow-md">✓</button>
                                                            <button onClick={() => handleReject(req)} className="w-8 h-8 rounded-full bg-transparent border border-[#333] hover:bg-[#1a1a1a] text-gray-400 hover:text-[#ff4d4d] cursor-pointer flex justify-center items-center transition">✕</button>
                                                        </div>
                                                    </div>
                                                ))
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div ref={profileRef} className="relative">
                            <button onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotiOpen(false); setIsMobileMenuOpen(false); }} className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer block p-0 ${isProfileOpen ? 'border-[#0095f6] shadow-[0_0_15px_rgba(0,149,246,0.3)]' : 'border-[#333] hover:border-[#0095f6]'}`}>
                                <img src={getAvatar(activeUser)} alt="Perfil" className="w-full h-full object-cover block" />
                            </button>
                            {isProfileOpen && (
                                <div className="absolute top-14 right-0 w-48 bg-[#121212]/95 backdrop-blur-2xl border border-[#333] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.8)] overflow-hidden z-[100] py-2">
                                    <div className="px-4 py-2 mb-2 border-b border-[#262626]">
                                        <strong className="text-white text-sm block truncate">{activeUser?.display_name || activeUser?.username}</strong>
                                        <span className="text-gray-500 text-xs truncate">@{activeUser?.username}</span>
                                    </div>
                                    <Link to={`/${activeUser?.username}`} className="block w-full text-left px-4 py-2.5 text-white text-sm font-bold bg-transparent border-none hover:bg-[#1a1a1a] transition cursor-pointer no-underline">
                                        Ver mi perfil
                                    </Link>
                                    <Link to="/settings" className="block w-full text-left px-4 py-2.5 text-white text-sm font-bold bg-transparent border-none hover:bg-[#1a1a1a] transition cursor-pointer no-underline">
                                        Configuración
                                    </Link>
                                    {(activeUser?.is_admin || activeUser?.username === 'liangbw_') && (
                                        <Link to="/admin" className="block w-full text-left px-4 py-2.5 text-[#ff4d4d] text-sm font-bold bg-transparent border-none hover:bg-[#1a1a1a] transition cursor-pointer no-underline border-y border-[#262626]">
                                            Panel de Moderación
                                        </Link>
                                    )}
                                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 mt-1 text-[#ff4d4d] text-sm font-bold bg-transparent border-none hover:bg-[#1a1a1a] transition cursor-pointer">
                                        Cerrar sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div ref={mobileMenuRef} className="md:hidden absolute top-16 left-0 w-full bg-[#121212]/95 backdrop-blur-xl border-b border-[#262626] shadow-2xl z-40 flex flex-col py-2 animate-fade-in">
                        <Link to="/conversations" className={`flex items-center gap-3 px-6 py-4 no-underline font-bold text-sm tracking-widest transition-colors ${isMobileActive('/conversations')}`}>
                            <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" /></svg> CHATS
                        </Link>
                        <Link to="/drops" className={`flex items-center gap-3 px-6 py-4 no-underline font-bold text-sm tracking-widest transition-colors ${isMobileActive('/drops')}`}>
                            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg> DROPS
                        </Link>
                        <Link to="/communities" className={`flex items-center gap-3 px-6 py-4 no-underline font-bold text-sm tracking-widest transition-colors ${isMobileActive('/communities')}`}>
                            <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg> COMUNIDADES
                        </Link>
                    </div>
                )}
            </nav>
            
            {/* VISOR DE POSTS */}
            {selectedPostModal && (
                <div className="fixed inset-0 bg-black/95 z-[9999] flex justify-center items-center p-2 md:p-5 backdrop-blur-md" onClick={() => setSelectedPostModal(null)}>
                    
                    <button onClick={() => setSelectedPostModal(null)} className="absolute top-4 right-4 md:top-8 md:right-8 z-[10000] bg-black/50 hover:bg-[#ff4d4d] text-white border border-[#333] rounded-full w-10 h-10 flex justify-center items-center cursor-pointer transition-colors backdrop-blur-md shadow-2xl">✕</button>
                    
                    <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[600px] bg-[#121212] rounded-2xl border border-[#262626] flex flex-col max-h-[95vh] md:max-h-[90vh] shadow-[0_15px_50px_rgba(0,0,0,0.8)] overflow-y-auto custom-scrollbar relative">
                        <PostCard 
                            initialPost={selectedPostModal} 
                            getAvatar={getAvatar} 
                            isModal={true} 
                            onCloseModal={() => setSelectedPostModal(null)}
                            targetCommentId={targetCommentId}
                        />
                    </div>
                </div>
            )}

            {/* VISOR DE DROPS */}
            {selectedDropId && (
                <SingleDropModal
                    dropId={selectedDropId}
                    onClose={() => setSelectedDropId(null)}
                />
            )}
        </Fragment>
    );
};

export default Navbar;