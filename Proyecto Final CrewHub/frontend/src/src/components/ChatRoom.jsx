import React, { useContext, Fragment, useState, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { useChatRoomLogic } from '../hooks/useChatRoomLogic.js';
import MessageBubble from './MessageBubble.jsx';

const ChatRoom = ({ targetUsername }) => {
    const { token, activeUser } = useContext(AuthContext);
    
    // ESTADOS PARA LA IMAGEN QUE FALTABAN
    const [selectedImage, setSelectedImage] = useState(null);
    const fileInputRef = useRef(null);

    const {
        messages, newMessage, setNewMessage, messagesEndRef,
        handleSendMessage, handleEditMessage, handleDeleteMessage
    } = useChatRoomLogic(targetUsername, token);

    return (
        <Fragment>
            <div className="flex flex-col h-full bg-[#0a0a0a]">
                <div className="p-4 border-b border-[#262626] flex items-center gap-4 bg-[#121212]">
                    <div className="font-bold text-lg text-white">@{targetUsername}</div>
                </div>

                <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                    {messages.length === 0 ? (
                        <p className="text-center text-gray-500 mt-5 text-sm">Inicia una conversación con {targetUsername}</p>
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
                    <div className="px-5 py-3 bg-[#1a1a1a] border-t border-[#262626] flex items-center gap-4">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-[#333]">
                            <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="w-full h-full object-cover" />
                            <button onClick={() => setSelectedImage(null)} className="absolute top-0 right-0 bg-black/60 text-white border-none cursor-pointer px-1.5 py-0.5 text-[10px] hover:bg-red-500 transition">✕</button>
                        </div>
                        <span className="text-gray-400 text-xs">Imagen lista para enviar</span>
                    </div>
                )}

                <div className="p-4 border-t border-[#262626] bg-[#121212]">
                    <form 
                        onSubmit={(e) => {
                            handleSendMessage(e, selectedImage);
                            setSelectedImage(null);
                        }} 
                        className="flex gap-3 items-center"
                    >
                        {/* BOTÓN DEL CLIP PARA ADJUNTAR */}
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current.click()} 
                            className="bg-transparent border-none text-gray-400 cursor-pointer flex items-center justify-center p-1 hover:text-white transition"
                        >
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                        </button>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={(e) => setSelectedImage(e.target.files[0])} className="hidden" />

                        <input 
                            type="text" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Escribe un mensaje..."
                            className="flex-1 px-4 py-3 rounded-full border border-[#333] bg-[#000] text-white outline-none focus:border-[#0095f6] transition text-sm"
                        />
                        <button 
                            type="submit" 
                            disabled={!newMessage.trim() && !selectedImage}
                            className={`px-5 h-11 rounded-full border-none font-bold text-sm transition ${ (newMessage.trim() || selectedImage) ? 'bg-[#0095f6] text-white cursor-pointer hover:bg-blue-600' : 'bg-[#262626] text-gray-500 cursor-default' }`}
                        >
                            Enviar
                        </button>
                    </form>
                </div>
            </div>
        </Fragment>
    );
};

export default ChatRoom;