import React from 'react';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '../../hooks/useForgotPassword.js';

// Componente: ForgotPassword
// Formulario para solicitar restablecimiento de contraseña.
const ForgotPassword = () => {
    const { email, setEmail, loading, handleSubmit } = useForgotPassword();

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1f1f1f] via-[#0a0a0a] to-black flex items-center justify-center p-4">
            
            <div className="w-full max-w-[420px] bg-[#121212]/80 backdrop-blur-xl border border-[#262626] rounded-3xl p-8 md:p-10 text-center shadow-[0_15px_50px_rgba(0,0,0,0.8)] relative z-10">
                
                {/* ICONO DEL CANDADO ILUMINADO */}
                <div className="w-20 h-20 bg-[#0095f6]/10 border-2 border-[#0095f6]/50 rounded-full flex justify-center items-center mx-auto mb-6 shadow-[0_0_30px_rgba(0,149,246,0.2)] text-[#0095f6]">
                    <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>
                </div>
                
                <h2 className="text-2xl font-black mb-3 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">¿Problemas para entrar?</h2>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed">Introduce tu correo electrónico asociado y te enviaremos un código para recuperar tu acceso.</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="relative">
                        <input 
                            type="email" 
                            placeholder="Tu correo electrónico" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="w-full py-4 pr-4 pl-12 rounded-xl border border-[#333] bg-[#0a0a0a]/50 text-white outline-none focus:border-[#0095f6] focus:bg-[#111] transition-all text-sm shadow-inner placeholder:text-gray-600" 
                            required 
                        />
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || !email} 
                        className="w-full bg-gradient-to-r from-[#0095f6] to-[#0077c5] text-white py-4 rounded-full font-black tracking-wide cursor-pointer hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,149,246,0.3)] border-none"
                    >
                        {loading ? 'Enviando...' : 'Enviar código de acceso'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-[#262626]">
                    <Link to="/login" className="text-gray-400 text-sm font-bold no-underline hover:text-white transition-colors flex items-center justify-center gap-2">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        Volver al Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;