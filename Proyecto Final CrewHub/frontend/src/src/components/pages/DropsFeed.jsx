import React, { useState, useContext, useRef, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { fetchAPI } from '../../services/api.js';
import { useDropsLogic } from '../../hooks/useDropsLogic.js';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import Navbar from '../structure/Navbar.jsx';
import UploadDropModal from '../UploadDropModal.jsx';
import ReportModal from '../ReportModal.jsx';
import ConfirmModal from '../ConfirmModal.jsx';

const DropsFeed = () => {
    const { activeUser } = useContext(AuthContext);
    const { 
        drops, loading, handleScroll, downloadVideo, isDownloading, 
        isGlobalMuted, setIsGlobalMuted, toggleAction, deleteDrop, 
        addNewDrop, loadComments, postComment 
    } = useDropsLogic();

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    
    const [activeCommentsDropId, setActiveCommentsDropId] = useState(null);
    const [commentsList, setCommentsList] = useState([]);
    const [newCommentText, setNewCommentText] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [activeCommentMenuId, setActiveCommentMenuId] = useState(null);

    const [commentToDelete, setCommentToDelete] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const [reportDropData, setReportDropData] = useState(null);

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
    const myIdStr = activeUser?._id || activeUser?.id;

    const videoRefs = useRef({});

    const HappyFace = ({ filled, size = 24 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#ffdd00" : "none"} stroke={filled ? "#000" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
    );
    
    const togglePlay = (dropId) => {
        const video = videoRefs.current[dropId];
        if (video) {
            video.paused ? video.play() : video.pause();
        }
    };

    const openComments = async (dropId) => {
        setActiveCommentsDropId(dropId);
        setCommentsList([]);
        const fetchedComments = await loadComments(dropId);
        setCommentsList(fetchedComments);
    };

    const handleSendComment = async (e) => {
        e.preventDefault();
        if (!newCommentText.trim() || isSubmittingComment) return;
        
        setIsSubmittingComment(true);
        const comment = await postComment(activeCommentsDropId, newCommentText);
        if (comment) {
            setCommentsList(prev => [comment, ...prev]);
            setNewCommentText("");
        }
        setIsSubmittingComment(false);
    };

    const handleDeleteDrop = async (dropId) => {
        setDeletingId(dropId);
        setActiveMenuId(null);
        if (videoRefs.current[dropId]) videoRefs.current[dropId].pause();
        
        await deleteDrop(dropId);
        setDeletingId(null);
    };

    const executeDeleteComment = async () => {
        if (!commentToDelete) return;
        try {
            const res = await fetchAPI(`/drops/comments/${commentToDelete}`, { method: 'DELETE' });
            if (res.success) {
                setCommentsList(prev => prev.filter(item => (item._id || item.id) !== commentToDelete));
            }
        } catch (err) {}
        setIsConfirmModalOpen(false);
        setCommentToDelete(null);
    };

    const handleCommentReact = async (commentId) => {
        setCommentsList(prev => prev.map(c => {
            if ((c._id || c.id) === commentId) {
                const wasReacted = c.has_reacted;
                return { 
                    ...c, 
                    has_reacted: !wasReacted, 
                    reactions_count: wasReacted ? Math.max(0, (c.reactions_count || 0) - 1) : (c.reactions_count || 0) + 1 
                };
            }
            return c;
        }));

        try {
            await fetchAPI(`/drops/comments/${commentId}/react`, { method: 'POST' });
        } catch (error) {
            console.error("Error al reaccionar al comentario", error);
        }
    };

    const renderCommentContent = (content) => {
        if (!content) return null;
        return content.split(/(@[a-zA-Z0-9_]+)/g).map((part, index) => {
            if (part.startsWith('@')) {
                const username = part.substring(1);
                return (
                    <Link key={index} to={`/${username}`} className="text-[#0095f6] font-bold no-underline hover:underline cursor-pointer">
                        {part}
                    </Link>
                );
            }
            return <span key={index} className="text-white">{part}</span>;
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a]">
                <Navbar />
                <div className="pt-[120px] text-gray-500 text-sm font-bold uppercase tracking-widest text-center animate-pulse">Abriendo Drops...</div>
            </div>
        );
    }

    return (
        <Fragment>
            <div className="bg-[#000] h-screen overflow-hidden flex flex-col select-none relative">
                <Navbar />
                
                <button 
                    onClick={() => setIsGlobalMuted(!isGlobalMuted)}
                    className="absolute top-20 right-6 z-50 bg-black/40 backdrop-blur-md border border-white/10 text-white w-10 h-10 rounded-full flex justify-center items-center cursor-pointer hover:bg-black/70 hover:scale-105 transition-all shadow-lg"
                >
                    {isGlobalMuted ? (
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                    ) : (
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                    )}
                </button>

                <button 
                    onClick={() => setIsUploadOpen(true)}
                    className="absolute bottom-6 right-6 z-50 bg-gradient-to-r from-[#ff4d4d] to-[#d43838] text-white w-14 h-14 rounded-full flex justify-center items-center shadow-[0_0_20px_rgba(255,77,77,0.5)] cursor-pointer hover:scale-110 transition-transform border-none"
                >
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>

                {isUploadOpen && <UploadDropModal onClose={() => setIsUploadOpen(false)} onUploadSuccess={(newDrop) => addNewDrop(newDrop)} />}

                <div onScroll={handleScroll} className="flex-1 overflow-y-scroll snap-y snap-mandatory custom-scrollbar pt-16">
                    {drops.length === 0 ? (
                        <div className="h-[calc(100vh-64px)] w-full flex flex-col justify-center items-center text-gray-500">
                            <svg className="w-12 h-12 mb-3 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                            <p className="text-sm font-bold uppercase tracking-wide">Aún no hay Drops publicados</p>
                        </div>
                    ) : (
                        drops.map((drop) => {
                            const dropId = drop._id || drop.id;
                            const isMyDrop = (drop.user?._id || drop.user?.id) === myIdStr;
                            const avatarUrl = drop.user?.profile_picture ? (drop.user.profile_picture.startsWith('http') ? drop.user.profile_picture : `${BACKEND_URL}${drop.user.profile_picture}`) : `https://ui-avatars.com/api/?name=${drop.user?.username}&background=262626&color=fff`;

                            return (
                                <div key={dropId} className="h-[calc(100vh-64px)] w-full flex justify-center snap-center bg-[#0a0a0a] relative border-b border-[#212121]">
                                    <div className="relative h-full max-w-[450px] w-full flex bg-black shadow-2xl">
                                        
                                        {deletingId === dropId ? (
                                            <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
                                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff4d4d] mb-4"></div>
                                                <p className="text-white font-bold tracking-widest text-sm">Eliminando Drop...</p>
                                            </div>
                                        ) : null}

                                        <video 
                                            ref={(el) => (videoRefs.current[dropId] = el)}
                                            src={drop.video_url} 
                                            className="w-full h-full object-cover cursor-pointer" 
                                            autoPlay loop playsInline 
                                            muted={isGlobalMuted}
                                            onClick={() => togglePlay(dropId)}
                                        />

                                        <div className="absolute bottom-0 left-0 w-full p-5 pb-8 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex justify-between items-end pointer-events-none z-10">
                                            <div className="flex flex-col gap-2 max-w-[75%] pointer-events-auto">
                                                <div className="flex items-center gap-2">
                                                    <Link to={`/${drop.user?.username}`} className="no-underline flex items-center gap-2 group cursor-pointer z-50">
                                                        <img src={avatarUrl} alt="Avatar" className="w-11 h-11 rounded-full border-2 border-white/20 object-cover shadow-[0_0_10px_rgba(0,0,0,0.5)] group-hover:border-[#0095f6] transition-colors" />
                                                        <strong className="text-white text-base tracking-wide group-hover:underline drop-shadow-md">@{drop.user?.username}</strong>
                                                    </Link>
                                                </div>
                                                <p className="text-gray-100 text-sm m-0 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-medium mt-1">{renderCommentContent(drop.description)}</p>
                                            </div>

                                            <div className="flex flex-col items-center gap-4 relative z-20 pointer-events-auto">
                                                <div className="flex flex-col items-center group">
                                                    <button onClick={() => toggleAction(dropId, 'like')} className="bg-black/40 backdrop-blur-md p-3 rounded-full border border-white/10 cursor-pointer hover:bg-black/70 hover:scale-105 transition-all active:scale-95 shadow-lg">
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill={drop.has_liked ? "#ff4d4d" : "none"} stroke={drop.has_liked ? "#ff4d4d" : "white"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                                                    </button>
                                                    <span className="text-white text-xs font-bold mt-1 drop-shadow-md">{drop.likes_count || 0}</span>
                                                </div>

                                                <div className="flex flex-col items-center group">
                                                    <button onClick={() => openComments(dropId)} className="bg-black/40 backdrop-blur-md p-3 rounded-full border border-white/10 cursor-pointer hover:bg-black/70 hover:scale-105 transition-all active:scale-95 shadow-lg text-white">
                                                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10c-1.7 0-3.3-.4-4.75-1.1L3 21l1.5-4.5C3.55 14.85 3 13.45 3 12 3 6.477 7.477 2 12 2zm0 2c-4.418 0-8 3.582-8 8 0 1.35.34 2.65.95 3.8L4.2 18.8l3.15-.95C8.65 18.55 10.25 19 12 19c4.418 0 8-3.582 8-8s-3.582-8-8-8z"/></svg>
                                                    </button>
                                                    <span className="text-white text-xs font-bold mt-1 drop-shadow-md">{drop.comments_count || 0}</span>
                                                </div>

                                                <div className="flex flex-col items-center group">
                                                    <button onClick={() => toggleAction(dropId, 'repost')} className="bg-black/40 backdrop-blur-md p-3 rounded-full border border-white/10 cursor-pointer hover:bg-black/70 hover:scale-105 transition-all active:scale-95 shadow-lg">
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={drop.has_reposted ? "#00ba7c" : "white"} strokeWidth="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                                                    </button>
                                                    <span className="text-white text-xs font-bold mt-1 drop-shadow-md">{drop.reposts_count || 0}</span>
                                                </div>

                                                <div className="flex flex-col items-center group">
                                                    <button onClick={() => toggleAction(dropId, 'save')} className="bg-black/40 backdrop-blur-md p-3 rounded-full border border-white/10 cursor-pointer hover:bg-black/70 hover:scale-105 transition-all active:scale-95 shadow-lg">
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill={drop.has_saved ? "#0095f6" : "none"} stroke={drop.has_saved ? "#0095f6" : "white"} strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                                                    </button>
                                                    <span className="text-white text-xs font-bold mt-1 drop-shadow-md">{drop.saves_count || 0}</span>
                                                </div>

                                                <div className="relative">
                                                    <button onClick={() => setActiveMenuId(activeMenuId === dropId ? null : dropId)} className="bg-black/40 backdrop-blur-md p-3 rounded-full border border-white/10 cursor-pointer hover:bg-black/70 hover:scale-105 transition-all active:scale-95 shadow-lg text-white">
                                                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>
                                                    </button>

                                                    {activeMenuId === dropId && (
                                                        <div className="absolute right-14 bottom-0 w-48 bg-[#1a1a1a]/95 backdrop-blur-xl border border-[#333] rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col z-50">
                                                            {drop.allow_downloads && (
                                                                <button onClick={() => { downloadVideo(drop.video_url); setActiveMenuId(null); }} disabled={isDownloading} className="w-full text-left px-4 py-3.5 text-white text-xs font-bold tracking-wide bg-transparent border-none hover:bg-[#262626] cursor-pointer flex items-center gap-3 transition-colors">
                                                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                                                    Guardar video
                                                                </button>
                                                            )}
                                                            {isMyDrop && (
                                                                <button onClick={() => handleDeleteDrop(dropId)} className="w-full text-left px-4 py-3.5 text-[#ff4d4d] text-xs font-bold tracking-wide bg-transparent border-t border-[#333] hover:bg-[#262626] cursor-pointer flex items-center gap-3 transition-colors">
                                                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                                    Eliminar Drop
                                                                </button>
                                                            )}
                                                            {!isMyDrop && (
                                                                <button onClick={() => { 
                                                                    setReportDropData({ targetId: dropId, reportedUserId: drop.user?._id || drop.user?.id }); 
                                                                    setActiveMenuId(null); 
                                                                }} className="w-full text-left px-4 py-3.5 text-[#ff4d4d] text-xs font-bold tracking-wide bg-transparent border-t border-[#333] hover:bg-[#262626] cursor-pointer flex items-center gap-3 transition-colors">
                                                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                                                    Reportar Drop
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {activeCommentsDropId === dropId && (
                                            <div className="absolute bottom-0 w-full h-[70%] bg-[#121212]/95 backdrop-blur-3xl rounded-t-3xl z-50 flex flex-col shadow-[0_-15px_50px_rgba(0,0,0,0.8)] border-t border-[#333]">
                                                <div className="flex justify-between items-center p-4 border-b border-[#262626]">
                                                    <h3 className="text-white text-sm font-black m-0 text-center flex-1 tracking-wider uppercase">Comentarios</h3>
                                                    <button onClick={() => setActiveCommentsDropId(null)} className="bg-transparent border-none text-gray-500 hover:text-[#ff4d4d] transition-colors cursor-pointer absolute right-4 text-xl">✕</button>
                                                </div>
                                                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                                                    {commentsList.length === 0 ? (
                                                        <div className="flex flex-col items-center justify-center h-full text-center">
                                                            <svg width="40" height="40" fill="none" stroke="#333" strokeWidth="1.5" viewBox="0 0 24 24" className="mb-3"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest m-0">Sé el primero en comentar</p>
                                                        </div>
                                                    ) : (
                                                        commentsList.map(c => {
                                                            const commentId = c._id || c.id;
                                                            const isCommentOwner = (c.user?._id || c.user?.id) === myIdStr;
                                                            const canDelete = isCommentOwner || isMyDrop;

                                                            return (
                                                                <div key={commentId} className="flex gap-3 mb-5 items-start relative group">
                                                                    <Link to={`/${c.user?.username}`}>
                                                                        <img src={c.user?.profile_picture ? (c.user.profile_picture.startsWith('http') ? c.user.profile_picture : `${BACKEND_URL}${c.user.profile_picture}`) : `https://ui-avatars.com/api/?name=${c.user?.username}&background=262626&color=fff`} className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#333] shadow-sm" alt="avatar" />
                                                                    </Link>
                                                                    <div className="flex-1 bg-[#1a1a1a]/50 p-3 rounded-2xl rounded-tl-none border border-[#262626]">
                                                                        <Link to={`/${c.user?.username}`} className="text-gray-400 text-xs font-bold block mb-1.5 no-underline hover:text-white transition">@{c.user?.username}</Link>
                                                                        <p className="text-white text-[13px] m-0 leading-relaxed">{renderCommentContent(c.content)}</p>
                                                                        
                                                                        <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                                            <button onClick={(e) => { e.stopPropagation(); handleCommentReact(commentId); }} className={`bg-transparent border-none cursor-pointer flex items-center gap-1.5 p-0 transition-colors ${c.has_reacted ? 'text-[#ffdd00]' : 'text-inherit hover:text-gray-300'}`}>
                                                                                <HappyFace filled={c.has_reacted} size={12} /> {c.reactions_count > 0 && <span>{c.reactions_count}</span>}
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    {canDelete && (
                                                                        <div className="relative shrink-0 pt-2">
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
                                                <form onSubmit={handleSendComment} className="p-4 border-t border-[#262626] bg-[#0a0a0a]/80 backdrop-blur-md flex gap-3">
                                                    <input type="text" placeholder="Añadir comentario..." value={newCommentText} onChange={e => setNewCommentText(e.target.value)} disabled={isSubmittingComment} className="flex-1 bg-[#1a1a1a] border border-[#333] shadow-inner rounded-full px-5 py-3 text-white outline-none text-sm focus:border-[#0095f6] transition-colors" />
                                                    <button type="submit" disabled={!newCommentText.trim() || isSubmittingComment} className="bg-gradient-to-r from-[#0095f6] to-[#0077c5] text-white border-none rounded-full w-11 h-11 flex items-center justify-center cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(0,149,246,0.3)] hover:scale-105 transition-transform">
                                                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                                                    </button>
                                                </form>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {reportDropData && (
                <div onClick={e => e.stopPropagation()}>
                    <ReportModal 
                        targetType="drop" 
                        targetId={reportDropData.targetId} 
                        reportedUserId={reportDropData.reportedUserId} 
                        onClose={() => setReportDropData(null)} 
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
        </Fragment>
    );
};

export default DropsFeed;