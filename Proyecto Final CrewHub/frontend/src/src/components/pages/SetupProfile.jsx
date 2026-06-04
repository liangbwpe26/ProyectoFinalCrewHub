import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useProfileForm } from "../../hooks/useProfileForm.js";
import { AuthContext } from "../../contexts/AuthContext.jsx";

const SetupProfile = () => {
    const { activeUser, setActiveUser } = useContext(AuthContext); 
    const navigate = useNavigate();

    const { 
        displayName, setDisplayName, dateOfBirth, setDateOfBirth, 
        previewUrl, handleImageChange, loading, submitProfile 
    } = useProfileForm(activeUser || {});

    const handleSetup = (e) => {
        e.preventDefault();
        submitProfile((updatedUser) => {
            if (setActiveUser) setActiveUser(updatedUser);
            navigate("/");
        });
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1f1f1f] via-[#0a0a0a] to-black flex items-center justify-center p-4">
            <div className="w-full max-w-[400px] bg-[#121212]/80 backdrop-blur-xl border border-[#262626] rounded-3xl p-8 text-center shadow-[0_15px_50px_rgba(0,0,0,0.8)]">
                <h2 className="text-white text-2xl font-black mb-3 tracking-wide">Configura tu Perfil</h2>
                <p className="text-gray-400 text-sm mb-8">Haz que otros tripulantes te reconozcan.</p>

                <form onSubmit={handleSetup} className="flex flex-col gap-6">
                    <div className="flex flex-col items-center gap-4">
                        <img src={previewUrl} alt="Previsualización" className="w-28 h-28 rounded-full object-cover border-4 border-[#1a1a1a] shadow-lg" />
                        <label className="cursor-pointer text-[#0095f6] font-bold text-xs uppercase tracking-widest hover:text-blue-400 transition">
                            Subir foto (Opcional)
                            <input type="file" accept="image/png, image/jpeg, image/gif" onChange={handleImageChange} className="hidden" />
                        </label>
                    </div>

                    <input className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a]/50 shadow-inner text-white outline-none focus:border-[#0095f6] text-sm transition-all" name="displayName" type="text" placeholder="Tu nombre real (Opcional)" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={50} />
                    <input className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a]/50 shadow-inner text-white outline-none focus:border-[#0095f6] transition-all text-sm [color-scheme:dark]" name="dateOfBirth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />

                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#0095f6] to-[#0077c5] text-white py-4 rounded-full font-black tracking-wide cursor-pointer hover:scale-[1.02] transition-all border-none shadow-[0_0_20px_rgba(0,149,246,0.3)]">
                        {loading ? "Guardando..." : "Guardar y Continuar"}
                    </button>
                </form>

                <div className="mt-6 text-gray-500 text-xs font-bold uppercase tracking-widest cursor-pointer hover:text-white transition" onClick={() => navigate("/")}>
                    Omitir este paso
                </div>
            </div>
        </div>
    );
};

export default SetupProfile;