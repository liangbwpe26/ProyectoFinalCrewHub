import { useState, useEffect, useCallback } from 'react';
import { fetchAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext.jsx';
import { ERRORS } from '../utils/errorMessages.js';

export const usePostInteractions = (post, token, targetCommentId = null) => {
    const postId = post._id || post.id;
    const { showToast } = useToast();

    // Estados
    const [hasReacted, setHasReacted] = useState(post.has_reacted || false);
    const [reactionsCount, setReactionsCount] = useState(post.reactions_count || 0);
    const [showComments, setShowComments] = useState(!!targetCommentId);
    const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);

    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);

    const [mentionResults, setMentionResults] = useState([]);
    const [showMentions, setShowMentions] = useState(false);
    const [isSearchingMentions, setIsSearchingMentions] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);

    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    const handlePostReact = async () => {
        const wasReacted = hasReacted;
        setHasReacted(!wasReacted);
        setReactionsCount(prev => wasReacted ? prev - 1 : prev + 1);

        try {
            const data = await fetchAPI(`/posts/${postId}/react`, { method: 'POST' }, token);
            if (!data.success) {
                setHasReacted(wasReacted);
                setReactionsCount(prev => wasReacted ? prev + 1 : prev - 1);
                showToast(data.message || "No se pudo procesar tu reacción.", 'error');
            }
        } catch (error) {
            setHasReacted(wasReacted);
            setReactionsCount(prev => wasReacted ? prev + 1 : prev - 1);
            showToast("Problema de conexión al reaccionar.", 'error');
        }
    };

    const fetchComments = useCallback(async (currentOffset = 0) => {
        if (currentOffset === 0) setLoadingComments(true);
        else setLoadingMore(true);

        try {
            const data = await fetchAPI(`/posts/${postId}/comments?offset=${currentOffset}`, {}, token);
            
            if (data.success) {
                if (currentOffset === 0) setComments(data.comments);
                else setComments(prev => [...prev, ...data.comments]);
                
                setHasMore(data.hasMore);
                setOffset(currentOffset);
            } else {
                showToast(data.message || "Error al cargar comentarios.", 'error');
            }
        } catch (error) {
            showToast(ERRORS.SERVER_500, 'error');
        } finally {
            setLoadingComments(false);
            setLoadingMore(false);
        }
    }, [postId, token]); 

    useEffect(() => {
        if (targetCommentId) {
            setShowComments(true);
            fetchComments(0);
        }
    }, [targetCommentId, fetchComments]);
    
    // NUEVA MAGIA: EL SCROLL Y RESALTADO AUTOMÁTICO
    useEffect(() => {
        if (targetCommentId && comments.length > 0) {
            // Le damos 100ms a React para que termine de pintar el HTML de los comentarios
            setTimeout(() => {
                const commentElement = document.getElementById(`comment-${targetCommentId}`);
                if (commentElement) {
                    // 1. Bajamos la pantalla hasta el comentario (centrado)
                    commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // 2. Destello visual azul para que el usuario sepa cuál es
                    commentElement.style.transition = 'background-color 0.5s ease';
                    commentElement.style.backgroundColor = 'rgba(0, 149, 246, 0.3)'; // Azul suave
                    
                    setTimeout(() => {
                        commentElement.style.backgroundColor = 'transparent';
                    }, 2000); // El destello dura 2 segundos
                }
            }, 100);
        }
    }, [targetCommentId, comments]);

    const toggleComments = () => {
        const willShow = !showComments;
        setShowComments(willShow);
        if (willShow && comments.length === 0) fetchComments();
    };

    const loadAllReplies = async (commentId) => {
        try {
            const data = await fetchAPI(`/comments/${commentId}/replies`, {}, token);
            if (data.success) {
                setComments(prev => prev.map(c => {
                    if ((c._id || c.id) === commentId) return { ...c, replies_preview: data.replies };
                    return c;
                }));
            }
        } catch (error) { 
            showToast("Error al cargar respuestas.", 'error'); 
        }
    };

    const submitComment = async (e, onSuccess) => {
        e.preventDefault();
        if (!newComment.trim()) {
            showToast(ERRORS.EMPTY_MESSAGE, 'error');
            return;
        }

        try {
            const body = { content: newComment };
            if (replyingTo) body.parent_id = replyingTo;

            const data = await fetchAPI(`/posts/${postId}/comments`, { method: 'POST', body }, token);

            if (data.success) {
                if (replyingTo) fetchComments();
                else setComments(prev => [data.comment, ...prev]);
                
                setNewComment("");
                setReplyingTo(null);
                setCommentsCount(prev => prev + 1);
                
                if (onSuccess) onSuccess();
            } else {
                showToast(data.message || ERRORS.DEFAULT, 'error');
            }
        } catch (error) { 
            showToast(ERRORS.SERVER_500, 'error'); 
        }
    };

    const handleInputChange = async (e) => {
        const value = e.target.value;
        setNewComment(value);

        const words = value.split(" ");
        const lastWord = words[words.length - 1];

        if (lastWord.startsWith("@") && lastWord.length > 1) {
            const query = lastWord.substring(1);
            setShowMentions(true);
            setIsSearchingMentions(true);

            try {
                const data = await fetchAPI(`/mentions/search?q=${query}`, {}, token);
                if (data.success) setMentionResults(data.users);
            } catch (err) { 
                // Evitamos el toast aquí para que no sea molesto mientras se escribe rápido
            } finally { setIsSearchingMentions(false); }
        } else {
            setShowMentions(false);
        }
    };

    const selectMention = (username, inputRef) => {
        const words = newComment.split(" ");
        words[words.length - 1] = `@${username} `;
        setNewComment(words.join(" "));
        setShowMentions(false);
        if (inputRef && inputRef.current) inputRef.current.focus();
    };

    const handleCommentReact = async (commentId) => {
        try {
            const data = await fetchAPI(`/comments/${commentId}/react`, { method: 'POST' }, token);
            if (data.success) {
                setComments(prev => prev.map(c => {
                    if ((c._id || c.id) === commentId) {
                        return { ...c, has_reacted: data.reacted, reactions_count: data.reacted ? (c.reactions_count || 0) + 1 : (c.reactions_count || 0) - 1 };
                    }
                    if (c.replies_preview) {
                        const updatedReplies = c.replies_preview.map(reply => {
                            if ((reply._id || reply.id) === commentId) {
                                return { ...reply, has_reacted: data.reacted, reactions_count: data.reacted ? (reply.reactions_count || 0) + 1 : (reply.reactions_count || 0) - 1 };
                            }
                            return reply;
                        });
                        return { ...c, replies_preview: updatedReplies };
                    }
                    return c;
                }));
            }
        } catch (error) { 
            showToast("Problema de conexión al reaccionar al comentario.", 'error'); 
        }
    };

    return {
        hasReacted, reactionsCount, handlePostReact,
        showComments, toggleComments, comments, loadingComments, loadAllReplies,
        newComment, setNewComment, submitComment,
        replyingTo, setReplyingTo,
        mentionResults, showMentions, isSearchingMentions, handleInputChange, selectMention,
        handleCommentReact, hasMore, loadingMore,
        loadMoreComments: () => fetchComments(offset + 5)
    };
};