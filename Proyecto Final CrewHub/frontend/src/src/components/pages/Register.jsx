import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useRegisterLogic } from "../../hooks/useRegisterLogic.js";
import logoImg from "../../assets/logo.png";

const Register = () => {
    const navigate = useNavigate();
    const { userData, updateData, handleRegister, loading } = useRegisterLogic();

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20 max-w-5xl w-full">
                
                <div className="flex flex-col items-center flex-1">
                    <div className="text-white text-5xl md:text-7xl font-extrabold tracking-widest mb-4 md:mb-6 text-center">CREW HUB</div>
                    <img src={logoImg} alt="Crew Hub Logo" className="w-48 h-48 md:w-[350px] md:h-[350px] rounded-full object-cover shadow-2xl" />
                </div>

                <div className="w-full max-w-[400px] bg-[#121212] border border-[#262626] rounded-2xl p-6 md:p-10 shadow-2xl shrink-0">
                    <h2 className="text-white text-xl font-bold mb-6 text-center">Regístrate</h2>

                    <form onSubmit={handleRegister} className="flex flex-col gap-4">
                        
                        <input 
                            autoComplete="off" 
                            id="signup_usr_field"
                            name="signup_usr_field" 
                            type="text" 
                            placeholder="Nombre de usuario" 
                            value={userData.username} 
                            onChange={(e) => updateData({ target: { name: 'username', value: e.target.value } })} 
                            className="w-full p-4 rounded-xl border border-[#333] bg-black text-white outline-none focus:border-[#0095f6] text-sm"
                            required 
                        />
                        
                        <input 
                            autoComplete="off" 
                            id="signup_mail_field"
                            name="signup_mail_field" 
                            type="email" 
                            placeholder="Correo electrónico" 
                            value={userData.email} 
                            onChange={(e) => updateData({ target: { name: 'email', value: e.target.value } })} 
                            className="w-full p-4 rounded-xl border border-[#333] bg-black text-white outline-none focus:border-[#0095f6] text-sm"
                            required 
                        />
                        
                        <div style={{ position: 'absolute', opacity: 0, left: '-9999px', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
                            <input type="text" name="username" autoComplete="username" tabIndex="-1" />
                        </div>

                        <input 
                            autoComplete="new-password" 
                            id="password"
                            name="password" 
                            type="password" 
                            placeholder="Contraseña" 
                            value={userData.password} 
                            onChange={updateData} 
                            className="w-full p-4 rounded-xl border border-[#333] bg-black text-white outline-none focus:border-[#0095f6] text-sm"
                            required 
                        />

                        <button type="submit" disabled={loading} className="w-full bg-[#0095f6] text-white py-3 rounded-full font-bold cursor-pointer hover:bg-blue-600 transition-colors mt-2 disabled:bg-[#262626]">
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </button>
                    </form>

                    <div className="text-center mt-6 text-gray-500 text-sm">
                        ¿Ya tienes cuenta? <span className="text-[#0095f6] font-bold cursor-pointer hover:underline" onClick={() => navigate("/login")}>Inicia sesión</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Register;