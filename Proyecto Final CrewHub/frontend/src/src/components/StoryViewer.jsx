import React, { useState, useEffect, Fragment, useContext, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AuthContext } from '../contexts/AuthContext.jsx';
import ConfirmModal from './ConfirmModal.jsx';

const StoryViewer = ({ feed, initialUserIndex, onClose, onStoryViewed, onDeleteStory, onToggleLike, onGetStats, onReply }) => {
    const { activeUser } = useContext(AuthContext);

    const [userIndex, setUserIndex] = useState(initialUserIndex);
    const [storyIndex, setStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    
    const [isPaused, setIsPaused] = useState(false);
    const [isManuallyPaused, setIsManuallyPaused] = useState(false);
    
    const [replyText, setReplyText] = useState("");
    const [isSendingReply, setIsSendingReply] = useState(false);
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [showStatsPanel, setShowStatsPanel] = useState(false);
    const [statsData, setStatsData] = useState({ viewers: [], views_count: 0, likes_count: 0, loading: false });

    const videoRef = useRef(null);
    const STORY_DURATION = 5000;

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

    const currentUserGroup = feed[userIndex];
    const currentStory = currentUserGroup?.stories[storyIndex];
    const isMyStory = activeUser && (currentUserGroup?.user?.username === activeUser.username);

    useEffect(() => {
        if (currentStory && !currentStory.has_viewed && !isMyStory) {
            onStoryViewed(currentStory._id || currentStory.id);
        }
        setProgress(0);
        setShowStatsPanel(false); 
        setIsManuallyPaused(false); 
    }, [userIndex, storyIndex, currentStory, onStoryViewed, isMyStory]);

    useEffect(() => {
        if (isPaused || isManuallyPaused || isDeleteModalOpen || showStatsPanel || currentStory?.media_type === 'video') return;
        const interval = setInterval(() => {
            setProgress((prev) => prev + (100 / (STORY_DURATION / 50)));
        }, 50);
        return () => clearInterval(interval);
    }, [userIndex, storyIndex, isPaused, isManuallyPaused, isDeleteModalOpen, showStatsPanel, currentStory]);

    useEffect(() => {
        if (currentStory?.media_type === 'video' && videoRef.current) {
            if (isPaused || isManuallyPaused || isDeleteModalOpen || showStatsPanel) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        }
    }, [isPaused, isManuallyPaused, isDeleteModalOpen, showStatsPanel, currentStory]);

    useEffect(() => {
        if (progress >= 100) handleNext();
    }, [progress]);

    const handleNext = () => {
        if (storyIndex < currentUserGroup.stories.length - 1) setStoryIndex(storyIndex + 1);
        else if (userIndex < feed.length - 1) { setUserIndex(userIndex + 1); setStoryIndex(0); }
        else onClose(); 
    };

    const handlePrev = () => {
        if (storyIndex > 0) setStoryIndex(storyIndex - 1);
        else if (userIndex > 0) { setUserIndex(userIndex - 1); setStoryIndex(feed[userIndex - 1].stories.length - 1); }
        else setProgress(0);
    };

    const confirmDelete = async () => {
        const res = await onDeleteStory(currentStory._id || currentStory.id);
        if (res.success) {
            setIsDeleteModalOpen(false);
            onClose();
        } else {
            setIsDeleteModalOpen(false);
            setIsPaused(false);
        }
    };

    const openStatsPanel = async (e) => {
        e.stopPropagation();
        setIsPaused(true);
        setShowStatsPanel(true);
        setStatsData(prev => ({ ...prev, loading: true }));
        const data = await onGetStats(currentStory._id || currentStory.id);
        if (data.success) setStatsData({ viewers: data.viewers, views_count: data.views_count, likes_count: data.likes_count, loading: false });
        else setStatsData(prev => ({ ...prev, loading: false }));
    };

    const closeStatsPanel = (e) => {
        e.stopPropagation();
        setShowStatsPanel(false);
        setIsPaused(false);
    };

    const submitReply = async () => {
        if (!replyText.trim() || isSendingReply) return;
        setIsSendingReply(true);
        const targetUserId = currentUserGroup.user._id || currentUserGroup.user.id;
        const res = await onReply(targetUserId, replyText, currentStory.media_path, currentStory.media_type);
        setIsSendingReply(false);
        if (res && res.success) {
            setReplyText("");
            setIsManuallyPaused(false);
            onClose();
        }
    };

    if (!currentStory) return null;

    const mediaUrl = currentStory.media_path.startsWith('http') ? currentStory.media_path : `${BACKEND_URL}${currentStory.media_path}`;

    return createPortal(
        <Fragment>
            <div className="fixed inset-0 bg-black/95 z-[99999] flex justify-center items-center backdrop-blur-sm">
                
                <div 
                    className="relative w-full max-w-[450px] h-full max-h-[900px] bg-[#111] flex flex-col overflow-hidden shadow-2xl"
                    onMouseDown={() => setIsPaused(true)} onMouseUp={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)}
                >
                    {/* MODAL DE CONFIRMACIÓN INTEGRADO */}
                    {isDeleteModalOpen && (
                        <div className="absolute inset-0 bg-black/80 z-[100] flex justify-center items-center p-5 backdrop-blur-sm">
                            <div 
                                className="bg-[#1a1a1a] border border-[#333] p-6 rounded-2xl w-full max-w-[300px] text-center shadow-2xl"
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-white text-lg font-bold mt-0 mb-2">¿Eliminar historia?</h3>
                                <p className="text-gray-400 text-sm mb-6 leading-relaxed">Esta foto o video desaparecerá inmediatamente y no podrá recuperarse.</p>
                                <div className="flex flex-col gap-3">
                                    <button onClick={confirmDelete} className="w-full bg-[#ff4d4d] text-white border-none py-3 rounded-xl font-bold cursor-pointer hover:bg-red-600 transition">Eliminar</button>
                                    <button onClick={() => { setIsDeleteModalOpen(false); setIsPaused(false); }} className="w-full bg-transparent text-white border border-[#333] py-3 rounded-xl font-bold cursor-pointer hover:bg-[#333] transition">Cancelar</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none"></div>

                    <div className="absolute top-3 left-3 right-3 flex gap-1 z-20">
                        {currentUserGroup.stories.map((s, idx) => (
                            <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                                <div className="h-full bg-white" style={{ width: idx < storyIndex ? '100%' : idx === storyIndex ? `${progress}%` : '0%', transition: idx === storyIndex && !isManuallyPaused && !isPaused ? 'width 50ms linear' : 'none' }} />
                            </div>
                        ))}
                    </div>

                    <div className="absolute top-8 left-4 right-4 flex justify-between items-center z-20">
                        <div className="flex items-center gap-3">
                            <img src={currentUserGroup.user.profile_picture ? (currentUserGroup.user.profile_picture.startsWith('http') ? currentUserGroup.user.profile_picture : `${BACKEND_URL}${currentUserGroup.user.profile_picture}`) : `https://ui-avatars.com/api/?name=${currentUserGroup.user.username}&background=262626&color=fff`} className="w-10 h-10 rounded-full object-cover border border-[#333]" alt="avatar" />
                            <strong className="text-white text-sm drop-shadow-md">{currentUserGroup.user.username}</strong>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <button 
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                onClick={(e) => { e.stopPropagation(); setIsManuallyPaused(!isManuallyPaused); }} 
                                className="bg-transparent border-none text-white cursor-pointer flex items-center drop-shadow-md hover:scale-110 transition-transform"
                            >
                                {isManuallyPaused ? (
                                    <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                ) : (
                                    <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                )}
                            </button>

                            {isMyStory && (
                                <button 
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onTouchStart={(e) => e.stopPropagation()}
                                    onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(true); setIsPaused(true); }} 
                                    className="bg-transparent border-none text-[#ff4d4d] cursor-pointer flex items-center drop-shadow-md hover:scale-110 transition-transform"
                                >
                                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                </button>
                            )}
                            <button 
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                onClick={onClose} 
                                className="bg-transparent border-none text-white text-2xl cursor-pointer drop-shadow-md hover:text-gray-300 transition-colors"
                            >✕</button>
                        </div>
                    </div>

                    <div onClick={handlePrev} className="absolute top-0 left-0 w-[30%] h-full z-10 cursor-pointer" />
                    <div onClick={handleNext} className="absolute top-0 right-0 w-[70%] h-full z-10 cursor-pointer" />

                    {isMyStory && (
                        <div className="absolute bottom-6 left-4 z-30">
                            <button 
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                onClick={openStatsPanel} 
                                className="bg-black/60 border border-white/20 px-4 py-2 rounded-full cursor-pointer flex items-center gap-2 text-white backdrop-blur-md hover:bg-black/80 transition-colors"
                            >
                                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                <span className="text-sm font-bold">Visto por {currentStory.viewed_by ? currentStory.viewed_by.length : 0}</span>
                            </button>
                        </div>
                    )}

                    {!isMyStory && onReply && (
                        <div 
                            className="absolute bottom-6 left-4 right-[70px] z-30 flex items-center gap-3" 
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                            onMouseUp={(e) => e.stopPropagation()}
                            onTouchEnd={(e) => e.stopPropagation()}
                        >
                            <input 
                                type="text" 
                                placeholder={`Responder a ${currentUserGroup.user.username}...`}
                                value={replyText} 
                                onChange={(e) => setReplyText(e.target.value)}
                                onFocus={() => setIsManuallyPaused(true)} 
                                onBlur={() => setIsManuallyPaused(false)}
                                onKeyDown={(e) => { if (e.key === 'Enter') submitReply(); }}
                                disabled={isSendingReply}
                                className="flex-1 px-5 py-3 rounded-full border border-white/30 bg-black/40 text-white outline-none backdrop-blur-md text-sm placeholder-gray-300 focus:border-white transition-colors"
                            />
                            
                            {replyText.trim() && (
                                <button 
                                    onClick={submitReply} disabled={isSendingReply}
                                    className="bg-[#0095f6] text-white border-none rounded-full w-12 h-12 flex justify-center items-center cursor-pointer shrink-0 hover:bg-blue-600 transition-colors"
                                >
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                                </button>
                            )}
                        </div>
                    )}

                    {!isMyStory && onToggleLike && (
                        <div className="absolute bottom-6 right-4 flex flex-col items-center z-30">
                            <button 
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchStart={(e) => e.stopPropagation()}
                                onClick={(e) => { e.stopPropagation(); onToggleLike(currentStory._id || currentStory.id); }} 
                                className="bg-transparent border-none cursor-pointer flex flex-col items-center drop-shadow-2xl active:scale-90 transition-transform"
                            >
                                <svg width="34" height="34" viewBox="0 0 24 24" fill={currentStory.has_liked ? "#ffcc00" : "none"} stroke={currentStory.has_liked ? "#000" : "white"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" stroke={currentStory.has_liked ? "#ffcc00" : "white"}></circle>
                                    <path d="M8 14s1.5 2 4 2 4-2 4-2" fill="none"></path>
                                    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3"></line>
                                    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3"></line>
                                </svg>
                                <span className="text-sm font-bold text-white mt-1 drop-shadow-md">{currentStory.likes_count || 0}</span>
                            </button>
                        </div>
                    )}

                    {showStatsPanel && (
                        <div 
                            className="absolute bottom-0 left-0 right-0 h-[60%] bg-[#1a1a1a] rounded-t-3xl z-40 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.7)] transition-transform duration-300"
                            onMouseDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                        >
                            <div className="p-5 border-b border-[#333] flex justify-between items-center">
                                <strong className="text-white text-base">Vistas: {statsData.views_count}</strong>
                                <button onClick={closeStatsPanel} className="bg-transparent border-none text-gray-500 text-xl cursor-pointer hover:text-white transition-colors">✕</button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                                {statsData.loading ? (
                                    <div className="text-center text-gray-500 mt-8 text-sm">Cargando...</div>
                                ) : statsData.viewers.length === 0 ? (
                                    <div className="text-center text-gray-500 mt-8 text-sm">Nadie ha visto esto aún.</div>
                                ) : (
                                    statsData.viewers.map(user => (
                                        <div key={user._id || user.id} className="flex items-center justify-between px-6 py-3 hover:bg-[#262626] transition-colors">
                                            <div className="flex items-center gap-3">
                                                <img src={user.profile_picture ? (user.profile_picture.startsWith('http') ? user.profile_picture : `${BACKEND_URL}${user.profile_picture}`) : `https://ui-avatars.com/api/?name=${user.username}&background=262626&color=fff`} className="w-10 h-10 rounded-full object-cover border border-[#333]" alt="avatar" />
                                                <strong className="text-white text-sm">{user.username}</strong>
                                            </div>
                                            {user.has_liked && (
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffcc00" stroke="#000" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <path d="M8 14s1.5 2 4 2 4-2 4-2" fill="none"></path>
                                                    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3"></line>
                                                    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3"></line>
                                                </svg>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {currentStory.media_type === 'video' ? (
                        <video ref={videoRef} src={mediaUrl} autoPlay playsInline onTimeUpdate={(e) => { if(!showStatsPanel && !isManuallyPaused && !isPaused && !isDeleteModalOpen) setProgress((e.target.currentTime / e.target.duration) * 100); }} onEnded={handleNext} className="w-full h-full object-cover relative z-0" />
                    ) : (
                        <img src={mediaUrl} alt="Story" className="w-full h-full object-cover relative z-0" />
                    )}
                </div>
            </div>
        </Fragment>,
        document.body
    );
};

export default StoryViewer;