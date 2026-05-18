import React, { Fragment, useContext, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { useChatsLogic } from '../../hooks/useChatsLogic.js';
import ChatRoom from '../ChatRoom.jsx';

const Chats = () => {
    const { username } = useParams(); 
    const { token, activeUser } = useContext(AuthContext);
    
    const { chatList, loading, getAvatar, markAsRead, loadChatData } = useChatsLogic(token, username);

    useEffect(() => {
        if (username) markAsRead(username);
    }, [username]);

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'ahora';

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `hace ${diffInHours} h`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `hace ${diffInDays} d`;

        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInWeeks < 4) return `hace ${diffInWeeks} sem`;

        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) return `hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`;

        const diffInYears = Math.floor(diffInDays / 365);
        return `hace ${diffInYears} año${diffInYears > 1 ? 's' : ''}`;
    };

    return (
        <Fragment>
            <div style={{ display: 'flex', height: '100vh', backgroundColor: '#000', color: '#fff' }}>
                
                <div style={{ width: '350px', borderRight: '1px solid #262626', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '20px', fontWeight: 'bold', fontSize: '1.2rem', borderBottom: '1px solid #262626', position: 'sticky', top: 0, backgroundColor: '#000', zIndex: 10, display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Link to="/" style={{ color: '#0095f6', textDecoration: 'none', fontSize: '1.4rem', lineHeight: '1' }}>&larr;</Link> Mensajes
                    </div>
                    
                    {loading ? (
                        <p style={{ textAlign: 'center', color: 'gray', padding: '20px' }}>Cargando...</p>
                    ) : chatList.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}><p style={{ color: 'gray' }}>No tienes contactos aún.</p></div>
                    ) : (
                        chatList.map((item) => (
                            <Link 
                                key={item.user.username} 
                                to={`/chats/${item.user.username}`}
                                style={{
                                    display: 'flex', gap: '15px', padding: '15px', textDecoration: 'none',
                                    backgroundColor: username === item.user.username ? '#121212' : 'transparent',
                                    transition: '0.2s', borderBottom: '1px solid #1a1a1a'
                                }}
                            >
                                <img src={getAvatar(item.user)} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} alt="" />
                                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    
                                    <div style={{ color: '#fff', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {item.user.display_name || item.user.username}
                                    </div>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                                        <div style={{ color: item.unread ? '#fff' : (item.last_message ? 'gray' : '#0095f6'), fontWeight: item.unread ? 'bold' : 'normal', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, paddingRight: '10px', transition: '0.2s' }}>
                                            {item.last_message ? (
                                                <Fragment>
                                                    {item.last_message.sender_id === (activeUser._id || activeUser.id) ? 'Tú: ' : ''}
                                                    {item.last_message.is_edited ? '(Editado) ' : ''}
                                                    {item.last_message.content}
                                                </Fragment>
                                            ) : 'Toca para iniciar un chat'}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                                            {item.unread && <div style={{ width: '8px', height: '8px', backgroundColor: '#0095f6', borderRadius: '50%' }}></div>}
                                            {item.last_message && (
                                                <div style={{ fontSize: '0.75rem', color: item.unread ? '#0095f6' : '#555', fontWeight: item.unread ? 'bold' : 'normal', transition: '0.2s', whiteSpace: 'nowrap' }}>
                                                    {formatTime(item.last_message.created_at)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#0a0a0a' }}>
                    {username ? (
                        <ChatRoom targetUsername={username} onChatUpdate={loadChatData} /> 
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ width: '90px', height: '90px', border: '2px solid #333', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
                                <svg width="45" height="45" fill="gray" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 5.58 2 10c0 2.6 1.48 4.9 3.75 6.33V22l4.37-2.33c.6.1 1.23.16 1.88.16 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/></svg>
                            </div>
                            <h2 style={{ margin: '0 0 10px 0' }}>Tus mensajes</h2>
                            <p style={{ color: 'gray', margin: 0 }}>Selecciona un contacto para comenzar a hablar.</p>
                        </div>
                    )}
                </div>
            </div>
        </Fragment>
    );
};

export default Chats;