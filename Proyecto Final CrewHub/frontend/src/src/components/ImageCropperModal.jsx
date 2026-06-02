import React, { useState, useCallback, Fragment } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';

const ImageCropperModal = ({ imageSrc, aspectRatio, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const onCropChange = useCallback((crop) => setCrop(crop), []);
    const onZoomChange = useCallback((zoom) => setZoom(zoom), []);
    
    const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleConfirm = async () => {
        if (!croppedAreaPixels) return;
        setIsProcessing(true);
        try {
            const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
            onCropComplete(croppedFile);
        } catch (e) {
            console.error("Error al recortar la imagen", e);
            onCancel();
        } finally {
            setIsProcessing(false);
        }
    };

    // Usamos createPortal para teletransportar el modal fuera de CreatePost
    return createPortal(
        <Fragment>
            <div className="fixed inset-0 bg-black/90 z-[9999999] flex justify-center items-center p-4">
                
                <div className="w-full max-w-[500px] bg-[#121212] rounded-2xl border border-[#333] shadow-[0_10px_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden">
                    
                    <div className="p-4 flex justify-between items-center border-b border-[#333] bg-[#1a1a1a]">
                        <button 
                            onClick={onCancel} 
                            className="bg-transparent border-none text-white text-sm cursor-pointer font-bold hover:text-gray-300 px-2 py-1"
                        >
                            Cancelar
                        </button>
                        <strong className="text-white text-base">Ajustar Imagen</strong>
                        <button 
                            onClick={handleConfirm} 
                            disabled={isProcessing} 
                            className="bg-transparent border-none text-[#0095f6] text-sm cursor-pointer font-bold hover:text-blue-400 px-2 py-1"
                        >
                            {isProcessing ? 'Procesando...' : 'Aplicar'}
                        </button>
                    </div>

                    <div className="relative w-full h-[400px] bg-black">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspectRatio}
                            onCropChange={onCropChange}
                            onCropComplete={handleCropComplete}
                            onZoomChange={onZoomChange}
                            style={{
                                containerStyle: { width: '100%', height: '100%', backgroundColor: '#000' },
                                cropAreaStyle: { border: '2px solid rgba(255,255,255,0.8)', boxShadow: '0 0 0 9999em rgba(0,0,0,0.8)' }
                            }}
                        />
                    </div>

                    <div className="p-5 bg-[#1a1a1a] border-t border-[#333] flex justify-center items-center">
                        <input 
                            type="range" 
                            value={zoom} min={1} max={3} step={0.1} 
                            onChange={(e) => setZoom(e.target.value)} 
                            className="w-[80%] cursor-pointer accent-[#0095f6]" 
                        />
                    </div>
                </div>
            </div>
        </Fragment>,
        document.body
    );
};

export default ImageCropperModal;