import React, { useState, useContext, Fragment } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import useNotifications, { getSafeId } from '../hooks/useNotifications.js'; 
import PostActions from './PostActions.jsx';

const NotificationBell = () => {
    const { token, activeUser } = useContext(AuthContext);

    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('main');

    const {
        mainNotifications,
        followRequests,
        unreadCount,
        handleAccept,
        handleReject,
        markAllAsRead,
        selectedPostModal,
        setSelectedPostModal,
        isLoadingPost,
        openNotificationPost,
        targetCommentId,
    } = useNotifications(token, activeUser?._id || activeUser?.id);

    const getAvatar = (user) => {
        if (user?.profile_picture) return user.profile_picture.startsWith('http') ? user.profile_picture : `http://127.0.0.1:8000${user.profile_picture}`;
        return `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=262626&color=fff&bold=true`;
    };

    return (
        <Fragment>
            <div style={{ position: 'relative' }}>
                <button
                    onClick={() => {
                        setIsOpen(!isOpen);
                        if (!isOpen && unreadCount > 0) markAllAsRead();
                    }}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', position: 'relative' }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    {unreadCount > 0 && (
                        <span style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#ff4d4d', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                            {unreadCount}
                        </span>
                    )}
                </button>

                {isOpen && (
                    <div style={{ position: 'absolute', right: 0, top: '40px', width: '350px', backgroundColor: '#121212', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', borderBottom: '1px solid #333' }}>
                            <button onClick={() => setActiveTab('main')} style={{ flex: 1, padding: '12px', background: 'none', border: 'none', color: activeTab === 'main' ? '#fff' : 'gray', borderBottom: activeTab === 'main' ? '2px solid #0095f6' : 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                Principal
                            </button>
                            <button onClick={() => setActiveTab('requests')} style={{ flex: 1, padding: '12px', background: 'none', border: 'none', color: activeTab === 'requests' ? '#fff' : 'gray', borderBottom: activeTab === 'requests' ? '2px solid #0095f6' : 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                Solicitudes {followRequests.length > 0 && `(${followRequests.length})`}
                            </button>
                        </div>

                        {activeTab === 'main' && (
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {mainNotifications.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: 'gray', padding: '20px' }}>No hay actividad reciente.</p>
                                ) : (
                                    mainNotifications.map(notif => {
                                        const postId = getSafeId(notif.post_id) || getSafeId(notif.post?._id);

                                        return (
                                            <div
                                                key={getSafeId(notif._id) || getSafeId(notif.id)}
                                                onClick={() => openNotificationPost(postId, notif.comment_id, () => setIsOpen(false))}
                                                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderBottom: '1px solid #1a1a1a', cursor: 'pointer', transition: '0.2s' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <img src={getAvatar(notif.sender)} style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }} alt="" />
                                                <div style={{ flex: 1, fontSize: '0.85rem' }}>
                                                    <strong style={{ color: '#fff' }}>{notif.sender?.username}</strong>
                                                    {
                                                        notif.type === 'tag' ? ' te etiquetó en un comentario.' :
                                                            notif.type === 'comment_reaction' ? ' reaccionó a tu comentario.' :
                                                                ' respondió a tu comentario.'
                                                    }
                                                </div>
                                                {notif.post && (
                                                    <img src={`http://127.0.0.1:8000${notif.post.image_path}`} style={{ width: '35px', height: '35px', borderRadius: '4px', objectFit: 'cover' }} alt="" />
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {activeTab === 'requests' && (
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {followRequests.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: 'gray', padding: '20px' }}>No tienes solicitudes pendientes.</p>
                                ) : (
                                    followRequests.map(request => (
                                        <div
                                            key={getSafeId(request._id) || getSafeId(request.id)}
                                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', borderBottom: '1px solid #1a1a1a' }}
                                        >
                                            <img
                                                src={getAvatar(request.sender)}
                                                style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover' }}
                                                alt=""
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.85rem', color: '#fff' }}>
                                                    <strong>{request.sender?.username}</strong> quiere seguirte.
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                                    <button
                                                        onClick={() => handleAccept(request)}
                                                        style={{ flex: 1, backgroundColor: '#0095f6', color: 'white', border: 'none', borderRadius: '4px', padding: '5px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                                                    >
                                                        Aceptar
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(request)}
                                                        style={{ flex: 1, backgroundColor: '#262626', color: 'white', border: '1px solid #333', borderRadius: '4px', padding: '5px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}
                                                    >
                                                        Rechazar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                {selectedPostModal && (
                    <div
                        style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.9)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", cursor: "default" }}
                        onClick={() => setSelectedPostModal(null)}
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: "100%", maxWidth: "600px", backgroundColor: "#121212", borderRadius: "12px", border: "1px solid #262626", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "90vh" }}
                        >
                            <div style={{ padding: "15px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #262626", flexShrink: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <img src={getAvatar(selectedPostModal.user)} alt="avatar" style={{ width: "35px", height: "35px", borderRadius: "50%", objectFit: "cover" }} />
                                    <strong style={{ color: "#fff" }}>{selectedPostModal.user?.username}</strong>
                                </div>
                                <button onClick={() => setSelectedPostModal(null)} style={{ background: "transparent", color: "gray", border: "none", fontSize: "1.2rem", cursor: "pointer", fontWeight: "bold" }}>✕</button>
                            </div>

                            <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column" }}>
                                <div style={{ backgroundColor: "#000", display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
                                    <img
                                        src={selectedPostModal.image_path.startsWith('http') ? selectedPostModal.image_path : `http://127.0.0.1:8000${selectedPostModal.image_path}`}
                                        alt="Post"
                                        style={{ width: "100%", maxHeight: "60vh", objectFit: "contain", display: "block" }}
                                    />
                                </div>
                                <div style={{ padding: "20px 20px 0 20px" }}>
                                    <p style={{ margin: 0, fontSize: "1rem", lineHeight: "1.5", color: "#e0e0e0" }}>
                                        <strong style={{ color: "#fff", marginRight: "8px" }}>@{selectedPostModal.user?.username}</strong>
                                        {selectedPostModal.description}
                                    </p>
                                </div>

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