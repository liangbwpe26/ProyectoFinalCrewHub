import React, { Fragment, useState, useContext } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { useMonetization } from '../../hooks/useMonetization.js';
import Navbar from '../structure/Navbar.jsx';

// Componente: SecureBadge
// Badge visual que indica transacción segura.
const SecureBadge = () => (
    <div className="flex items-center gap-1.5 bg-[#00ba7c]/10 text-[#00ba7c] border border-[#00ba7c]/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit mb-4">
        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path></svg>
        Transacción Segura
    </div>
);

const Checkout = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { activeUser } = useContext(AuthContext);
    
    const { buyAdPlan, buyVerification } = useMonetization(); 
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvc: '' });

    if (!state || !state.planId) {
        return <Navigate to="/premium" />;
    }

    const handlePayment = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        setTimeout(async () => {
            let success = false;
            
            if (state.type === 'ads') {
                success = true; 
            } else if (state.type === 'verification') {
                success = true;
            }

            setIsProcessing(false);
            
            if (success) {
                setIsSuccess(true);
                
                setTimeout(() => {
                    navigate(`/${activeUser?.username}`);
                }, 3000);
            }
        }, 2000);
    };

    return (
        <Fragment>
            <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1f1f1f] via-[#0a0a0a] to-black text-white font-sans flex flex-col relative">
                <Navbar />

                <main className="flex-1 w-full max-w-[950px] mx-auto pt-[120px] px-5 pb-12 flex flex-col md:flex-row gap-8 relative z-10">
                    
                    <div className="w-full md:w-1/3 flex flex-col gap-6">
                        <div className="bg-[#121212]/80 backdrop-blur-xl border border-[#262626] rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                            <h2 className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-6 border-b border-[#333] pb-3">Resumen de Compra</h2>
                            
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-[#1a1a1a] rounded-2xl flex items-center justify-center border border-[#333] shadow-inner">
                                    <svg width="24" height="24" fill="none" stroke={state.type === 'ads' ? '#00ba7c' : '#0095f6'} strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                                </div>
                                <div>
                                    <h3 className="font-black text-lg tracking-wide m-0 leading-tight">{state.planName}</h3>
                                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Suscripción</span>
                                </div>
                            </div>

                            <div className="border-t border-[#262626] pt-5 flex justify-between items-center mb-3">
                                <span className="text-gray-400 text-sm">Subtotal</span>
                                <span className="font-medium">S/ {(state.price / 1.18).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-5">
                                <span className="text-gray-400 text-sm">IGV (18%)</span>
                                <span className="font-medium">S/ {(state.price - (state.price / 1.18)).toFixed(2)}</span>
                            </div>
                            <div className="border-t border-[#262626] pt-5 flex justify-between items-center font-black text-2xl">
                                <span>Total</span>
                                <span className={state.type === 'ads' ? 'text-[#00ba7c] drop-shadow-[0_0_8px_rgba(0,186,124,0.4)]' : 'text-[#0095f6] drop-shadow-[0_0_8px_rgba(0,149,246,0.4)]'}>S/ {state.price}</span>
                            </div>
                        </div>

                        <div className="bg-[#121212]/50 backdrop-blur-md rounded-2xl p-4 border border-[#333] text-center text-[11px] text-gray-500 font-medium flex items-center justify-center gap-2">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 15h2v2h-2v-2zm0-10h2v8h-2V7z"></path></svg>
                            Pago 100% simulado. No uses tarjetas reales.
                        </div>
                    </div>

                    <div className="w-full md:w-2/3">
                        <div className="bg-[#121212]/80 backdrop-blur-xl border border-[#262626] rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                            
                            {isSuccess ? (
                                <div className="flex flex-col items-center justify-center py-12 animate-fade-in text-center">
                                    <div className="w-24 h-24 bg-[#00ba7c]/10 rounded-full flex items-center justify-center mb-6 border border-[#00ba7c]/30 shadow-[0_0_40px_rgba(0,186,124,0.3)]">
                                        <svg className="w-12 h-12 text-[#00ba7c]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <h2 className="text-3xl font-black text-white mb-3">¡Pago Exitoso!</h2>
                                    <p className="text-gray-400 text-sm md:text-base mb-8 max-w-sm leading-relaxed">
                                        Se cobró <strong className="text-white">S/ {state.price}</strong> de tu tarjeta terminada en <span className="font-black text-[#00ba7c] bg-[#00ba7c]/10 px-2 py-0.5 rounded">{cardData.number.slice(-4) || 'XXXX'}</span>
                                    </p>
                                    
                                    <div className="flex items-center gap-3 text-[#00ba7c] font-bold text-sm bg-[#00ba7c]/10 border border-[#00ba7c]/20 px-6 py-3.5 rounded-full shadow-inner">
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Aplicando beneficios y redirigiendo...
                                    </div>
                                </div>
                            ) : (
                                <Fragment>
                                    <SecureBadge />
                                    <h2 className="text-2xl font-black mb-8 tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Detalles de Pago</h2>
                                    
                                    <form onSubmit={handlePayment} className="flex flex-col gap-6">
                                        <div className="flex flex-col gap-2.5">
                                            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">Número de Tarjeta</label>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    required
                                                    maxLength="19"
                                                    placeholder="0000 0000 0000 0000" 
                                                    value={cardData.number}
                                                    onChange={(e) => setCardData({...cardData, number: e.target.value})}
                                                    className="w-full py-4 pr-4 pl-14 rounded-xl border border-[#333] bg-[#0a0a0a]/50 shadow-inner text-white outline-none focus:border-[#0095f6] focus:bg-[#111] transition-all font-mono text-sm placeholder:text-gray-600" 
                                                />
                                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2.5">
                                            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">Nombre en la tarjeta</label>
                                            <input 
                                                type="text" 
                                                required
                                                placeholder="EJ. JUAN PÉREZ" 
                                                value={cardData.name}
                                                onChange={(e) => setCardData({...cardData, name: e.target.value})}
                                                className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a]/50 shadow-inner text-white outline-none focus:border-[#0095f6] focus:bg-[#111] transition-all uppercase text-sm placeholder:text-gray-600" 
                                            />
                                        </div>

                                        <div className="flex gap-5">
                                            <div className="flex-1 flex flex-col gap-2.5">
                                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">Vencimiento</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    maxLength="5"
                                                    placeholder="MM/YY" 
                                                    value={cardData.expiry}
                                                    onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                                                    className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a]/50 shadow-inner text-white outline-none focus:border-[#0095f6] focus:bg-[#111] transition-all font-mono text-center text-sm placeholder:text-gray-600" 
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col gap-2.5">
                                                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">CVC / CVV</label>
                                                <input 
                                                    type="password" 
                                                    required
                                                    maxLength="4"
                                                    placeholder="***" 
                                                    value={cardData.cvc}
                                                    onChange={(e) => setCardData({...cardData, cvc: e.target.value})}
                                                    className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a]/50 shadow-inner text-white outline-none focus:border-[#0095f6] focus:bg-[#111] transition-all font-mono text-center text-sm placeholder:text-gray-600" 
                                                />
                                            </div>
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={isProcessing}
                                            className={`w-full mt-6 py-4 rounded-full font-black text-sm tracking-wide transition-all border-none flex justify-center items-center gap-2
                                                ${isProcessing 
                                                    ? 'bg-[#262626] text-gray-500 cursor-wait' 
                                                    : `cursor-pointer text-white shadow-xl hover:scale-[1.02] ${state.type === 'ads' ? 'bg-gradient-to-r from-[#00ba7c] to-[#008f5e] shadow-[0_0_20px_rgba(0,186,124,0.3)]' : 'bg-gradient-to-r from-[#0095f6] to-[#0077c5] shadow-[0_0_20px_rgba(0,149,246,0.3)]'}`
                                                }`}
                                        >
                                            {isProcessing ? (
                                                <Fragment>
                                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    Procesando pago...
                                                </Fragment>
                                            ) : (
                                                `Pagar S/ ${state.price}`
                                            )}
                                        </button>
                                    </form>
                                </Fragment>
                            )}
                        </div>
                    </div>

                </main>
            </div>
        </Fragment>
    );
};

export default Checkout;