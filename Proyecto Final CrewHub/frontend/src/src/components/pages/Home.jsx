import React, { Fragment, useContext, useState, useEffect } from "react";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
    const { activeUser, logout, token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // NUEVO: Estado para guardar los amigos mutuos
    const [mutuals, setMutuals] = useState([]);

    // NUEVO: Función para pedir los mutuals al backend
    const fetchMutuals = async () => {
        if (!token) return;
        try {
            const response = await fetch('http://127.0.0.1:8000/api/mutuals', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            if (data.success) {
                setMutuals(data.mutuals);
            }
        } catch (error) {
            console.error("Error obteniendo mutuals:", error);
        }
    };

    // NUEVO: Ejecutar fetchMutuals nada más cargar la página (si estamos logueados)
    useEffect(() => {
        fetchMutuals();
    }, [token]);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/users/search?q=${query}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            if (data.success) {
                setSearchResults(data.users);
            }
        } catch (error) {
            console.error("Error buscando usuarios:", error);
        }
        setIsSearching(false);
    };

    const toggleFollow = async (userId, currentlyFollowing) => {
        const endpoint = currentlyFollowing ? 'unfollow' : 'follow';
        const method = currentlyFollowing ? 'DELETE' : 'POST';

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/${endpoint}/${userId}`, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                setSearchResults(searchResults.map(user => {
                    const currentId = user.id || user._id;
                    if (currentId === userId) {
                        return { ...user, is_followed: !currentlyFollowing };
                    }
                    return user;
                }));
                
                // NUEVO: Actualizamos la lista de contactos automáticamente
                fetchMutuals();
            }
        } catch (error) {
            console.error("Error al actualizar seguimiento:", error);
        }
    };

    // Función para iniciar el chat
    const startChat = async (friendId) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/chat/start/${friendId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            const data = await response.json();
            
            if (data.success) {
                // CORRECCIÓN: Leemos el ID de la sala sin importar si Laravel lo llama id o _id
                const chatId = data.conversation.id || data.conversation._id;
                navigate(`/chat/${chatId}`);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Error al iniciar el chat:", error);
        }
    };

    return (
        <Fragment>
            <header style={{ padding: "20px", borderBottom: "1px solid #ccc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Crew Hub</h1>
                
                <nav>
                    {token && activeUser ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                            <span>Bienvenido, <strong>{activeUser.username}</strong></span>
                            <button 
                                onClick={logout} 
                                style={{ backgroundColor: "#ff4444", color: "white", border: "none", padding: "8px 15px", cursor: "pointer", borderRadius: "5px" }}
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", gap: "10px" }}>
                            <Link to="/login">
                                <button style={{ padding: "8px 15px", cursor: "pointer" }}>Iniciar Sesión</button>
                            </Link>
                            <Link to="/register">
                                <button style={{ padding: "8px 15px", cursor: "pointer", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px" }}>
                                    Registrarse
                                </button>
                            </Link>
                        </div>
                    )}
                </nav>
            </header>

            <main style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto", display: "flex", gap: "30px" }}>
                {token && activeUser ? (
                    <Fragment>
                        {/* COLUMNA IZQUIERDA: Buscador y Muro */}
                        <div style={{ flex: 2 }}>
                            {/* SECCIÓN DEL BUSCADOR */}
                            <div style={{ marginBottom: "30px", backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "8px" }}>
                                <h3>Encontrar a otras personas</h3>
                                <input 
                                    type="text" 
                                    placeholder="Busca por nombre o correo..." 
                                    value={searchQuery}
                                    onChange={handleSearch}
                                    style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", marginBottom: "15px", boxSizing: "border-box" }}
                                />

                                {/* RESULTADOS DE BÚSQUEDA */}
                                {isSearching && <p>Buscando...</p>}
                                {searchResults.length > 0 && (
                                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                        {searchResults.map((user) => {
                                            const userId = user.id || user._id;
                                            return (
                                                <li key={userId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", borderBottom: "1px solid #eee", backgroundColor: "white" }}>
                                                    <div>
                                                        <strong>{user.username}</strong> <br/>
                                                        <small style={{ color: "gray" }}>{user.email}</small>
                                                    </div>
                                                    
                                                    <button 
                                                        onClick={() => toggleFollow(userId, user.is_followed)}
                                                        style={{ 
                                                            padding: "6px 12px", cursor: "pointer", borderRadius: "20px", border: "none", fontWeight: "bold",
                                                            backgroundColor: user.is_followed ? "#e4e6eb" : "#0095f6", 
                                                            color: user.is_followed ? "#1c1e21" : "white" 
                                                        }}
                                                    >
                                                        {user.is_followed ? 'Siguiendo' : 'Seguir'}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>

                            <h2>Tu Muro</h2>
                            <p>PUBLICACIONES</p>
                        </div>

                        {/* COLUMNA DERECHA: Lista de Mutuals (Chats) */}
                        <div style={{ flex: 1, backgroundColor: "#fff", border: "1px solid #e4e6eb", padding: "20px", borderRadius: "8px", alignSelf: "flex-start" }}>
                            <h3>Tus Contactos</h3>
                            <p style={{ fontSize: "0.85rem", color: "gray", marginTop: 0 }}>Solo puedes chatear con quienes te siguen de vuelta.</p>
                            
                            {mutuals.length === 0 ? (
                                <p style={{ fontSize: "0.9rem" }}>Aún no tienes contactos mutuos.</p>
                            ) : (
                                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                    {mutuals.map((mutual) => {
                                        const mutualId = mutual.id || mutual._id;
                                        return (
                                            <li key={mutualId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f0f2f5" }}>
                                                <strong style={{ fontSize: "1rem" }}>{mutual.username}</strong>
                                                <button 
                                                    onClick={() => startChat(mutualId)}
                                                    style={{ 
                                                        backgroundColor: "#316f8e", color: "white", border: "none", padding: "6px 12px", borderRadius: "20px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "bold"
                                                    }}
                                                >
                                                    Chatear
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </Fragment>
                ) : (
                    <div style={{ width: "100%", textAlign: "center", marginTop: "50px" }}>
                        <h2>Bienvenido a Crew Hub</h2>
                        <p>Inicia sesión para descubrir la plataforma.</p>
                    </div>
                )}
            </main>
        </Fragment>
    );
};

export default Home;