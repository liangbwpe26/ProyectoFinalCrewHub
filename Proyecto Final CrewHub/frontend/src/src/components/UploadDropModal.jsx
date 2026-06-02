import React, { useState, useRef } from 'react';
import { fetchAPI } from '../services/api.js';

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
        <div className="fixed inset-0 bg-black/90 z-[10000] flex justify-center items-center p-5 backdrop-blur-sm" onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[450px] bg-[#121212] rounded-2xl border border-[#262626] flex flex-col shadow-2xl p-6">
                
                <div className="flex justify-between items-center mb-6">
                    <h3 className="m-0 text-white text-lg font-bold">Publicar un Drop</h3>
                    <button onClick={onClose} className="bg-transparent text-gray-500 hover:text-white border-none text-2xl cursor-pointer font-bold leading-none">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {previewUrl ? (
                        <div className="relative w-full h-[250px] bg-black rounded-xl overflow-hidden border border-[#333]">
                            <video src={previewUrl} className="w-full h-full object-contain" autoPlay loop muted />
                            <button type="button" onClick={() => { setFile(null); setPreviewUrl(null); }} className="absolute top-2 right-2 bg-black/70 text-white border-none rounded-full w-8 h-8 flex justify-center items-center cursor-pointer font-bold hover:bg-[#ff4d4d] transition">✕</button>
                        </div>
                    ) : (
                        <div onClick={() => fileInputRef.current.click()} className="w-full h-[250px] border-2 border-dashed border-[#333] rounded-xl flex flex-col justify-center items-center text-gray-500 cursor-pointer hover:bg-[#1a1a1a] transition hover:border-[#0095f6]">
                            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="mb-2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                            <span className="text-sm font-bold">Seleccionar video (MP4)</span>
                        </div>
                    )}
                    <input type="file" accept="video/mp4,video/quicktime" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />

                    <textarea placeholder="Escribe una descripción..." value={description} onChange={e => setDescription(e.target.value)} className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a] text-white outline-none focus:border-[#0095f6] transition text-sm resize-none h-24" />

                    <label className="flex items-center gap-3 text-gray-300 cursor-pointer text-sm bg-[#0a0a0a] p-4 rounded-xl border border-[#333]">
                        <input type="checkbox" checked={allowDownloads} onChange={e => setAllowDownloads(e.target.checked)} className="w-5 h-5 accent-[#0095f6] cursor-pointer" />
                        Permitir que otros descarguen este Drop
                    </label>

                    <button type="submit" disabled={!file || isSubmitting} className={`w-full py-3.5 rounded-full font-bold text-sm transition mt-2 border-none ${file && !isSubmitting ? 'bg-[#0095f6] text-white hover:bg-blue-600 cursor-pointer' : 'bg-[#262626] text-gray-500 cursor-not-allowed'}`}>
                        {isSubmitting ? 'Subiendo...' : 'Publicar Drop'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UploadDropModal;