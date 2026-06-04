import React, { Fragment, useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { Link } from "react-router-dom";
import { fetchAPI } from "../../services/api.js";
import { useFeed } from "../../hooks/useFeed.js";
import Layout from "../structure/Layout.jsx";
import PostCard from "../PostCard.jsx";
import CreatePost from "../CreatePost.jsx";
import StoriesBar from "../StoriesBar.jsx";
import PostSkeleton from '../ui/PostSkeleton.jsx';

const Home = () => {
    const { activeUser } = useContext(AuthContext);
    const { posts, filter, setFilter, loading, loadingMore, hasMore, loadMore } = useFeed();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100) {
                if (!loading && !loadingMore && hasMore) loadMore();
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
                    const data = await fetchAPI(`/users/search?q=${searchQuery}`);
                    if (data.success) setSearchResults(data.users);
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
    }, [searchQuery]);

    const toggleFollowSearch = async (targetUserId, currentStatus) => {
        try {
            const data = await fetchAPI(`/users/${targetUserId}/follow`, { method: 'POST' });
            if (data.success) {
                setSearchResults(prevResults => prevResults.map(u => {
                    const uid = u.id || u._id;
                    if (uid === targetUserId) return { ...u, follow_status: data.status };
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
        return `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=262626&color=fff&bold=true`;
    };

    const addNewPostToFeed = (newPost) => setFilter('all');

    if (!activeUser) return null;

    return (
        <Layout>
            <div className="w-full max-w-[600px] mx-auto flex flex-col pb-12 px-2 md:px-0">

                <div className="md:hidden bg-[#121212] p-4 rounded-xl border border-[#262626] mb-4 shadow-lg">
                    <h3 className="text-sm font-bold mb-3 text-white m-0">Historias</h3>
                    <div className="overflow-x-auto pb-2 custom-scrollbar">
                        <StoriesBar />
                    </div>
                </div>

                <div className="bg-[#121212] p-4 md:p-6 rounded-xl border border-[#262626] mb-6 shadow-lg">
                    <h3 className="text-lg md:text-xl font-bold mb-4 text-white m-0">Buscar Personas</h3>
                    <input
                        type="text" placeholder="Busca por nombre de usuario..."
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-5 py-3 rounded-full border border-[#363636] bg-black text-white mb-2 outline-none focus:border-[#0095f6] transition box-border text-sm"
                    />
                    {isSearching && <p className="text-gray-400 text-sm mt-2">Buscando...</p>}
                    {searchResults.length > 0 && (
                        <ul className="flex flex-col gap-3 p-0 m-0 mt-4 list-none">
                            {searchResults.map((user) => {
                                const userId = user.id || user._id;
                                const status = user.follow_status || 'none';
                                return (
                                    <li key={userId} className="flex justify-between items-center p-3 rounded-lg bg-[#0a0a0a] border border-[#262626]">
                                        <Link to={`/${user.username}`} className="flex items-center gap-3 hover:opacity-80 transition text-white no-underline overflow-hidden">
                                            <img src={getAvatar(user)} alt={user.username} className="w-10 h-10 rounded-full object-cover shrink-0" />
                                            <div className="min-w-0">
                                                <strong className="text-sm text-white block leading-tight truncate">{user.display_name || user.username}</strong>
                                                <small className="text-gray-400 truncate">@{user.username}</small>
                                            </div>
                                        </Link>
                                        <button
                                            onClick={() => toggleFollowSearch(userId, status)}
                                            className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full font-bold transition text-xs md:text-sm cursor-pointer shrink-0 ${status === 'none' ? 'bg-[#0095f6] text-white border-none' : 'bg-[#262626] text-white border border-[#363636]'}`}
                                        >
                                            {status === 'pending' ? 'Pendiente' : (status === 'accepted' ? 'Siguiendo' : 'Seguir')}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                <div className="mb-6"><CreatePost onPostCreated={addNewPostToFeed} /></div>

                {/* PESTAÑAS DEL HOME */}
                <div className="flex w-full bg-[#121212] border border-[#262626] rounded-xl overflow-hidden shadow-lg mb-6">
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex-1 py-3 md:py-4 font-bold uppercase text-[10px] md:text-xs tracking-wider transition-all cursor-pointer ${filter === 'all' ? 'bg-[#1a1a1a] text-white shadow-[inset_0_2px_0_0_#0095f6] border-none' : 'bg-transparent text-gray-500 border-none hover:bg-[#151515] hover:text-gray-300'}`}
                    >
                        Para Ti
                    </button>
                    <button
                        onClick={() => setFilter('following')}
                        className={`flex-1 py-3 md:py-4 font-bold uppercase text-[10px] md:text-xs tracking-wider transition-all cursor-pointer border-l border-[#262626] ${filter === 'following' ? 'bg-[#1a1a1a] text-white shadow-[inset_0_2px_0_0_#0095f6] border-t-0 border-b-0 border-r-0' : 'bg-transparent text-gray-500 border-t-0 border-b-0 border-r-0 hover:bg-[#151515] hover:text-gray-300'}`}
                    >
                        Seguidos
                    </button>
                </div>

                <div className="flex flex-col gap-4 md:gap-6 min-h-[200px]">
                    {loading ? (
                        <>
                            <PostSkeleton />
                            <PostSkeleton />
                            <PostSkeleton />
                        </>
                    ) : posts.length === 0 ? (
                        <div className="bg-[#121212] p-10 rounded-xl border border-[#262626] text-center shadow-lg">
                            <h2 className="text-lg md:text-xl text-white font-bold mb-2 mt-0">No hay publicaciones</h2>
                        </div>
                    ) : (
                        posts.map(post => <PostCard key={post.id || post._id} initialPost={post} getAvatar={getAvatar} />)
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Home;