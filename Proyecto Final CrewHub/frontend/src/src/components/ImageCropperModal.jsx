import React, { useState, useCallback, Fragment } from 'react';
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

    return (
        <Fragment>
            <div className="fixed inset-0 bg-black/95 z-[10000] flex flex-col">
                
                <div className="p-4 flex justify-between items-center border-b border-[#333] bg-[#111]">
                    <button onClick={onCancel} className="bg-transparent border-none text-white text-sm cursor-pointer font-bold hover:text-gray-300">Cancelar</button>
                    <strong className="text-white text-sm">Ajustar Imagen</strong>
                    <button onClick={handleConfirm} disabled={isProcessing} className="bg-transparent border-none text-[#0095f6] text-sm cursor-pointer font-bold hover:text-blue-400">
                        {isProcessing ? 'Procesando...' : 'Aplicar'}
                    </button>
                </div>

                <div className="relative flex-1 bg-black">
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
                            cropAreaStyle: { border: '2px solid rgba(255,255,255,0.5)', boxShadow: '0 0 0 9999em rgba(0,0,0,0.8)' }
                        }}
                    />
                </div>

                <div className="p-6 bg-[#111] flex justify-center items-center">
                    <input 
                        type="range" 
                        value={zoom} min={1} max={3} step={0.1} 
                        onChange={(e) => setZoom(e.target.value)} 
                        className="w-[60%] cursor-pointer accent-[#0095f6]" 
                    />
                </div>
            </div>
        </Fragment>
    );
};

export default ImageCropperModal;