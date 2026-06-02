import React, { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../structure/Navbar.jsx';
import { fetchAPI } from '../../services/api.js';
import VerifiedBadge from '../VerifiedBadge.jsx';

const Explore = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

    const categories = ['Tecnología', 'Moda y Ropa', 'Comida y Restaurantes', 'Entretenimiento'];

    // Efecto para buscar automáticamente cuando escribes o cambias de categoría
    useEffect(() => {
        const fetchResults = async () => {
            if (!searchQuery.trim() && !selectedCategory) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                // Armamos la URL dependiendo de qué estamos buscando
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

        // Le metemos un pequeño retraso (debounce) para no saturar tu backend si escriben muy rápido
        const delayDebounceFn = setTimeout(() => {
            fetchResults();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, selectedCategory]);

    const handleCategoryClick = (category) => {
        // Si le dan clic a la misma categoría, la desmarcan
        if (selectedCategory === category) {
            setSelectedCategory('');
        } else {
            setSelectedCategory(category);
            setSearchQuery(''); // Limpiamos el texto si buscan por rubro
        }
    };

    const getAvatar = (user) => {
        if (user && user.profile_picture) return user.profile_picture.startsWith('http') ? user.profile_picture : `${BACKEND_URL}${user.profile_picture}`;
        return `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=262626&color=fff&bold=true`;
    };

    return (
        <Fragment>
            <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col relative">
                <Navbar />

                <main className="flex-1 w-full max-w-[800px] mx-auto pt-[100px] px-5 pb-12 flex flex-col gap-6">
                    
                    {/* ZONA DE BÚSQUEDA */}
                    <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 shadow-xl sticky top-[80px] z-10">
                        <div className="relative mb-6">
                            <input 
                                type="text" 
                                placeholder="Buscar usuarios, empresas o amigos..." 
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (e.target.value) setSelectedCategory(''); // Limpia la categoría si escriben
                                }}
                                className="w-full p-4 pl-12 rounded-xl border border-[#333] bg-[#0a0a0a] text-white outline-none focus:border-[#0095f6] transition-colors"
                            />
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>

                        {/* FILTROS BUSINESS */}
                        <div>
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-3">Explorar por rubro (Business)</span>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategoryClick(cat)}
                                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                                            selectedCategory === cat 
                                            ? 'bg-[#00ba7c] text-white border-[#00ba7c] shadow-lg shadow-green-500/20' 
                                            : 'bg-[#1a1a1a] text-gray-400 border-[#333] hover:border-[#00ba7c] hover:text-[#00ba7c]'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RESULTADOS */}
                    <div className="flex flex-col gap-3">
                        {isLoading ? (
                            <div className="text-center py-10 text-gray-500 font-bold">Buscando en la base de datos...</div>
                        ) : results.length > 0 ? (
                            results.map(user => (
                                <div key={user._id || user.id} className="bg-[#121212] border border-[#262626] rounded-xl p-4 flex items-center justify-between hover:border-[#333] transition-colors">
                                    <Link to={`/${user.username}`} className="flex items-center gap-4 no-underline text-white flex-1 min-w-0 group">
                                        <img src={getAvatar(user)} alt={user.username} className="w-14 h-14 rounded-full object-cover border border-[#333] shrink-0" />
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-1">
                                                <strong className="text-base truncate group-hover:underline">{user.display_name || user.username}</strong>
                                                {user.is_verified && <VerifiedBadge className="w-4 h-4" />}
                                            </div>
                                            <span className="text-sm text-gray-500 truncate">@{user.username}</span>
                                            
                                            {/* Si es business, mostramos su etiqueta */}
                                            {user.is_business && (
                                                <span className="mt-1 w-max text-[10px] font-bold uppercase tracking-widest text-[#00ba7c] border border-[#00ba7c] px-2 py-0.5 rounded-sm bg-[#00ba7c]/10">
                                                    {user.business_category || 'Empresa'}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                    
                                    {/* Botón de seguir falso visual para la maqueta */}
                                    <Link to={`/${user.username}`} className="shrink-0 px-5 py-2 rounded-full bg-[#262626] text-white text-xs font-bold border border-[#363636] hover:bg-[#333] transition-colors no-underline">
                                        Ver perfil
                                    </Link>
                                </div>
                            ))
                        ) : (searchQuery || selectedCategory) ? (
                            <div className="text-center py-16 text-gray-500 font-bold bg-[#121212] rounded-2xl border border-[#262626]">
                                No se encontraron resultados pa' esa búsqueda.
                            </div>
                        ) : (
                            <div className="text-center py-16 text-gray-600 font-bold">
                                Usa el buscador de arriba o selecciona un rubro para encontrar gente.
                            </div>
                        )}
                    </div>

                </main>
            </div>
        </Fragment>
    );
};

export default Explore;