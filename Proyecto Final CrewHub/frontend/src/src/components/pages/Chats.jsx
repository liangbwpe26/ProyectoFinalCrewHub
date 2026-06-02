import React, { Fragment, useContext, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { useChatsLogic } from '../../hooks/useChatsLogic.js';
import ChatRoom from '../ChatRoom.jsx';
import Navbar from '../structure/Navbar.jsx';

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
        <div className="h-screen bg-[#0a0a0a] text-white font-sans flex flex-col overflow-hidden pb-[70px] md:pb-0">
            <Navbar />

            <div className="flex flex-1 w-full max-w-[1400px] mx-auto md:pt-[60px] overflow-hidden">

                <div className={`w-full md:w-[350px] border-r border-[#262626] flex-col shrink-0 bg-[#0a0a0a] ${username ? 'hidden md:flex' : 'flex'}`}>

                    <div className="p-4 md:p-5 font-bold text-xl border-b border-[#262626] flex items-center gap-4 shrink-0">
                        <Link to="/" className="text-[#0095f6] text-2xl no-underline hover:text-blue-400 transition-colors leading-none">&larr;</Link>
                        <span>Mensajes</span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <p className="text-center text-gray-500 p-5 text-sm">Cargando...</p>
                        ) : chatList.length === 0 ? (
                            <p className="text-center text-gray-500 p-5 text-sm">No tienes contactos aún.</p>
                        ) : (
                            chatList.map((item) => (
                                <Link key={item.user.username} to={`/conversations/${item.user.username}`} className={`flex gap-4 p-4 no-underline border-b border-[#1a1a1a] transition-colors hover:bg-[#121212] ${username === item.user.username ? 'bg-[#121212]' : 'bg-transparent'}`}>
                                    <img src={getAvatar(item.user)} className="w-12 h-12 rounded-full object-cover shrink-0 border border-[#333]" alt="" />
                                    <div className="flex-1 flex flex-col justify-center min-w-0">
                                        <div className="text-white font-bold text-sm truncate">{item.user.display_name || item.user.username}</div>
                                        <div className="text-xs text-gray-400 truncate mt-1">{item.last_message ? item.last_message.content : 'Inicia un chat'}</div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                <div className={`flex-1 flex-col bg-[#000] relative ${!username ? 'hidden md:flex' : 'flex'}`}>
                    
                    {username && (
                        <div className="md:hidden absolute top-0 left-0 w-full z-10 bg-[#121212] border-b border-[#262626] p-3 flex items-center">
                            {/* SOLUCIÓN: Cambiado a /conversations */}
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
                            <div className="w-20 h-20 md:w-24 md:h-24 border border-[#333] rounded-full flex justify-center items-center mb-5 bg-[#121212] shadow-2xl">
                                <svg width="40" height="40" fill="#444" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 5.58 2 10c0 2.6 1.48 4.9 3.75 6.33V22l4.37-2.33c.6.1 1.23.16 1.88.16 5.52 0 10-3.58 10-8s-4.48-8-10-8z" /></svg>
                            </div>
                            <h2 className="m-0 mb-2 text-lg md:text-xl font-bold text-white tracking-wide">Tus mensajes</h2>
                            <p className="text-gray-500 m-0 text-sm">Selecciona un contacto para comenzar a hablar.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chats;