import React, { useState, useRef, useContext, Fragment } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import ImageCropperModal from './ImageCropperModal.jsx';
import { fetchAPI } from '../services/api.js';

const CreatePost = ({ onPostCreated, onCancel }) => {
    const { token } = useContext(AuthContext);
    const { showToast } = useToast();
    
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [cropImageSrc, setCropImageSrc] = useState(null);
    const fileInputRef = useRef(null);

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

        try {
            // CORRECCIÓN: Usamos fetchAPI. Se encarga automáticamente de VITE_BACKEND_URL, del Token y del FormData
            const data = await fetchAPI('/posts', {
                method: 'POST',
                body: formData
            }, token);
            
            if (data.success) {
                showToast('Publicación creada con éxito', 'success');
                if (onPostCreated) onPostCreated(data.post);
                setFile(null); setPreviewUrl(''); setDescription('');
            } else {
                showToast(data.message || 'Error al publicar', 'error');
            }
        } catch (error) {
            showToast('Error de red', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

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

                    {previewUrl ? (
                        <div className="relative w-full max-w-[300px] mx-auto">
                            <img src={previewUrl} alt="Preview" className="w-full rounded-xl border border-[#333] block" />
                            <button 
                                type="button" 
                                onClick={() => { setFile(null); setPreviewUrl(''); }}
                                className="absolute top-2 right-2 bg-black/70 text-white border-none rounded-full w-8 h-8 flex justify-center items-center cursor-pointer font-bold hover:bg-red-500 transition"
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <div 
                            onClick={() => fileInputRef.current.click()}
                            className="border-2 border-dashed border-[#333] rounded-xl p-8 text-center cursor-pointer text-gray-500 hover:bg-[#1a1a1a] transition text-sm font-medium"
                        >
                            Haz clic para seleccionar una foto
                        </div>
                    )}
                    
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />

                    <div className="flex justify-end gap-3 mt-2">
                        {onCancel && (
                            <button type="button" onClick={onCancel} className="px-5 py-2 rounded-full border-none bg-transparent text-gray-400 cursor-pointer font-bold hover:bg-[#262626] transition text-sm">
                                Cancelar
                            </button>
                        )}
                        <button type="submit" disabled={isSubmitting || !file} className={`px-6 py-2 rounded-full border-none font-bold text-sm transition ${file ? 'bg-[#0095f6] text-white cursor-pointer hover:bg-blue-600' : 'bg-[#262626] text-gray-500 cursor-not-allowed'}`}>
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