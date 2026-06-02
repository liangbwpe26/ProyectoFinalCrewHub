import React, { useState, useRef, Fragment, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext.jsx';
import ImageCropperModal from './ImageCropperModal.jsx';
import { fetchAPI } from '../services/api.js';

const CreatePost = ({ onPostCreated, onCancel, communityId, communityTags = [] }) => {
    const { showToast } = useToast();

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
        { id: 'tecnologia', label: 'Tecnología' },
        { id: 'deportes', label: 'Deportes' },
        { id: 'musica', label: 'Música' },
        { id: 'arte', label: 'Arte y Diseño' },
        { id: 'videojuegos', label: 'Videojuegos' },
        { id: 'viajes', label: 'Viajes' },
        { id: 'comida', label: 'Gastronomía' },
        { id: 'estilo_de_vida', label: 'Estilo de Vida' }
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target)) {
                setIsTagDropdownOpen(false);
            }
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
        if (!file) return showToast('Por favor selecciona una imagen', 'error');

        setIsSubmitting(true);
        const formData = new FormData();

        formData.append('image', file);
        formData.append('description', description);
        
        if (!communityId) {
            formData.append('category', category);
        }

        if (communityId) {
            formData.append('community_id', communityId);
            if (communityTag) formData.append('community_tag', communityTag);
        }

        try {
            const data = await fetchAPI('/posts', {
                method: 'POST',
                body: formData
            });

            if (data.success) {
                showToast(data.message || 'Publicación enviada con éxito', 'success');

                if (onPostCreated) onPostCreated(data.post, data.status);

                setFile(null); setPreviewUrl(''); setDescription(''); setCategory(''); setCommunityTag('');
            } else {
                showToast(data.message || 'Error al publicar', 'error');
            }
        } catch (error) {
            showToast('Error de red', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Validación dinámica para habilitar el botón "Publicar"
    // Si estamos en comunidad: solo hace falta la foto. Si no: hace falta foto + categoría.
    const isFormValid = file && (communityId ? true : category !== '');

    return (
        <Fragment>
            <div className="bg-[#121212] p-6 rounded-2xl border border-[#262626] shadow-lg">
                <h3 className="mt-0 mb-4 text-white text-lg font-bold">Crear Publicación</h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <textarea
                        placeholder="¿Qué estás pensando?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-4 rounded-xl border border-[#333] bg-[#000] text-white min-h-[80px] resize-y outline-none focus:border-[#0095f6] transition text-sm"
                    />

                    {/* RENDERIZADO CONDICIONAL DE SELECTORES */}
                    {!communityId ? (
                        /* 1. SELECTOR DE CATEGORÍA GLOBAL (Si está en el Home) */
                        <div className="relative w-full" ref={dropdownRef}>
                            <div
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`w-full p-4 rounded-xl border ${isDropdownOpen ? 'border-[#0095f6]' : 'border-[#333]'} bg-[#000] transition cursor-pointer flex justify-between items-center`}
                            >
                                <span className={`text-sm ${category ? 'text-white' : 'text-gray-500'}`}>
                                    {category ? CATEGORIES.find(c => c.id === category)?.label : 'Selecciona una categoría...'}
                                </span>
                                <svg className={`w-5 h-5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-[#0095f6]' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </div>
                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] z-[50] overflow-hidden">
                                    <div className="max-h-[220px] overflow-y-auto custom-scrollbar py-1">
                                        {CATEGORIES.map(cat => (
                                            <div
                                                key={cat.id}
                                                onClick={() => { setCategory(cat.id); setIsDropdownOpen(false); }}
                                                className={`px-5 py-3 text-sm cursor-pointer transition flex items-center gap-2 ${category === cat.id ? 'bg-[#0095f6]/10 text-[#0095f6] font-bold border-l-2 border-[#0095f6]' : 'text-gray-300 hover:bg-[#262626] hover:text-white border-l-2 border-transparent'}`}
                                            >
                                                {cat.label}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : communityTags && communityTags.length > 0 ? (
                        /* 2. SELECTOR DE ETIQUETAS DE COMUNIDAD (Si está en un grupo y hay etiquetas) */
                        <div className="relative w-full" ref={tagDropdownRef}>
                            <div
                                onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                                className={`w-full p-4 rounded-xl border ${isTagDropdownOpen ? 'border-[#0095f6]' : 'border-[#333]'} bg-[#000] transition cursor-pointer flex justify-between items-center`}
                            >
                                <span className={`text-sm ${communityTag ? 'text-white' : 'text-gray-500'}`}>
                                    {communityTag || 'Selecciona una etiqueta (Opcional)...'}
                                </span>
                                <svg className={`w-5 h-5 transition-transform duration-300 ${isTagDropdownOpen ? 'rotate-180 text-[#0095f6]' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </div>
                            {isTagDropdownOpen && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] z-[50] overflow-hidden">
                                    <div className="max-h-[220px] overflow-y-auto custom-scrollbar py-1">
                                        <div 
                                            onClick={() => { setCommunityTag(''); setIsTagDropdownOpen(false); }} 
                                            className="px-5 py-3 text-sm cursor-pointer text-gray-400 hover:bg-[#262626] hover:text-white transition"
                                        >
                                            Sin etiqueta
                                        </div>
                                        {communityTags.map((tag, i) => (
                                            <div
                                                key={i}
                                                onClick={() => { setCommunityTag(tag); setIsTagDropdownOpen(false); }}
                                                className={`px-5 py-3 text-sm cursor-pointer transition flex items-center gap-2 ${communityTag === tag ? 'bg-[#0095f6]/10 text-[#0095f6] font-bold border-l-2 border-[#0095f6]' : 'text-gray-300 hover:bg-[#262626] hover:text-white border-l-2 border-transparent'}`}
                                            >
                                                {tag}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}

                    {/* PREVIEW DE IMAGEN */}
                    {previewUrl ? (
                        <div className="relative w-full max-w-[300px] mx-auto mt-2">
                            <img src={previewUrl} alt="Preview" className="w-full rounded-xl border border-[#333] block" />
                            <button
                                type="button"
                                onClick={() => { setFile(null); setPreviewUrl(''); }}
                                className="absolute top-2 right-2 bg-black/70 text-white border-none rounded-full w-8 h-8 flex justify-center items-center cursor-pointer font-bold hover:bg-red-500 transition"
                            >✕</button>
                        </div>
                    ) : (
                        <div
                            onClick={() => fileInputRef.current.click()}
                            className="border-2 border-dashed border-[#333] rounded-xl p-8 text-center cursor-pointer text-gray-500 hover:bg-[#1a1a1a] transition text-sm font-medium mt-2"
                        >
                            Haz clic para seleccionar una foto
                        </div>
                    )}

                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />

                    <div className="flex justify-end gap-3 mt-4">
                        {onCancel && (
                            <button type="button" onClick={onCancel} className="px-5 py-2 rounded-full border-none bg-transparent text-gray-400 cursor-pointer font-bold hover:bg-[#262626] transition text-sm">
                                Cancelar
                            </button>
                        )}
                        <button 
                            type="submit" 
                            disabled={isSubmitting || !isFormValid} 
                            className={`px-6 py-2 rounded-full border-none font-bold text-sm transition ${isFormValid ? 'bg-[#0095f6] text-white cursor-pointer hover:bg-blue-600' : 'bg-[#262626] text-gray-500 cursor-not-allowed'}`}
                        >
                            {isSubmitting ? 'Publicando...' : 'Publicar'}
                        </button>
                    </div>
                </form>
            </div>

            {cropImageSrc && (
                <ImageCropperModal imageSrc={cropImageSrc} aspectRatio={1} onCropComplete={handleCropComplete} onCancel={() => { setCropImageSrc(null); fileInputRef.current.value = ''; }} />
            )}
        </Fragment>
    );
};

export default CreatePost;