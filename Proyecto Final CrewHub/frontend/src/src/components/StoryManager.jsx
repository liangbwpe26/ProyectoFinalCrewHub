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

// 🔥 RECIBIMOS 'community' EN VEZ DE 'communityId'
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
            // Buscamos el ID por cielo, mar y tierra
            const safeId = community._id?.$oid || community._id || community.id;
            const slug = community.slug;

            // Le mandamos AMBOS a Laravel para que él decida cuál usar
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
            <div className="fixed inset-0 z-[9999] bg-black/90 flex flex-col items-center justify-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0095f6] mb-4"></div>
                <p>Subiendo video a la nube...</p>
            </div>,
            document.body
        );
    }

    return createPortal(
        <Fragment>
            <div className="fixed inset-0 z-[9999] bg-black">
                <div className="relative w-full h-[85vh]">
                    <Cropper
                        image={URL.createObjectURL(file)}
                        crop={crop}
                        zoom={zoom}
                        aspect={9 / 16}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                    />
                </div>

                <div className="h-[15vh] flex justify-end items-center px-10 gap-4">
                    <button className="text-white border-none bg-transparent font-bold cursor-pointer hover:text-gray-400" onClick={() => onClose(false)}>Cancelar</button>
                    <button
                        className="bg-[#0095f6] text-white px-8 py-3 rounded-full border-none font-bold cursor-pointer hover:bg-blue-600 transition disabled:opacity-50"
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