import React, { Fragment, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import PostActions from './PostActions.jsx';
import ConfirmModal from './ConfirmModal.jsx';
import { usePostCardLogic } from '../hooks/usePostCardLogic.js';
import ReportModal from './ReportModal.jsx';
import VerifiedBadge from './VerifiedBadge.jsx';
import { AuthContext } from '../contexts/AuthContext.jsx'; 

const PostCard = ({ initialPost, getAvatar, isModal = false, onCloseModal, onDeleteSuccess, targetCommentId }) => {
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
    
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://crewhub.es:8000';

    const isTextOnly = !postData.image_path;

    return (
        <Fragment>
            <div className={`flex flex-col w-full mx-auto bg-[#121212]/80 backdrop-blur-xl ${isAd ? 'border-[#00ba7c]/50 shadow-[0_8px_30px_rgba(0,186,124,0.15)]' : 'border-[#262626]'} ${isModal ? 'h-auto border-none shadow-none rounded-none' : 'max-w-[600px] rounded-3xl mb-8 border shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden'}`}>

                <div className="flex justify-between items-center p-5 border-b border-[#262626]/50 bg-[#1a1a1a]/30">
                    {postData.community ? (
                        <div className="flex items-center gap-3 w-full">
                            <Link to={`/communities/${postData.community.slug}`} className="shrink-0 no-underline">
                                <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-xl font-black text-gray-400 hover:text-white transition-colors overflow-hidden shadow-sm">
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
                                <Link to={`/communities/${postData.community.slug}`} className="text-white font-black text-[15px] hover:text-[#0095f6] transition-colors truncate no-underline tracking-wide">
                                    {postData.community.name}
                                </Link>
                                <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-gray-500 mt-1">
                                    <span>POR</span>
                                    <Link to={`/${postData.user?.username}`} className="text-gray-300 hover:text-white truncate no-underline flex items-center gap-1 transition-colors">
                                        {postData.user?.display_name || postData.user?.username}
                                        {isUserVerified && <VerifiedBadge className="w-3.5 h-3.5" />}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link to={`/${postData.user?.username || ''}`} className="flex items-center gap-3 no-underline text-white group w-full">
                            <img src={getAvatar(postData.user)} alt="avatar" className="w-12 h-12 rounded-full object-cover border border-[#333] shadow-sm group-hover:border-[#555] transition-colors" />
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <strong className="text-[15px] font-black group-hover:text-[#0095f6] transition-colors tracking-wide">
                                        {postData.user?.display_name || postData.user?.username || 'Usuario'}
                                    </strong>
                                    {isUserVerified && <VerifiedBadge className="w-4 h-4" />}
                                </div>
                                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500 mt-0.5">@{postData.user?.username}</span>
                            </div>
                        </Link>
                    )}

                    <div className="relative z-20 shrink-0 ml-2">
                        <button onClick={toggleMenu} className="bg-transparent border-none text-gray-400 cursor-pointer p-1.5 hover:text-white transition-colors">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
                        </button>
                        {showMenu && (
                            <div className="absolute top-10 right-0 bg-[#1a1a1a]/95 backdrop-blur-xl border border-[#333] rounded-2xl shadow-2xl min-w-[160px] overflow-hidden z-[100]">
                                {canEdit && (
                                    <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="w-full p-4 text-white bg-transparent border-none border-b border-[#333] text-left text-xs font-bold uppercase tracking-widest hover:bg-[#262626] cursor-pointer transition-colors">Editar</button>
                                )}
                                {canDelete && (
                                    <button onClick={() => { setIsDeleteModalOpen(true); setShowMenu(false); }} className="w-full p-4 text-[#ff4d4d] bg-transparent border-none text-left text-xs font-bold uppercase tracking-widest hover:bg-[#262626] cursor-pointer transition-colors">Eliminar</button>
                                )}
                                {!isMyPost && (
                                    <button onClick={() => { setIsReportModalOpen(true); setShowMenu(false); }} className="w-full text-left p-4 text-[#ff4d4d] text-xs font-bold uppercase tracking-widest bg-transparent border-t border-[#333] hover:bg-[#262626] cursor-pointer transition-colors">
                                        Reportar
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {isTextOnly ? (
                    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] p-10 md:p-16 flex items-center justify-center min-h-[250px] text-center border-y border-[#262626]">
                         <p className="text-xl md:text-3xl text-white font-medium leading-relaxed tracking-wide italic">
                            "{postData.description}"
                        </p>
                    </div>
                ) : (
                    <div className="bg-[#050505] flex justify-center items-center border-y border-[#262626]">
                        <img
                            src={getPostImage(postData.image_path)}
                            alt="Publicación"
                            className={`w-full ${isModal ? 'max-h-[60vh] object-contain' : 'max-h-[70vh] object-cover'}`}
                        />
                    </div>
                )}

                <div className={`p-5 md:p-6 bg-[#121212]/90 flex-1 flex flex-col ${isTextOnly ? 'pt-4 md:pt-5' : ''}`}>
                    <div className="flex justify-between items-center mb-5">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest m-0">
                            {new Date(postData.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>

                        {isAd && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#00ba7c] border border-[#00ba7c]/30 px-2.5 py-1 rounded-md bg-[#00ba7c]/10 shadow-inner">
                                Promocionado
                            </span>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="flex flex-col gap-3 mb-5">
                            <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className={`w-full bg-[#0a0a0a]/50 shadow-inner border border-[#333] text-white p-4 rounded-xl font-medium outline-none focus:border-[#0095f6] transition-colors resize-none custom-scrollbar ${isTextOnly ? 'text-base md:text-lg' : 'text-sm'}`} rows="3" />
                            <div className="flex justify-end gap-3">
                                <button onClick={() => setIsEditing(false)} className="text-gray-400 border-none bg-transparent cursor-pointer font-bold text-xs uppercase tracking-widest hover:text-white transition-colors">Cancelar</button>
                                <button onClick={handleSaveEdit} className="bg-[#0095f6]/10 border border-[#0095f6]/30 text-[#0095f6] px-4 py-2 rounded-lg cursor-pointer font-bold text-xs uppercase tracking-widest hover:bg-[#0095f6] hover:text-white transition-colors">Guardar</button>
                            </div>
                        </div>
                    ) : (
                        !isTextOnly && postData.description && (
                            <p className="text-sm md:text-[15px] text-gray-200 mb-5 leading-relaxed font-medium">
                                {postData.description}
                            </p>
                        )
                    )}

                    <PostActions post={postData} targetCommentId={targetCommentId} />
                </div>
            </div>

            <ConfirmModal isOpen={isDeleteModalOpen} title="¿Eliminar publicación?" message="¿Seguro que quieres borrar este contenido? No se podrá recuperar." onConfirm={confirmDelete} onCancel={() => setIsDeleteModalOpen(false)} />
            
            {isReportModalOpen && (
                <div onClick={e => e.stopPropagation()}>
                    <ReportModal
                        targetType="post"
                        targetId={postData._id || postData.id}
                        reportedUserId={postData.user?._id || postData.user?.id}
                        onClose={() => setIsReportModalOpen(false)}
                    />
                </div>
            )}
        </Fragment>
    );
};

export default PostCard;