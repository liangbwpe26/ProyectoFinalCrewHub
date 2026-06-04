import React, { useState, useCallback, Fragment } from 'react';
import { createPortal } from 'react-dom';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage.js';

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

    return createPortal(
        <Fragment>
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999999] flex justify-center items-center p-4">
                
                <div className="w-full max-w-[500px] bg-[#121212]/95 border border-[#333] rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden transform transition-all">
                    
                    <div className="p-5 flex justify-between items-center border-b border-[#262626]">
                        <button 
                            onClick={onCancel} 
                            className="bg-transparent border-none text-gray-400 text-xs font-bold uppercase tracking-widest cursor-pointer hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <strong className="text-white text-base tracking-wide font-black">Ajustar Imagen</strong>
                        <button 
                            onClick={handleConfirm} 
                            disabled={isProcessing} 
                            className="bg-[#0095f6]/10 border border-[#0095f6]/30 text-[#0095f6] text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-[#0095f6] hover:text-white transition-colors px-4 py-2 rounded-full shadow-inner disabled:opacity-50"
                        >
                            {isProcessing ? 'Cargando...' : 'Aplicar'}
                        </button>
                    </div>

                    <div className="relative w-full h-[400px] bg-[#050505]">
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
                                cropAreaStyle: { border: '2px solid rgba(255,255,255,0.9)', boxShadow: '0 0 0 9999em rgba(0,0,0,0.8)' }
                            }}
                        />
                    </div>

                    <div className="p-6 bg-[#121212] flex flex-col justify-center items-center gap-3">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Nivel de Zoom</span>
                        <input 
                            type="range" 
                            value={zoom} min={1} max={3} step={0.1} 
                            onChange={(e) => setZoom(e.target.value)} 
                            className="w-[80%] cursor-pointer accent-[#0095f6] h-1.5 bg-[#333] rounded-lg appearance-none" 
                        />
                    </div>
                </div>
            </div>
        </Fragment>,
        document.body
    );
};

export default ImageCropperModal;