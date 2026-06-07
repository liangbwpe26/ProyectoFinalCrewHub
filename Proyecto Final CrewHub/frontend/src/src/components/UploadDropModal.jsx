import React, { useState, useRef } from 'react';
import { fetchAPI } from '../services/api.js';

// Componente: UploadDropModal
// Modal para subir un nuevo drop (video) y vista previa antes de enviar.
const UploadDropModal = ({ onClose, onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [description, setDescription] = useState('');
    const [allowDownloads, setAllowDownloads] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('video', file);
        formData.append('description', description);
        formData.append('allow_downloads', allowDownloads ? '1' : '0');

        try {
            const data = await fetchAPI('/drops', {
                method: 'POST',
                body: formData
            });
            if (data.success) {
                onUploadSuccess(data.drop);
                onClose();
            }
        } catch (error) {
            console.error("Error subiendo el Drop", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[10000] flex justify-center items-center p-4 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] bg-[#121212]/95 backdrop-blur-2xl rounded-3xl border border-[#333] flex flex-col shadow-[0_15px_50px_rgba(0,0,0,0.8)] p-8 transform transition-all">
                
                <div className="flex justify-between items-center mb-6 border-b border-[#262626] pb-4">
                    <h3 className="m-0 text-white text-xl font-black tracking-wide">Publicar un Drop</h3>
                    <button onClick={onClose} className="bg-transparent text-gray-500 hover:text-[#ff4d4d] border-none text-2xl cursor-pointer font-bold leading-none transition-colors">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {previewUrl ? (
                        <div className="relative w-full h-[280px] bg-[#050505] rounded-2xl overflow-hidden border border-[#333] shadow-inner group">
                            <video src={previewUrl} className="w-full h-full object-contain" autoPlay loop muted />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end p-3">
                                <button type="button" onClick={() => { setFile(null); setPreviewUrl(null); }} className="bg-[#ff4d4d] text-white border-none rounded-full w-8 h-8 flex justify-center items-center cursor-pointer font-bold hover:scale-110 transition-transform shadow-lg">✕</button>
                            </div>
                        </div>
                    ) : (
                        <div onClick={() => fileInputRef.current.click()} className="w-full h-[280px] border-2 border-dashed border-[#333] bg-[#0a0a0a]/50 shadow-inner rounded-2xl flex flex-col justify-center items-center text-gray-500 cursor-pointer hover:bg-[#1a1a1a] hover:text-[#0095f6] transition-all hover:border-[#0095f6]">
                            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="mb-3"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                            <span className="text-sm font-bold uppercase tracking-widest">Seleccionar video (MP4)</span>
                        </div>
                    )}
                    <input type="file" accept="video/mp4,video/quicktime" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />

                    <div className="flex flex-col gap-2.5">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">Descripción</label>
                        <textarea placeholder="¿De qué trata este video?..." value={description} onChange={e => setDescription(e.target.value)} className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a]/50 shadow-inner text-white outline-none focus:border-[#0095f6] focus:bg-[#111] transition-all text-sm resize-none h-24 custom-scrollbar" />
                    </div>

                    <label className="flex items-center gap-4 text-gray-300 cursor-pointer text-sm bg-[#1a1a1a]/50 backdrop-blur-md p-4 rounded-xl border border-[#333] hover:border-[#555] transition-colors shadow-inner">
                        <input type="checkbox" checked={allowDownloads} onChange={e => setAllowDownloads(e.target.checked)} className="w-5 h-5 accent-[#0095f6] cursor-pointer" />
                        <span className="font-bold">Permitir que otros descarguen este Drop</span>
                    </label>

                    <button type="submit" disabled={!file || isSubmitting} className={`w-full py-4 rounded-full font-black uppercase tracking-widest text-xs transition-all mt-2 border-none ${file && !isSubmitting ? 'bg-gradient-to-r from-[#0095f6] to-[#0077c5] text-white hover:scale-[1.02] shadow-[0_0_20px_rgba(0,149,246,0.3)] cursor-pointer' : 'bg-[#262626] text-gray-500 cursor-not-allowed'}`}>
                        {isSubmitting ? 'Subiendo...' : 'Publicar Drop'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadDropModal;