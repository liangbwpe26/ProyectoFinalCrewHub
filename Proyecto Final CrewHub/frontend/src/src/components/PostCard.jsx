import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import PostActions from './PostActions.jsx';
import ConfirmModal from './ConfirmModal.jsx';
import { usePostCardLogic } from '../hooks/usePostCardLogic.js';

const PostCard = ({ initialPost, getAvatar, isModal = false, onCloseModal, onDeleteSuccess }) => {
    const {
        postData, isDeleted, isEditing, setIsEditing, editDescription, setEditDescription,
        showMenu, setShowMenu, isDeleteModalOpen, setIsDeleteModalOpen,
        isMyPost, toggleMenu, confirmDelete, handleSaveEdit, getPostImage
    } = usePostCardLogic(initialPost, isModal, onCloseModal, onDeleteSuccess);

    if (isDeleted) return null;

    return (
        <Fragment>
            {/* Contenedor principal: Fondo oscuro, bordes suavizados */}
            <div className={`w-full max-w-[600px] mx-auto bg-[#121212] border border-[#262626] rounded-xl overflow-hidden ${isModal ? 'h-full' : 'mb-10'}`}>
                
                {/* 1. CABECERA: Avatar y Usuario (Arriba de la imagen) */}
                <div className="flex justify-between items-center p-4">
                    <Link to={`/${postData.user?.username || ''}`} className="flex items-center gap-3 no-underline text-white group">
                        <img src={getAvatar(postData.user)} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-[#333]" />
                        <strong className="text-sm font-bold group-hover:underline">{postData.user?.username || 'Usuario'}</strong>
                    </Link>

                    {/* Menú de Opciones */}
                    {isMyPost && (
                        <div className="relative z-20">
                            <button onClick={toggleMenu} className="bg-transparent border-none text-white cursor-pointer p-1 hover:text-gray-400">
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                            </button>
                            {showMenu && (
                                <div className="absolute top-8 right-0 bg-[#1a1a1a] border border-[#333] rounded-md shadow-2xl min-w-[140px]">
                                    <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="w-full p-3 text-white bg-transparent border-none border-b border-[#333] text-left text-sm hover:bg-[#262626] cursor-pointer">Editar</button>
                                    <button onClick={() => { setIsDeleteModalOpen(true); setShowMenu(false); }} className="w-full p-3 text-[#ff4d4d] font-bold bg-transparent border-none text-left text-sm hover:bg-[#262626] cursor-pointer">Eliminar</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 2. IMAGEN */}
                <div className="bg-[#000] w-full flex justify-center items-center">
                    <img src={getPostImage(postData.image_path)} alt="Publicación" className="w-full object-contain block" />
                </div>

                {/* 3. BLOQUE INFERIOR: Texto y Acciones */}
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Link to={`/${postData.user?.username || ''}`} className="font-bold text-white text-sm hover:underline no-underline">
                            @{postData.user?.username || 'Usuario'}
                        </Link>
                        <span className="text-gray-400 text-sm">Nueva publicación</span>
                    </div>

                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">
                        {new Date(postData.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>

                    {/* Descripción editable */}
                    {isEditing ? (
                        <div className="flex flex-col gap-2 mb-4">
                            <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full bg-[#000] border border-[#333] text-white p-3 rounded-md text-sm outline-none" />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsEditing(false)} className="text-gray-400 border-none bg-transparent cursor-pointer font-bold text-xs">Cancelar</button>
                                <button onClick={handleSaveEdit} className="text-[#0095f6] border-none bg-transparent cursor-pointer font-bold text-xs">Guardar</button>
                            </div>
                        </div>
                    ) : (
                        postData.description && (
                            <p className="text-sm text-gray-300 mb-4">{postData.description}</p>
                        )
                    )}

                    <PostActions post={postData} />
                </div>
            </div>

            <ConfirmModal isOpen={isDeleteModalOpen} title="¿Eliminar publicación?" message="¿Seguro que quieres borrarla?" onConfirm={confirmDelete} onCancel={() => setIsDeleteModalOpen(false)} />
        </Fragment>
    );
};

export default PostCard;