import React from 'react';
import { useOnboarding } from '../../hooks/useOnboarding.js';

const Onboarding = () => {
    const { 
        availableInterests, 
        selectedInterests, 
        loading, 
        saving, 
        toggleInterest, 
        handleSaveInterests 
    } = useOnboarding();

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex justify-center items-center">
                <p className="text-gray-500 font-bold tracking-widest uppercase animate-pulse">Cargando tus opciones...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1f1f1f] via-[#0a0a0a] to-black flex flex-col items-center pt-20 px-4 font-sans">
            
            <div className="w-full max-w-[800px] bg-[#121212]/80 backdrop-blur-xl border border-[#262626] rounded-3xl p-10 shadow-[0_15px_50px_rgba(0,0,0,0.8)] flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#0095f6]/10 blur-[100px] rounded-full -z-10"></div>
                
                <h1 className="text-white text-3xl font-black mb-3 tracking-tight">¿Qué temas te apasionan?</h1>
                <p className="text-gray-400 text-sm mb-10 max-w-[500px]">
                    Selecciona al menos 3 intereses para personalizar tu experiencia en Crew Hub y conectar con tripulantes que comparten tus gustos.
                </p>

                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {availableInterests.map((interest) => {
                        const isSelected = selectedInterests.includes(interest.slug);
                        return (
                            <button
                                key={interest._id || interest.id}
                                onClick={() => toggleInterest(interest.slug)}
                                className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 transform hover:scale-105 cursor-pointer border ${
                                    isSelected 
                                    ? 'bg-[#0095f6] border-[#0095f6] text-white shadow-[0_0_20px_rgba(0,149,246,0.3)]' 
                                    : 'bg-[#1a1a1a]/50 border-[#333] text-gray-400 hover:border-gray-500 hover:text-white hover:bg-[#1a1a1a]'
                                }`}
                            >
                                {interest.name}
                            </button>
                        );
                    })}
                </div>

                <div className="w-full border-t border-[#262626] pt-8 flex flex-col items-center">
                    <p className="text-[10px] text-gray-500 font-black tracking-widest uppercase mb-4">
                        {selectedInterests.length} de 3 seleccionados mínimos
                    </p>
                    
                    <button 
                        onClick={handleSaveInterests}
                        disabled={selectedInterests.length < 3 || saving}
                        className={`w-full max-w-[300px] py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all duration-300 shadow-lg border-none ${
                            selectedInterests.length >= 3 && !saving
                            ? 'bg-gradient-to-r from-white to-gray-300 text-black hover:scale-105 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                            : 'bg-[#262626] text-gray-600 cursor-not-allowed border border-[#333]'
                        }`}
                    >
                        {saving ? 'Personalizando tu Feed...' : 'Continuar al Feed'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;