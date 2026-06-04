import React, { Fragment, useState, useContext } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { useMonetization } from '../../hooks/useMonetization.js';
import Navbar from '../structure/Navbar.jsx';

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
                // await buyAdPlan(state.planId); 
                success = true; 
            } else if (state.type === 'verification') {
                // await buyVerification();
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
            <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col relative">
                <Navbar />

                <main className="flex-1 w-full max-w-[900px] mx-auto pt-[120px] px-5 pb-12 flex flex-col md:flex-row gap-8">
                    
                    <div className="w-full md:w-1/3 flex flex-col gap-6">
                        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 shadow-xl">
                            <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Resumen de Compra</h2>
                            
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-[#1a1a1a] rounded-xl flex items-center justify-center border border-[#333]">
                                    <svg width="24" height="24" fill="none" stroke={state.type === 'ads' ? '#00ba7c' : '#0095f6'} strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{state.planName}</h3>
                                    <span className="text-gray-500 text-sm">Suscripción Mensual</span>
                                </div>
                            </div>

                            <div className="border-t border-[#262626] pt-4 flex justify-between items-center mb-2">
                                <span className="text-gray-400">Subtotal</span>
                                <span>S/ {(state.price / 1.18).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-gray-400">IGV (18%)</span>
                                <span>S/ {(state.price - (state.price / 1.18)).toFixed(2)}</span>
                            </div>
                            <div className="border-t border-[#262626] pt-4 flex justify-between items-center font-black text-xl">
                                <span>Total</span>
                                <span className={state.type === 'ads' ? 'text-[#00ba7c]' : 'text-[#0095f6]'}>S/ {state.price}</span>
                            </div>
                        </div>

                        <div className="text-center text-xs text-gray-600 flex items-center justify-center gap-2">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 15h2v2h-2v-2zm0-10h2v8h-2V7z"></path></svg>
                            Pago 100% simulado. No uses tarjetas reales.
                        </div>
                    </div>

                    <div className="w-full md:w-2/3">
                        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 md:p-8 shadow-xl">
                            
                            {isSuccess ? (
                                <div className="flex flex-col items-center justify-center py-12 animate-fade-in text-center">
                                    <div className="w-24 h-24 bg-[#00ba7c]/10 rounded-full flex items-center justify-center mb-6 border border-[#00ba7c]/30 shadow-[0_0_30px_rgba(0,186,124,0.2)]">
                                        <svg className="w-12 h-12 text-[#00ba7c]" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <h2 className="text-3xl font-black text-white mb-3">¡Pago Exitoso!</h2>
                                    <p className="text-gray-400 text-lg mb-8 max-w-sm">
                                        Se cobró S/ {state.price} de tu tarjeta terminada en <span className="font-bold text-white">{cardData.number.slice(-4) || 'XXXX'}</span>
                                    </p>
                                    
                                    <div className="flex items-center gap-3 text-[#00ba7c] font-bold text-sm bg-[#00ba7c]/10 px-5 py-3 rounded-full">
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Aplicando beneficios y redirigiendo...
                                    </div>
                                </div>
                            ) : (
                                <Fragment>
                                    <h2 className="text-2xl font-black mb-6">Detalles de Pago</h2>
                                    <form onSubmit={handlePayment} className="flex flex-col gap-5">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Número de Tarjeta</label>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    required
                                                    maxLength="19"
                                                    placeholder="0000 0000 0000 0000" 
                                                    value={cardData.number}
                                                    onChange={(e) => setCardData({...cardData, number: e.target.value})}
                                                    // CORRECCIÓN AQUÍ: py-4 pr-4 pl-14
                                                    className="w-full py-4 pr-4 pl-14 rounded-xl border border-[#333] bg-[#0a0a0a] text-white outline-none focus:border-[#0095f6] transition-colors font-mono" 
                                                />
                                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Nombre en la tarjeta</label>
                                            <input 
                                                type="text" 
                                                required
                                                placeholder="EJ. JUAN PEREZ" 
                                                value={cardData.name}
                                                onChange={(e) => setCardData({...cardData, name: e.target.value})}
                                                className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a] text-white outline-none focus:border-[#0095f6] transition-colors uppercase" 
                                            />
                                        </div>

                                        <div className="flex gap-5">
                                            <div className="flex-1 flex flex-col gap-2">
                                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Vencimiento</label>
                                                <input 
                                                    type="text" 
                                                    required
                                                    maxLength="5"
                                                    placeholder="MM/YY" 
                                                    value={cardData.expiry}
                                                    onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                                                    className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a] text-white outline-none focus:border-[#0095f6] transition-colors font-mono" 
                                                />
                                            </div>
                                            <div className="flex-1 flex flex-col gap-2">
                                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">CVC / CVV</label>
                                                <input 
                                                    type="password" 
                                                    required
                                                    maxLength="4"
                                                    placeholder="***" 
                                                    value={cardData.cvc}
                                                    onChange={(e) => setCardData({...cardData, cvc: e.target.value})}
                                                    className="w-full p-4 rounded-xl border border-[#333] bg-[#0a0a0a] text-white outline-none focus:border-[#0095f6] transition-colors font-mono" 
                                                />
                                            </div>
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={isProcessing}
                                            className={`w-full mt-4 py-4 rounded-xl font-black text-sm transition-all border-none flex justify-center items-center gap-2
                                                ${isProcessing 
                                                    ? 'bg-[#262626] text-gray-500 cursor-wait' 
                                                    : `cursor-pointer text-white shadow-lg ${state.type === 'ads' ? 'bg-[#00ba7c] hover:bg-[#009e6a] shadow-green-500/20' : 'bg-[#0095f6] hover:bg-blue-600 shadow-blue-500/20'}`
                                                }`}
                                        >
                                            {isProcessing ? (
                                                <Fragment>
                                                    <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
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