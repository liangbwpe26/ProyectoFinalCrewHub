import { useState, useEffect, useCallback } from 'react';
import { fetchAPI } from '../services/api';

export const usePostInteractions = (post, token, targetCommentId = null) => {
    const postId = post._id || post.id;

    // Estados del Post
    const [hasReacted, setHasReacted] = useState(post.has_reacted || false);
    const [reactionsCount, setReactionsCount] = useState(post.reactions_count || 0);
    const [showComments, setShowComments] = useState(!!targetCommentId);
    const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);

    // Estados de Comentarios
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);

    // Estados de Menciones y Respuestas
    const [mentionResults, setMentionResults] = useState([]);
    const [showMentions, setShowMentions] = useState(false);
    const [isSearchingMentions, setIsSearchingMentions] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);

    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    // 1. REACCIONAR AL POST
    const handlePostReact = async () => {
        const wasReacted = hasReacted;
        setHasReacted(!wasReacted);
        setReactionsCount(prev => wasReacted ? prev - 1 : prev + 1);

        try {
            const data = await fetchAPI(`/posts/${postId}/react`, { method: 'POST' }, token);
            if (!data.success) {
                setHasReacted(wasReacted);
                setReactionsCount(prev => wasReacted ? prev + 1 : prev - 1);
            }
        } catch (error) {
            setHasReacted(wasReacted);
            setReactionsCount(prev => wasReacted ? prev + 1 : prev - 1);
        }
    };

    // 2. CARGAR COMENTARIOS
    const fetchComments = useCallback(async (currentOffset = 0) => {
        if (currentOffset === 0) setLoadingComments(true);
        else setLoadingMore(true);

        try {
            const postId = post._id || post.id; 
            const data = await fetchAPI(`/posts/${postId}/comments?offset=${currentOffset}`, {}, token);
            
            if (data.success) {
                if (currentOffset === 0) {
                    setComments(data.comments);
                } else {
                    setComments(prev => [...prev, ...data.comments]);
                }
                setHasMore(data.hasMore);
                setOffset(currentOffset);
            }
        } catch (error) {
            console.error("Error cargando comentarios:", error);
        } finally {
            setLoadingComments(false);
            setLoadingMore(false);
        }
    // 👉 ESTO ES VITAL: Las dependencias del useCallback
    }, [post._id, post.id, token]); 

    // Efecto que reacciona a la notificación
    useEffect(() => {
        if (targetCommentId) {
            setShowComments(true);
            fetchComments(0);
        }
    }, [targetCommentId, fetchComments]);
    
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
        } catch (error) { console.error("Error al cargar respuestas", error); }
    };

    // 3. ENVIAR COMENTARIO
    const submitComment = async (e, onSuccess) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const body = { content: newComment };
            if (replyingTo) body.parent_id = replyingTo;

            const data = await fetchAPI(`/posts/${postId}/comments`, { method: 'POST', body }, token);

            if (data.success) {
                if (replyingTo) {
                    fetchComments();
                } else {
                    setComments(prev => [data.comment, ...prev]);
                }
                setNewComment("");
                setReplyingTo(null);

                // NUEVO: Sumar 1 al contador visual
                setCommentsCount(prev => prev + 1);

                if (onSuccess) onSuccess();
            }
        } catch (error) { console.error(error); }
    };

    // 4. MENCIONES
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
            } catch (err) { console.error(err); }
            finally { setIsSearchingMentions(false); }
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

    // 5. REACCIONAR A COMENTARIOS
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
        } catch (error) { console.error(error); }
    };

    

    // Retornamos todo lo que la vista va a necesitar
    return {
        hasReacted, reactionsCount, handlePostReact,
        showComments, toggleComments, comments, loadingComments, loadAllReplies,
        newComment, setNewComment, submitComment,
        replyingTo, setReplyingTo,
        mentionResults, showMentions, isSearchingMentions, handleInputChange, selectMention,
        handleCommentReact, hasMore,
        loadingMore,
        loadMoreComments: () => fetchComments(offset + 5)
    };
};