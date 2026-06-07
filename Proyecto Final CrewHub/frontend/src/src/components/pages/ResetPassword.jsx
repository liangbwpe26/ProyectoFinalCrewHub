import React from 'react';
import { Link } from 'react-router-dom';
import { useResetPassword } from '../../hooks/useResetPassword.js';

// Componente: ResetPassword
// Pantalla para confirmar código y establecer nueva contraseña.
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
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1f1f1f] via-[#0a0a0a] to-black flex items-center justify-center p-4">
            <div className="w-full max-w-[420px] bg-[#121212]/80 backdrop-blur-xl border border-[#262626] rounded-3xl p-8 md:p-10 text-center shadow-[0_15px_50px_rgba(0,0,0,0.8)] relative z-10">
                <h2 className="text-white text-xl font-black mb-3 tracking-wide">Crea una nueva contraseña</h2>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                    Escribe el código de 6 dígitos que enviamos a tu correo y tu nueva contraseña.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5" autoComplete="off">
                    {!initialEmail && (
                        <input 
                            type="email" placeholder="Tu correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a]/50 shadow-inner text-white outline-none focus:border-[#0095f6] text-sm" 
                            required 
                        />
                    )}
                    
                    <input 
                        type="text" maxLength="6" placeholder="000000" value={code} onChange={handleCodeChange}
                        className="w-full p-4 rounded-xl border border-[#0095f6] bg-black text-white outline-none text-center tracking-[1rem] font-black text-2xl shadow-[0_0_15px_rgba(0,149,246,0.2)]" 
                        required 
                    />

                    <input 
                        type="password" placeholder="Nueva contraseña (min. 8 caracteres)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a]/50 shadow-inner text-white outline-none focus:border-[#0095f6] text-sm" 
                        required 
                    />

                    <button 
                        type="submit" disabled={loading || code.length < 6 || newPassword.length < 8}
                        className="w-full bg-gradient-to-r from-[#0095f6] to-[#0077c5] text-white py-4 rounded-full font-black tracking-wide cursor-pointer hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,149,246,0.3)] border-none mt-2"
                    >
                        {loading ? 'Guardando...' : 'Cambiar Contraseña'}
                    </button>
                </form>

                <div className="mt-8">
                    <Link to="/login" className="text-gray-500 font-bold no-underline hover:text-white transition text-xs uppercase tracking-widest">Cancelar</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;