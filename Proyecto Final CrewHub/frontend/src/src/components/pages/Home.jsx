import React, { Fragment, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { Link } from "react-router-dom";
import { useHomeLogic } from "../../hooks/useHomeLogic.js";
import { useUnreadChats } from "../../hooks/useUnreadChats.js";
import PostCard from "../PostCard.jsx";
import NotificationBell from "../NotificationBell.jsx";
import CreatePost from "../CreatePost.jsx";
import PostActions from "../PostActions.jsx";
import StoriesBar from "../StoriesBar.jsx";
import './Home.css';

const Home = () => {
    const { activeUser, logout, token } = useContext(AuthContext);

    // Lógica del Home (buscador, feed, etc.)
    const {
        searchQuery, searchResults, isSearching, mutuals,
        feed, loadingFeed, addNewPostToFeed,
        handleSearch, toggleFollow
    } = useHomeLogic(token);

    const { unreadCount } = useUnreadChats();

    const getAvatar = (user) => {
        if (user && user.profile_picture) {
            if (user.profile_picture.startsWith('http')) return user.profile_picture;
            return `http://127.0.0.1:8000${user.profile_picture}`;
        }
        const name = user && user.username ? user.username : 'U';
        return `https://ui-avatars.com/api/?name=${name}&background=262626&color=fff&bold=true`;
    };

    return (
        <Fragment>
            <div style={{ minHeight: "100vh", backgroundColor: "#000", color: "#fff", fontFamily: "system-ui, -apple-system, sans-serif" }}>

                {/* HEADER DARK MODE */}
                <header style={{ padding: "15px 30px", borderBottom: "1px solid #262626", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#000", position: "sticky", top: 0, zIndex: 100 }}>
                    <Link to="/" style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", color: "#fff", textDecoration: "none" }}>Crew Hub</Link>

                    <nav style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                        {token && activeUser && (
                            <Fragment>
                                <NotificationBell />

                                {/* BOTÓN DE CHATS CON EL GLOBITO ROJO */}
                                <Link to="/chats" style={{ position: "relative", color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", gap: "5px", transition: "0.2s" }}>
                                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 5.58 2 10c0 2.6 1.48 4.9 3.75 6.33V22l4.37-2.33c.6.1 1.23.16 1.88.16 5.52 0 10-3.58 10-8s-4.48-8-10-8z" /></svg>

                                    {/* Muestra el badge SOLO si hay mensajes sin leer */}
                                    {unreadCount > 0 && (
                                        <span style={{
                                            position: 'absolute', top: -8, right: -8,
                                            backgroundColor: '#ff4d4d', color: 'white',
                                            borderRadius: '50%', padding: '2px 6px',
                                            fontSize: '0.75rem', fontWeight: 'bold'
                                        }}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </Link>

                                <Link to={`/${activeUser.username}`} style={{ display: "flex", alignItems: "center", gap: "10px", color: "#fff", textDecoration: "none", transition: "opacity 0.2s" }}>
                                    <img src={getAvatar(activeUser)} alt="Mi perfil" style={{ width: "35px", height: "35px", borderRadius: "50%", objectFit: "cover", border: "1px solid #363636" }} />
                                    <span style={{ fontWeight: "500" }}>{activeUser.username}</span>
                                </Link>
                                <button onClick={logout} style={{ backgroundColor: "transparent", color: "#ff4d4d", border: "1px solid #ff4d4d", padding: "6px 15px", cursor: "pointer", borderRadius: "20px", fontWeight: "bold", transition: "0.2s" }}>
                                    Salir
                                </button>
                            </Fragment>
                        )}
                    </nav>
                </header>

                <main style={{ padding: "30px 20px", maxWidth: "1100px", margin: "0 auto", display: "flex", gap: "30px", flexWrap: "wrap" }}>
                    {token && activeUser && (
                        <Fragment>
                            {/* COLUMNA IZQUIERDA: Buscador, Crear Post y Muro */}
                            <div style={{ flex: "2 1 600px", display: "flex", flexDirection: "column", gap: "30px" }}>
                                <StoriesBar />
                                {/* 1. SECCIÓN DEL BUSCADOR */}
                                <div style={{ backgroundColor: "#121212", padding: "25px", borderRadius: "12px", border: "1px solid #262626" }}>
                                    <h3 style={{ marginTop: 0, fontSize: "1.2rem", marginBottom: "15px" }}>Explorar</h3>
                                    <input
                                        type="text" placeholder="Busca por nombre de usuario..."
                                        value={searchQuery} onChange={handleSearch}
                                        style={{ width: "100%", padding: "12px 15px", borderRadius: "30px", border: "1px solid #363636", backgroundColor: "#000", color: "#fff", marginBottom: "15px", boxSizing: "border-box", outline: "none" }}
                                    />
                                    {isSearching && <p style={{ color: "gray", fontSize: "0.9rem" }}>Buscando...</p>}
                                    {searchResults.length > 0 && (
                                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                                            {searchResults.map((user) => {
                                                const userId = user.id || user._id;
                                                const status = user.follow_status || 'none';

                                                return (
                                                    <li key={userId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", borderRadius: "8px", backgroundColor: "#0a0a0a", border: "1px solid #262626" }}>
                                                        <Link to={`/${user.username}`} style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "inherit" }}>
                                                            <img src={getAvatar(user)} alt={user.username} style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                                                            <div>
                                                                <strong style={{ fontSize: "1rem", color: "#fff" }}>{user.display_name || user.username}</strong> <br />
                                                                <small style={{ color: "gray" }}>@{user.username}</small>
                                                            </div>
                                                        </Link>
                                                        <button
                                                            onClick={() => toggleFollow(userId, status)}
                                                            style={{
                                                                padding: "8px 16px", cursor: "pointer", borderRadius: "20px", fontWeight: "bold", transition: "0.2s",
                                                                border: status === 'none' ? "none" : "1px solid #363636",
                                                                backgroundColor: status === 'none' ? "#0095f6" : "#262626",
                                                                color: "white"
                                                            }}
                                                        >
                                                            {status === 'pending' ? 'Pendiente' : (status === 'accepted' ? 'Siguiendo' : 'Seguir')}
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </div>

                                {/* 2. CREADOR DE PUBLICACIONES */}
                                <CreatePost onPostCreated={addNewPostToFeed} />

                                {/* 3. SECCIÓN DEL MURO (FEED) */}
                                <div style={{ minHeight: "200px", display: "flex", flexDirection: "column", gap: "25px" }}>
                                    {loadingFeed ? (
                                        <p style={{ textAlign: "center", color: "gray" }}>Cargando publicaciones...</p>
                                    ) : feed.length === 0 ? (
                                        <div style={{ backgroundColor: "#121212", padding: "40px", borderRadius: "12px", border: "1px solid #262626", textAlign: "center", color: "gray" }}>
                                            <h2 style={{ marginTop: 0, fontSize: "1.3rem", color: "#fff" }}>Tu Muro está vacío</h2>
                                            <p>Empieza a seguir a otros tripulantes o haz tu primera publicación.</p>
                                        </div>
                                    ) : (
                                        feed.map(post => (
                                            <PostCard key={post.id || post._id} initialPost={post} getAvatar={getAvatar} />
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* COLUMNA DERECHA: Lista de Mutuals (Chats) */}
                            <div style={{ flex: "1 1 300px", backgroundColor: "#121212", border: "1px solid #262626", padding: "25px", borderRadius: "12px", alignSelf: "flex-start", position: "sticky", top: "90px" }}>
                                <h3 style={{ marginTop: 0, fontSize: "1.2rem" }}>Tus Contactos</h3>
                                <p style={{ fontSize: "0.85rem", color: "gray", marginTop: "5px", marginBottom: "20px" }}>Solo puedes chatear con quienes te siguen de vuelta.</p>

                                {mutuals.length === 0 ? (
                                    <div style={{ textAlign: "center", color: "gray", padding: "20px 0" }}><p style={{ fontSize: "0.9rem", margin: 0 }}>Aún no tienes contactos mutuos.</p></div>
                                ) : (
                                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                                        {mutuals.map((mutual) => {
                                            const mutualId = mutual.id || mutual._id;
                                            return (
                                                <li key={mutualId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", borderRadius: "8px" }}>
                                                    <Link to={`/${mutual.username}`} style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "inherit" }}>
                                                        <img src={getAvatar(mutual)} alt={mutual.username} style={{ width: "35px", height: "35px", borderRadius: "50%", objectFit: "cover" }} />
                                                        <strong style={{ fontSize: "0.95rem", color: "#fff" }}>{mutual.username}</strong>
                                                    </Link>

                                                    <Link
                                                        to={`/chats/${mutual.username}`}
                                                        style={{ backgroundColor: "transparent", color: "#0095f6", border: "1px solid #0095f6", padding: "6px 15px", borderRadius: "20px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "bold", textDecoration: "none" }}
                                                    >
                                                        Chat
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        </Fragment>
                    )}
                </main>
            </div>
        </Fragment>
    );
};

export default Home;