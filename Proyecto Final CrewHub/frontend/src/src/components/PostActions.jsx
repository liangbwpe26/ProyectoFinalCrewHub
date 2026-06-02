import React, { useContext, useState, useRef, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { usePostInteractions } from '../hooks/usePostInteractions';
import { fetchAPI } from '../services/api.js';

const PostActions = ({ post, targetCommentId = null }) => {
    const { activeUser } = useContext(AuthContext);
    const inputRef = useRef(null);

    const [hasScrolledToTarget, setHasScrolledToTarget] = useState(false);
    const [hasSaved, setHasSaved] = useState(post.has_saved || false);
    const [hasReposted, setHasReposted] = useState(post.has_reposted || false);

    const {
        hasReacted, reactionsCount, handlePostReact,
        showComments, toggleComments, comments, loadingComments, loadAllReplies,
        newComment, setNewComment, submitComment,
        replyingTo, setReplyingTo,
        mentionResults, showMentions, isSearchingMentions, handleInputChange, selectMention,
        handleCommentReact, commentsCount, hasMore, loadingMore, loadMoreComments
    } = usePostInteractions(post, targetCommentId);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

    const getAvatar = (user) => {
        if (user?.profile_picture) return user.profile_picture.startsWith('http') ? user.profile_picture : `${BACKEND_URL}${user.profile_picture}`;
        return `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=262626&color=fff&bold=true`;
    };

    const renderTextWithMentions = (text) => {
        if (!text) return null;
        const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
        return parts.map((part, index) => {
            if (part.startsWith('@')) {
                const username = part.substring(1);
                return <Link key={index} to={`/${username}`} className="text-[#0095f6] underline font-bold" onClick={(e) => e.stopPropagation()}>{part}</Link>;
            }
            return <span key={index}>{part}</span>;
        });
    };

    const HappyFace = ({ filled, size = 24 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#ffdd00" : "none"} stroke={filled ? "#000" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
    );

    const BookmarkIcon = ({ filled, size = 24 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#fff" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
    );

    const handlePostSave = async () => {
        const previousState = hasSaved;
        setHasSaved(!hasSaved);
        try {
            const data = await fetchAPI(`/posts/${post._id || post.id}/save`, { method: 'POST' });
            if (!data.success) setHasSaved(previousState);
        } catch (error) {
            setHasSaved(previousState);
        }
    };

    const handlePostRepost = async () => {
        const previousState = hasReposted;
        setHasReposted(!hasReposted);
        try {
            const data = await fetchAPI(`/posts/${post._id || post.id}/repost`, { method: 'POST' });
            if (!data.success) setHasReposted(previousState);
        } catch (error) {
            setHasReposted(previousState);
        }
    };

    useEffect(() => {
        if (targetCommentId && comments.length > 0 && !hasScrolledToTarget) {
            const attemptScroll = () => {
                const elementId = `comment-${targetCommentId}`;
                const element = document.getElementById(elementId);

                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const originalBg = element.style.backgroundColor;
                    element.style.backgroundColor = "rgba(0, 149, 246, 0.3)";
                    element.style.transition = "background-color 0.5s ease-out";
                    element.style.borderRadius = "8px";
                    setTimeout(() => { element.style.backgroundColor = originalBg; }, 2000);
                    setHasScrolledToTarget(true);
                    return true;
                }
                return false;
            };

            if (!attemptScroll()) {
                let attempts = 0;
                const pollInterval = setInterval(() => {
                    attempts++;
                    if (attemptScroll() || attempts >= 20) clearInterval(pollInterval);
                }, 100);
                return () => clearInterval(pollInterval);
            }
        }
    }, [comments, targetCommentId, hasScrolledToTarget]);

    return (
        <Fragment>
            <div className="w-full">
                <div className="flex justify-between items-center mb-1">
                    <div className="flex gap-5 items-center">
                        <div className="flex items-center gap-2">
                            <button onClick={handlePostReact} className={`bg-transparent border-none cursor-pointer p-0 transition-transform active:scale-90 ${hasReacted ? 'text-[#ffdd00]' : 'text-white hover:text-gray-300'}`}>
                                <HappyFace filled={hasReacted} size={26} />
                            </button>
                            {reactionsCount > 0 && <span className="text-white text-sm font-bold">{reactionsCount}</span>}
                        </div>

                        <div className="flex items-center gap-2">
                            <button onClick={toggleComments} className="bg-transparent border-none text-white cursor-pointer p-0 hover:text-gray-300 transition">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                            </button>
                            {commentsCount > 0 && <span className="text-white text-sm font-bold">{commentsCount}</span>}
                        </div>
                        
                        <button onClick={handlePostRepost} className={`flex items-center gap-1.5 bg-transparent border-none cursor-pointer transition group ${hasReposted ? 'text-[#00ba7c]' : 'text-gray-400 hover:text-[#00ba7c]'}`}>
                            <div className={`p-2 rounded-full transition ${hasReposted ? 'bg-[#00ba7c]/10' : 'group-hover:bg-[#00ba7c]/10'}`}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <path d="M17 1l4 4-4 4"></path>
                                    <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                                    <path d="M7 23l-4-4 4-4"></path>
                                    <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                                </svg>
                            </div>
                        </button>
                    </div>

                    <div>
                        <button onClick={handlePostSave} className="bg-transparent border-none text-white cursor-pointer p-0 transition-transform active:scale-90 hover:text-gray-300">
                            <BookmarkIcon filled={hasSaved} size={26} />
                        </button>
                    </div>
                </div>

                {showComments && (
                    <div className="mt-4 border-t border-[#333] pt-4">
                        {loadingComments ? (
                            <p className="text-gray-500 text-sm m-0 mb-4">Cargando comentarios...</p>
                        ) : comments.length === 0 ? (
                            <p className="text-gray-500 text-sm m-0 mb-4">Aún no hay comentarios. ¡Sé el primero!</p>
                        ) : (
                            <div className="flex flex-col gap-4 mb-5">
                                {comments.map(comment => (
                                    <div key={comment._id || comment.id} id={`comment-${comment._id || comment.id}`} className="p-2 transition-colors duration-300 rounded-lg">
                                        <div className="flex gap-3">
                                            <Link to={`/${comment.user.username}`}>
                                                <img src={getAvatar(comment.user)} className="w-8 h-8 rounded-full object-cover" alt="" />
                                            </Link>
                                            <div className="flex-1">
                                                <div className="text-sm text-gray-300 leading-relaxed">
                                                    <Link to={`/${comment.user.username}`} className="text-white font-bold no-underline mr-2 hover:underline">{comment.user.username}</Link>
                                                    {renderTextWithMentions(comment.content)}
                                                </div>
                                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                                    <button onClick={() => handleCommentReact(comment._id || comment.id)} className={`bg-transparent border-none cursor-pointer flex items-center gap-1 p-0 ${comment.has_reacted ? 'text-[#ffdd00]' : 'text-inherit hover:text-gray-400'}`}>
                                                        <HappyFace filled={comment.has_reacted} size={16} /> {comment.reactions_count > 0 && <span>{comment.reactions_count}</span>}
                                                    </button>
                                                    <button onClick={() => { setReplyingTo(comment._id || comment.id); setNewComment(`@${comment.user.username} `); inputRef.current.focus(); }} className="bg-transparent border-none text-inherit cursor-pointer font-bold p-0 hover:text-gray-300">Responder</button>
                                                </div>
                                            </div>
                                        </div>

                                        {comment.replies_preview && comment.replies_preview.length > 0 && (
                                            <div className="ml-11 flex flex-col gap-3 border-l border-[#262626] pl-4 mt-3">
                                                {comment.replies_preview.map(reply => (
                                                    <div key={reply._id || reply.id} id={`comment-${reply._id || reply.id}`} className="p-1 transition-colors duration-300 rounded-lg flex flex-col gap-1">
                                                        <div className="flex gap-2 items-start">
                                                            <Link to={`/${reply.user.username}`}>
                                                                <img src={getAvatar(reply.user)} className="w-6 h-6 rounded-full object-cover" alt="" />
                                                            </Link>
                                                            <div className="text-xs text-gray-300 leading-relaxed">
                                                                <Link to={`/${reply.user.username}`} className="text-white font-bold no-underline mr-1 hover:underline">{reply.user.username}</Link>
                                                                {renderTextWithMentions(reply.content)}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4 ml-8 text-[11px] text-gray-500">
                                                            <button onClick={() => handleCommentReact(reply._id || reply.id)} className={`bg-transparent border-none cursor-pointer flex items-center gap-1 p-0 ${reply.has_reacted ? 'text-[#ffdd00]' : 'text-inherit hover:text-gray-400'}`}>
                                                                <HappyFace filled={reply.has_reacted} size={14} /> {reply.reactions_count > 0 && <span>{reply.reactions_count}</span>}
                                                            </button>
                                                            <button onClick={() => { setReplyingTo(comment._id || comment.id); setNewComment(`@${reply.user.username} `); inputRef.current.focus(); }} className="bg-transparent border-none text-inherit cursor-pointer font-bold p-0 hover:text-gray-300">Responder</button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {comment.replies_count > (comment.replies_preview?.length || 0) && (
                                                    <button onClick={() => loadAllReplies(comment._id || comment.id)} className="bg-transparent border-none text-gray-500 text-[11px] font-bold cursor-pointer text-left py-1 hover:text-gray-300">
                                                        ——— Mostrar {comment.replies_count - (comment.replies_preview?.length || 0)} respuestas más
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {hasMore && (
                                    <div className="text-center my-2">
                                        <button
                                            onClick={loadMoreComments}
                                            disabled={loadingMore}
                                            className={`bg-transparent text-[#0095f6] border-none text-sm font-bold transition-opacity ${loadingMore ? 'cursor-default opacity-50' : 'cursor-pointer hover:text-blue-500'}`}
                                        >
                                            {loadingMore ? 'Cargando...' : 'Cargar más comentarios'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="relative mt-2">
                            {showMentions && (
                                <div className="absolute bottom-[calc(100%+8px)] left-0 w-full max-h-[160px] overflow-y-auto bg-[#1a1a1a] border border-[#333] rounded-lg z-[100] shadow-[0_-4px_12px_rgba(0,0,0,0.5)] custom-scrollbar">
                                    {isSearchingMentions ? (
                                        <div className="p-3 text-gray-500 text-sm text-center">Cargando...</div>
                                    ) : mentionResults.length > 0 ? (
                                        mentionResults.map(user => (
                                            <div key={user._id || user.id} onClick={() => selectMention(user.username, inputRef)} className="p-2.5 cursor-pointer flex items-center gap-2 border-b border-[#262626] hover:bg-[#262626] transition">
                                                <img src={getAvatar(user)} className="w-6 h-6 rounded-full object-cover" alt="" />
                                                <span className="text-sm text-white">@{user.username}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-3 text-gray-500 text-sm text-center">No se encontraron usuarios</div>
                                    )}
                                </div>
                            )}

                            {replyingTo && (
                                <div className="text-xs text-[#0095f6] mb-2 flex justify-between items-center bg-[#0095f6]/10 px-3 py-1.5 rounded-md relative z-10">
                                    <span>Respondiendo...</span>
                                    <button onClick={() => { setReplyingTo(null); setNewComment(""); }} className="bg-transparent border-none text-gray-500 cursor-pointer text-sm font-bold hover:text-white">✕</button>
                                </div>
                            )}

                            <form onSubmit={(e) => submitComment(e)} className="flex gap-3 items-center relative z-10">
                                <img src={getAvatar(activeUser)} className="w-7 h-7 rounded-full object-cover" alt="" />
                                <input ref={inputRef} type="text" value={newComment} onChange={handleInputChange} placeholder="Escribe un comentario o @ para mencionar..." className="flex-1 bg-transparent border-none text-white outline-none text-sm placeholder-gray-500" />
                                <button type="submit" disabled={!newComment.trim()} className={`bg-transparent border-none font-bold text-sm ${newComment.trim() ? 'text-[#0095f6] cursor-pointer hover:text-blue-500' : 'text-[#262626] cursor-default'}`}>Publicar</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Fragment>
    );
};

export default PostActions;