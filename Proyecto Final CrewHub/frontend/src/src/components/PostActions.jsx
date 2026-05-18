import React, { useContext, useRef, useEffect, useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { usePostInteractions } from '../hooks/usePostInteractions';

const PostActions = ({ post, targetCommentId = null }) => {
    const { token, activeUser } = useContext(AuthContext);
    const inputRef = useRef(null);

    const [hasScrolledToTarget, setHasScrolledToTarget] = useState(false);

    const {
        hasReacted, reactionsCount, handlePostReact,
        showComments, toggleComments, comments, loadingComments, loadAllReplies,
        newComment, setNewComment, submitComment,
        replyingTo, setReplyingTo,
        mentionResults, showMentions, isSearchingMentions, handleInputChange, selectMention,
        handleCommentReact,
        commentsCount,
        hasMore, loadingMore, loadMoreComments
    } = usePostInteractions(post, token, targetCommentId);

    const isMyPost = activeUser && post.user && activeUser.username === post.user.username;

    const getAvatar = (user) => {
        if (user?.profile_picture) return user.profile_picture.startsWith('http') ? user.profile_picture : `http://127.0.0.1:8000${user.profile_picture}`;
        return `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=262626&color=fff&bold=true`;
    };

    const renderTextWithMentions = (text) => {
        if (!text) return null;
        const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
        return parts.map((part, index) => {
            if (part.startsWith('@')) {
                const username = part.substring(1);
                return <Link key={index} to={`/${username}`} style={{ color: "#0095f6", textDecoration: "underline", fontWeight: "bold" }} onClick={(e) => e.stopPropagation()}>{part}</Link>;
            }
            return <span key={index}>{part}</span>;
        });
    };

    const HappyFace = ({ filled, size = 20 }) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#ffdd00" : "none"} stroke={filled ? "#000" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
    );

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

                    setTimeout(() => {
                        element.style.backgroundColor = originalBg;
                    }, 2000);

                    setHasScrolledToTarget(true);
                    return true;
                }
                return false;
            };

            if (!attemptScroll()) {
                let attempts = 0;
                const maxAttempts = 20;
                const pollInterval = setInterval(() => {
                    attempts++;
                    if (attemptScroll() || attempts >= maxAttempts) clearInterval(pollInterval);
                }, 100);
                return () => clearInterval(pollInterval);
            }
        }
    }, [comments, targetCommentId, hasScrolledToTarget]);

    return (
        <Fragment>
            <div style={{ padding: "0 15px 15px 15px", textAlign: "left" }}>

                <div style={{ display: "flex", gap: "20px", alignItems: "center", marginBottom: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button onClick={handlePostReact} style={{ background: "none", border: "none", color: hasReacted ? "#ffdd00" : "#fff", cursor: "pointer", padding: 0, transition: "transform 0.1s" }} onMouseDown={e => e.currentTarget.style.transform = "scale(0.9)"} onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}>
                            <HappyFace filled={hasReacted} size={24} />
                        </button>
                        {reactionsCount > 0 && <span style={{ color: "gray", fontSize: "0.95rem", fontWeight: "bold" }}>{reactionsCount}</span>}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button onClick={toggleComments} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0 }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        </button>
                        {commentsCount > 0 && <span style={{ color: "gray", fontSize: "0.95rem", fontWeight: "bold" }}>{commentsCount}</span>}
                    </div>
                </div>

                {showComments && (
                    <div style={{ borderTop: "1px solid #262626", paddingTop: "15px" }}>

                        {loadingComments ? (
                            <p style={{ color: "gray", fontSize: "0.85rem", margin: 0, marginBottom: "15px" }}>Cargando comentarios...</p>
                        ) : comments.length === 0 ? (
                            <p style={{ color: "gray", fontSize: "0.85rem", margin: 0, marginBottom: "15px" }}>Aún no hay comentarios. ¡Sé el primero!</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "18px", marginBottom: "20px" }}>
                                {comments.map(comment => (
                                    <div key={comment._id || comment.id} id={`comment-${comment._id || comment.id}`} style={{ padding: "8px", transition: "background-color 0.3s ease", borderRadius: "8px" }}>
                                        
                                        <div style={{ display: "flex", gap: "12px" }}>
                                            <Link to={`/${comment.user.username}`}><img src={getAvatar(comment.user)} style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} alt="" /></Link>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: "0.9rem", color: "#e0e0e0", lineHeight: "1.4" }}>
                                                    <Link to={`/${comment.user.username}`} style={{ color: "#fff", fontWeight: "bold", textDecoration: "none", marginRight: "8px" }}>{comment.user.username}</Link>
                                                    {renderTextWithMentions(comment.content)}
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "15px", marginTop: "6px", fontSize: "0.8rem", color: "gray" }}>
                                                    <button onClick={() => handleCommentReact(comment._id || comment.id)} style={{ background: "none", border: "none", color: comment.has_reacted ? "#ffdd00" : "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: 0 }}>
                                                        <HappyFace filled={comment.has_reacted} size={16} /> {comment.reactions_count > 0 && <span>{comment.reactions_count}</span>}
                                                    </button>
                                                    <button onClick={() => { setReplyingTo(comment._id || comment.id); setNewComment(`@${comment.user.username} `); inputRef.current.focus(); }} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontWeight: "bold", padding: 0 }}>Responder</button>
                                                </div>
                                            </div>
                                        </div>

                                        {comment.replies_preview && comment.replies_preview.length > 0 && (
                                            <div style={{ marginLeft: "44px", display: "flex", flexDirection: "column", gap: "12px", borderLeft: "1px solid #262626", paddingLeft: "15px", marginTop: "12px" }}>
                                                {comment.replies_preview.map(reply => (
                                                    <div key={reply._id || reply.id} id={`comment-${reply._id || reply.id}`} style={{ padding: "6px", transition: "background-color 0.3s ease", borderRadius: "8px", display: "flex", flexDirection: "column", gap: "2px" }}>
                                                        <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                                                            <Link to={`/${reply.user.username}`}><img src={getAvatar(reply.user)} style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }} alt="" /></Link>
                                                            <div style={{ fontSize: "0.85rem", color: "#e0e0e0", lineHeight: "1.3" }}>
                                                                <Link to={`/${reply.user.username}`} style={{ color: "#fff", fontWeight: "bold", textDecoration: "none", marginRight: "6px" }}>{reply.user.username}</Link>
                                                                {renderTextWithMentions(reply.content)}
                                                            </div>
                                                        </div>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "15px", marginLeft: "34px", fontSize: "0.75rem", color: "gray" }}>
                                                            <button onClick={() => handleCommentReact(reply._id || reply.id)} style={{ background: "none", border: "none", color: reply.has_reacted ? "#ffdd00" : "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", padding: 0 }}>
                                                                <HappyFace filled={reply.has_reacted} size={14} /> {reply.reactions_count > 0 && <span>{reply.reactions_count}</span>}
                                                            </button>
                                                            <button onClick={() => { setReplyingTo(comment._id || comment.id); setNewComment(`@${reply.user.username} `); inputRef.current.focus(); }} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontWeight: "bold", padding: 0 }}>Responder</button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {comment.replies_count > (comment.replies_preview?.length || 0) && (
                                                    <button onClick={() => loadAllReplies(comment._id || comment.id)} style={{ background: "none", border: "none", color: "gray", fontSize: "0.75rem", fontWeight: "bold", cursor: "pointer", textAlign: "left", padding: "5px 0" }}>
                                                        ——— Mostrar {comment.replies_count - (comment.replies_preview?.length || 0)} respuestas más
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                
                                {hasMore && (
                                    <div style={{ textAlign: "center", marginTop: "10px", marginBottom: "10px" }}>
                                        <button 
                                            onClick={loadMoreComments}
                                            disabled={loadingMore}
                                            style={{ 
                                                background: "none", color: "#0095f6", border: "none", 
                                                cursor: loadingMore ? "default" : "pointer", 
                                                fontSize: "0.9rem", fontWeight: "bold",
                                                opacity: loadingMore ? 0.5 : 1, transition: "0.2s"
                                            }}
                                        >
                                            {loadingMore ? 'Cargando...' : 'Cargar más comentarios'}
                                        </button>
                                    </div>
                                )}

                            </div>
                        )}

                        <div style={{ position: "relative" }}>
                            {showMentions && (
                                <div style={{ position: "absolute", bottom: "100%", left: 0, width: "220px", backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", zIndex: 10, overflow: "hidden", marginBottom: "5px", boxShadow: "0 -4px 12px rgba(0,0,0,0.5)" }}>
                                    {isSearchingMentions ? (
                                        <div style={{ padding: "12px", color: "gray", fontSize: "0.85rem", textAlign: "center" }}>Cargando...</div>
                                    ) : mentionResults.length > 0 ? (
                                        mentionResults.map(user => (
                                            <div key={user._id || user.id} onClick={() => selectMention(user.username, inputRef)} style={{ padding: "10px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", borderBottom: "1px solid #262626" }}>
                                                <img src={getAvatar(user)} style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }} alt="" />
                                                <span style={{ fontSize: "0.85rem", color: "#fff" }}>@{user.username}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: "12px", color: "gray", fontSize: "0.85rem", textAlign: "center" }}>No se encontraron usuarios</div>
                                    )}
                                </div>
                            )}

                            {replyingTo && (
                                <div style={{ fontSize: "0.8rem", color: "#0095f6", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(0,149,246,0.1)", padding: "5px 10px", borderRadius: "5px" }}>
                                    <span>Respondiendo...</span>
                                    <button onClick={() => { setReplyingTo(null); setNewComment(""); }} style={{ background: "none", border: "none", color: "gray", cursor: "pointer", fontSize: "0.9rem", fontWeight: "bold" }}>✕</button>
                                </div>
                            )}

                            <form onSubmit={(e) => submitComment(e)} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                <img src={getAvatar(activeUser)} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }} alt="" />
                                <input ref={inputRef} type="text" value={newComment} onChange={handleInputChange} placeholder="Escribe un comentario o @ para mencionar..." style={{ flex: 1, backgroundColor: "transparent", border: "none", color: "#fff", outline: "none", fontSize: "0.9rem" }} />
                                <button type="submit" disabled={!newComment.trim()} style={{ background: "none", border: "none", color: newComment.trim() ? "#0095f6" : "#262626", fontWeight: "bold", cursor: newComment.trim() ? "pointer" : "default" }}>Publicar</button>
                            </form>
                        </div>

                    </div>
                )}
            </div>
        </Fragment>
    );
};

export default PostActions;