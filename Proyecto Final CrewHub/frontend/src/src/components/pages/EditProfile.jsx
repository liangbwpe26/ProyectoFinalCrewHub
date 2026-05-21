import React, { Fragment, useContext, useRef } from 'react';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { useProfileForm } from '../../hooks/useProfileForm.js';
import ImageCropperModal from '../ImageCropperModal.jsx';

const EditProfile = () => {
    const { activeUser, token, setActiveUser } = useContext(AuthContext); 
    const fileInputRef = useRef(null);

    const { 
        displayName, setDisplayName, dateOfBirth, setDateOfBirth,
        isPrivate, setIsPrivate, previewUrl, handleImageChange, loading, submitProfile,
        cropImageSrc, setCropImageSrc, handleCropComplete
    } = useProfileForm(token, activeUser || {});

    const handleSubmit = (e) => {
        e.preventDefault();
        submitProfile((updatedUser) => {
            if (setActiveUser) setActiveUser(updatedUser);
        });
    };

    if (!activeUser) return null;

    return (
        <Fragment>
            <div className="w-full max-w-[550px]">
                <h2 className="m-0 mb-6 text-xl font-bold text-white">Editar Perfil</h2>

                <form onSubmit={handleSubmit} className="p-8 bg-[#121212] rounded-2xl border border-[#262626] flex flex-col gap-6 shadow-xl">
                    
                    <div className="flex flex-col items-center gap-4">
                        <img src={previewUrl} alt="Previsualización" className="w-28 h-28 rounded-full object-cover border-4 border-[#1a1a1a] shadow-lg" />
                        <label className="cursor-pointer text-[#0095f6] font-bold text-sm hover:text-blue-400 transition-colors">
                            Cambiar foto
                            <input type="file" ref={fileInputRef} accept="image/png, image/jpeg, image/gif" onChange={handleImageChange} className="hidden" />
                        </label>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Nombre a mostrar</label>
                        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ej. Juan Pérez" maxLength={50} className="w-full p-3.5 rounded-xl border border-[#333] bg-[#000] text-white outline-none focus:border-[#0095f6] transition-colors text-sm" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Fecha de nacimiento</label>
                        <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full p-3.5 rounded-xl border border-[#333] bg-[#000] text-white outline-none focus:border-[#0095f6] transition-colors text-sm [color-scheme:dark]" />
                    </div>

                    <div className="flex justify-between items-center p-5 bg-[#0a0a0a] rounded-xl border border-[#333]">
                        <div>
                            <span className="block font-bold text-sm text-white">Cuenta Privada</span>
                            <span className="text-xs text-gray-500 mt-1 block">Solo quienes apruebes podrán seguirte.</span>
                        </div>
                        {/* Toggle animado con Tailwind */}
                        <label className="relative inline-block w-12 h-6 cursor-pointer shrink-0">
                            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="opacity-0 w-0 h-0 peer" />
                            <span className={`absolute inset-0 rounded-full transition-colors duration-300 ${isPrivate ? 'bg-[#0095f6]' : 'bg-[#363636]'}`}>
                                <span className={`absolute w-4 h-4 bg-white rounded-full bottom-1 transition-transform duration-300 ${isPrivate ? 'translate-x-7' : 'translate-x-1'}`}></span>
                            </span>
                        </label>
                    </div>

                    <button type="submit" disabled={loading} className={`mt-4 p-4 rounded-xl border-none font-bold text-sm transition-all ${loading ? 'bg-[#262626] text-gray-500 cursor-not-allowed' : 'bg-[#0095f6] text-white hover:bg-blue-600 cursor-pointer shadow-lg shadow-blue-500/20'}`}>
                        {loading ? "Guardando..." : "Guardar cambios"}
                    </button>
                </form>
            </div>

            {cropImageSrc && (
                <ImageCropperModal 
                    imageSrc={cropImageSrc}
                    aspectRatio={1}
                    onCropComplete={handleCropComplete}
                    onCancel={() => { setCropImageSrc(null); fileInputRef.current.value = ''; }}
                />
            )}
        </Fragment>
    );
};

export default EditProfile;