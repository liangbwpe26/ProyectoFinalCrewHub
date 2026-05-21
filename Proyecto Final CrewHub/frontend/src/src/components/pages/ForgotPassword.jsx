import React from 'react';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '../../hooks/useForgotPassword.js';

const ForgotPassword = () => {
    const { email, setEmail, loading, handleSubmit } = useForgotPassword();

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-[400px] bg-[#121212] border border-[#262626] rounded-2xl p-8 text-center shadow-2xl">
                <div className="w-16 h-16 border-2 border-white rounded-full flex justify-center items-center mx-auto mb-6">
                    <svg width="30" height="30" fill="currentColor" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>
                </div>
                <h2 className="text-white text-xl font-bold mb-3">¿Problemas para entrar?</h2>
                <p className="text-gray-400 text-sm mb-8">Introduce tu correo y te enviaremos un código.</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 rounded-xl border border-[#333] bg-black text-white outline-none focus:border-[#0095f6] text-sm" required />
                    <button type="submit" disabled={loading || !email} className="w-full bg-[#0095f6] text-white py-3 rounded-full font-bold cursor-pointer hover:bg-blue-600 transition-colors disabled:bg-[#262626]">
                        {loading ? 'Enviando...' : 'Enviar código'}
                    </button>
                </form>

                <div className="mt-6">
                    <Link to="/login" className="text-[#0095f6] text-sm font-bold no-underline hover:underline">Volver al Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;