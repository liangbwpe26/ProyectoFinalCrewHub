import { useState, useEffect, useCallback } from 'react';
import { fetchAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext.jsx';
import { ERRORS } from '../utils/errorMessages.js';

// Hook personalizado para manejar las interacciones de los posts, incluyendo reacciones, comentarios, menciones y carga de comentarios con paginación
export const usePostInteractions = (post, targetCommentId = null) => {
    // Variables para obtener el ID seguro de la publicación, utilizando el campo _id o id según corresponda, y el contexto de toast para mostrar mensajes al usuario
    const postId = post._id || post.id;
    const { showToast } = useToast();

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

    // Función para manejar la reacción a la publicación, actualizando el estado de si el usuario ha reaccionado y el conteo de reacciones,
    // y enviando la solicitud a la API para registrar la reacción, manejando errores y mostrando mensajes de toast según corresponda
    const handlePostReact = async () => {
        const wasReacted = hasReacted;
        setHasReacted(!wasReacted);
        setReactionsCount(prev => wasReacted ? prev - 1 : prev + 1);

        try {
            const data = await fetchAPI(`/posts/${postId}/react`, { method: 'POST' });
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

    // Función para cargar los comentarios de la publicación desde la API, manejando la paginación con el offset y 
    // actualizando el estado local con los nuevos comentarios obtenidos
    const fetchComments = useCallback(async (currentOffset = 0) => {
        if (currentOffset === 0) setLoadingComments(true);
        else setLoadingMore(true);

        try {
            const data = await fetchAPI(`/posts/${postId}/comments?offset=${currentOffset}`);

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
    }, [postId]);

    // Efecto para cargar los comentarios al montar el componente si se proporciona un targetCommentId, y para hacer 
    // scroll al comentario objetivo una vez que los comentarios han sido cargados
    useEffect(() => {
        if (targetCommentId) {
            setShowComments(true);
            fetchComments(0);
        }
    }, [targetCommentId, fetchComments]);

    // Efecto para hacer scroll al comentario objetivo una vez que los comentarios han sido cargados, verificando si el 
    // targetCommentId está presente y si hay comentarios cargados,
    useEffect(() => {
        if (targetCommentId && comments.length > 0) {
            setTimeout(() => {
                const commentElement = document.getElementById(`comment-${targetCommentId}`);
                if (commentElement) {
                    commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    commentElement.style.transition = 'background-color 0.5s ease';
                    commentElement.style.backgroundColor = 'rgba(0, 149, 246, 0.3)';

                    setTimeout(() => {
                        commentElement.style.backgroundColor = 'transparent';
                    }, 2000);
                }
            }, 100);
        }
    }, [targetCommentId, comments]);

    // Función para alternar la visibilidad de los comentarios, y si se van a mostrar los comentarios y aún no se han cargado, 
    // llamar a la función para cargar los comentarios desde la API
    const toggleComments = () => {
        const willShow = !showComments;
        setShowComments(willShow);
        if (willShow && comments.length === 0) fetchComments();
    };

    // Función para cargar todas las respuestas de un comentario específico, enviando la solicitud a la API y actualizando el 
    // estado local de comentarios para incluir las respuestas obtenidas, manejando errores y mostrando mensajes de toast según corresponda
    const loadAllReplies = async (commentId) => {
        try {
            const data = await fetchAPI(`/comments/${commentId}/replies`);
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

    // Función para manejar el envío de un nuevo comentario, verificando que el contenido no esté vacío, enviando la solicitud a 
    // la API para crear el comentario, y actualizando el estado local de comentarios y conteo de comentarios según corresponda, 
    // además de manejar errores y mostrar mensajes de toast
    const submitComment = async (e, onSuccess) => {
        e.preventDefault();
        if (!newComment.trim()) {
            showToast(ERRORS.EMPTY_MESSAGE, 'error');
            return;
        }

        try {
            const body = { content: newComment };
            if (replyingTo) body.parent_id = replyingTo;

            const data = await fetchAPI(`/posts/${postId}/comments`, { method: 'POST', body });

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

    // Función para manejar el cambio en el campo de entrada del nuevo comentario, verificando si se está escribiendo una mención,
    // y si es así, enviando la solicitud a la API para buscar usuarios que coincidan con la consulta de mención, y actualizando el estado local 
    // con los resultados obtenidos, además de manejar errores y mostrar mensajes de toast según corresponda
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
                const data = await fetchAPI(`/mentions/search?q=${query}`);
                if (data.success) setMentionResults(data.users);
            } catch (err) { } 
            finally { setIsSearchingMentions(false); }
        } else {
            setShowMentions(false);
        }
    };

    // Función para seleccionar un usuario de los resultados de mención, actualizando el campo de entrada del nuevo comentario para incluir la mención seleccionada,
    // ocultando los resultados de mención y enfocando el campo de entrada para continuar escribiendo el comentario
    const selectMention = (username, inputRef) => {
        const words = newComment.split(" ");
        words[words.length - 1] = `@${username} `;
        setNewComment(words.join(" "));
        setShowMentions(false);
        if (inputRef && inputRef.current) inputRef.current.focus();
    };

    // Función para manejar la reacción a un comentario específico, enviando la solicitud a la API para registrar la reacción, 
    // y actualizando el estado local de comentarios para reflejar el nuevo estado de reacción y conteo de reacciones, manejando errores y 
    // mostrando mensajes de toast según corresponda
    const handleCommentReact = async (commentId) => {
        try {
            const data = await fetchAPI(`/comments/${commentId}/react`, { method: 'POST' });
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