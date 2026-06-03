import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useResetPassword } from '../../hooks/useResetPassword.js';

const ResetPassword = () => {
    const location = useLocation();
    const initialEmail = location.state?.email || '';

    const {
        email, setEmail,
        code, handleCodeChange,
        newPassword, setNewPassword,
        loading, handleSubmit
    } = useResetPassword(initialEmail);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-[400px] bg-[#121212] border border-[#262626] rounded-2xl p-8 text-center shadow-2xl">
                <h2 className="text-white text-xl font-bold mb-3">Crea una nueva contraseña</h2>
                <p className="text-gray-400 text-sm mb-8">
                    Escribe el código de 6 dígitos que enviamos a tu correo y tu nueva contraseña.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="off">
                    {!initialEmail && (
                        <input 
                            type="email" placeholder="Tu correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 rounded-xl border border-[#333] bg-black text-white outline-none focus:border-[#0095f6] text-sm" 
                            required 
                        />
                    )}
                    
                    <input 
                        type="text" maxLength="6" placeholder="Código de 6 dígitos" value={code} onChange={handleCodeChange}
                        className="w-full p-4 rounded-xl border border-[#0095f6] bg-black text-white outline-none text-center tracking-[0.5rem] font-bold text-lg" 
                        required 
                    />

                    <input 
                        type="password" placeholder="Nueva contraseña (min. 8 caracteres)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-4 rounded-xl border border-[#333] bg-black text-white outline-none focus:border-[#0095f6] text-sm" 
                        required 
                    />

                    <button 
                        type="submit" disabled={loading || code.length < 5 || newPassword.length < 8}
                        className="w-full bg-[#0095f6] text-white py-3 rounded-full font-bold cursor-pointer hover:bg-blue-600 transition-colors disabled:bg-[#262626] mt-2"
                    >
                        {loading ? 'Guardando...' : 'Cambiar Contraseña'}
                    </button>
                </form>

                <div className="mt-6 text-sm">
                    <Link to="/login" className="text-gray-500 no-underline hover:text-white transition">Cancelar</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;