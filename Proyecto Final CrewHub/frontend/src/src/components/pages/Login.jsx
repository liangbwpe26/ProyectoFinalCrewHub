import React, { Fragment } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useLoginLogic } from "../../hooks/useLoginLogic.js";
import logoImg from "../../assets/logo.png";

const Login = () => {
    const navigate = useNavigate();
    const { credentials, updateData, handleLogin, loading } = useLoginLogic();

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-20 max-w-5xl w-full">
                {/* Lado Izquierdo: Logo */}
                <div className="flex flex-col items-center flex-1">
                    <div className="text-white text-5xl md:text-7xl font-extrabold tracking-widest mb-4 md:mb-6 text-center">CREW HUB</div>
                    <img src={logoImg} alt="Crew Hub Logo" className="w-48 h-48 md:w-[350px] md:h-[350px] rounded-full object-cover shadow-2xl" />                </div>
            </div>
            {/* Lado Derecho: Formulario */}
            <div className="w-full max-w-[400px] bg-[#121212] border border-[#262626] rounded-2xl p-6 md:p-10 shadow-2xl">
                <h2 className="text-white text-xl font-bold mb-6 text-center">Inicia Sesión</h2>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <input
                        className="w-full p-4 rounded-xl border border-[#333] bg-black text-white outline-none focus:border-[#0095f6] text-sm"
                        name="login" type="text" placeholder="Usuario o correo electrónico"
                        value={credentials.login} onChange={updateData} required
                    />
                    <input
                        className="w-full p-4 rounded-xl border border-[#333] bg-black text-white outline-none focus:border-[#0095f6] text-sm"
                        name="password" type="password" placeholder="Contraseña"
                        value={credentials.password} onChange={updateData} required
                    />

                    <div className="text-right">
                        <Link to="/forgot-password" className="text-[#0095f6] text-xs font-bold no-underline hover:underline">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-[#0095f6] text-white py-3 rounded-full font-bold cursor-pointer hover:bg-blue-600 transition-colors mt-2 disabled:bg-[#262626]">
                        {loading ? 'Iniciando...' : 'Inicia Sesión'}
                    </button>
                </form>

                <div className="text-center mt-6 text-gray-500 text-sm">
                    ¿No tienes cuenta? <span className="text-[#0095f6] font-bold cursor-pointer hover:underline" onClick={() => navigate("/register")}>Regístrate</span>
                </div>
            </div>
        </div>
    );
};

export default Login;