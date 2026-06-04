import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchAPI } from '../services/api.js';
import { useDropsLogic } from '../hooks/useDropsLogic.js';
import { AuthContext } from '../contexts/AuthContext.jsx';
import ReportModal from './ReportModal.jsx';
import ConfirmModal from './ConfirmModal.jsx';

const SingleDropModal = ({ dropId, onClose }) => {
    const [drop, setDrop] = useState(null);
    const [loading, setLoading] = useState(true);
    const { activeUser } = useContext(AuthContext);
    
    const { toggleAction, downloadVideo, isDownloading, loadComments, postComment, deleteDrop } = useDropsLogic();
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

    const [isMuted, setIsMuted] = useState(true);
    const [activeMenuOpen, setActiveMenuOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [commentsList, setCommentsList] = useState([]);
    const [newCommentText, setNewCommentText] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [activeCommentMenuId, setActiveCommentMenuId] = useState(null);

    // NUEVOS ESTADOS PARA EL MODAL DE CONFIRMACIÓN
    const [commentToDelete, setCommentToDelete] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const videoRef = useRef(null);
    const myIdStr = activeUser?._id || activeUser?.id;

    useEffect(() => {
        const fetchSingleDrop = async () => {
            try {
                const data = await fetchAPI(`/drops/${dropId}`);
                if (data.success) setDrop(data.drop);
            } catch (error) {} finally {
                setLoading(false);
            }
        };
        fetchSingleDrop();
    }, [dropId]);

    const handleToggleAction = async (action) => {
        const result = await toggleAction(dropId, action);
        if (result !== undefined) {
            setDrop(prev => {
                if (action === 'like') return { ...prev, has_liked: !prev.has_liked, likes_count: prev.has_liked ? prev.likes_count - 1 : prev.likes_count + 1 };
                if (action === 'save') return { ...prev, has_saved: !prev.has_saved, saves_count: prev.has_saved ? prev.saves_count - 1 : prev.saves_count + 1 };
                if (action === 'repost') return { ...prev, has_reposted: !prev.has_reposted, reposts_count: prev.has_reposted ? prev.reposts_count - 1 : prev.reposts_count + 1 };
                return prev;
            });
        }
    };

    const handleOpenComments = async () => {
        setIsCommentsOpen(true);
        const fetchedComments = await loadComments(dropId);
        setCommentsList(fetchedComments);
    };

    const handleSendComment = async (e) => {
        e.preventDefault();
        if (!newCommentText.trim() || isSubmittingComment) return;
        
        setIsSubmittingComment(true);
        const comment = await postComment(dropId, newCommentText);
        if (comment) {
            setCommentsList(prev => [comment, ...prev]);
            setDrop(prev => ({ ...prev, comments_count: (prev.comments_count || 0) + 1 }));
            setNewCommentText("");
        }
        setIsSubmittingComment(false);
    };

    const handleDeleteDrop = async () => {
        setDeleting(true);
        await deleteDrop(dropId);
        onClose();
    };

    // NUEVA FUNCIÓN PARA EJECUTAR EL BORRADO DEL COMENTARIO
    const executeDeleteComment = async () => {
        if (!commentToDelete) return;
        try {
            const res = await fetchAPI(`/drops/comments/${commentToDelete}`, { method: 'DELETE' });
            if (res.success) {
                setCommentsList(prev => prev.filter(item => (item._id || item.id) !== commentToDelete));
                setDrop(prev => ({ ...prev, comments_count: Math.max(0, (prev.comments_count || 0) - 1) }));
            }
        } catch (err) {}
        setIsConfirmModalOpen(false);
        setCommentToDelete(null);
    };

    const togglePlay = () => {
        if (videoRef.current) {
            videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
        }
    };

    const renderCommentContent = (content) => {
        return content.split(/(@[a-zA-Z0-9_]+)/g).map((part, index) => {
            if (part.startsWith('@')) {
                const username = part.substring(1);
                return (
                    <Link key={index} to={`/${username}`} onClick={onClose} className="text-[#0095f6] font-bold no-underline hover:underline">
                        {part}
                    </Link>
                );
            }
            return <span key={index} className="text-white">{part}</span>;
        });
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/90 z-[9999] flex justify-center items-center backdrop-blur-sm cursor-pointer" onClick={onClose}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0095f6]"></div>
            </div>
        );
    }

    if (!drop) return null;

    const isMyDrop = (drop.user?._id || drop.user?.id) === myIdStr;
    const avatarUrl = drop.user?.profile_picture ? (drop.user.profile_picture.startsWith('http') ? drop.user.profile_picture : `${BACKEND_URL}${drop.user.profile_picture}`) : `https://ui-avatars.com/api/?name=${drop.user?.username}&background=262626&color=fff`;

    return (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex justify-center items-center backdrop-blur-md p-4 cursor-pointer" onClick={onClose}>
            <button onClick={onClose} className="absolute top-6 left-6 bg-black/60 text-white w-10 h-10 rounded-full flex justify-center items-center cursor-pointer border border-[#333] hover:bg-black/80 transition z-50">✕</button>

            <button onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }} className="absolute top-6 right-6 bg-black/60 text-white w-10 h-10 rounded-full flex justify-center items-center cursor-pointer border border-[#333] hover:bg-black/80 transition z-50">
                {isMuted ? (
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                ) : (
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                )}
            </button>

            <div className="relative w-full max-w-[450px] h-full max-h-[85vh] bg-black border border-[#212121] rounded-2xl overflow-hidden shadow-2xl flex cursor-default" onClick={e => e.stopPropagation()}>
                
                {deleting && (
                    <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff4d4d] mb-4"></div>
                        <p className="text-white font-bold tracking-widest text-sm">Eliminando Drop...</p>
                    </div>
                )}

                <video 
                    ref={videoRef}
                    src={drop.video_url} 
                    autoPlay 
                    loop 
                    playsInline 
                    controls={false}
                    muted={isMuted}
                    onClick={togglePlay}
                    className="w-full h-full object-cover cursor-pointer" 
                />

                <div className="absolute bottom-0 left-0 w-full p-5 pb-8 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex justify-between items-end pointer-events-none z-10">
                    <div className="flex flex-col gap-2 max-w-[75%] pointer-events-auto">
                        <div className="flex items-center gap-2">
                            <Link to={`/${drop.user?.username}`} onClick={onClose} className="no-underline flex items-center gap-2 group">
                                <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-[#333] object-cover" />
                                <strong className="text-white text-base tracking-wide group-hover:underline">@{drop.user?.username}</strong>
                            </Link>
                        </div>
                        <p className="text-gray-200 text-sm m-0 leading-tight drop-shadow-md font-medium">{renderCommentContent(drop.description || '')}</p>
                    </div>

                    <div className="flex flex-col items-center gap-4 pointer-events-auto z-20">
                        <div className="flex flex-col items-center group">
                            <button onClick={() => handleToggleAction('like')} className="bg-black/40 p-3 rounded-full border-none cursor-pointer hover:bg-black/70 transition backdrop-blur-md active:scale-90">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill={drop.has_liked ? "#ff4d4d" : "none"} stroke={drop.has_liked ? "#ff4d4d" : "white"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                            </button>
                            <span className="text-white text-xs font-bold mt-1 drop-shadow-md">{drop.likes_count || 0}</span>
                        </div>

                        <div className="flex flex-col items-center group">
                            <button onClick={handleOpenComments} className="bg-black/40 p-3 rounded-full border-none cursor-pointer hover:bg-black/70 transition backdrop-blur-md active:scale-90 text-white">
                                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10c-1.7 0-3.3-.4-4.75-1.1L3 21l1.5-4.5C3.55 14.85 3 13.45 3 12 3 6.477 7.477 2 12 2zm0 2c-4.418 0-8 3.582-8 8 0 1.35.34 2.65.95 3.8L4.2 18.8l3.15-.95C8.65 18.55 10.25 19 12 19c4.418 0 8-3.582 8-8s-3.582-8-8-8z"/></svg>
                            </button>
                            <span className="text-white text-xs font-bold mt-1 drop-shadow-md">{drop.comments_count || 0}</span>
                        </div>

                        <div className="flex flex-col items-center group">
                            <button onClick={() => handleToggleAction('repost')} className="bg-black/40 p-3 rounded-full border-none cursor-pointer hover:bg-black/70 transition backdrop-blur-md active:scale-90">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={drop.has_reposted ? "#00ba7c" : "white"} strokeWidth="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                            </button>
                            <span className="text-white text-xs font-bold mt-1 drop-shadow-md">{drop.reposts_count || 0}</span>
                        </div>

                        <div className="flex flex-col items-center group">
                            <button onClick={() => handleToggleAction('save')} className="bg-black/40 p-3 rounded-full border-none cursor-pointer hover:bg-black/70 transition backdrop-blur-md active:scale-90">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill={drop.has_saved ? "#0095f6" : "none"} stroke={drop.has_saved ? "#0095f6" : "white"} strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                            </button>
                            <span className="text-white text-xs font-bold mt-1 drop-shadow-md">{drop.saves_count || 0}</span>
                        </div>

                        <div className="relative">
                            <button onClick={() => setActiveMenuOpen(!activeMenuOpen)} className="bg-black/40 p-3 rounded-full border-none cursor-pointer hover:bg-black/70 transition backdrop-blur-md text-white">
                                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>
                            </button>

                            {activeMenuOpen && (
                                <div className="absolute right-14 bottom-0 w-48 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl overflow-hidden flex flex-col z-[100]">
                                    {drop.allow_downloads && (
                                        <button onClick={() => { downloadVideo(drop.video_url); setActiveMenuOpen(false); }} disabled={isDownloading} className="w-full text-left px-4 py-3 text-white text-sm bg-transparent border-none hover:bg-[#262626] cursor-pointer flex items-center gap-3">
                                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                            Guardar video
                                        </button>
                                    )}
                                    {isMyDrop && (
                                        <button onClick={handleDeleteDrop} className="w-full text-left px-4 py-3 text-[#ff4d4d] text-sm font-bold bg-transparent border-t border-[#333] hover:bg-[#262626] cursor-pointer flex items-center gap-3">
                                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                            Eliminar Drop
                                        </button>
                                    )}
                                    {!isMyDrop && (
                                        <button onClick={() => { setIsReportModalOpen(true); setActiveMenuOpen(false); }} className="w-full text-left px-4 py-3 text-[#ff4d4d] text-sm font-bold bg-transparent border-t border-[#333] hover:bg-[#262626] cursor-pointer flex items-center gap-2">
                                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                            Reportar Drop
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {isCommentsOpen && (
                    <div className="absolute bottom-0 w-full h-[65%] bg-[#121212] rounded-t-2xl z-50 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.8)] border-t border-[#333]">
                        <div className="flex justify-between items-center p-4 border-b border-[#262626]">
                            <h3 className="text-white text-sm font-bold m-0 text-center flex-1">Comentarios</h3>
                            <button onClick={() => setIsCommentsOpen(false)} className="bg-transparent border-none text-gray-500 hover:text-white cursor-pointer absolute right-4 text-xl">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {commentsList.length === 0 ? (
                                <p className="text-center text-gray-500 text-sm mt-4">Sé el primero en comentar.</p>
                            ) : (
                                commentsList.map(c => {
                                    const commentId = c._id || c.id;
                                    const isCommentOwner = (c.user?._id || c.user?.id) === myIdStr;
                                    const canDelete = isCommentOwner || isMyDrop;

                                    return (
                                        <div key={commentId} className="flex gap-3 mb-4 items-start relative">
                                            <Link to={`/${c.user?.username}`} onClick={onClose}>
                                                <img src={c.user?.profile_picture ? (c.user.profile_picture.startsWith('http') ? c.user.profile_picture : `${BACKEND_URL}${c.user.profile_picture}`) : `https://ui-avatars.com/api/?name=${c.user?.username}&background=262626&color=fff`} className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#333]" alt="avatar" />
                                            </Link>
                                            <div className="flex-1">
                                                <Link to={`/${c.user?.username}`} onClick={onClose} className="text-gray-400 text-xs font-bold block mb-1 no-underline hover:text-white transition">@{c.user?.username}</Link>
                                                <p className="text-white text-sm m-0 leading-tight">{renderCommentContent(c.content)}</p>
                                            </div>
                                            
                                            {canDelete && (
                                                <div className="relative shrink-0">
                                                    <button 
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); 
                                                            setActiveCommentMenuId(activeCommentMenuId === commentId ? null : commentId); 
                                                        }} 
                                                        className="bg-transparent border-none text-gray-500 hover:text-white cursor-pointer p-1"
                                                    >
                                                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>
                                                    </button>
                                                    {activeCommentMenuId === commentId && (
                                                        <div className="absolute right-0 top-6 w-32 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl overflow-hidden z-50">
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setCommentToDelete(commentId);
                                                                    setIsConfirmModalOpen(true);
                                                                    setActiveCommentMenuId(null);
                                                                }}
                                                                className="w-full text-left px-4 py-3 text-[#ff4d4d] text-xs font-bold bg-transparent border-none hover:bg-[#262626] cursor-pointer flex items-center gap-2"
                                                            >
                                                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <form onSubmit={handleSendComment} className="p-3 border-t border-[#262626] bg-[#0a0a0a] flex gap-2">
                            <input type="text" placeholder="Añadir comentario..." value={newCommentText} onChange={e => setNewCommentText(e.target.value)} disabled={isSubmittingComment} className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-full px-4 py-2 text-white outline-none text-sm focus:border-[#0095f6]" />
                            <button type="submit" disabled={!newCommentText.trim() || isSubmittingComment} className="bg-[#0095f6] text-white border-none rounded-full px-4 text-sm font-bold cursor-pointer disabled:opacity-50">Enviar</button>
                        </form>
                    </div>
                )}
            </div>

            {/* AQUÍ SE RENDERIZAN LOS MODALES GLOBALES */}
            {isReportModalOpen && (
                <div onClick={e => e.stopPropagation()}>
                    <ReportModal 
                        targetType="drop" 
                        targetId={dropId} 
                        reportedUserId={drop.user?._id || drop.user?.id} 
                        onClose={() => setIsReportModalOpen(false)} 
                    />
                </div>
            )}
            
            <ConfirmModal 
                isOpen={isConfirmModalOpen}
                title="Eliminar comentario"
                message="¿Seguro que quieres eliminar este comentario? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={executeDeleteComment}
                onCancel={() => { setIsConfirmModalOpen(false); setCommentToDelete(null); }}
            />
        </div>
    );
};

export default SingleDropModal;