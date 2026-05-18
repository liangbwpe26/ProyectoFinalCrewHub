import React, { useState, useEffect, useContext, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAPI } from "../../services/api.js";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { useToast } from "../../contexts/ToastContext.jsx";
import PostCard from "../PostCard.jsx";

const SinglePost = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);
    const { showToast } = useToast();
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getPost = async () => {
            try {
                const data = await fetchAPI(`/posts/${id}`, {}, token);
                if (data.success) {
                    setPost(data.post);
                } else {
                    showToast("La publicación no existe o fue eliminada.", "error");
                    navigate("/"); 
                }
            } catch (error) {
                showToast("Ocurrió un error al cargar la publicación.", "error");
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        if (token) getPost();
    }, [id, token, navigate]);

    if (loading) return (
        <Fragment>
            <div style={{ color: "white", textAlign: "center", padding: "50px", backgroundColor: "#000", minHeight: "100vh" }}>
                Cargando publicación...
            </div>
        </Fragment>
    );
    
    if (!post) return null;

    const getAvatar = (user) => user?.profile_picture ? (user.profile_picture.startsWith("http") ? user.profile_picture : `http://127.0.0.1:8000${user.profile_picture}`) : `https://ui-avatars.com/api/?name=${user?.username || "U"}&background=262626&color=fff&bold=true`;

    return (
        <Fragment>
            <div style={{ minHeight: "100vh", backgroundColor: "#000", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "40px", paddingBottom: "50px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
                
                <div style={{ width: "100%", maxWidth: "600px", padding: "0 20px", marginBottom: "20px" }}>
                    <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "#0095f6", fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer", padding: 0 }}>
                        &larr; Volver
                    </button>
                </div>

                <div style={{ width: "100%", maxWidth: "600px" }}>
                    {/* Reemplazamos toda la vista manual por la PostCard */}
                    <PostCard 
                        initialPost={post} 
                        getAvatar={getAvatar} 
                        onDeleteSuccess={() => navigate("/")} 
                    />
                </div>
            </div>
        </Fragment>
    );
};

export default SinglePost;