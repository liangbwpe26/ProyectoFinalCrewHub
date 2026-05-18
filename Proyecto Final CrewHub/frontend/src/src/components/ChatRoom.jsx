import React, { useContext, Fragment } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { useChatRoomLogic } from '../hooks/useChatRoomLogic.js';
import MessageBubble from './MessageBubble.jsx';

const ChatRoom = ({ targetUsername }) => {
    const { token, activeUser } = useContext(AuthContext);
    
    // Obtenemos todo lo necesario de nuestro Hook
    const {
        messages,
        newMessage,
        setNewMessage,
        messagesEndRef,
        handleSendMessage,
        handleEditMessage,
        handleDeleteMessage
    } = useChatRoomLogic(targetUsername, token);

    return (
        <Fragment>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ padding: '15px 20px', borderBottom: '1px solid #262626', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#fff' }}>@{targetUsername}</div>
                </div>

                <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                    {messages.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'gray', marginTop: '20px' }}>Inicia una conversación con {targetUsername}</p>
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

                <div style={{ padding: '20px', borderTop: '1px solid #262626' }}>
                    <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
                        <input 
                            type="text" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Escribe un mensaje..."
                            style={{ flex: 1, padding: '12px 20px', borderRadius: '30px', border: '1px solid #333', backgroundColor: '#121212', color: '#fff', outline: 'none' }}
                        />
                        <button 
                            type="submit" 
                            disabled={!newMessage.trim()}
                            style={{ padding: '0 20px', borderRadius: '30px', backgroundColor: newMessage.trim() ? '#0095f6' : '#262626', color: newMessage.trim() ? '#fff' : 'gray', border: 'none', fontWeight: 'bold', cursor: newMessage.trim() ? 'pointer' : 'default', transition: '0.2s' }}
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