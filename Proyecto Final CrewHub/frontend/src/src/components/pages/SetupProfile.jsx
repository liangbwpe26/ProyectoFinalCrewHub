import React, { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { useProfileForm } from "../../hooks/useProfileForm.js";

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
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-[400px] bg-[#121212] border border-[#262626] rounded-2xl p-8 text-center shadow-2xl">
                <h2 className="text-white text-2xl font-bold mb-2">Configura tu Perfil</h2>
                <p className="text-gray-400 text-sm mb-8">Haz que otros tripulantes te reconozcan.</p>

                <form onSubmit={handleSetup} className="flex flex-col gap-5">
                    <div className="flex flex-col items-center gap-3">
                        <img src={previewUrl} alt="Previsualización" className="w-24 h-24 rounded-full object-cover border border-[#333]" />
                        <label className="cursor-pointer text-[#0095f6] font-bold text-xs hover:text-blue-400">
                            Subir foto (Opcional)
                            <input type="file" accept="image/png, image/jpeg, image/gif" onChange={handleImageChange} className="hidden" />
                        </label>
                    </div>

                    <input className="w-full p-4 rounded-xl border border-[#333] bg-black text-white outline-none focus:border-[#0095f6] text-sm" name="displayName" type="text" placeholder="Tu nombre real (Opcional)" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={50} />
                    <input className="w-full p-4 rounded-xl border border-[#333] bg-black text-white outline-none focus:border-[#0095f6] text-sm [color-scheme:dark]" name="dateOfBirth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />

                    <button type="submit" disabled={loading} className="w-full bg-[#0095f6] text-white py-3 rounded-full font-bold cursor-pointer hover:bg-blue-600 transition-colors disabled:bg-[#262626]">
                        {loading ? "Guardando..." : "Guardar y Continuar"}
                    </button>
                </form>

                <div className="mt-6 text-gray-500 text-sm cursor-pointer hover:text-gray-300" onClick={() => navigate("/")}>
                    Omitir este paso por ahora
                </div>
            </div>
        </div>
    );
};

export default SetupProfile;