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
                <p className="text-gray-500 font-bold tracking-widest uppercase">Cargando tus opciones...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col items-center pt-20 px-4 font-sans">
            
            <div className="w-full max-w-[800px] bg-[#121212] border border-[#262626] rounded-3xl p-10 shadow-2xl flex flex-col items-center text-center">
                
                <h1 className="text-white text-3xl font-black mb-3">¿Qué temas te apasionan?</h1>
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
                                    ? 'bg-[#0095f6] border-[#0095f6] text-white shadow-[0_0_15px_rgba(0,149,246,0.4)]' 
                                    : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-gray-500 hover:text-white'
                                }`}
                            >
                                {interest.name}
                            </button>
                        );
                    })}
                </div>

                <div className="w-full border-t border-[#262626] pt-8 flex flex-col items-center">
                    <p className="text-xs text-gray-500 font-bold tracking-widest uppercase mb-4">
                        {selectedInterests.length} de 3 seleccionados mínimos
                    </p>
                    
                    <button 
                        onClick={handleSaveInterests}
                        disabled={selectedInterests.length < 3 || saving}
                        className={`w-full max-w-[300px] py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
                            selectedInterests.length >= 3 && !saving
                            ? 'bg-white text-black hover:bg-gray-200 cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)]'
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