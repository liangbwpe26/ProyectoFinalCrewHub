import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const THEMES = {
    ES: {
        leftGlow: 'bg-[#aa151b]/20', 
        rightGlow: 'bg-[#f1bf00]/15',
        pattern: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%23aa151b' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`
    },
    PE: {
        leftGlow: 'bg-[#d91023]/20',
        rightGlow: 'bg-[#ffffff]/10',
        pattern: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0V0zm20 20h20v20H20V20z' fill='%23d91023' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")`
    },
    DEFAULT: {
        leftGlow: 'bg-[#0095f6]/10',
        rightGlow: 'bg-[#00ba7c]/10',
        pattern: 'none'
    }
};

// Componente: CountryDecorations
// Aplica estilos y temas visuales según el país del usuario.
const CountryDecorations = () => {
    const { activeUser } = useContext(AuthContext);
    const [country, setCountry] = useState('DEFAULT');

    useEffect(() => {
        if (!activeUser) return;
        
        if (activeUser.country_code) {
            setCountry(activeUser.country_code.toUpperCase());
            return;
        }

        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            
            if (tz === 'Europe/Madrid' || tz === 'Atlantic/Canary' || tz === 'Europe/Ceuta') {
                setCountry('ES');
            } 
            // Si el reloj dice Perú
            else if (tz === 'America/Lima') {
                setCountry('PE');
            } 
            else {
                setCountry('DEFAULT');
            }
        } catch (error) {
            setCountry('DEFAULT');
        }
    }, [activeUser]);

    if (!activeUser) return null;

    const activeTheme = THEMES[country] || THEMES.DEFAULT;

    return (
        <div className="fixed inset-0 z-[0] pointer-events-none overflow-hidden flex justify-between">
            
            <div 
                className="absolute inset-0 z-0" 
                style={{ backgroundImage: activeTheme.pattern, backgroundSize: '100px' }}
            ></div>

            <div 
                className={`absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-[120px] mix-blend-screen transition-colors duration-1000 ${activeTheme.leftGlow}`}
            ></div>

            <div 
                className={`absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-[120px] mix-blend-screen transition-colors duration-1000 ${activeTheme.rightGlow}`}
            ></div>
            
        </div>
    );
};

export default CountryDecorations;