import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../structure/Layout.jsx';
import { useCommunities } from '../../hooks/useCommunities.js';
import CreateCommunityModal from '../CreateCommunityModal.jsx';

const Communities = () => {
    const { communities, setCommunities, loading } = useCommunities();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

    const handleCommunityCreated = (newCommunity) => {
        setCommunities(prevCommunities => [newCommunity, ...prevCommunities]);
    };

    const filteredCommunities = communities.filter(community =>
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (community.description && community.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <Layout>
            <div className="w-full max-w-[600px] mx-auto flex flex-col pb-12 px-2 md:px-0 relative z-10">

                <div className="flex justify-between items-center mb-6 mt-4">
                    <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 m-0 tracking-wide">Comunidades</h1>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-gradient-to-r from-[#0095f6] to-[#0077c5] hover:scale-105 text-white px-5 py-2.5 rounded-full font-bold text-xs md:text-sm transition-all shadow-[0_0_15px_rgba(0,149,246,0.3)] border-none cursor-pointer flex items-center gap-2"
                    >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Crear
                    </button>
                </div>

                <div className="mb-6 relative">
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input
                        type="text"
                        placeholder="Buscar comunidades por nombre o descripción..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-5 py-3.5 rounded-full border border-[#333] bg-[#0a0a0a]/50 text-white outline-none focus:border-[#0095f6] focus:bg-[#111] transition-all text-sm shadow-inner placeholder:text-gray-600"
                    />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-500 mb-4"></div>
                        <span className="text-xs text-gray-500 font-bold tracking-widest uppercase">Cargando espacios...</span>
                    </div>
                ) : communities.length === 0 ? (
                    <div className="bg-[#121212]/80 backdrop-blur-xl p-10 rounded-3xl border border-[#262626] text-center shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                        <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-5 border border-[#333] shadow-inner">
                            <svg width="32" height="32" fill="#555" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
                        </div>
                        <h2 className="text-xl md:text-2xl text-white font-black mb-2 mt-0 tracking-wide">No hay comunidades todavía</h2>
                        <p className="text-gray-400 text-sm m-0">Sé el primero en crear un espacio para tus intereses y reúne a tu crew.</p>
                    </div>
                ) : filteredCommunities.length === 0 ? (
                    <div className="text-center text-gray-500 py-12 bg-[#121212]/80 backdrop-blur-xl border border-[#262626] rounded-2xl font-bold shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                        No se encontraron comunidades que coincidan.
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">
                        {filteredCommunities.map(community => (
                            <Link
                                key={community._id || community.id}
                                to={`/communities/${community.slug}`}
                                className="bg-[#121212]/80 backdrop-blur-xl border border-[#262626] rounded-2xl p-5 hover:border-[#444] transition-all flex gap-4 no-underline items-center group shadow-[0_8px_30px_rgb(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
                            >
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center shrink-0 text-xl md:text-2xl font-black text-gray-500 group-hover:text-white transition-colors overflow-hidden shadow-inner group-hover:scale-105">
                                    {community.avatar_path ? (
                                        <img src={community.avatar_path.startsWith('http') ? community.avatar_path : `${BACKEND_URL}${community.avatar_path}`} alt={community.name} className="w-full h-full object-cover" />
                                    ) : (
                                        community.name.charAt(0).toUpperCase()
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-bold text-base md:text-lg m-0 truncate group-hover:text-[#0095f6] transition-colors">{community.name}</h3>
                                    <p className="text-gray-400 text-xs md:text-sm m-0 mt-1 truncate">{community.description}</p>
                                    <div className="text-[#00ba7c] bg-[#00ba7c]/10 border border-[#00ba7c]/20 w-fit px-2 py-0.5 rounded text-[10px] md:text-xs font-black mt-2.5 tracking-wide uppercase">
                                        {community.members ? community.members.length : 0} Miembros
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {isCreateModalOpen && (
                    <CreateCommunityModal
                        onClose={() => setIsCreateModalOpen(false)}
                        onCreated={handleCommunityCreated}
                    />
                )}
            </div>
        </Layout>
    );
};

export default Communities;