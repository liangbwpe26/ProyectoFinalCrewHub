import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchAPI } from "../../services/api.js";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import PostActions from "../PostActions.jsx";

const SinglePost = () => {
    const { id } = useParams(); // Obtenemos la ID de la URL
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getPost = async () => {
            try {
                const data = await fetchAPI(`/posts/${id}`, {}, token);
                if (data.success) {
                    setPost(data.post);
                } else {
                    navigate("/"); // Si no existe o fue borrado, lo mandamos al inicio
                }
            } catch (error) {
                console.error("Error cargando el post", error);
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        if (token) getPost();
    }, [id, token, navigate]);

    if (loading) return <div style={{ color: "white", textAlign: "center", padding: "50px", backgroundColor: "#000", minHeight: "100vh" }}>Cargando publicación...</div>;
    if (!post) return null;

    // Helpers para las imágenes
    const getPostImage = (path) => path?.startsWith("http") ? path : `http://127.0.0.1:8000${path}`;
    const getAvatar = (user) => user?.profile_picture ? (user.profile_picture.startsWith("http") ? user.profile_picture : `http://127.0.0.1:8000${user.profile_picture}`) : `https://ui-avatars.com/api/?name=${user?.username || "U"}&background=262626&color=fff&bold=true`;

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#000", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "40px", paddingBottom: "50px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
            
            <div style={{ width: "100%", maxWidth: "600px", padding: "0 20px", marginBottom: "20px" }}>
                <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#0095f6", fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer", padding: 0 }}>
                    &larr; Volver
                </button>
            </div>

            <div style={{ width: "100%", maxWidth: "600px", backgroundColor: "#121212", borderRadius: "12px", border: "1px solid #262626", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                
                {/* Cabecera */}
                <div style={{ padding: "15px", display: "flex", alignItems: "center", borderBottom: "1px solid #262626" }}>
                    <Link to={`/${post.user?.username}`} style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
                        <img src={getAvatar(post.user)} alt="avatar" style={{ width: "35px", height: "35px", borderRadius: "50%", objectFit: "cover" }} />
                        <strong style={{ color: "#fff" }}>{post.user?.username}</strong>
                    </Link>
                </div>

                {/* Imagen */}
                <div style={{ backgroundColor: "#000", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <img 
                        src={getPostImage(post.image_path)} 
                        alt="Publicación" 
                        style={{ width: "100%", maxHeight: "70vh", objectFit: "contain", display: "block" }} 
                    />
                </div>

                {/* Descripción */}
                {post.description && (
                    <div style={{ padding: "20px 20px 0 20px" }}>
                        <p style={{ margin: 0, fontSize: "1rem", lineHeight: "1.5" }}>
                            <Link to={`/${post.user?.username}`} style={{ color: "#fff", fontWeight: "bold", marginRight: "8px", textDecoration: "none" }}>
                                @{post.user?.username}
                            </Link>
                            <span style={{ color: "#e0e0e0" }}>{post.description}</span>
                        </p>
                        <span style={{ display: "block", marginTop: "10px", fontSize: "0.8rem", color: "gray", textTransform: "uppercase", marginBottom: "15px" }}>
                            {new Date(post.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                    </div>
                )}

                {/* INTERACCIONES (Magia inyectada) */}
                <PostActions post={post} />

            </div>
        </div>
    );
};

export default SinglePost;