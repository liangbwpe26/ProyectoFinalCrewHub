import React, { Fragment, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import Navbar from '../structure/Navbar.jsx';

const Premium = () => {
    const { activeUser } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1f1f1f] via-[#0a0a0a] to-black text-white font-sans flex flex-col relative">
            <Navbar />

            <main className="flex-1 w-full max-w-[1000px] mx-auto pt-[120px] px-5 pb-12 flex flex-col items-center relative z-10">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">CrewHub Ads</h1>
                    <p className="text-gray-400 text-lg max-w-[600px] mx-auto">
                        Tener perfil de empresa es bonito, pero que te vean miles es mejor. Invierte en pauta y rompe el algoritmo.
                    </p>
                </div>

                {!activeUser?.is_business && (
                    <div className="w-full max-w-2xl bg-[#ff4d4d]/10 border border-[#ff4d4d]/30 text-[#ff4d4d] p-4 rounded-xl text-center font-bold mb-8">
                        Debes convertir tu cuenta a Business desde "Editar Perfil" para comprar pauta.
                    </div>
                )}

                <div className="flex flex-col md:flex-row gap-8 w-full justify-center">
                    
                    <div className="flex-1 bg-[#121212]/80 backdrop-blur-xl border border-[#262626] rounded-3xl p-8 flex flex-col hover:border-[#0095f6] transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                        <h2 className="text-2xl font-black mb-2 text-white">Plan Standard</h2>
                        <p className="text-gray-400 text-sm mb-6">Tu marca se mostrará a personas con intereses afines.</p>
                        
                        <div className="text-4xl font-black mb-8 border-b border-[#262626] pb-6 text-[#0095f6]">
                            S/ 39.90 <span className="text-base text-gray-500 font-normal">/ mes</span>
                        </div>

                        <ul className="flex flex-col gap-4 mb-auto text-sm text-gray-300">
                            <li className="flex gap-3 items-center"><span className="text-[#0095f6] font-bold">✓</span> Alcance orgánico potenciado</li>
                            <li className="flex gap-3 items-center"><span className="text-[#0095f6] font-bold">✓</span> 1 post sugerido cada 15</li>
                            <li className="flex gap-3 items-center"><span className="text-[#0095f6] font-bold">✓</span> Segmentación básica</li>
                        </ul>

                        <button 
                            onClick={() => navigate('/checkout', { state: { type: 'ads', planId: 'Standard', planName: 'Plan Standard Ads', price: '39.90' } })}
                            disabled={!activeUser?.is_business || activeUser?.ad_plan === 'Standard'}
                            className={`w-full mt-8 py-4 rounded-xl font-black text-sm transition-all border-none cursor-pointer shadow-lg ${!activeUser?.is_business ? 'bg-[#262626] text-gray-600' : activeUser?.ad_plan === 'Standard' ? 'bg-[#1a1a1a] text-[#0095f6] border border-[#0095f6] cursor-not-allowed' : 'bg-[#0095f6] hover:bg-blue-600 text-white shadow-blue-500/20'}`}
                        >
                            {activeUser?.ad_plan === 'Standard' ? 'Plan Actual' : 'Comprar Standard'}
                        </button>
                    </div>

                    <div className="flex-1 bg-[#121212]/80 backdrop-blur-xl border border-[#00ba7c]/30 rounded-3xl p-8 flex flex-col transition-all relative overflow-hidden shadow-[0_0_40px_rgba(0,186,124,0.15)]">
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-[#00ba7c] to-[#008f5e] text-white text-[10px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest shadow-lg">
                            Best Seller
                        </div>
                        <h2 className="text-2xl font-black mb-2 text-[#00ba7c]">Plan Business</h2>
                        <p className="text-gray-400 text-sm mb-6">Aparición garantizada, rompe los límites.</p>
                        
                        <div className="text-4xl font-black mb-8 border-b border-[#262626] pb-6 text-[#00ba7c]">
                            S/ 120.00 <span className="text-base text-gray-500 font-normal">/ mes</span>
                        </div>

                        <ul className="flex flex-col gap-4 mb-6 text-sm text-gray-300">
                            <li className="flex gap-3 items-center"><span className="text-[#00ba7c] font-bold">✓</span> Publicidad masiva</li>
                            <li className="flex gap-3 items-center"><span className="text-[#00ba7c] font-bold">✓</span> 1 post sugerido cada 5</li>
                            <li className="flex gap-3 items-center"><span className="text-[#00ba7c] font-bold">✓</span> Segmentación Premium</li>
                        </ul>

                        <button 
                            onClick={() => navigate('/checkout', { state: { type: 'ads', planId: 'tiburon', planName: 'Plan Business Ads', price: '120.00' } })}
                            disabled={!activeUser?.is_business || activeUser?.ad_plan === 'tiburon'}
                            className={`w-full mt-auto py-4 rounded-xl font-black text-sm transition-all border-none cursor-pointer shadow-lg ${!activeUser?.is_business ? 'bg-[#262626] text-gray-600' : activeUser?.ad_plan === 'tiburon' ? 'bg-[#1a1a1a] text-[#00ba7c] border border-[#00ba7c] cursor-not-allowed' : 'bg-gradient-to-r from-[#00ba7c] to-[#008f5e] hover:from-[#00ba7c] hover:to-[#00ba7c] text-white shadow-green-500/20'}`}
                        >
                            {activeUser?.ad_plan === 'tiburon' ? 'Plan Actual' : 'Comprar Business'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Premium;