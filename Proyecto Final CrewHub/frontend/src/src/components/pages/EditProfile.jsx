import React, { Fragment, useContext, useRef, useState } from 'react';
import { Link } from 'react-router-dom'; // IMPORTAMOS LINK
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
                        <label className="relative inline-block w-12 h-6 cursor-pointer shrink-0">
                            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="opacity-0 w-0 h-0 peer" />
                            <span className={`absolute inset-0 rounded-full transition-colors duration-300 ${isPrivate ? 'bg-[#0095f6]' : 'bg-[#363636]'}`}>
                                <span className={`absolute w-4 h-4 bg-white rounded-full bottom-1 transition-transform duration-300 ${isPrivate ? 'translate-x-7' : 'translate-x-1'}`}></span>
                            </span>
                        </label>
                    </div>

                    <hr className="border-[#262626] my-2" />

                    <div className="flex flex-col p-5 bg-[#0a0a0a] rounded-xl border border-[#333]">
                        <div className="mb-4 flex justify-between items-start">
                            <div>
                                <span className="block font-bold text-sm text-[#00ba7c]">Cuenta Business</span>
                                <span className="text-xs text-gray-500 mt-1 block">
                                    {activeUser?.is_business
                                        ? 'Modifica la apariencia de tu empresa para tus clientes.'
                                        : 'Activa herramientas comerciales gratis.'}
                                </span>
                            </div>
                            {activeUser?.is_business && (
                                <button type="button" onClick={handleDowngrade} disabled={isUpgrading} className="text-xs text-[#ff4d4d] hover:underline bg-transparent border-none cursor-pointer p-0">
                                    Desactivar
                                </button>
                            )}
                        </div>

                        {activeUser?.is_business ? (
                            <div className="flex flex-col gap-5">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Banner Comercial</label>
                                    <div className="w-full h-32 bg-[#1a1a1a] rounded-xl border-2 border-dashed border-[#333] flex items-center justify-center relative overflow-hidden group">
                                        {previewBannerUrl ? (
                                            <img src={previewBannerUrl.startsWith('http') || previewBannerUrl.startsWith('blob') ? previewBannerUrl : `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}${previewBannerUrl}`} alt="Banner" className="w-full h-full object-cover opacity-60 group-hover:opacity-30 transition-opacity" />
                                        ) : (
                                            <span className="text-gray-500 text-sm">Sin banner actual</span>
                                        )}
                                        <label className="absolute cursor-pointer bg-[#00ba7c] text-white text-xs font-bold px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                            Subir Nuevo Banner
                                            <input type="file" ref={bannerInputRef} accept="image/png, image/jpeg" onChange={handleBannerChange} className="hidden" />
                                        </label>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Eslogan de la Empresa</label>
                                    <input
                                        type="text"
                                        value={businessSlogan}
                                        onChange={(e) => setBusinessSlogan(e.target.value)}
                                        placeholder="Ej. 'Innovando tu futuro cada día'"
                                        maxLength={60}
                                        className="w-full p-3.5 rounded-xl border border-[#333] bg-[#1a1a1a] text-[#00ba7c] font-medium outline-none focus:border-[#00ba7c] transition-colors text-sm"
                                    />
                                </div>

                                <div className="text-sm font-bold bg-[#1a1a1a] p-4 rounded-lg border border-[#333] text-gray-300 flex items-center justify-between">
                                    <span>Categoría:</span>
                                    <span className="text-[#00ba7c] bg-[#00ba7c]/10 px-3 py-1 rounded-full uppercase text-xs tracking-wider">
                                        {activeUser.business_category || 'General'}
                                    </span>
                                </div>

                                {/* NUEVO BOTÓN PARA COMPRAR PAUTA */}
                                <div className="mt-2 pt-4 border-t border-[#333]">
                                    <Link to="/premium" className="w-full py-4 px-2 rounded-xl font-bold text-sm transition-all border border-[#00ba7c] text-[#00ba7c] hover:bg-[#00ba7c] hover:text-white cursor-pointer shadow-lg shadow-green-500/10 flex justify-center items-center no-underline text-center">
                                        Impulsar mi Empresa (Ads)
                                    </Link>
                                    <p className="text-[10px] text-gray-500 text-center mt-2">Haz que tus publicaciones lleguen a miles de personas.</p>
                                </div>

                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <select
                                    value={businessCategory}
                                    onChange={(e) => setBusinessCategory(e.target.value)}
                                    className="w-full p-3.5 rounded-xl border border-[#333] bg-[#1a1a1a] text-white outline-none focus:border-[#00ba7c] transition-colors text-sm cursor-pointer"
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
                                    className={`w-full p-4 rounded-xl font-bold text-sm transition-all border-none ${isUpgrading ? 'bg-[#262626] text-gray-500 cursor-not-allowed' : 'bg-[#00ba7c] text-white hover:bg-[#009e6a] cursor-pointer shadow-lg shadow-green-500/20'}`}
                                >
                                    {isUpgrading ? "Procesando..." : "Convertir en Cuenta Business"}
                                </button>
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={loading} className={`mt-4 p-4 rounded-xl border-none font-bold text-sm transition-all ${loading ? 'bg-[#262626] text-gray-500 cursor-not-allowed' : 'bg-[#0095f6] text-white hover:bg-blue-600 cursor-pointer shadow-lg shadow-blue-500/20'}`}>
                        {loading ? "Guardando cambios..." : "Guardar todos los cambios"}
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