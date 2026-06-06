import React, { useState, useEffect, Fragment, useContext } from 'react';
import { Link } from 'react-router-dom';
import { fetchAPI } from '../../services/api.js';
import { AuthContext } from '../../contexts/AuthContext.jsx';

const LocationBadge = ({ country }) => (
    <div className="flex items-center gap-1 text-[9px] text-gray-400 bg-gradient-to-r from-[#1a1a1a] to-[#111] px-2 py-0.5 rounded-full border border-[#333] shadow-inner w-fit mt-1 group-hover:border-[#00ba7c] transition-colors">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#00ba7c]">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span className="font-bold tracking-wider uppercase">{country}</span>
    </div>
);

const RightSidebar = () => {
    const { activeUser } = useContext(AuthContext); 
    const [suggestions, setSuggestions] = useState({ users: [], communities: [] });
    const [loading, setLoading] = useState(true);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

    useEffect(() => {
        if (activeUser) {
            loadSuggestions();
        }
    }, [activeUser]);

    const loadSuggestions = async () => {
        try {
            const data = await fetchAPI('/suggestions');
            if (data.success) {
                const myId = activeUser?._id || activeUser?.id;
                
                const filteredCommunities = (data.communities || []).filter(community => {
                    if (!community.members) return true;
                    return !community.members.includes(myId);
                });

                setSuggestions({ 
                    users: data.users || [], 
                    communities: filteredCommunities 
                });
            }
        } catch (error) {
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
                
                <div className="bg-[#121212]/80 backdrop-blur-xl border border-[#262626] rounded-2xl p-6 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                    <h3 className="mt-0 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">A quién seguir</h3>

                    {loading ? (
                        <p className="text-center text-gray-500 text-xs">Buscando...</p>
                    ) : suggestions.users.length === 0 ? (
                        <p className="text-center text-gray-500 text-xs">No hay sugerencias por ahora.</p>
                    ) : (
                        <ul className="list-none p-0 m-0 flex flex-col gap-5">
                            {suggestions.users.map(user => (
                                <li key={user.id || user._id} className="flex justify-between items-center group">
                                    <Link to={`/${user.username}`} className="flex items-center gap-3 no-underline text-inherit min-w-0">
                                        <img src={getAvatar(user)} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-[#333] shadow-md" />
                                        <div className="flex flex-col min-w-0">
                                            <strong className="text-sm text-white truncate group-hover:underline tracking-wide">{user.username}</strong>
                                            <LocationBadge country="España" />
                                        </div>
                                    </Link>
                                    <button onClick={() => handleFollow(user.id || user._id)} className="ml-2 shrink-0 bg-[#0095f6]/10 text-[#0095f6] hover:bg-[#0095f6] hover:text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all border border-[#0095f6]/30 shadow-sm cursor-pointer">
                                        Seguir
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="bg-[#121212]/80 backdrop-blur-xl border border-[#262626] rounded-2xl p-6 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                    <h3 className="mt-0 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Descubre Grupos</h3>

                    {loading ? (
                        <p className="text-center text-gray-500 text-xs">Buscando...</p>
                    ) : suggestions.communities.length === 0 ? (
                        <p className="text-center text-gray-500 text-xs">Estás en todas partes.</p>
                    ) : (
                        <ul className="list-none p-0 m-0 flex flex-col gap-4">
                            {suggestions.communities.map(community => (
                                <li key={community.id || community._id} className="flex justify-between items-center group">
                                    <Link to={`/communities/${community.slug}`} className="flex items-center gap-3 no-underline text-inherit min-w-0">
                                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#333] shrink-0 shadow-md">
                                            <img src={getCommunityAvatar(community)} alt="avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <strong className="text-sm text-white truncate group-hover:underline tracking-wide">{community.name}</strong>
                                            <span className="text-[9px] text-[#00ba7c] font-bold uppercase tracking-widest mt-1 bg-[#00ba7c]/10 px-2 py-0.5 rounded-md w-fit border border-[#00ba7c]/20">{community.members?.length || 0} Miembros</span>
                                        </div>
                                    </Link>
                                    <button onClick={() => handleJoinCommunity(community.id || community._id)} className="ml-2 shrink-0 bg-[#262626] text-white px-4 py-1.5 rounded-full font-bold text-xs cursor-pointer hover:bg-white hover:text-black transition-colors border border-[#333] shadow-sm">
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