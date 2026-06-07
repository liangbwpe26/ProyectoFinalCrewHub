import React, { useState, Fragment } from 'react';

// Componente: MessageBubble
// Muestra un mensaje individual en el chat con acciones (editar, borrar).
const MessageBubble = ({ message, activeUser, onDelete, onEdit }) => {
    const myId = activeUser._id || activeUser.id;
    const isMe = message.sender_id === myId;
    
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content || '');
    
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const messageDate = new Date(message.created_at);
    const now = new Date();
    const canEdit = isMe && (now - messageDate) <= 180000;

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

    const handleEditSubmit = () => {
        if (editContent.trim() && editContent !== message.content) {
            onEdit(message._id || message.id, editContent);
        }
        setIsEditing(false);
        setShowMenu(false);
    };

    return (
        <Fragment>
            <div className={`flex mb-4 relative group ${isMe ? 'justify-end' : 'justify-start'}`}>
                
                {isMe && !isEditing && (
                    <div className="hidden group-hover:flex items-center mr-2 relative">
                        <button onClick={() => setShowMenu(!showMenu)} className="bg-transparent border-none text-gray-500 cursor-pointer text-2xl px-1 hover:text-[#0095f6] transition-colors leading-none pb-1">
                            ⋮
                        </button>

                        {showMenu && (
                            <div className="absolute right-full top-0 bg-[#1a1a1a]/90 backdrop-blur-md p-1.5 rounded-xl z-20 flex flex-col w-[130px] border border-[#333] shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                                {canEdit && (
                                    <button onClick={() => setIsEditing(true)} className="text-white bg-transparent border-none p-3 text-left cursor-pointer border-b border-[#333] text-[11px] font-bold uppercase tracking-widest hover:bg-[#262626] transition-colors rounded-t-lg">Editar</button>
                                )}
                                <button onClick={() => { setShowDeleteModal(true); setShowMenu(false); }} className="text-[#ff4d4d] bg-transparent border-none p-3 text-left cursor-pointer text-[11px] font-bold uppercase tracking-widest hover:bg-[#262626] transition-colors rounded-b-lg">Eliminar</button>
                            </div>
                        )}
                    </div>
                )}

                <div className={`p-3.5 md:p-4 rounded-3xl max-w-[75%] md:max-w-[65%] relative shadow-sm ${isMe ? 'bg-gradient-to-tr from-[#0095f6] to-[#0077c5] rounded-tr-sm text-white' : 'bg-[#1a1a1a] rounded-tl-sm border border-[#262626] text-gray-100'}`}>
                    
                    {message.story_media_path && (
                        <div className="mb-3 rounded-xl overflow-hidden border border-white/20 w-[140px] md:w-[160px] h-[220px] relative shadow-md">
                            {message.story_media_type === 'video' ? (
                                <video src={message.story_media_path.startsWith('http') ? message.story_media_path : `${BACKEND_URL}${message.story_media_path}`} className="w-full h-full object-cover" muted />
                            ) : (
                                <img src={message.story_media_path.startsWith('http') ? message.story_media_path : `${BACKEND_URL}${message.story_media_path}`} alt="Story Reply" className="w-full h-full object-cover" />
                            )}
                            <div className="absolute bottom-0 left-0 right-0 text-[9px] uppercase tracking-widest text-center bg-black/70 backdrop-blur-sm p-2 text-white font-bold border-t border-white/10">
                                Historia
                            </div>
                        </div>
                    )}
                    
                    {message.image_path && (
                        <div className={`rounded-xl overflow-hidden shadow-md ${message.content ? 'mb-3' : 'm-0'}`}>
                            <img 
                                src={message.image_path.startsWith('http') ? message.image_path : `${BACKEND_URL}${message.image_path}`} 
                                alt="Chat" 
                                className="max-w-full max-h-[250px] object-contain block" 
                            />
                        </div>
                    )}

                    {isEditing ? (
                        <div className="flex gap-2 items-center mt-1">
                            <input 
                                autoFocus
                                value={editContent} 
                                onChange={(e) => setEditContent(e.target.value)} 
                                onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit()}
                                className="bg-black/30 border border-white/20 shadow-inner text-white rounded-lg p-2 outline-none text-sm w-full font-medium" 
                            />
                            <button onClick={handleEditSubmit} className="bg-white text-[#0095f6] border-none rounded-lg cursor-pointer px-2.5 py-1.5 font-black text-sm hover:bg-gray-200 shadow-md">✓</button>
                            <button onClick={() => setIsEditing(false)} className="bg-transparent text-white border-none cursor-pointer text-sm font-black hover:text-red-400">✕</button>
                        </div>
                    ) : (
                        <span className="break-words leading-relaxed text-[14px] md:text-[15px] font-medium block">{message.content}</span>
                    )}
                    
                    {message.is_edited && !isEditing && (
                        <span className={`block text-[9px] uppercase tracking-widest font-bold mt-1.5 ${isMe ? 'text-white/70 text-right' : 'text-gray-500 text-left'}`}>(editado)</span>
                    )}
                </div>
            </div>

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[9999] p-4">
                    <div className="bg-[#121212]/95 backdrop-blur-2xl p-8 rounded-3xl w-[350px] text-center border border-[#333] shadow-[0_15px_50px_rgba(0,0,0,0.8)] animate-fade-in">
                        <div className="w-16 h-16 rounded-full bg-[#ff4d4d]/10 border border-[#ff4d4d]/30 mx-auto flex items-center justify-center text-[#ff4d4d] mb-4 shadow-inner">
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </div>
                        <h3 className="mt-0 text-white text-lg font-black tracking-wide mb-2">Eliminar mensaje</h3>
                        <p className="text-xs text-gray-400 mb-8 uppercase tracking-widest font-bold">¿Para quién quieres eliminarlo?</p>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => { onDelete(message._id || message.id, 'everyone'); setShowDeleteModal(false); }} 
                                className="p-4 bg-[#ff4d4d] text-white border-none rounded-xl cursor-pointer font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(255,77,77,0.3)] hover:scale-[1.02] transition-transform"
                            >
                                Para todos
                            </button>
                            <button 
                                onClick={() => { onDelete(message._id || message.id, 'me'); setShowDeleteModal(false); }} 
                                className="p-4 bg-[#262626] text-white border-none rounded-xl cursor-pointer font-bold text-xs uppercase tracking-widest hover:bg-[#333] transition-colors shadow-sm"
                            >
                                Solo para mí
                            </button>
                            <button 
                                onClick={() => setShowDeleteModal(false)} 
                                className="p-4 bg-transparent text-gray-400 border border-[#333] rounded-xl cursor-pointer text-xs font-bold uppercase tracking-widest mt-1 hover:bg-[#1a1a1a] hover:text-white transition-colors"
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