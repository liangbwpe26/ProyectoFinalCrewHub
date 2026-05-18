import React, { useState, useRef, useContext, Fragment } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import ImageCropperModal from './ImageCropperModal.jsx';

const CreatePost = ({ onPostCreated, onCancel }) => {
    const { token } = useContext(AuthContext);
    const { showToast } = useToast();
    
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Estados para el recorte
    const [cropImageSrc, setCropImageSrc] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (selectedFile.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.readAsDataURL(selectedFile);
            reader.onload = () => {
                setCropImageSrc(reader.result);
            };
        } else {
            // Si tuvieras videos en posts, pasarían por aquí
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
        if (!file) {
            showToast('Por favor selecciona una imagen', 'error');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('image', file);
        formData.append('description', description);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/posts', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();
            
            if (data.success) {
                showToast('Publicación creada con éxito', 'success');
                if (onPostCreated) onPostCreated(data.post);
                setFile(null);
                setPreviewUrl('');
                setDescription('');
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
            <div style={{ backgroundColor: '#121212', padding: '20px', borderRadius: '12px', border: '1px solid #262626' }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#fff' }}>Crear Publicación</h3>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <textarea 
                        placeholder="¿Qué estás pensando?" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#000', color: '#fff', minHeight: '80px', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
                    />

                    {previewUrl ? (
                        <div style={{ position: 'relative', width: '100%', maxWidth: '300px', margin: '0 auto' }}>
                            <img src={previewUrl} alt="Preview" style={{ width: '100%', borderRadius: '8px', display: 'block', border: '1px solid #333' }} />
                            <button 
                                type="button" 
                                onClick={() => { setFile(null); setPreviewUrl(''); }}
                                style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <div 
                            onClick={() => fileInputRef.current.click()}
                            style={{ border: '2px dashed #333', borderRadius: '8px', padding: '30px', textAlign: 'center', cursor: 'pointer', color: 'gray', transition: '0.2s' }}
                        >
                            Haz clic para seleccionar una foto
                        </div>
                    )}
                    
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" style={{ display: 'none' }} />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                        {onCancel && (
                            <button type="button" onClick={onCancel} style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', backgroundColor: 'transparent', color: 'gray', cursor: 'pointer', fontWeight: 'bold' }}>
                                Cancelar
                            </button>
                        )}
                        <button type="submit" disabled={isSubmitting || !file} style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', backgroundColor: file ? '#0095f6' : '#262626', color: file ? '#fff' : 'gray', cursor: file ? 'pointer' : 'default', fontWeight: 'bold', transition: '0.2s' }}>
                            {isSubmitting ? 'Publicando...' : 'Publicar'}
                        </button>
                    </div>
                </form>
            </div>

            {cropImageSrc && (
                <ImageCropperModal 
                    imageSrc={cropImageSrc}
                    aspectRatio={1} // Formato Cuadrado (1:1) para Publicaciones
                    onCropComplete={handleCropComplete}
                    onCancel={() => { setCropImageSrc(null); fileInputRef.current.value = ''; }}
                />
            )}
        </Fragment>
    );
};

export default CreatePost;