import React, { Fragment, useContext, useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext.jsx"; 
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
window.Pusher = Pusher;

const Chat = () => {
    const { id } = useParams();
    const { token, activeUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const myId = activeUser?.id || activeUser?._id;

    // 1. Cargar el historial
    useEffect(() => {
        if (!token) { navigate("/login"); return; }

        const fetchMessages = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/chat/${id}/messages`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
                });
                const data = await response.json();
                if (data.success) {
                    setMessages(data.messages);
                }
            } catch (error) {
                console.error("Error cargando historial:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMessages();
    }, [id, token, navigate]);

    // 2. ESCUCHAR EN TIEMPO REAL (Corregido)
    useEffect(() => {
        if (!token || !id) return;

        const echo = new Echo({
            broadcaster: 'reverb',
            key: import.meta.env.VITE_REVERB_APP_KEY,
            wsHost: import.meta.env.VITE_REVERB_HOST,
            wsPort: import.meta.env.VITE_REVERB_PORT,
            wssPort: import.meta.env.VITE_REVERB_PORT,
            forceTLS: false,
            enabledTransports: ['ws', 'wss'],
            authEndpoint: 'http://127.0.0.1:8000/api/broadcasting/auth',
            auth: {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                }
            }
        });

        const channel = echo.private(`chat.${id}`);

        // CAMBIO: Aseguramos que el nombre coincida con el broadcastAs del Backend
        channel.listen('.MessageSent', (e) => {
            console.log("¡Mensaje recibido!", e);
            
            setMessages((prevMessages) => {
                // CORRECCIÓN: Comprobamos el ID de forma flexible (_id o id)
                const incomingId = e.message._id || e.message.id;
                const exists = prevMessages.some(m => (m._id || m.id) === incomingId);
                
                if (exists) return prevMessages;
                return [...prevMessages, e.message];
            });
        });

        return () => {
            // CAMBIO: El nombre aquí debe ser igual al del listen para limpiar bien
            channel.stopListening('.MessageSent');
            echo.leave(`chat.${id}`);
        };
    }, [id, token]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/chat/${id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ content: newMessage })
            });

            const data = await response.json();
            if (data.success) {
                // Importante: No limpiamos la lista, solo añadimos si no estaba
                setMessages((prev) => {
                    const exists = prev.some(m => (m._id || m.id) === (data.message._id || data.message.id));
                    return exists ? prev : [...prev, data.message];
                });
                setNewMessage("");
            }
        } catch (error) {
            console.error("Error al enviar:", error);
        }
    };

    if (!activeUser) return null;

    return (
        <Fragment>
            <div style={{ height: "100vh", backgroundColor: "#000", color: "#fff", display: "flex", flexDirection: "column" }}>
                <header style={{ padding: "15px 20px", borderBottom: "1px solid #262626", display: "flex", alignItems: "center", gap: "15px" }}>
                    <Link to="/" style={{ color: "#0095f6", textDecoration: "none", fontSize: "1.2rem", fontWeight: "bold" }}> &larr; </Link>
                    <h2 style={{ margin: 0, fontSize: "1.1rem" }}>Chat Privado</h2>
                </header>

                <main style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", overflowY: "auto", gap: "10px" }}>
                    {loading ? (
                        <p style={{ textAlign: "center", color: "gray" }}>Cargando...</p>
                    ) : messages.length === 0 ? (
                        <p style={{ textAlign: "center", color: "gray", margin: "auto" }}>Inicia la conversación.</p>
                    ) : (
                        messages.map((msg, index) => {
                            // CORRECCIÓN: Key única usando ID o index como último recurso
                            const msgId = msg._id || msg.id || `temp-${index}`;
                            const isMine = msg.sender_id === myId;
                            
                            return (
                                <div
                                    key={msgId}
                                    style={{
                                        alignSelf: isMine ? "flex-end" : "flex-start",
                                        backgroundColor: isMine ? "#0095f6" : "#262626",
                                        color: "#fff",
                                        padding: "10px 15px",
                                        borderRadius: "20px",
                                        maxWidth: "70%",
                                        wordWrap: "break-word"
                                    }}
                                >
                                    {msg.content}
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </main>

                <footer style={{ padding: "15px", borderTop: "1px solid #262626" }}>
                    <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "10px", maxWidth: "1000px", margin: "0 auto" }}>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Escribe un mensaje..."
                            style={{ flex: 1, padding: "12px 20px", borderRadius: "30px", border: "1px solid #363636", backgroundColor: "#262626", color: "#fff", outline: "none" }}
                        />
                        <button type="submit" disabled={!newMessage.trim()} style={{ padding: "10px 25px", borderRadius: "30px", border: "none", backgroundColor: newMessage.trim() ? "#0095f6" : "#363636", color: "white", cursor: "pointer", fontWeight: "bold" }}>
                            Enviar
                        </button>
                    </form>
                </footer>
            </div>
        </Fragment>
    );
};

export default Chat;