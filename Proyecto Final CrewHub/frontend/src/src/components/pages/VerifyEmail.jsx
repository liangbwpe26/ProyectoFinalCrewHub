import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useVerifyEmail } from '../../hooks/useVerifyEmail.js';

const VerifyEmail = () => {
    const location = useLocation();
    const initialEmail = location.state?.email || '';

    const {
        email, setEmail,
        code, handleCodeChange,
        loading, handleVerify,
        resendLoading, handleResendCode
    } = useVerifyEmail(initialEmail);

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1f1f1f] via-[#0a0a0a] to-black flex items-center justify-center p-4">
            <div className="w-full max-w-[400px] bg-[#121212] border border-[#262626] rounded-2xl p-8 text-center shadow-2xl">
                <h2 className="text-white text-xl font-bold mb-3">Verifica tu correo</h2>
                <p className="text-gray-400 text-sm mb-8">
                    Hemos enviado un código de 6 dígitos a tu bandeja de entrada.
                </p>

                <form onSubmit={handleVerify} className="flex flex-col gap-4">
                    {!initialEmail && (
                        <input 
                            type="email" 
                            placeholder="Tu correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 rounded-xl border border-[#333] bg-black text-white outline-none focus:border-[#0095f6] text-sm"
                            required
                        />
                    )}
                    
                    <input 
                        type="text" 
                        maxLength="6"
                        placeholder="000000"
                        value={code}
                        onChange={handleCodeChange}
                        className="w-full p-4 rounded-xl border border-[#0095f6] bg-black text-white outline-none text-center tracking-[1rem] font-bold text-2xl"
                        required
                    />

                    <button 
                        type="submit" 
                        disabled={loading || code.length < 5}
                        className="w-full bg-[#0095f6] text-white py-3 rounded-full font-bold cursor-pointer hover:bg-blue-600 transition-colors disabled:bg-[#262626] mt-2"
                    >
                        {loading ? 'Verificando...' : 'Verificar y Entrar'}
                    </button>
                </form>

                {/* Botón de reenvío */}
                <div className="mt-6">
                    <button 
                        onClick={handleResendCode}
                        disabled={resendLoading || !email}
                        className="bg-transparent border-none text-[#0095f6] cursor-pointer text-xs font-bold underline hover:text-blue-400 disabled:text-gray-600"
                    >
                        {resendLoading ? 'Enviando...' : '¿No recibiste el código? Reenviar'}
                    </button>
                </div>

                <div className="mt-6 text-sm">
                    <Link to="/login" className="text-gray-500 no-underline hover:text-white transition">Volver al Login</Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;