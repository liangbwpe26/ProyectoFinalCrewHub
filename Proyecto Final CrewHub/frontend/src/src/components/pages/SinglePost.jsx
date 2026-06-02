import React, { useState, useEffect, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchAPI } from "../../services/api.js";
import { useToast } from "../../contexts/ToastContext.jsx";
import PostCard from "../PostCard.jsx";
import Layout from "../structure/Layout.jsx";

const SinglePost = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

    useEffect(() => {
        const getPost = async () => {
            try {
                const data = await fetchAPI(`/posts/${id}`);
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

        getPost();
    }, [id, navigate]);

    if (loading) return (
        <Layout>
            <div className="text-white text-center p-12">
                Cargando publicación...
            </div>
        </Layout>
    );
    
    if (!post) return null;

    const getAvatar = (user) => user?.profile_picture ? (user.profile_picture.startsWith("http") ? user.profile_picture : `${BACKEND_URL}${user.profile_picture}`) : `https://ui-avatars.com/api/?name=${user?.username || "U"}&background=262626&color=fff&bold=true`;

    return (
        <Layout>
            <div className="w-full max-w-[600px] mx-auto mb-6">
                <button 
                    onClick={() => navigate(-1)} 
                    className="bg-transparent border-none text-[#0095f6] text-base font-bold cursor-pointer p-0 hover:text-blue-400 transition-colors flex items-center gap-2"
                >
                    &larr; Volver
                </button>
            </div>

            <div className="w-full max-w-[600px] mx-auto">
                <PostCard 
                    initialPost={post} 
                    getAvatar={getAvatar} 
                    onDeleteSuccess={() => navigate("/")} 
                />
            </div>
        </Layout>
    );
};

export default SinglePost;