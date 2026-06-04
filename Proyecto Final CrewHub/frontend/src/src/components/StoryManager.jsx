import React, { useState, useEffect, Fragment } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import { fetchAPI } from '../services/api.js';

const getCroppedImg = async (imageSrc, pixelCrop) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => { image.onload = resolve; });

    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(new File([blob], `story_${Date.now()}.jpg`, { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.9);
    });
};

const StoryManager = ({ file, onClose, community }) => { 
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const uploadFile = async (fileToUpload) => {
        if (isUploading) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('media', fileToUpload);

        if (community) {
            const safeId = community._id?.$oid || community._id || community.id;
            const slug = community.slug;

            if (safeId) formData.append('community_id', String(safeId));
            if (slug) formData.append('community_slug', String(slug));
        }

        try {
            const data = await fetchAPI('/stories', { method: 'POST', body: formData });
            onClose(data.success);
        } catch (e) {
            console.error("Error al subir", e);
            onClose(false);
        }
    };

    const handlePublish = async () => {
        setIsUploading(true);
        if (file.type.startsWith('image/')) {
            try {
                const cropData = croppedAreaPixels || { x: 0, y: 0, width: 1080, height: 1920 };
                const croppedFile = await getCroppedImg(URL.createObjectURL(file), cropData);
                await uploadFile(croppedFile);
            } catch (e) {
                console.error("Fallo al recortar", e);
                setIsUploading(false);
            }
        } else {
            await uploadFile(file);
        }
    };

    useEffect(() => {
        if (file.type.startsWith('video/')) {
            uploadFile(file);
        }
    }, []);

    if (file.type.startsWith('video/')) {
        return createPortal(
            <div className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center text-white animate-fade-in">
                <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-[#0095f6] mb-6 shadow-[0_0_20px_rgba(0,149,246,0.5)]"></div>
                <h3 className="text-xl font-black tracking-wide m-0 mb-2">Procesando Video</h3>
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest m-0">Subiendo a la nube...</p>
            </div>,
            document.body
        );
    }

    return createPortal(
        <Fragment>
            <div className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-xl flex flex-col justify-between animate-fade-in">
                
                {/* Cabecera Cristal */}
                <div className="h-[8vh] md:h-[10vh] bg-[#121212]/80 backdrop-blur-md border-b border-[#262626] flex items-center justify-center shadow-lg relative z-10">
                    <span className="text-white font-black tracking-widest uppercase text-sm drop-shadow-md">Ajustar Historia</span>
                </div>

                {/* Zona del Cropper */}
                <div className="relative w-full flex-1 bg-[#050505]">
                    <Cropper
                        image={URL.createObjectURL(file)}
                        crop={crop}
                        zoom={zoom}
                        aspect={9 / 16}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                        style={{
                            containerStyle: { width: '100%', height: '100%', backgroundColor: 'transparent' },
                            cropAreaStyle: { border: '2px solid rgba(255,255,255,0.9)', boxShadow: '0 0 0 9999em rgba(0,0,0,0.85)' }
                        }}
                    />
                </div>

                {/* Footer de Controles */}
                <div className="h-[12vh] md:h-[15vh] bg-[#121212]/90 backdrop-blur-2xl border-t border-[#262626] flex justify-between items-center px-6 md:px-12 gap-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] relative z-10">
                    <button 
                        className="text-gray-400 border-none bg-transparent font-bold uppercase tracking-widest text-xs cursor-pointer hover:text-white transition-colors" 
                        onClick={() => onClose(false)}
                    >
                        Cancelar
                    </button>
                    <button
                        className={`bg-gradient-to-r from-[#0095f6] to-[#0077c5] text-white px-8 md:px-10 py-3.5 rounded-full border-none font-black uppercase tracking-widest text-xs cursor-pointer transition-all shadow-[0_0_20px_rgba(0,149,246,0.4)] ${isUploading ? 'opacity-50 cursor-wait' : 'hover:scale-105'}`}
                        onClick={handlePublish}
                        disabled={isUploading}
                    >
                        {isUploading ? 'Subiendo...' : 'Publicar'}
                    </button>
                </div>
            </div>
        </Fragment>,
        document.body
    );
};

export default StoryManager;