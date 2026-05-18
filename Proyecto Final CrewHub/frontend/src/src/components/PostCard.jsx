import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import PostActions from './PostActions.jsx';
import ConfirmModal from './ConfirmModal.jsx';
import { usePostCardLogic } from '../hooks/usePostCardLogic.js';

const PostCard = ({ initialPost, getAvatar, isModal = false, onCloseModal, onDeleteSuccess }) => {
    
    // Invocamos la lógica separada
    const {
        postData,
        isDeleted,
        isEditing, setIsEditing,
        editDescription, setEditDescription,
        showMenu, setShowMenu,
        isDeleteModalOpen, setIsDeleteModalOpen,
        isMyPost,
        toggleMenu,
        confirmDelete,
        handleSaveEdit,
        getPostImage
    } = usePostCardLogic(initialPost, isModal, onCloseModal, onDeleteSuccess);

    // Si la publicación fue eliminada, desmontamos el componente
    if (isDeleted) return null;

    return (
        <Fragment>
            <div style={{ backgroundColor: "#121212", borderRadius: isModal ? "0" : "12px", border: isModal ? "none" : "1px solid #262626", overflow: "hidden", display: "flex", flexDirection: "column", height: isModal ? "100%" : "auto" }}>
                
                {/* Cabecera */}
                <div style={{ padding: "15px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #262626", flexShrink: 0 }}>
                    <Link to={`/${postData.user?.username || ''}`} style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "inherit" }}>
                        <img src={getAvatar(postData.user)} alt="avatar" style={{ width: "35px", height: "35px", borderRadius: "50%", objectFit: "cover" }} />
                        <strong style={{ color: "#fff" }}>{postData.user?.username || 'Usuario'}</strong>
                    </Link>

                    <div style={{ display: "flex", alignItems: "center", gap: "15px", position: "relative" }}>
                        {isMyPost && (
                            <button onClick={toggleMenu} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                            </button>
                        )}

                        {showMenu && (
                            <div style={{ position: "absolute", top: "25px", right: "0", backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", zIndex: 10, overflow: "hidden", minWidth: "120px", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                                <button onClick={() => { setIsEditing(true); setShowMenu(false); }} style={{ width: "100%", padding: "12px", background: "none", border: "none", borderBottom: "1px solid #333", color: "#fff", cursor: "pointer", textAlign: "left", fontSize: "0.9rem" }}>Editar</button>
                                <button onClick={() => { setIsDeleteModalOpen(true); setShowMenu(false); }} style={{ width: "100%", padding: "12px", background: "none", border: "none", color: "#ff4d4d", cursor: "pointer", textAlign: "left", fontSize: "0.9rem", fontWeight: "bold" }}>Eliminar</button>
                            </div>
                        )}

                        {isModal && onCloseModal && (
                            <button onClick={onCloseModal} style={{ background: "transparent", color: "gray", border: "none", fontSize: "1.2rem", cursor: "pointer", fontWeight: "bold", padding: 0 }}>X</button>
                        )}
                    </div>
                </div>

                <div style={{ overflowY: isModal ? "auto" : "visible", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ backgroundColor: "#000", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
                        <img src={getPostImage(postData.image_path)} alt="Publicación" style={{ width: "100%", maxHeight: isModal ? "60vh" : "600px", objectFit: "contain", display: "block" }} />
                    </div>

                    <div style={{ padding: "15px 15px 5px 15px" }}>
                        {isEditing ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "15px" }}>
                                <textarea 
                                    value={editDescription} 
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    style={{ width: "100%", backgroundColor: "#000", border: "1px solid #333", color: "#fff", padding: "10px", borderRadius: "8px", resize: "vertical", minHeight: "60px", fontFamily: "inherit", boxSizing: "border-box", outline: "none" }}
                                />
                                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                                    <button onClick={() => setIsEditing(false)} style={{ background: "none", border: "none", color: "gray", cursor: "pointer", fontWeight: "bold" }}>Cancelar</button>
                                    <button onClick={handleSaveEdit} style={{ backgroundColor: "#0095f6", color: "#fff", border: "none", padding: "6px 16px", borderRadius: "20px", cursor: "pointer", fontWeight: "bold" }}>Guardar</button>
                                </div>
                            </div>
                        ) : (
                            postData.description && (
                                <p style={{ margin: 0, fontSize: "0.95rem", lineHeight: "1.4" }}>
                                    <Link to={`/${postData.user?.username || ''}`} style={{ fontWeight: "bold", color: "#fff", textDecoration: "none", marginRight: "8px" }}>
                                        @{postData.user?.username || 'Usuario'}
                                    </Link>
                                    <span style={{ color: "#e0e0e0" }}>{postData.description}</span>
                                </p>
                            )
                        )}

                        {!isEditing && (
                            <span style={{ display: "block", marginTop: "10px", fontSize: "0.8rem", color: "gray", textTransform: "uppercase", marginBottom: "10px" }}>
                                {new Date(postData.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        )}
                    </div>

                    <PostActions post={postData} />
                </div>
            </div>

            {/* Modal para confirmar eliminación */}
            <ConfirmModal 
                isOpen={isDeleteModalOpen}
                title="¿Eliminar publicación?"
                message="Esta acción no se puede deshacer. Tu publicación se borrará definitivamente."
                onConfirm={confirmDelete}
                onCancel={() => setIsDeleteModalOpen(false)}
            />
        </Fragment>
    );
};

export default PostCard;