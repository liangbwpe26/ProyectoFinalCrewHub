import React, { Fragment, useContext, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { useChatsLogic } from '../../hooks/useChatsLogic.js';
import ChatRoom from '../ChatRoom.jsx';
import Navbar from '../structure/Navbar.jsx';

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
        <div className="h-screen bg-[#0a0a0a] text-white font-sans flex flex-col overflow-hidden">
            <Navbar />

            {/* pt-[60px] empuja el contenido hacia abajo para que el Navbar fijo no lo tape */}
            <div className="flex flex-1 w-full max-w-[1400px] mx-auto pt-[60px] overflow-hidden">
                
                {/* BARRA LATERAL (LISTA DE CHATS) */}
                <div className="w-full md:w-[350px] border-r border-[#262626] flex flex-col shrink-0 bg-[#0a0a0a]">
                    
                    <div className="p-5 font-bold text-xl border-b border-[#262626] flex items-center gap-4 shrink-0">
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
                                <Link 
                                    key={item.user.username} 
                                    to={`/chats/${item.user.username}`}
                                    className={`flex gap-4 p-4 no-underline border-b border-[#1a1a1a] transition-colors hover:bg-[#121212] ${username === item.user.username ? 'bg-[#121212]' : 'bg-transparent'}`}
                                >
                                    <img src={getAvatar(item.user)} className="w-12 h-12 rounded-full object-cover shrink-0 border border-[#333]" alt="" />
                                    <div className="flex-1 flex flex-col justify-center min-w-0">
                                        
                                        <div className="text-white font-bold text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                            {item.user.display_name || item.user.username}
                                        </div>
                                        
                                        <div className="flex justify-between items-center mt-1 gap-2">
                                            <div className={`text-xs whitespace-nowrap overflow-hidden text-ellipsis flex-1 transition-colors ${item.unread ? 'text-white font-bold' : (item.last_message ? 'text-gray-400' : 'text-[#0095f6]')}`}>
                                                {item.last_message ? (
                                                    <Fragment>
                                                        {item.last_message.sender_id === (activeUser._id || activeUser.id) ? 'Tú: ' : ''}
                                                        {item.last_message.is_edited ? '(Editado) ' : ''}
                                                        {item.last_message.story_media_path ? '[Historia] ' : ''}
                                                        {item.last_message.content}
                                                    </Fragment>
                                                ) : 'Toca para iniciar un chat'}
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                {item.unread && <div className="w-2 h-2 bg-[#0095f6] rounded-full shadow-[0_0_8px_rgba(0,149,246,0.8)]"></div>}
                                                {item.last_message && (
                                                    <div className={`text-[10px] whitespace-nowrap transition-colors ${item.unread ? 'text-[#0095f6] font-bold' : 'text-gray-500'}`}>
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
                </div>

                {/* ÁREA PRINCIPAL DEL CHAT */}
                <div className="flex-1 flex flex-col bg-[#000]">
                    {username ? (
                        <ChatRoom targetUsername={username} onChatUpdate={loadChatData} /> 
                    ) : (
                        <div className="flex-1 flex flex-col justify-center items-center">
                            <div className="w-24 h-24 border border-[#333] rounded-full flex justify-center items-center mb-5 bg-[#121212] shadow-2xl">
                                <svg width="45" height="45" fill="#444" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 5.58 2 10c0 2.6 1.48 4.9 3.75 6.33V22l4.37-2.33c.6.1 1.23.16 1.88.16 5.52 0 10-3.58 10-8s-4.48-8-10-8z"/></svg>
                            </div>
                            <h2 className="m-0 mb-2 text-xl font-bold text-white tracking-wide">Tus mensajes</h2>
                            <p className="text-gray-500 m-0 text-sm">Selecciona un contacto para comenzar a hablar.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chats;