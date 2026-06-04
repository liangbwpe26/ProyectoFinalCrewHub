import React, { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../structure/Navbar.jsx';
import { fetchAPI } from '../../services/api.js';
import VerifiedBadge from '../VerifiedBadge.jsx';

// 🔥 INSIGNIA DE GEOLOCALIZACIÓN (Consistencia visual)
const LocationBadge = ({ country }) => (
    <div className="flex items-center gap-1 text-[9px] text-gray-400 bg-gradient-to-r from-[#1a1a1a] to-[#111] px-2 py-0.5 rounded-full border border-[#333] shadow-inner w-fit mt-1 group-hover:border-[#0095f6] transition-colors">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0095f6]">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span className="font-bold tracking-wider uppercase">{country}</span>
    </div>
);

const Explore = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

    const categories = ['Tecnología', 'Moda y Ropa', 'Comida y Restaurantes', 'Entretenimiento'];

    useEffect(() => {
        const fetchResults = async () => {
            if (!searchQuery.trim() && !selectedCategory) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                let url = `/users/search?`;
                if (searchQuery.trim()) url += `q=${encodeURIComponent(searchQuery)}&`;
                if (selectedCategory) url += `category=${encodeURIComponent(selectedCategory)}`;

                const data = await fetchAPI(url);
                if (data.success) {
                    setResults(data.users);
                }
            } catch (error) {
                console.error("Error buscando:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchResults();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, selectedCategory]);

    const handleCategoryClick = (category) => {
        if (selectedCategory === category) {
            setSelectedCategory('');
        } else {
            setSelectedCategory(category);
            setSearchQuery('');
        }
    };

    const getAvatar = (user) => {
        if (user && user.profile_picture) return user.profile_picture.startsWith('http') ? user.profile_picture : `${BACKEND_URL}${user.profile_picture}`;
        return `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=262626&color=fff&bold=true`;
    };

    return (
        <Fragment>
            {/* 🔥 FONDO PREMIUM ILUMINADO */}
            <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1f1f1f] via-[#0a0a0a] to-black text-white font-sans flex flex-col relative">
                <Navbar />

                <main className="flex-1 w-full max-w-[800px] mx-auto pt-[100px] px-5 pb-12 flex flex-col gap-6 relative z-10">
                    
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-[#0095f6]/10 border border-[#0095f6]/30 rounded-xl flex items-center justify-center text-[#0095f6] shadow-[0_0_15px_rgba(0,149,246,0.2)]">
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 m-0 tracking-wide">Explorar</h1>
                    </div>

                    {/* ZONA DE BÚSQUEDA (PANEL DE CRISTAL) */}
                    <div className="bg-[#121212]/80 backdrop-blur-xl border border-[#262626] rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.5)] sticky top-[80px] z-20">
                        <div className="relative mb-6">
                            <input 
                                type="text" 
                                placeholder="Buscar usuarios, empresas o amigos..." 
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (e.target.value) setSelectedCategory('');
                                }}
                                className="w-full py-4 pr-4 pl-12 rounded-2xl border border-[#333] bg-[#0a0a0a]/50 text-white outline-none focus:border-[#0095f6] focus:bg-[#111] transition-all shadow-inner text-sm md:text-base placeholder:text-gray-600"
                            />
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>

                        {/* FILTROS BUSINESS */}
                        <div>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-3 ml-1">Explorar por rubro (Business)</span>
                            <div className="flex flex-wrap gap-2.5">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategoryClick(cat)}
                                        className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                                            selectedCategory === cat 
                                            ? 'bg-gradient-to-r from-[#00ba7c] to-[#008f5e] text-white border-transparent shadow-[0_0_15px_rgba(0,186,124,0.3)] scale-105' 
                                            : 'bg-[#1a1a1a]/50 backdrop-blur-md text-gray-400 border-[#333] hover:border-[#00ba7c] hover:text-white shadow-inner'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RESULTADOS */}
                    <div className="flex flex-col gap-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0095f6] mb-4"></div>
                                <span className="text-xs text-gray-500 font-bold tracking-widest uppercase">Buscando en la red...</span>
                            </div>
                        ) : results.length > 0 ? (
                            results.map(user => (
                                <div key={user._id || user.id} className="bg-[#121212]/80 backdrop-blur-xl border border-[#262626] rounded-2xl p-4 md:p-5 flex items-center justify-between hover:border-[#444] transition-all shadow-[0_8px_30px_rgb(0,0,0,0.3)] group">
                                    <Link to={`/${user.username}`} className="flex items-center gap-4 no-underline text-white flex-1 min-w-0">
                                        <img src={getAvatar(user)} alt={user.username} className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-2 border-[#333] shrink-0 shadow-md group-hover:scale-105 transition-transform" />
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <strong className="text-base md:text-lg truncate group-hover:text-[#0095f6] transition-colors">{user.display_name || user.username}</strong>
                                                {user.is_verified && <VerifiedBadge className="w-4 h-4" />}
                                            </div>
                                            <span className="text-xs md:text-sm text-gray-500 truncate">@{user.username}</span>
                                            
                                            <div className="flex items-center gap-2 mt-1">
                                                <LocationBadge country="España" />
                                                {user.is_business && (
                                                    <span className="w-max text-[9px] font-bold uppercase tracking-widest text-[#00ba7c] border border-[#00ba7c]/30 px-2 py-0.5 rounded-md bg-[#00ba7c]/10 shadow-inner">
                                                        {user.business_category || 'Empresa'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                    
                                    <Link to={`/${user.username}`} className="shrink-0 ml-3 px-5 py-2.5 rounded-full bg-[#1a1a1a] text-white text-xs font-bold border border-[#333] hover:bg-[#262626] hover:border-[#0095f6] transition-all no-underline shadow-sm">
                                        Ver perfil
                                    </Link>
                                </div>
                            ))
                        ) : (searchQuery || selectedCategory) ? (
                            <div className="text-center py-16 bg-[#121212]/80 backdrop-blur-xl rounded-3xl border border-[#262626] shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                                <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#333] shadow-inner">
                                    <svg width="24" height="24" fill="none" stroke="#555" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">Sin resultados</h3>
                                <p className="text-gray-500 text-sm">No encontramos a nadie que coincida con tu búsqueda.</p>
                            </div>
                        ) : (
                            <div className="text-center py-16 text-gray-600 font-bold bg-[#121212]/30 backdrop-blur-sm rounded-3xl border border-[#262626] border-dashed">
                                Usa el buscador de arriba o selecciona un rubro para encontrar cuentas.
                            </div>
                        )}
                    </div>

                </main>
            </div>
        </Fragment>
    );
};

export default Explore;