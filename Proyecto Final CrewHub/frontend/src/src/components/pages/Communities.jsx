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
            <div className="w-full max-w-[600px] mx-auto flex flex-col pb-12 px-2 md:px-0 relative">
                
                <div className="flex justify-between items-center mb-6 mt-4">
                    <h1 className="text-2xl md:text-3xl font-black text-white m-0 tracking-wide">Comunidades</h1>
                    
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-[#0095f6] hover:bg-blue-600 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-full font-bold text-xs md:text-sm transition-colors shadow-lg shadow-blue-500/20 cursor-pointer"
                    >
                        + Crear
                    </button>
                </div>

                {/* BARRA DE BÚSQUEDA */}
                <div className="mb-6">
                    <input 
                        type="text" 
                        placeholder="Buscar comunidades por nombre o descripción..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-full border border-[#333] bg-[#121212] text-white outline-none focus:border-[#0095f6] transition text-sm shadow-lg"
                    />
                </div>

                {loading ? (
                    <p className="text-center text-gray-400 font-bold tracking-widest uppercase py-10">Cargando espacios...</p>
                ) : communities.length === 0 ? (
                    <div className="bg-[#121212] p-10 rounded-2xl border border-[#262626] text-center shadow-lg">
                        <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#333]">
                            <svg width="32" height="32" fill="#666" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
                        </div>
                        <h2 className="text-lg md:text-xl text-white font-bold mb-2 mt-0">No hay comunidades todavía</h2>
                        <p className="text-gray-400 text-sm m-0">Sé el primero en crear un espacio para tus intereses.</p>
                    </div>
                ) : filteredCommunities.length === 0 ? (
                    <div className="text-center text-gray-500 py-10 bg-[#121212] border border-[#262626] rounded-xl font-bold">
                        No se encontraron comunidades que coincidan con tu búsqueda.
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {filteredCommunities.map(community => (
                            <Link 
                                key={community._id || community.id} 
                                to={`/communities/${community.slug}`} 
                                className="bg-[#121212] border border-[#262626] rounded-2xl p-5 hover:border-[#444] transition flex gap-4 no-underline items-center group shadow-lg"
                            >
                                {/* SOPORTE PARA AVATAR */}
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center shrink-0 text-xl md:text-2xl font-black text-gray-500 group-hover:text-white transition-colors overflow-hidden">
                                    {community.avatar_path ? (
                                        <img src={`${BACKEND_URL}${community.avatar_path}`} alt={community.name} className="w-full h-full object-cover" />
                                    ) : (
                                        community.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-bold text-base md:text-lg m-0 truncate">{community.name}</h3>
                                    <p className="text-gray-400 text-xs md:text-sm m-0 mt-1 truncate">{community.description}</p>
                                    <div className="text-[#0095f6] text-[10px] md:text-xs font-bold mt-2 tracking-wide uppercase">
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