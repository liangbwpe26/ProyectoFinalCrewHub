import React, { useState, useContext, Fragment, useRef, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import useNotifications, { getSafeId } from '../hooks/useNotifications.js';
import PostActions from './PostActions.jsx';

const NotificationBell = () => {
    const { token, activeUser } = useContext(AuthContext);

    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('main');
    const bellRef = useRef(null);

    const {
        mainNotifications,
        followRequests,
        unreadCount,
        handleAccept,
        handleReject,
        markAllAsRead,
        selectedPostModal,
        setSelectedPostModal,
        openNotificationPost,
        targetCommentId,
    } = useNotifications(token, activeUser?._id || activeUser?.id);

    const getAvatar = (user) => {
        if (user?.profile_picture) return user.profile_picture.startsWith('http') ? user.profile_picture : `http://127.0.0.1:8000${user.profile_picture}`;
        return `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=262626&color=fff&bold=true`;
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (bellRef.current && !bellRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <Fragment>
            <div className="relative flex justify-center w-full" ref={bellRef}>
                <button
                    onClick={() => {
                        setIsOpen(!isOpen);
                        if (!isOpen && unreadCount > 0) markAllAsRead();
                    }}
                    className="bg-transparent border-none text-white cursor-pointer relative flex items-center justify-center hover:text-gray-400 transition"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    {unreadCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-[#ff4d4d] text-white rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                            {unreadCount}
                        </span>
                    )}
                </button>

                {isOpen && (
                    <div className="absolute bottom-12 left-0 md:left-full ml-2 w-[320px] bg-[#121212] border border-[#333] rounded-xl overflow-hidden z-[1000] shadow-2xl">
                        <div className="flex border-b border-[#333]">
                            <button onClick={() => setActiveTab('main')} className={`flex-1 py-3 bg-transparent font-bold text-sm transition ${activeTab === 'main' ? 'text-white border-b-2 border-[#0095f6]' : 'text-gray-500 border-none'}`}>
                                Principal
                            </button>
                            <button onClick={() => setActiveTab('requests')} className={`flex-1 py-3 bg-transparent font-bold text-sm transition ${activeTab === 'requests' ? 'text-white border-b-2 border-[#0095f6]' : 'text-gray-500 border-none'}`}>
                                Solicitudes {followRequests.length > 0 && `(${followRequests.length})`}
                            </button>
                        </div>

                        {activeTab === 'main' && (
                            <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                {mainNotifications.length === 0 ? (
                                    <p className="text-center text-gray-500 p-5 text-sm">No hay actividad reciente.</p>
                                ) : (
                                    mainNotifications.map(notif => {
                                        const postId = getSafeId(notif.post_id) || getSafeId(notif.post?._id);
                                        return (
                                            <div
                                                key={getSafeId(notif._id) || getSafeId(notif.id)}
                                                onClick={() => {
                                                    if (notif.type === 'story_reaction') setIsOpen(false);
                                                    else openNotificationPost(postId, notif.comment_id, () => setIsOpen(false));
                                                }}
                                                className="flex items-center gap-3 p-3 border-b border-[#1a1a1a] cursor-pointer hover:bg-[#1a1a1a] transition"
                                            >
                                                <img src={getAvatar(notif.sender)} className="w-9 h-9 rounded-full object-cover" alt="" />
                                                <div className="flex-1 text-[13px] text-gray-300">
                                                    <strong className="text-white mr-1">{notif.sender?.username}</strong>
                                                    {notif.type === 'tag' ? 'te etiquetó.' : notif.type === 'comment_reaction' ? 'reaccionó a tu comentario.' : 'le dio me gusta a tu post.'}
                                                </div>
                                                {notif.post && <img src={`http://127.0.0.1:8000${notif.post.image_path}`} className="w-10 h-10 rounded object-cover" alt="" />}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {activeTab === 'requests' && (
                            <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                {followRequests.length === 0 ? (
                                    <p className="text-center text-gray-500 p-5 text-sm">No hay solicitudes.</p>
                                ) : (
                                    followRequests.map(request => (
                                        <div key={getSafeId(request._id) || getSafeId(request.id)} className="flex items-center gap-3 p-3 border-b border-[#1a1a1a]">
                                            <img src={getAvatar(request.sender)} className="w-9 h-9 rounded-full object-cover" alt="" />
                                            <div className="flex-1">
                                                <div className="text-[13px] text-gray-300"><strong className="text-white">{request.sender?.username}</strong> quiere seguirte.</div>
                                                <div className="flex gap-2 mt-2">
                                                    <button onClick={() => handleAccept(request)} className="flex-1 bg-[#0095f6] text-white border-none rounded py-1.5 text-xs font-bold cursor-pointer hover:bg-blue-600">Aceptar</button>
                                                    <button onClick={() => handleReject(request)} className="flex-1 bg-[#262626] text-white border border-[#333] rounded py-1.5 text-xs font-bold cursor-pointer">Rechazar</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Modal de Publicación */}
                {selectedPostModal && (
                    <div className="fixed inset-0 bg-black/90 z-[9999] flex justify-center items-center p-5 cursor-default" onClick={() => setSelectedPostModal(null)}>
                        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[600px] bg-[#121212] rounded-2xl border border-[#262626] flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
                            <div className="p-4 flex justify-between items-center border-b border-[#262626]">
                                <div className="flex items-center gap-3">
                                    <img src={getAvatar(selectedPostModal.user)} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
                                    <strong className="text-white">{selectedPostModal.user?.username}</strong>
                                </div>
                                <button onClick={() => setSelectedPostModal(null)} className="bg-transparent text-gray-500 hover:text-white border-none text-xl cursor-pointer font-bold">✕</button>
                            </div>
                            <div className="overflow-y-auto flex-1 flex flex-col custom-scrollbar">
                                <div className="bg-black flex justify-center items-center"><img src={selectedPostModal.image_path.startsWith('http') ? selectedPostModal.image_path : `http://127.0.0.1:8000${selectedPostModal.image_path}`} alt="Post" className="w-full max-h-[60vh] object-contain" /></div>
                                <div className="p-5 pb-0"><p className="m-0 text-[15px] text-gray-300"><strong className="text-white mr-2">@{selectedPostModal.user?.username}</strong>{selectedPostModal.description}</p></div>
                                <PostActions post={selectedPostModal} targetCommentId={targetCommentId} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Fragment>
    );
};

export default NotificationBell;