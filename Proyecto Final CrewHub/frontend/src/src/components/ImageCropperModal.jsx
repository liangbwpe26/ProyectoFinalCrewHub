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
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 10000, display: 'flex', flexDirection: 'column' }}>
                
                <div style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', backgroundColor: '#111' }}>
                    <button onClick={onCancel} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
                    <strong style={{ color: '#fff' }}>Ajustar Imagen</strong>
                    <button onClick={handleConfirm} disabled={isProcessing} style={{ background: 'none', border: 'none', color: '#0095f6', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>
                        {isProcessing ? 'Procesando...' : 'Aplicar'}
                    </button>
                </div>

                <div style={{ position: 'relative', flex: 1, backgroundColor: '#000' }}>
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

                <div style={{ padding: '20px', backgroundColor: '#111', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <input 
                        type="range" 
                        value={zoom} min={1} max={3} step={0.1} 
                        onChange={(e) => setZoom(e.target.value)} 
                        style={{ width: '60%' }} 
                    />
                </div>
            </div>
        </Fragment>
    );
};

export default ImageCropperModal;