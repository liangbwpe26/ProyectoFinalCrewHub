import React, { Fragment, useContext, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { useChatsLogic } from '../../hooks/useChatsLogic.js';
import ChatRoom from '../ChatRoom.jsx';
import Navbar from '../structure/Navbar.jsx';

// Componente: Chats
// Muestra la lista de conversaciones y carga mensajes del usuario.
const Chats = () => {
    const { username } = useParams();
    const { activeUser } = useContext(AuthContext);
    const { chatList, loading, markAsRead, loadChatData, getAvatar } = useChatsLogic(username);

    useEffect(() => {
        if (username) {
            markAsRead(username);
        }
    }, [username, markAsRead]);

    return (
        <div className="h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1f1f1f] via-[#0a0a0a] to-black text-white font-sans flex flex-col overflow-hidden pb-[70px] md:pb-0">
            <Navbar />

            <div className="flex flex-1 w-full max-w-[1400px] mx-auto md:pt-[60px] overflow-hidden relative z-10">

                <div className={`w-full md:w-[380px] border-r border-[#262626] flex-col shrink-0 bg-[#121212]/50 backdrop-blur-md ${username ? 'hidden md:flex' : 'flex'}`}>

                    <div className="p-4 md:p-6 font-black text-xl border-b border-[#262626] flex items-center gap-4 shrink-0 shadow-sm bg-[#121212]/80">
                        <Link to="/" className="text-[#0095f6] text-2xl no-underline hover:text-blue-400 transition-colors leading-none drop-shadow-md">&larr;</Link>
                        <span className="tracking-wide">Mensajes</span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center items-center h-20">
                                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-500"></div>
                            </div>
                        ) : chatList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-10 text-center opacity-60">
                                <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mb-3"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                <p className="text-sm font-bold uppercase tracking-widest m-0">No tienes contactos</p>
                            </div>
                        ) : (
                            chatList.map((item) => (
                                <Link 
                                    key={item.user.username} 
                                    to={`/conversations/${item.user.username}`} 
                                    className={`flex gap-4 p-4 no-underline border-b border-[#1a1a1a] transition-all group ${username === item.user.username ? 'bg-[#1a1a1a]/80 border-l-4 border-l-[#0095f6]' : 'bg-transparent border-l-4 border-l-transparent hover:bg-[#1a1a1a]/50'}`}
                                >
                                    <div className="relative shrink-0">
                                        <img src={getAvatar(item.user)} className="w-12 h-12 rounded-full object-cover border border-[#333] shadow-md group-hover:border-[#555] transition-colors" alt="" />
                                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00ba7c] rounded-full border-2 border-[#121212]"></div>
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center min-w-0">
                                        <div className="text-white font-bold text-[15px] truncate">{item.user.display_name || item.user.username}</div>
                                        <div className="text-xs text-gray-400 truncate mt-0.5">{item.last_message ? item.last_message.content : 'Inicia un chat...'}</div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                <div className={`flex-1 flex-col bg-transparent relative ${!username ? 'hidden md:flex' : 'flex'}`}>
                    
                    {username && (
                        <div className="md:hidden absolute top-0 left-0 w-full z-10 bg-[#121212]/90 backdrop-blur-md border-b border-[#262626] p-3 flex items-center shadow-md">
                            <Link to="/conversations" className="text-[#0095f6] text-sm font-bold no-underline flex items-center gap-1">
                                <span>&larr; Volver a contactos</span>
                            </Link>
                        </div>
                    )}

                    {username ? (
                        <div className="flex-1 flex flex-col h-full pt-[45px] md:pt-0">
                            <ChatRoom targetUsername={username} onChatUpdate={loadChatData} />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col justify-center items-center p-4 text-center">
                            <div className="bg-[#121212]/60 backdrop-blur-xl border border-[#262626] p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col items-center max-w-sm w-full">
                                <div className="w-20 h-20 md:w-24 md:h-24 border border-[#333] rounded-full flex justify-center items-center mb-6 bg-[#1a1a1a] shadow-[inset_0_2px_10px_rgba(255,255,255,0.05)]">
                                    <svg width="40" height="40" fill="none" stroke="#555" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                </div>
                                <h2 className="m-0 mb-3 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 tracking-wide">Tus Mensajes</h2>
                                <p className="text-gray-400 m-0 text-sm leading-relaxed">Selecciona una conversación del panel lateral para empezar a chatear o buscar nuevos amigos.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chats;