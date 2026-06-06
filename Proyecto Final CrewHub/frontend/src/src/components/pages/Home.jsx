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

const LocationBadge = ({ country }) => (
    <div className="flex items-center gap-1 text-[9px] text-gray-400 bg-gradient-to-r from-[#1a1a1a] to-[#111] px-2 py-0.5 rounded-full border border-[#333] shadow-inner w-fit mt-1 group-hover:border-[#00ba7c] transition-colors">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#00ba7c]">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span className="font-bold tracking-wider uppercase">{country}</span>
    </div>
);

const Home = () => {
    const { activeUser } = useContext(AuthContext);
    const { posts, filter, setFilter, loading, loadingMore, hasMore, loadMore } = useFeed();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

    const myId = activeUser?._id || activeUser?.id;

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
                searchResults.length > 0 && setSearchResults([]);
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

    const displayPosts = posts.filter(post => {
        if (filter === 'following') {
            const postUserId = post.user?._id || post.user?.id;
            return postUserId !== myId;
        }
        return true;
    });

    return (
        <Layout>
            <div className="w-full max-w-[600px] mx-auto flex flex-col pb-12 px-2 md:px-0">

                {/* HISTORIAS (SOLO MÓVIL) */}
                <div className="md:hidden bg-[#121212]/80 backdrop-blur-xl p-4 rounded-2xl border border-[#262626] mb-4 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 m-0">Historias</h3>
                    <div className="overflow-x-auto pb-2 custom-scrollbar">
                        <StoriesBar />
                    </div>
                </div>

                {/* BUSCADOR */}
                <div className="bg-[#121212]/80 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-[#262626] mb-6 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                    <h3 className="mt-0 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Buscar Personas</h3>
                    <div className="relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <input
                            type="text" placeholder="Busca por nombre de usuario..."
                            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-full border border-[#333] bg-[#1a1a1a] text-white outline-none focus:border-[#0095f6] transition-colors shadow-inner text-sm"
                        />
                    </div>
                    {isSearching && <p className="text-gray-500 text-xs mt-3 font-bold animate-pulse">Buscando...</p>}
                    {searchResults.length > 0 && (
                        <ul className="flex flex-col gap-3 p-0 m-0 mt-4 list-none">
                            {searchResults.map((user) => {
                                const userId = user.id || user._id;
                                const status = user.follow_status || 'none';
                                return (
                                    <li key={userId} className="flex justify-between items-center p-3 rounded-xl bg-[#0a0a0a] border border-[#262626] hover:border-[#333] transition-colors group">
                                        <Link to={`/${user.username}`} className="flex items-center gap-3 text-white no-underline overflow-hidden min-w-0">
                                            <img src={getAvatar(user)} alt={user.username} className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#333] shadow-sm" />
                                            <div className="min-w-0 flex flex-col">
                                                <strong className="text-sm text-white block leading-tight truncate group-hover:underline tracking-wide">{user.display_name || user.username}</strong>
                                                <LocationBadge country="España" />
                                            </div>
                                        </Link>
                                        <button
                                            onClick={() => toggleFollowSearch(userId, status)}
                                            className={`px-4 py-1.5 rounded-full font-bold transition-all text-xs cursor-pointer shrink-0 shadow-sm ${status === 'none' ? 'bg-[#0095f6]/10 text-[#0095f6] border border-[#0095f6]/30 hover:bg-[#0095f6] hover:text-white' : 'bg-[#262626] text-white border border-[#363636] hover:bg-[#333]'}`}
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
                <div className="flex w-full bg-[#121212]/80 backdrop-blur-xl border border-[#262626] rounded-xl overflow-hidden shadow-lg mb-6">
                    <button
                        onClick={() => setFilter('all')}
                        className={`flex-1 py-4 font-bold uppercase text-[10px] md:text-xs tracking-wider transition-all cursor-pointer ${filter === 'all' ? 'bg-[#1a1a1a] text-white shadow-[inset_0_2px_0_0_#0095f6] border-none' : 'bg-transparent text-gray-500 border-none hover:bg-[#151515] hover:text-gray-300'}`}
                    >
                        Para Ti
                    </button>
                    <button
                        onClick={() => setFilter('following')}
                        className={`flex-1 py-4 font-bold uppercase text-[10px] md:text-xs tracking-wider transition-all cursor-pointer border-l border-[#262626] ${filter === 'following' ? 'bg-[#1a1a1a] text-white shadow-[inset_0_2px_0_0_#0095f6] border-t-0 border-b-0 border-r-0' : 'bg-transparent text-gray-500 border-t-0 border-b-0 border-r-0 hover:bg-[#151515] hover:text-gray-300'}`}
                    >
                        Seguidos
                    </button>
                </div>

                {/* FEED DE POSTS */}
                <div className="flex flex-col gap-4 md:gap-6 min-h-[200px]">
                    {loading ? (
                        <>
                            <PostSkeleton />
                            <PostSkeleton />
                            <PostSkeleton />
                        </>
                    ) : displayPosts.length === 0 ? (
                        <div className="bg-[#121212]/80 backdrop-blur-xl p-10 rounded-2xl border border-[#262626] text-center shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                            <h2 className="text-lg md:text-xl text-white font-bold mb-2 mt-0 tracking-wide">No hay publicaciones</h2>
                            <p className="text-gray-500 text-sm">Sigue a más personas para ver su contenido aquí.</p>
                        </div>
                    ) : (
                        displayPosts.map(post => <PostCard key={post.id || post._id} initialPost={post} getAvatar={getAvatar} />)
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Home;