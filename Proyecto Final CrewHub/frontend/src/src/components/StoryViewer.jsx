import React, { useState, useEffect, useRef, Fragment, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import ConfirmModal from './ConfirmModal.jsx'; // Importamos tu modal elegante

const StoryViewer = ({ feed, initialUserIndex, onClose, onStoryViewed, onDeleteStory }) => {
    const { activeUser } = useContext(AuthContext); // Extraemos al usuario activo

    const [userIndex, setUserIndex] = useState(initialUserIndex);
    const [storyIndex, setStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    
    // Estado para nuestro Modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const progressInterval = useRef(null);
    const STORY_DURATION = 5000;

    const currentUserGroup = feed[userIndex];
    const currentStory = currentUserGroup?.stories[storyIndex];

    // ¿Es esta mi propia historia?
    const isMyStory = activeUser && (currentUserGroup?.user?.username === activeUser.username);

    useEffect(() => {
        if (currentStory && !currentStory.has_viewed && !isMyStory) {
            onStoryViewed(currentStory._id || currentStory.id);
        }
        setProgress(0);
    }, [userIndex, storyIndex, currentStory, onStoryViewed, isMyStory]);

    useEffect(() => {
        if (isPaused || isDeleteModalOpen) return; // Si el modal está abierto, congelamos el tiempo

        progressInterval.current = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval.current);
                    handleNext();
                    return 100;
                }
                return prev + (100 / (STORY_DURATION / 50)); 
            });
        }, 50);

        return () => clearInterval(progressInterval.current);
    }, [userIndex, storyIndex, isPaused, isDeleteModalOpen]);

    const handleNext = () => {
        if (storyIndex < currentUserGroup.stories.length - 1) {
            setStoryIndex(storyIndex + 1);
        } else if (userIndex < feed.length - 1) {
            setUserIndex(userIndex + 1);
            setStoryIndex(0);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (storyIndex > 0) {
            setStoryIndex(storyIndex - 1);
        } else if (userIndex > 0) {
            setUserIndex(userIndex - 1);
            setStoryIndex(feed[userIndex - 1].stories.length - 1);
        } else {
            setProgress(0);
        }
    };

    const confirmDelete = async () => {
        setIsDeleteModalOpen(false);
        const res = await onDeleteStory(currentStory._id || currentStory.id);
        if (res.success) {
            onClose(); // Cerramos el visor para evitar errores de renderizado tras borrar
        } else {
            setIsPaused(false);
        }
    };

    if (!currentStory) return null;

    const mediaUrl = currentStory.media_path.startsWith('http') 
        ? currentStory.media_path 
        : `http://127.0.0.1:8000${currentStory.media_path}`;

    return (
        <Fragment>
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                
                <div 
                    style={{ position: 'relative', width: '100%', maxWidth: '450px', height: '100%', maxHeight: '900px', backgroundColor: '#111', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                    onMouseDown={() => setIsPaused(true)}
                    onMouseUp={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                >
                    {/* Barras de progreso */}
                    <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', gap: '4px', zIndex: 10 }}>
                        {currentUserGroup.stories.map((s, idx) => (
                            <div key={idx} style={{ flex: 1, height: '3px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', backgroundColor: '#fff', width: idx < storyIndex ? '100%' : idx === storyIndex ? `${progress}%` : '0%', transition: idx === storyIndex ? 'width 50ms linear' : 'none' }} />
                            </div>
                        ))}
                    </div>

                    {/* Cabecera del usuario */}
                    <div style={{ position: 'absolute', top: 25, left: 15, right: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={currentUserGroup.user.profile_picture ? `http://127.0.0.1:8000${currentUserGroup.user.profile_picture}` : `https://ui-avatars.com/api/?name=${currentUserGroup.user.username}&background=262626&color=fff`} style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }} alt="avatar" />
                            <strong style={{ color: '#fff', fontSize: '0.9rem', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{currentUserGroup.user.username}</strong>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {/* 🔥 BOTÓN DE ELIMINAR (Solo aparece si es mi historia) */}
                            {isMyStory && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(true); setIsPaused(true); }} 
                                    style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', display: 'flex', alignItems: 'center', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }}
                                >
                                    <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                </button>
                            )}
                            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>✕</button>
                        </div>
                    </div>

                    <div onClick={handlePrev} style={{ position: 'absolute', top: 0, left: 0, width: '30%', height: '100%', zIndex: 5, cursor: 'pointer' }} />
                    <div onClick={handleNext} style={{ position: 'absolute', top: 0, right: 0, width: '70%', height: '100%', zIndex: 5, cursor: 'pointer' }} />

                    {currentStory.media_type === 'video' ? (
                        <video src={mediaUrl} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} onEnded={handleNext} />
                    ) : (
                        <img src={mediaUrl} alt="Story" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                </div>
            </div>

            {/* 🔥 MODAL DE CONFIRMACIÓN */}
            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                title="¿Eliminar esta historia?"
                message="Esta foto o video desaparecerá inmediatamente y no podrá recuperarse."
                onConfirm={confirmDelete}
                onCancel={() => { setIsDeleteModalOpen(false); setIsPaused(false); }}
            />
        </Fragment>
    );
};

export default StoryViewer;