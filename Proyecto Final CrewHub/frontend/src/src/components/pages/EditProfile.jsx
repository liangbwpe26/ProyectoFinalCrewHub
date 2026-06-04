import React, { Fragment, useContext, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { useProfileForm } from '../../hooks/useProfileForm.js';
import { useMonetization } from '../../hooks/useMonetization.js';
import ImageCropperModal from '../ImageCropperModal.jsx';
import ConfirmModal from '../ConfirmModal.jsx';

const EditProfile = () => {
    const { activeUser, setActiveUser } = useContext(AuthContext);
    const fileInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    const {
        displayName, setDisplayName, dateOfBirth, setDateOfBirth,
        isPrivate, setIsPrivate, previewUrl, handleImageChange, loading, submitProfile,
        cropImageSrc, setCropImageSrc, handleCropComplete,
        businessSlogan, setBusinessSlogan, previewBannerUrl, handleBannerChange
    } = useProfileForm(activeUser || {});

    const { upgradeBusiness, downgradeBusiness, isLoading: isUpgrading } = useMonetization();
    const [businessCategory, setBusinessCategory] = useState('Tecnología');
    const [isDowngradeModalOpen, setIsDowngradeModalOpen] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        submitProfile((updatedUser) => {
            if (setActiveUser) setActiveUser(updatedUser);
        });
    };

    const handleUpgradeToBusiness = async () => {
        if (activeUser?.is_business) return;
        await upgradeBusiness(businessCategory);
    };

    const handleDowngrade = () => {
        setIsDowngradeModalOpen(true);
    };

    const executeDowngrade = async () => {
        setIsDowngradeModalOpen(false);
        await downgradeBusiness();
    };

    if (!activeUser) return null;

    return (
        <Fragment>
            <div className="w-full max-w-[550px] relative z-10">
                <h2 className="m-0 mb-6 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-wide">Editar Perfil</h2>

                {/* PANEL DE CRISTAL ESMERILADO */}
                <form onSubmit={handleSubmit} className="p-6 md:p-8 bg-[#121212]/80 backdrop-blur-xl rounded-3xl border border-[#262626] flex flex-col gap-7 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">

                    {/* FOTO DE PERFIL */}
                    <div className="flex flex-col items-center gap-4 mb-2">
                        <div className="relative group">
                            <img src={previewUrl} alt="Previsualización" className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-[#121212] shadow-[0_0_20px_rgba(0,0,0,0.5)]" />
                            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" fill="none"/><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/></svg>
                            </div>
                        </div>
                        <label className="cursor-pointer bg-[#262626] hover:bg-[#333] text-white px-5 py-2 rounded-full font-bold text-xs transition-colors border border-[#333] shadow-sm">
                            Cambiar foto
                            <input type="file" ref={fileInputRef} accept="image/png, image/jpeg, image/gif" onChange={handleImageChange} className="hidden" />
                        </label>
                    </div>

                    <div className="flex flex-col gap-2.5">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">Nombre a mostrar</label>
                        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ej. Juan Pérez" maxLength={50} className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a]/50 shadow-inner text-white outline-none focus:border-[#0095f6] focus:bg-[#111] transition-all text-sm font-medium" />
                    </div>

                    <div className="flex flex-col gap-2.5">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">Fecha de nacimiento</label>
                        <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a]/50 shadow-inner text-white outline-none focus:border-[#0095f6] focus:bg-[#111] transition-all text-sm [color-scheme:dark]" />
                    </div>

                    <div className="flex justify-between items-center p-5 bg-[#0a0a0a]/50 shadow-inner rounded-2xl border border-[#333]">
                        <div>
                            <span className="block font-black text-sm text-white tracking-wide">Cuenta Privada</span>
                            <span className="text-xs text-gray-500 mt-1 block">Solo quienes apruebes podrán seguirte.</span>
                        </div>
                        <label className="relative inline-block w-12 h-6 cursor-pointer shrink-0">
                            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="opacity-0 w-0 h-0 peer" />
                            <span className={`absolute inset-0 rounded-full transition-colors duration-300 shadow-inner ${isPrivate ? 'bg-[#0095f6]' : 'bg-[#363636]'}`}>
                                <span className={`absolute w-4 h-4 bg-white rounded-full bottom-1 transition-transform duration-300 shadow-md ${isPrivate ? 'translate-x-7' : 'translate-x-1'}`}></span>
                            </span>
                        </label>
                    </div>

                    <hr className="border-[#262626] my-2" />

                    <div className="flex flex-col p-6 bg-gradient-to-br from-[#0a0a0a] to-[#111] rounded-2xl border border-[#333] shadow-inner relative overflow-hidden">
                        {/* Pequeño resplandor verde de fondo para la zona business */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ba7c]/10 blur-[50px] pointer-events-none"></div>

                        <div className="mb-5 flex justify-between items-start relative z-10">
                            <div>
                                <span className="block font-black text-sm text-[#00ba7c] tracking-wide drop-shadow-[0_0_5px_rgba(0,186,124,0.4)]">Cuenta Business</span>
                                <span className="text-xs text-gray-400 mt-1 block leading-relaxed max-w-[200px] md:max-w-none">
                                    {activeUser?.is_business
                                        ? 'Modifica la apariencia de tu empresa para tus clientes.'
                                        : 'Activa herramientas comerciales gratis.'}
                                </span>
                            </div>
                            {activeUser?.is_business && (
                                <button type="button" onClick={handleDowngrade} disabled={isUpgrading} className="text-xs text-[#ff4d4d] font-bold bg-[#ff4d4d]/10 px-3 py-1.5 rounded-lg hover:bg-[#ff4d4d] hover:text-white transition-colors cursor-pointer border border-[#ff4d4d]/20">
                                    Desactivar
                                </button>
                            )}
                        </div>

                        {activeUser?.is_business ? (
                            <div className="flex flex-col gap-6 relative z-10">
                                <div className="flex flex-col gap-2.5">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">Banner Comercial</label>
                                    <div className="w-full h-36 bg-[#0a0a0a] shadow-inner rounded-xl border-2 border-dashed border-[#333] flex items-center justify-center relative overflow-hidden group">
                                        {previewBannerUrl ? (
                                            <img src={previewBannerUrl.startsWith('http') || previewBannerUrl.startsWith('blob') ? previewBannerUrl : `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}${previewBannerUrl}`} alt="Banner" className="w-full h-full object-cover opacity-70 group-hover:opacity-30 transition-opacity" />
                                        ) : (
                                            <span className="text-gray-500 text-xs font-bold uppercase tracking-widest">Sin banner actual</span>
                                        )}
                                        <label className="absolute cursor-pointer bg-[#00ba7c] text-white text-xs font-bold px-5 py-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_15px_rgba(0,186,124,0.4)]">
                                            Subir Nuevo Banner
                                            <input type="file" ref={bannerInputRef} accept="image/png, image/jpeg" onChange={handleBannerChange} className="hidden" />
                                        </label>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2.5">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">Eslogan de la Empresa</label>
                                    <input
                                        type="text"
                                        value={businessSlogan}
                                        onChange={(e) => setBusinessSlogan(e.target.value)}
                                        placeholder="Ej. 'Innovando tu futuro cada día'"
                                        maxLength={60}
                                        className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a]/50 shadow-inner text-[#00ba7c] font-bold outline-none focus:border-[#00ba7c] focus:bg-[#111] transition-all text-sm placeholder:text-gray-600 placeholder:font-normal"
                                    />
                                </div>

                                <div className="text-sm font-bold bg-[#1a1a1a] p-4 rounded-xl border border-[#333] text-gray-300 flex items-center justify-between shadow-inner">
                                    <span className="text-xs uppercase tracking-widest text-gray-500">Categoría:</span>
                                    <span className="text-[#00ba7c] bg-[#00ba7c]/10 border border-[#00ba7c]/20 px-3 py-1 rounded-md uppercase text-[10px] tracking-widest">
                                        {activeUser.business_category || 'General'}
                                    </span>
                                </div>

                                <div className="mt-2 pt-5 border-t border-[#262626]">
                                    <Link to="/premium" className="w-full py-4 px-2 rounded-xl font-black tracking-wide text-sm transition-all border-none bg-gradient-to-r from-[#00ba7c] to-[#008f5e] text-white hover:scale-[1.02] cursor-pointer shadow-[0_0_20px_rgba(0,186,124,0.3)] flex justify-center items-center no-underline text-center">
                                        Impulsar mi Empresa (Ads)
                                    </Link>
                                    <p className="text-[10px] text-gray-500 text-center mt-3 font-bold uppercase tracking-widest">Haz que tus publicaciones lleguen a miles.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4 relative z-10">
                                <select
                                    value={businessCategory}
                                    onChange={(e) => setBusinessCategory(e.target.value)}
                                    className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a]/50 shadow-inner text-white font-bold outline-none focus:border-[#00ba7c] focus:bg-[#111] transition-all text-sm cursor-pointer"
                                >
                                    <option value="Tecnología">Tecnología</option>
                                    <option value="Moda y Ropa">Moda y Ropa</option>
                                    <option value="Comida y Restaurantes">Comida y Restaurantes</option>
                                    <option value="Entretenimiento">Entretenimiento</option>
                                </select>

                                <button
                                    type="button"
                                    onClick={handleUpgradeToBusiness}
                                    disabled={isUpgrading}
                                    className={`w-full py-4 rounded-xl font-black text-sm tracking-wide transition-all border-none ${isUpgrading ? 'bg-[#262626] text-gray-500 cursor-wait' : 'bg-gradient-to-r from-[#00ba7c] to-[#008f5e] text-white hover:scale-[1.02] cursor-pointer shadow-[0_0_20px_rgba(0,186,124,0.3)]'}`}
                                >
                                    {isUpgrading ? "Procesando..." : "Convertir en Cuenta Business"}
                                </button>
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={loading} className={`mt-2 py-4 rounded-full border-none font-black text-sm tracking-wide transition-all ${loading ? 'bg-[#262626] text-gray-500 cursor-wait' : 'bg-gradient-to-r from-[#0095f6] to-[#0077c5] text-white hover:scale-[1.02] cursor-pointer shadow-[0_0_20px_rgba(0,149,246,0.3)]'}`}>
                        {loading ? "Guardando cambios..." : "Guardar todos los cambios"}
                    </button>

                </form>
            </div>

            {cropImageSrc && (
                <ImageCropperModal imageSrc={cropImageSrc} aspectRatio={1} onCropComplete={handleCropComplete} onCancel={() => { setCropImageSrc(null); fileInputRef.current.value = ''; }} />
            )}

            <ConfirmModal
                isOpen={isDowngradeModalOpen}
                title="¿Cerrar tienda?"
                message="¿Seguro que quieres cerrar tu perfil de empresa? Perderás tus métricas y pautas publicitarias."
                confirmText="Desactivar"
                cancelText="Cancelar"
                onConfirm={executeDowngrade}
                onCancel={() => setIsDowngradeModalOpen(false)}
            />
        </Fragment>
    );
};

export default EditProfile;