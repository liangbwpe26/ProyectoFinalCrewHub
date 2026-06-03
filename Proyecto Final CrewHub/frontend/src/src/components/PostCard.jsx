import React, { Fragment, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import PostActions from './PostActions.jsx';
import ConfirmModal from './ConfirmModal.jsx';
import { usePostCardLogic } from '../hooks/usePostCardLogic.js';
import ReportModal from './ReportModal.jsx';
import VerifiedBadge from './VerifiedBadge.jsx';
import { AuthContext } from '../contexts/AuthContext.jsx'; 

const PostCard = ({ initialPost, getAvatar, isModal = false, onCloseModal, onDeleteSuccess }) => {
    const {
        postData, isDeleted, isEditing, setIsEditing, editDescription, setEditDescription,
        showMenu, setShowMenu, isDeleteModalOpen, setIsDeleteModalOpen,
        isMyPost, canEdit, canDelete, toggleMenu, confirmDelete, handleSaveEdit, getPostImage
    } = usePostCardLogic(initialPost, isModal, onCloseModal, onDeleteSuccess);

    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const { activeUser } = useContext(AuthContext);

    if (isDeleted) return null;

    const isUserVerified = postData.user?.is_verified || initialPost?.user?.is_verified || (activeUser?.username === postData.user?.username && activeUser?.is_verified);
    const isAd = postData.is_ad || initialPost?.is_ad;
    
    // Agregamos la ruta base para que la foto de la comunidad cargue bien
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://crewhub.es:8000';

    return (
        <Fragment>
            <div className={`w-full max-w-[600px] mx-auto bg-[#121212] border ${isAd ? 'border-[#00ba7c]/50 shadow-[0_0_15px_rgba(0,186,124,0.1)]' : 'border-[#262626]'} rounded-xl overflow-hidden ${isModal ? 'h-full' : 'mb-10'}`}>

                <div className="flex justify-between items-center p-4 border-b border-[#262626]/50">
                    {postData.community ? (
                        <div className="flex items-center gap-3 w-full">
                            <Link to={`/communities/${postData.community.slug}`} className="shrink-0 no-underline">
                                <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-lg font-black text-gray-400 hover:text-white transition-colors overflow-hidden">
                                    {postData.community.avatar_path ? (
                                        <img
                                            src={postData.community.avatar_path.startsWith('http') ? postData.community.avatar_path : `${BACKEND_URL}${postData.community.avatar_path}`}
                                            alt={postData.community.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        postData.community.name?.charAt(0).toUpperCase()
                                    )}
                                </div>
                            </Link>
                            <div className="flex flex-col min-w-0">
                                <Link to={`/communities/${postData.community.slug}`} className="text-white font-bold text-sm hover:underline truncate no-underline leading-tight">
                                    {postData.community.name}
                                </Link>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                    <span>por</span>
                                    <Link to={`/${postData.user?.username}`} className="font-bold text-gray-400 hover:text-white hover:underline truncate no-underline flex items-center gap-1">
                                        {postData.user?.display_name || postData.user?.username}
                                        {/* MEDALLA BLINDADA */}
                                        {isUserVerified && <VerifiedBadge className="w-3.5 h-3.5" />}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link to={`/${postData.user?.username || ''}`} className="flex items-center gap-3 no-underline text-white group w-full">
                            <img src={getAvatar(postData.user)} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-[#333]" />
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1">
                                    <strong className="text-sm font-bold group-hover:underline">
                                        {postData.user?.display_name || postData.user?.username || 'Usuario'}
                                    </strong>
                                    {/* MEDALLA BLINDADA */}
                                    {isUserVerified && <VerifiedBadge className="w-4 h-4" />}
                                </div>
                                <span className="text-xs text-gray-500">@{postData.user?.username}</span>
                            </div>
                        </Link>
                    )}

                    <div className="relative z-20 shrink-0 ml-2">
                        <button onClick={toggleMenu} className="bg-transparent border-none text-white cursor-pointer p-1 hover:text-gray-400">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
                        </button>
                        {showMenu && (
                            <div className="absolute top-8 right-0 bg-[#1a1a1a] border border-[#333] rounded-md shadow-2xl min-w-[140px]">
                                {canEdit && (
                                    <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="w-full p-3 text-white bg-transparent border-none border-b border-[#333] text-left text-sm hover:bg-[#262626] cursor-pointer">Editar</button>
                                )}
                                {canDelete && (
                                    <button onClick={() => { setIsDeleteModalOpen(true); setShowMenu(false); }} className="w-full p-3 text-[#ff4d4d] font-bold bg-transparent border-none text-left text-sm hover:bg-[#262626] cursor-pointer">Eliminar</button>
                                )}
                                {!isMyPost && (
                                    <button onClick={() => { setIsReportModalOpen(true); setShowMenu(false); }} className="w-full text-left px-4 py-3 text-[#ff4d4d] text-sm font-bold bg-transparent border-t border-[#333] hover:bg-[#262626] cursor-pointer">
                                        Reportar publicación
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className={isModal ? "bg-black flex justify-center items-center border-y border-[#262626]" : ""}>
                    <img
                        src={getPostImage(postData.image_path)}
                        alt="Publicación"
                        className={`w-full object-cover ${isModal ? 'max-h-[50vh] object-contain' : ''}`}
                    />
                </div>

                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-xs text-gray-500 uppercase tracking-widest m-0">
                            {new Date(postData.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>

                        {/* ETIQUETA PROMOCIONADO BLINDADA */}
                        {isAd && (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#00ba7c] border border-[#00ba7c] px-2 py-0.5 rounded-sm bg-[#00ba7c]/10">
                                Promocionado
                            </span>
                        )}
                    </div>

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
            {isReportModalOpen && (
                <ReportModal
                    targetType="post"
                    targetId={postData._id || postData.id}
                    reportedUserId={postData.user?._id || postData.user?.id}
                    onClose={() => setIsReportModalOpen(false)}
                />
            )}
        </Fragment>
    );
};

export default PostCard;