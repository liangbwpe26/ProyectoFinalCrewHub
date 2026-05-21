import React, { useState, Fragment } from 'react';

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
                
                {/* MENÚ DE 3 PUNTOS (Solo visible al pasar el ratón usando clases "group" de Tailwind) */}
                {isMe && !isEditing && (
                    <div className="hidden group-hover:flex items-center mr-2 relative">
                        <button onClick={() => setShowMenu(!showMenu)} className="bg-transparent border-none text-gray-500 cursor-pointer text-xl px-1 hover:text-white transition">
                            ⋮
                        </button>

                        {showMenu && (
                            <div className="absolute right-full top-0 bg-[#262626] p-1 rounded-lg z-10 flex flex-col w-[120px] shadow-lg">
                                {canEdit && (
                                    <button onClick={() => setIsEditing(true)} className="text-white bg-transparent border-none p-2.5 text-left cursor-pointer border-b border-[#333] text-sm hover:bg-[#333] transition rounded-t-md">Editar</button>
                                )}
                                <button onClick={() => { setShowDeleteModal(true); setShowMenu(false); }} className="text-[#ff4d4d] bg-transparent border-none p-2.5 text-left cursor-pointer text-sm hover:bg-[#333] transition rounded-b-md">Eliminar</button>
                            </div>
                        )}
                    </div>
                )}

                {/* EL GLOBO DE TEXTO */}
                <div className={`p-3 rounded-2xl max-w-[65%] relative ${isMe ? 'bg-[#0095f6] rounded-tr-sm' : 'bg-[#262626] rounded-tl-sm'}`}>
                    
                    {message.story_media_path && (
                        <div className="mb-2 rounded-lg overflow-hidden border border-white/20 w-[150px] h-[200px] relative">
                            {message.story_media_type === 'video' ? (
                                <video src={message.story_media_path.startsWith('http') ? message.story_media_path : `http://127.0.0.1:8000${message.story_media_path}`} className="w-full h-full object-cover" muted />
                            ) : (
                                <img src={message.story_media_path.startsWith('http') ? message.story_media_path : `http://127.0.0.1:8000${message.story_media_path}`} alt="Story Reply" className="w-full h-full object-cover" />
                            )}
                            <div className="absolute bottom-0 left-0 right-0 text-[10px] text-center bg-black/70 p-1.5 text-white font-bold">
                                Respuesta a historia
                            </div>
                        </div>
                    )}
                    
                    {/* IMAGEN DEL CHAT */}
                    {message.image_path && (
                        <div className={`rounded-lg overflow-hidden ${message.content ? 'mb-2' : 'm-0'}`}>
                            <img 
                                src={message.image_path.startsWith('http') ? message.image_path : `http://127.0.0.1:8000${message.image_path}`} 
                                alt="Chat" 
                                className="max-w-full max-h-[300px] object-contain rounded-lg block" 
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
                                className="bg-black/20 border-none text-white rounded p-1.5 outline-none text-sm w-full" 
                            />
                            <button onClick={handleEditSubmit} className="bg-white text-black border-none rounded cursor-pointer px-2 py-1 font-bold text-xs hover:bg-gray-200">✓</button>
                            <button onClick={() => setIsEditing(false)} className="bg-transparent text-white border-none cursor-pointer text-xs hover:text-gray-300">✕</button>
                        </div>
                    ) : (
                        <span className="text-white break-words leading-relaxed text-sm">{message.content}</span>
                    )}
                    
                    {message.is_edited && !isEditing && (
                        <span className={`block text-[10px] text-white/60 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>(editado)</span>
                    )}
                </div>
            </div>

            {/* MODAL DE ELIMINACIÓN DE MENSAJE */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[9999]">
                    <div className="bg-[#1a1a1a] p-6 rounded-2xl w-[320px] text-center border border-[#333] shadow-2xl">
                        <h3 className="mt-0 text-white text-lg font-bold mb-2">Eliminar mensaje</h3>
                        <p className="text-sm text-gray-400 mb-6">¿Para quién quieres eliminar este mensaje?</p>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => { onDelete(message._id || message.id, 'everyone'); setShowDeleteModal(false); }} 
                                className="p-3 bg-[#ff4d4d] text-white border-none rounded-lg cursor-pointer font-bold text-sm hover:bg-red-600 transition"
                            >
                                Eliminar para todos
                            </button>
                            <button 
                                onClick={() => { onDelete(message._id || message.id, 'me'); setShowDeleteModal(false); }} 
                                className="p-3 bg-[#262626] text-white border-none rounded-lg cursor-pointer font-bold text-sm hover:bg-[#333] transition"
                            >
                                Eliminar para mí
                            </button>
                            <button 
                                onClick={() => setShowDeleteModal(false)} 
                                className="p-3 bg-transparent text-white border border-[#444] rounded-lg cursor-pointer text-sm mt-1 hover:bg-[#262626] transition"
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