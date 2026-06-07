import React, { Fragment } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLoginLogic } from "../../hooks/useLoginLogic.js";
import logoImg from "../../assets/logo.png";

// Componente: Login
// Pantalla de inicio de sesión y redirección tras autenticar.
const Login = () => {
    const navigate = useNavigate();
    const { credentials, updateData, handleLogin, loading } = useLoginLogic();

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1f1f1f] via-[#0a0a0a] to-black flex items-center justify-center p-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20 max-w-5xl w-full z-10">
                
                <div className="flex flex-col items-center flex-1 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] md:w-[400px] md:h-[400px] bg-[#0095f6]/20 blur-[100px] rounded-full pointer-events-none"></div>
                    
                    <div className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 text-5xl md:text-7xl font-black tracking-widest mb-6 md:mb-8 text-center drop-shadow-lg relative z-10">
                        CREW HUB
                    </div>
                    <img src={logoImg} alt="Crew Hub Logo" className="w-56 h-56 md:w-[350px] md:h-[350px] rounded-full object-cover shadow-[0_0_50px_rgba(0,149,246,0.2)] border-2 border-white/5 relative z-10" />
                </div>
                
                <div className="w-full max-w-[420px] bg-[#121212]/80 backdrop-blur-xl border border-[#262626] rounded-3xl p-8 md:p-10 shadow-[0_15px_50px_rgba(0,0,0,0.8)] shrink-0 relative z-10">
                    <h2 className="text-2xl font-black mb-8 text-center tracking-wide text-white">Inicia Sesión</h2>

                    <form onSubmit={handleLogin} className="flex flex-col gap-5">
                        <div className="relative">
                            <input
                                className="w-full py-4 pr-4 pl-12 rounded-xl border border-[#333] bg-[#0a0a0a]/50 text-white outline-none focus:border-[#0095f6] focus:bg-[#111] transition-all text-sm shadow-inner placeholder:text-gray-600"
                                name="login" type="text" placeholder="Usuario o correo"
                                value={credentials.login} onChange={updateData} required
                            />
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>

                        <div className="relative">
                            <input
                                className="w-full py-4 pr-4 pl-12 rounded-xl border border-[#333] bg-[#0a0a0a]/50 text-white outline-none focus:border-[#0095f6] focus:bg-[#111] transition-all text-sm shadow-inner placeholder:text-gray-600"
                                name="password" type="password" placeholder="Contraseña"
                                value={credentials.password} onChange={updateData} required
                            />
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>

                        <div className="text-right mt-1">
                            <Link to="/forgot-password" className="text-[#0095f6] text-xs font-bold no-underline hover:text-blue-400 transition-colors">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full bg-gradient-to-r from-[#0095f6] to-[#0077c5] text-white py-4 rounded-full font-black tracking-wide cursor-pointer hover:scale-[1.02] transition-transform mt-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,149,246,0.3)] border-none"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Iniciando...
                                </span>
                            ) : 'Inicia Sesión'}
                        </button>
                    </form>

                    <div className="text-center mt-8 text-gray-500 text-sm border-t border-[#262626] pt-6">
                        ¿No tienes cuenta? <span className="text-[#0095f6] font-bold cursor-pointer hover:text-blue-400 transition-colors ml-1" onClick={() => navigate("/register")}>Regístrate aquí</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;