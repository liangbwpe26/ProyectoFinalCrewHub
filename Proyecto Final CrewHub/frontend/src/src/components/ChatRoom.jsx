import React, { useContext, Fragment, useState, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { useChatRoomLogic } from '../hooks/useChatRoomLogic.js';
import MessageBubble from './MessageBubble.jsx';

// Componente: ChatRoom
// Sala de chat para conversar con otro usuario y enviar medios.
const ChatRoom = ({ targetUsername }) => {
    const { activeUser } = useContext(AuthContext);
    
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);

    const {
        messages, newMessage, setNewMessage, messagesEndRef,
        handleSendMessage, handleEditMessage, handleDeleteMessage,
        isLoadingChat 
    } = useChatRoomLogic(targetUsername);

    return (
        <Fragment>
            <div className="flex flex-col h-full bg-transparent relative z-10">
                
                <div className="p-5 border-b border-[#262626] flex items-center gap-4 bg-[#121212]/80 backdrop-blur-xl shadow-sm z-20">
                    <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center border border-[#333] shadow-inner text-[#0095f6]">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 5.58 2 10c0 2.6 1.48 4.9 3.75 6.33V22l4.37-2.33c.6.1 1.23.16 1.88.16 5.52 0 10-3.58 10-8s-4.48-8-10-8z" /></svg>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-lg text-white tracking-wide leading-tight">@{targetUsername}</span>
                        <span className="text-[10px] text-[#00ba7c] font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00ba7c] animate-pulse"></span>
                            Chat Seguro
                        </span>
                    </div>
                </div>

                <div className="flex-1 p-5 overflow-y-auto custom-scrollbar relative">
                    {isLoadingChat ? (
                        <div className="absolute inset-0 flex flex-col justify-center items-center bg-transparent z-10">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0095f6] mb-4 shadow-[0_0_15px_rgba(0,149,246,0.5)]"></div>
                            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Sincronizando...</span>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full opacity-60">
                            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mb-3 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                            <p className="text-center text-gray-500 m-0 text-sm font-bold tracking-wide">Inicia una conversación con {targetUsername}</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <MessageBubble 
                                key={msg._id || msg.id} 
                                message={msg} 
                                activeUser={activeUser} 
                                onEdit={handleEditMessage}
                                onDelete={handleDeleteMessage}
                            />
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* VISTA PREVIA DE LA IMAGEN */}
                {selectedImage && (
                    <div className="px-5 py-3 bg-[#121212]/90 backdrop-blur-xl border-t border-[#262626] flex items-center gap-4 shadow-[0_-10px_20px_rgba(0,0,0,0.3)]">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-[#0095f6] shadow-[0_0_15px_rgba(0,149,246,0.3)] group">
                            <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={() => setSelectedImage(null)} className="bg-[#ff4d4d] text-white border-none rounded-full w-6 h-6 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">✕</button>
                            </div>
                        </div>
                        <span className="text-[#0095f6] text-xs font-bold uppercase tracking-widest">Imagen adjunta</span>
                    </div>
                )}

                <div className="p-4 md:p-5 border-t border-[#262626] bg-[#121212]/80 backdrop-blur-xl z-20">
                    <form 
                        onSubmit={(e) => {
                            handleSendMessage(e, selectedImage);
                            setSelectedImage(null);
                        }} 
                        className="flex gap-3 items-center"
                    >
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current.click()} 
                            className="bg-[#1a1a1a] border border-[#333] rounded-full text-gray-400 cursor-pointer flex items-center justify-center w-12 h-12 hover:text-[#0095f6] hover:border-[#0095f6] transition-all shadow-inner shrink-0"
                            title="Adjuntar imagen"
                        >
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                        </button>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => setSelectedImage(e.target.files[0])} className="hidden" />

                        <input 
                            type="text" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Escribe un mensaje..."
                            disabled={isLoadingChat}
                            className="flex-1 px-5 py-3.5 rounded-full border border-[#333] bg-[#0a0a0a]/50 text-white outline-none focus:border-[#0095f6] focus:bg-[#111] transition-all text-sm disabled:opacity-50 shadow-inner placeholder:text-gray-600"
                        />
                        <button 
                            type="submit" 
                            disabled={(!newMessage.trim() && !selectedImage) || isLoadingChat}
                            className={`w-12 h-12 rounded-full border-none font-bold text-sm transition-all shrink-0 flex items-center justify-center ${ (newMessage.trim() || selectedImage) && !isLoadingChat ? 'bg-gradient-to-tr from-[#0095f6] to-[#0077c5] text-white cursor-pointer hover:scale-105 shadow-[0_0_15px_rgba(0,149,246,0.4)]' : 'bg-[#262626] text-gray-500 cursor-not-allowed' }`}
                        >
                            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
                        </button>
                    </form>
                </div>
            </div>
        </Fragment>
    );
};

export default ChatRoom;