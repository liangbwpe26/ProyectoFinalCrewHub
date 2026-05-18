import React, { useState, Fragment } from 'react';

const MessageBubble = ({ message, activeUser, onDelete, onEdit }) => {
    const myId = activeUser._id || activeUser.id;
    const isMe = message.sender_id === myId;
    
    const [isHovered, setIsHovered] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const messageDate = new Date(message.created_at);
    const now = new Date();
    const canEdit = isMe && (now - messageDate) <= 180000;

    const handleEditSubmit = () => {
        if (editContent.trim() && editContent !== message.content) {
            onEdit(message._id || message.id, editContent);
        }
        setIsEditing(false);
        setShowMenu(false);
    };

    return (
        <Fragment>
            <div 
                onMouseEnter={() => setIsHovered(true)} 
                onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
                style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: '15px', position: 'relative' }}
            >
                {/* MENÚ DE 3 PUNTOS */}
                {isMe && isHovered && !isEditing && (
                    <div style={{ display: 'flex', alignItems: 'center', marginRight: '10px', position: 'relative' }}>
                        <button onClick={() => setShowMenu(!showMenu)} style={{ background: 'none', border: 'none', color: 'gray', cursor: 'pointer', fontSize: '1.2rem', padding: '0 5px' }}>
                            ⋮
                        </button>

                        {showMenu && (
                            <div style={{ position: 'absolute', right: '100%', top: '0', backgroundColor: '#262626', padding: '5px', borderRadius: '8px', zIndex: 10, display: 'flex', flexDirection: 'column', width: '120px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                                {canEdit && (
                                    <button onClick={() => setIsEditing(true)} style={{ color: 'white', background: 'none', border: 'none', padding: '10px', textAlign: 'left', cursor: 'pointer', borderBottom: '1px solid #333' }}>Editar</button>
                                )}
                                {/* 🔥 ABRIMOS NUESTRO MODAL EN LUGAR DEL CONFIRM FEO */}
                                <button onClick={() => { setShowDeleteModal(true); setShowMenu(false); }} style={{ color: '#ff4d4d', background: 'none', border: 'none', padding: '10px', textAlign: 'left', cursor: 'pointer' }}>Eliminar</button>
                            </div>
                        )}
                    </div>
                )}

                {/* EL GLOBO DE TEXTO */}
                <div style={{ backgroundColor: isMe ? '#0095f6' : '#262626', padding: '10px 15px', borderRadius: '18px', maxWidth: '65%', position: 'relative' }}>
                    {isEditing ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input 
                                autoFocus
                                value={editContent} 
                                onChange={(e) => setEditContent(e.target.value)} 
                                onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit()}
                                style={{ background: 'rgba(0,0,0,0.2)', border: 'none', color: '#fff', borderRadius: '4px', padding: '5px', outline: 'none' }} 
                            />
                            <button onClick={handleEditSubmit} style={{ background: '#fff', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '4px 8px', fontWeight: 'bold' }}>✓</button>
                            <button onClick={() => setIsEditing(false)} style={{ background: 'transparent', color: '#fff', border: 'none', cursor: 'pointer' }}>✕</button>
                        </div>
                    ) : (
                        <span style={{ color: 'white', wordBreak: 'break-word', lineHeight: '1.4' }}>{message.content}</span>
                    )}
                    
                    {message.is_edited && !isEditing && (
                        <span style={{ display: 'block', fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px', textAlign: isMe ? 'right' : 'left' }}>(editado)</span>
                    )}
                </div>
            </div>

            {/* 🔥 EL MODAL DE ELIMINACIÓN MODERNO */}
            {showDeleteModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                    <div style={{ backgroundColor: '#1a1a1a', padding: '25px', borderRadius: '16px', width: '320px', textAlign: 'center', border: '1px solid #333', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                        <h3 style={{ marginTop: 0, color: '#fff', fontSize: '1.3rem' }}>Eliminar mensaje</h3>
                        <p style={{ fontSize: '0.9rem', color: 'gray', marginBottom: '25px' }}>¿Para quién quieres eliminar este mensaje?</p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button 
                                onClick={() => { onDelete(message._id || message.id, 'everyone'); setShowDeleteModal(false); }} 
                                style={{ padding: '12px', backgroundColor: '#ff4d4d', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}
                            >
                                Eliminar para todos
                            </button>
                            <button 
                                onClick={() => { onDelete(message._id || message.id, 'me'); setShowDeleteModal(false); }} 
                                style={{ padding: '12px', backgroundColor: '#262626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}
                            >
                                Eliminar para mí
                            </button>
                            <button 
                                onClick={() => setShowDeleteModal(false)} 
                                style={{ padding: '12px', backgroundColor: 'transparent', color: '#fff', border: '1px solid #444', borderRadius: '8px', cursor: 'pointer', marginTop: '5px' }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
};

export default MessageBubble;