import React, { useState, useRef, Fragment, useEffect, useContext } from 'react';
import { useToast } from '../contexts/ToastContext.jsx';
import { AuthContext } from '../contexts/AuthContext.jsx';
import ImageCropperModal from './ImageCropperModal.jsx';
import { fetchAPI } from '../services/api.js';

// Componente: LocationBadge
// Pequeño badge para mostrar país en el formulario de creación.
const LocationBadge = ({ country }) => (
    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 bg-gradient-to-r from-[#1a1a1a] to-[#111] px-3 py-1.5 rounded-full border border-[#333] shadow-inner w-fit cursor-default hover:border-[#0095f6] hover:text-[#0095f6] transition-colors">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
            <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span className="font-bold tracking-widest uppercase">{country}</span>
    </div>
);

// Componente: CreatePost
// Formulario para crear una nueva publicación con imagen/video.
const CreatePost = ({ onPostCreated, onCancel, communityId, communityTags = [] }) => {
    const { showToast } = useToast();
    const { activeUser } = useContext(AuthContext); 

    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [communityTag, setCommunityTag] = useState('');
    const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [cropImageSrc, setCropImageSrc] = useState(null);
    const fileInputRef = useRef(null);
    const dropdownRef = useRef(null);
    const tagDropdownRef = useRef(null);
    
    const CATEGORIES = [
        { id: 'estilo-de-vida', label: 'Estilo de Vida' },
        { id: 'humor', label: 'Humor y Memes' },
        { id: 'pensamientos', label: 'Pensamientos y Reflexiones' },
        { id: 'actualidad', label: 'Actualidad y Noticias' },
        
        { id: 'cine-y-series', label: 'Cine y Series' },
        { id: 'musica', label: 'Música' },
        { id: 'arte-y-diseno', label: 'Arte y Diseño' },
        { id: 'fotografia', label: 'Fotografía' },
        { id: 'anime', label: 'Anime y Cultura Geek' },
        
        { id: 'videojuegos', label: 'Videojuegos' },
        { id: 'deportes-fitness', label: 'Deportes' },
        { id: 'viajes', label: 'Viajes y Aventura' },
        { id: 'gastronomia', label: 'Gastronomía' },
        
        { id: 'tecnologia', label: 'Tecnología' },
        { id: 'educacion', label: 'Educación y Aprendizaje' },
        { id: 'negocios', label: 'Negocios y Finanzas' },
        { id: 'desarrollo-web', label: 'Desarrollo Web' },
        { id: 'cocina', label: 'Cocina' }
    ];
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
    
    const getAvatar = (user) => {
        if (user?.profile_picture) return user.profile_picture.startsWith('http') ? user.profile_picture : `${BACKEND_URL}${user.profile_picture}`;
        return `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=262626&color=fff&bold=true`;
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false);
            if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target)) setIsTagDropdownOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.readAsDataURL(selectedFile);
            reader.onload = () => setCropImageSrc(reader.result);
        } else {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleCropComplete = (croppedFile) => {
        setFile(croppedFile);
        setPreviewUrl(URL.createObjectURL(croppedFile));
        setCropImageSrc(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!file && !description.trim()) {
            return showToast('Agrega una foto o escribe algo para publicar.', 'error');
        }

        setIsSubmitting(true);
        const formData = new FormData();

        if (file) {
            formData.append('image', file);
        }
        
        formData.append('description', description);
        
        if (!communityId) formData.append('category', category);
        if (communityId) {
            formData.append('community_id', communityId);
            if (communityTag) formData.append('community_tag', communityTag);
        }

        try {
            const data = await fetchAPI('/posts', { method: 'POST', body: formData });
            if (data.success) {
                showToast(data.message || 'Publicación enviada con éxito', 'success');
                if (onPostCreated) onPostCreated(data.post, data.status);
                
                // Limpiamos todo el formulario
                setFile(null); 
                setPreviewUrl(''); 
                setDescription(''); 
                setCategory(''); 
                setCommunityTag('');
                if (fileInputRef.current) fileInputRef.current.value = '';
            } else {
                showToast(data.message || 'Error al publicar', 'error');
            }
        } catch (error) {
            showToast('Error de red', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const hasContent = file !== null || description.trim().length > 0;
    const isFormValid = hasContent && (communityId ? true : category !== '');

    return (
        <Fragment>
            <div className="bg-[#121212]/90 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-[#262626] shadow-[0_8px_30px_rgb(0,0,0,0.5)] transition-all">
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    
                    <div className="flex items-start gap-3 md:gap-4">
                        <img 
                            src={getAvatar(activeUser)} 
                            alt="Tu perfil" 
                            className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border border-[#333] shrink-0 shadow-md"
                        />
                        <div className="flex-1 w-full flex flex-col gap-3">
                            <textarea
                                placeholder="¿Qué estás pensando?"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full p-4 rounded-2xl border border-transparent bg-transparent text-white min-h-[60px] resize-y outline-none focus:border-[#333] focus:bg-[#0a0a0a]/50 focus:shadow-inner transition-all text-sm md:text-[15px] placeholder:text-gray-500 leading-relaxed custom-scrollbar"
                            />

                            {/* PREVIEW DE IMAGEN */}
                            {previewUrl && (
                                <div className="relative w-full max-w-[300px] mt-2 group">
                                    <img src={previewUrl} alt="Preview" className="w-full rounded-2xl border border-[#333] block shadow-md" />
                                    <button
                                        type="button"
                                        onClick={() => { setFile(null); setPreviewUrl(''); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                                        className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white border-none rounded-full w-8 h-8 flex justify-center items-center cursor-pointer font-bold hover:bg-[#ff4d4d] transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 shadow-lg"
                                    >✕</button>
                                </div>
                            )}

                            <div className="flex flex-wrap items-center gap-3 mt-1">
                                {/* BOTÓN DE SUBIDA */}
                                <label className="flex items-center gap-2 text-xs font-bold text-[#0095f6] bg-[#0095f6]/10 px-4 py-2.5 rounded-full cursor-pointer hover:bg-[#0095f6] hover:text-white transition-colors border border-[#0095f6]/20 shadow-sm">
                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                        <polyline points="21 15 16 10 5 21"></polyline>
                                    </svg>
                                    {file ? 'Cambiar Foto' : 'Adjuntar Foto'}
                                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                                </label>

                                {/* SELECTORES DE CATEGORÍA / ETIQUETA */}
                                {!communityId ? (
                                    <div className="relative flex-1 min-w-[150px]" ref={dropdownRef}>
                                        <div
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className={`w-full px-4 py-2.5 rounded-full border ${isDropdownOpen ? 'border-[#00ba7c] bg-[#00ba7c]/5' : 'border-[#333] bg-[#1a1a1a]/50 shadow-inner'} transition-colors cursor-pointer flex justify-between items-center`}
                                        >
                                            <span className={`text-xs font-bold uppercase tracking-widest ${category ? 'text-[#00ba7c]' : 'text-gray-500'}`}>
                                                {category ? CATEGORIES.find(c => c.id === category)?.label : 'Categoría...'}
                                            </span>
                                            <svg className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-[#00ba7c]' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </div>
                                        {isDropdownOpen && (
                                            <div className="absolute top-full left-0 w-full mt-2 bg-[#1a1a1a]/95 backdrop-blur-xl border border-[#333] rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] z-[50] overflow-hidden">
                                                <div className="max-h-[220px] overflow-y-auto custom-scrollbar py-2">
                                                    {CATEGORIES.map(cat => (
                                                        <div
                                                            key={cat.id}
                                                            onClick={() => { setCategory(cat.id); setIsDropdownOpen(false); }}
                                                            className={`px-5 py-3 text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors flex items-center gap-2 ${category === cat.id ? 'bg-[#00ba7c]/10 text-[#00ba7c]' : 'text-gray-400 hover:bg-[#262626] hover:text-white'}`}
                                                        >
                                                            {cat.label}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : communityTags && communityTags.length > 0 ? (
                                    <div className="relative flex-1 min-w-[150px]" ref={tagDropdownRef}>
                                        <div
                                            onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                                            className={`w-full px-4 py-2.5 rounded-full border ${isTagDropdownOpen ? 'border-[#00ba7c] bg-[#00ba7c]/5' : 'border-[#333] bg-[#1a1a1a]/50 shadow-inner'} transition-colors cursor-pointer flex justify-between items-center`}
                                        >
                                            <span className={`text-xs font-bold uppercase tracking-widest ${communityTag ? 'text-[#00ba7c]' : 'text-gray-500'}`}>
                                                {communityTag || 'Etiqueta (Opcional)'}
                                            </span>
                                            <svg className={`w-4 h-4 transition-transform duration-300 ${isTagDropdownOpen ? 'rotate-180 text-[#00ba7c]' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </div>
                                        {isTagDropdownOpen && (
                                            <div className="absolute top-full left-0 w-full mt-2 bg-[#1a1a1a]/95 backdrop-blur-xl border border-[#333] rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] z-[50] overflow-hidden">
                                                <div className="max-h-[220px] overflow-y-auto custom-scrollbar py-2">
                                                    <div 
                                                        onClick={() => { setCommunityTag(''); setIsTagDropdownOpen(false); }} 
                                                        className="px-5 py-3 text-xs font-bold uppercase tracking-widest cursor-pointer text-gray-500 hover:bg-[#262626] hover:text-white transition-colors"
                                                    >
                                                        Sin etiqueta
                                                    </div>
                                                    {communityTags.map((tag, i) => (
                                                        <div
                                                            key={i}
                                                            onClick={() => { setCommunityTag(tag); setIsTagDropdownOpen(false); }}
                                                            className={`px-5 py-3 text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors flex items-center gap-2 ${communityTag === tag ? 'bg-[#00ba7c]/10 text-[#00ba7c]' : 'text-gray-400 hover:bg-[#262626] hover:text-white'}`}
                                                        >
                                                            {tag}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-4 border-t border-[#262626]">
                        <LocationBadge country="España" />
                        
                        <div className="flex gap-3">
                            {onCancel && (
                                <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-full border-none bg-transparent text-gray-400 cursor-pointer font-bold uppercase tracking-widest text-[10px] hover:bg-[#262626] hover:text-white transition-colors">
                                    Cancelar
                                </button>
                            )}
                            <button 
                                type="submit" 
                                disabled={isSubmitting || !isFormValid} 
                                className={`px-8 py-2.5 rounded-full border-none font-black uppercase tracking-widest text-[11px] transition-all shadow-md ${isFormValid ? 'bg-gradient-to-r from-[#0095f6] to-[#0077c5] text-white cursor-pointer hover:scale-105 shadow-[0_0_15px_rgba(0,149,246,0.3)]' : 'bg-[#262626] text-gray-500 cursor-not-allowed'}`}
                            >
                                {isSubmitting ? 'Publicando...' : 'Publicar'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {cropImageSrc && (
                <ImageCropperModal imageSrc={cropImageSrc} aspectRatio={1} onCropComplete={handleCropComplete} onCancel={() => { setCropImageSrc(null); if(fileInputRef.current) fileInputRef.current.value = ''; }} />
            )}
        </Fragment>
    );
};

export default CreatePost;