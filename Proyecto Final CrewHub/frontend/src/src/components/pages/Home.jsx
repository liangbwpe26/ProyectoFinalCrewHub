import React, { Fragment, useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { Link } from "react-router-dom";
import { fetchAPI } from "../../services/api.js";
import { useFeed } from "../../hooks/useFeed.js";
import Layout from "../structure/Layout.jsx";
import PostCard from "../PostCard.jsx";
import CreatePost from "../CreatePost.jsx";

const Home = () => {
    const { activeUser, token } = useContext(AuthContext);

    const { posts, filter, setFilter, loading, loadingMore, hasMore, loadMore } = useFeed(token);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
                if (!loading && !loadingMore && hasMore) {
                    loadMore();
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, loadingMore, hasMore, loadMore]);

    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (searchQuery.trim() !== '') {
                setIsSearching(true);
                try {
                    const data = await fetchAPI(`/users/search?q=${searchQuery}`, {}, token);
                    if (data.success) {
                        setSearchResults(data.users);
                    }
                } catch (error) {
                    console.error("Error en la búsqueda:", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchQuery, token]);

    const toggleFollowSearch = async (targetUserId, currentStatus) => {
        try {
            const data = await fetchAPI(`/users/${targetUserId}/follow`, { method: 'POST' }, token);
            if (data.success) {
                setSearchResults(prevResults => prevResults.map(u => {
                    const uid = u.id || u._id;
                    if (uid === targetUserId) {
                        return { ...u, follow_status: data.status };
                    }
                    return u;
                }));
            }
        } catch (error) {
            console.error("Error al actualizar seguimiento:", error);
        }
    };

    const getAvatar = (user) => {
        if (user && user.profile_picture) {
            if (user.profile_picture.startsWith('http')) return user.profile_picture;
            return `${BACKEND_URL}${user.profile_picture}`;
        }
        const name = user && user.username ? user.username : 'U';
        return `https://ui-avatars.com/api/?name=${name}&background=262626&color=fff&bold=true`;
    };

    const addNewPostToFeed = (newPost) => {
        setFilter('all'); 
    };

    if (!token || !activeUser) return null;

    return (
        <Layout>
            <div className="w-full max-w-[600px] mx-auto flex flex-col pb-12">
                
                <div className="bg-[#121212] p-6 rounded-xl border border-[#262626] mb-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4 text-white m-0">Buscar Personas</h3>
                    <input
                        type="text"
                        placeholder="Busca por nombre de usuario..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-5 py-3 rounded-full border border-[#363636] bg-black text-white mb-2 outline-none focus:border-[#0095f6] transition box-border"
                    />
                    
                    {isSearching && <p className="text-gray-400 text-sm mt-2">Buscando...</p>}
                    
                    {searchResults.length > 0 && (
                        <ul className="flex flex-col gap-3 p-0 m-0 mt-4 list-none">
                            {searchResults.map((user) => {
                                const userId = user.id || user._id;
                                const status = user.follow_status || 'none';

                                return (
                                    <li key={userId} className="flex justify-between items-center p-3 rounded-lg bg-[#0a0a0a] border border-[#262626]">
                                        <Link to={`/${user.username}`} className="flex items-center gap-3 hover:opacity-80 transition text-white no-underline">
                                            <img src={getAvatar(user)} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
                                            <div>
                                                <strong className="text-base text-white block leading-tight">{user.display_name || user.username}</strong>
                                                <small className="text-gray-400">@{user.username}</small>
                                            </div>
                                        </Link>
                                        
                                        <button
                                            onClick={() => toggleFollowSearch(userId, status)}
                                            className={`px-4 py-2 rounded-full font-bold transition text-sm cursor-pointer ${
                                                status === 'none' 
                                                ? 'bg-[#0095f6] hover:bg-blue-600 text-white border-none' 
                                                : 'bg-[#262626] hover:bg-[#333] text-white border border-[#363636]'
                                            }`}
                                        >
                                            {status === 'pending' ? 'Pendiente' : (status === 'accepted' ? 'Siguiendo' : 'Seguir')}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                    
                    {searchQuery.trim() !== '' && !isSearching && searchResults.length === 0 && (
                        <p className="text-gray-500 text-sm mt-4 text-center">No se encontraron resultados.</p>
                    )}
                </div>

                <div className="mb-6">
                    <CreatePost onPostCreated={addNewPostToFeed} />
                </div>

                <div className="flex w-full bg-[#121212] border border-[#262626] rounded-xl overflow-hidden shadow-lg mb-6">
                    <button 
                        onClick={() => setFilter('all')} 
                        className={`flex-1 py-4 font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${
                            filter === 'all' 
                            ? 'bg-[#1a1a1a] text-white shadow-[inset_0_2px_0_0_#fff] border-none' 
                            : 'bg-transparent text-gray-500 hover:text-gray-300 hover:bg-[#151515] border-none'
                        }`}
                    >
                        Explorar
                    </button>
                    <button 
                        onClick={() => setFilter('interests')} 
                        className={`flex-1 py-4 font-bold uppercase text-xs tracking-wider transition-all cursor-pointer border-l border-r border-[#262626] ${
                            filter === 'interests' 
                            ? 'bg-[#1a1a1a] text-white shadow-[inset_0_2px_0_0_#0095f6] border-t-0 border-b-0' 
                            : 'bg-transparent text-gray-500 hover:text-gray-300 hover:bg-[#151515] border-t-0 border-b-0'
                        }`}
                    >
                        Para ti
                    </button>
                    <button 
                        onClick={() => setFilter('following')} 
                        className={`flex-1 py-4 font-bold uppercase text-xs tracking-wider transition-all cursor-pointer ${
                            filter === 'following' 
                            ? 'bg-[#1a1a1a] text-white shadow-[inset_0_2px_0_0_#fff] border-none' 
                            : 'bg-transparent text-gray-500 hover:text-gray-300 hover:bg-[#151515] border-none'
                        }`}
                    >
                        Siguiendo
                    </button>
                </div>

                <div className="flex flex-col gap-6 min-h-[200px]">
                    {loading ? (
                        <p className="text-center text-gray-400 font-bold tracking-widest uppercase py-10">Cargando publicaciones...</p>
                    ) : posts.length === 0 ? (
                        <div className="bg-[#121212] p-10 rounded-xl border border-[#262626] text-center shadow-lg">
                            <h2 className="text-xl text-white font-bold mb-2 mt-0">No hay publicaciones</h2>
                            <p className="text-gray-400">
                                {filter === 'interests' 
                                    ? 'Aún no hay contenido relacionado con tus intereses.' 
                                    : filter === 'following' 
                                    ? 'Sigue a más personas para ver sus publicaciones aquí.' 
                                    : 'Sé el primero en publicar algo.'}
                            </p>
                        </div>
                    ) : (
                        posts.map(post => (
                            <PostCard key={post.id || post._id} initialPost={post} getAvatar={getAvatar} />
                        ))
                    )}
                    
                    {loadingMore && (
                        <div className="text-center text-[#0095f6] font-bold py-4 mt-2">
                            Cargando más publicaciones...
                        </div>
                    )}
                    {!hasMore && posts.length > 0 && (
                        <div className="text-center text-gray-500 py-4 mt-2 text-sm font-bold tracking-widest uppercase border-t border-[#262626]">
                            Has llegado al final
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Home;