import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { fetchAPI } from '../../services/api.js';

const RightSidebar = () => {
    const [suggestions, setSuggestions] = useState({ users: [], communities: [] });
    const [loading, setLoading] = useState(true);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

    useEffect(() => {
        loadSuggestions();
    }, []);

    const loadSuggestions = async () => {
        try {
            const data = await fetchAPI('/suggestions');
            if (data.success) {
                setSuggestions({ users: data.users || [], communities: data.communities || [] });
            }
        } catch (error) {
            console.error("Error al cargar sugerencias:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollow = async (userId) => {
        try {
            const res = await fetchAPI(`/follow/${userId}`, { method: 'POST' });
            if (res.success) {
                setSuggestions(prev => ({
                    ...prev,
                    users: prev.users.filter(u => (u._id || u.id) !== userId)
                }));
            }
        } catch (error) { }
    };

    const handleJoinCommunity = async (communityId) => {
        try {
            const res = await fetchAPI(`/communities/${communityId}/membership`, { method: 'POST' });
            if (res.success) {
                // Removemos la comunidad sugerida al unirnos
                setSuggestions(prev => ({
                    ...prev,
                    communities: prev.communities.filter(c => (c._id || c.id) !== communityId)
                }));
            }
        } catch (error) { }
    };

    const getAvatar = (user) => {
        if (user && user.profile_picture) return user.profile_picture.startsWith('http') ? user.profile_picture : `${BACKEND_URL}${user.profile_picture}`;
        return `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=262626&color=fff&bold=true`;
    };

    const getCommunityAvatar = (community) => {
        if (community && community.avatar_path) {
            return community.avatar_path.startsWith('http') 
                ? community.avatar_path 
                : `${BACKEND_URL}${community.avatar_path}`;
        }
        const initial = community && community.name ? community.name.charAt(0).toUpperCase() : 'C';
        return `https://ui-avatars.com/api/?name=${initial}&background=1a1a1a&color=fff&bold=true`;
    };

    return (
        <Fragment>
            <aside className="w-[280px] hidden lg:flex flex-col h-[calc(100vh-100px)] sticky top-[100px] gap-6">

                {/* SUGERENCIAS DE USUARIOS */}
                <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 flex flex-col shadow-lg">
                    <h3 className="mt-0 text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">A quién seguir</h3>

                    {loading ? (
                        <p className="text-center text-gray-500 text-xs">Buscando...</p>
                    ) : suggestions.users.length === 0 ? (
                        <p className="text-center text-gray-500 text-xs">No hay sugerencias por ahora.</p>
                    ) : (
                        <ul className="list-none p-0 m-0 flex flex-col gap-4">
                            {suggestions.users.map(user => (
                                <li key={user.id || user._id} className="flex justify-between items-center group">
                                    <Link to={`/${user.username}`} className="flex items-center gap-3 no-underline text-inherit min-w-0">
                                        <img src={getAvatar(user)} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-[#333]" />
                                        <div className="flex flex-col min-w-0">
                                            <strong className="text-sm text-white truncate group-hover:underline">{user.username}</strong>
                                            <span className="text-xs text-gray-500 truncate">Recomendado para ti</span>
                                        </div>
                                    </Link>
                                    <button onClick={() => handleFollow(user.id || user._id)} className="ml-2 shrink-0 bg-transparent text-[#0095f6] font-bold text-xs cursor-pointer hover:text-white transition-colors border-none p-0">
                                        Seguir
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* SUGERENCIAS DE COMUNIDADES */}
                <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 flex flex-col shadow-lg">
                    <h3 className="mt-0 text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Descubre Grupos</h3>

                    {loading ? (
                        <p className="text-center text-gray-500 text-xs">Buscando...</p>
                    ) : suggestions.communities.length === 0 ? (
                        <p className="text-center text-gray-500 text-xs">Estás en todas partes.</p>
                    ) : (
                        <ul className="list-none p-0 m-0 flex flex-col gap-4">
                            {suggestions.communities.map(community => (
                                <li key={community.id || community._id} className="flex justify-between items-center group">
                                    <Link to={`/communities/${community.slug}`} className="flex items-center gap-3 no-underline text-inherit min-w-0">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#333] shrink-0">
                                            <img src={getCommunityAvatar(community)} alt="avatar" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <strong className="text-sm text-white truncate group-hover:underline">{community.name}</strong>
                                            <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">{community.members?.length || 0} Miembros</span>
                                        </div>
                                    </Link>
                                    <button onClick={() => handleJoinCommunity(community.id || community._id)} className="ml-2 shrink-0 bg-[#262626] text-white px-3 py-1.5 rounded-full font-bold text-xs cursor-pointer hover:bg-[#333] transition-colors border-none">
                                        Unirse
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </aside>
        </Fragment>
    );
};

export default RightSidebar;