import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { COUNTRY_THEMES } from '../utils/themeConfig';

const CountryDecorations = () => {
    const { activeUser } = useContext(AuthContext);

    // Si no hay usuario logueado, no mostramos decoraciones
    if (!activeUser) return null;

    const countryCode = activeUser.country_code || 'DEFAULT';
    const theme = COUNTRY_THEMES[countryCode] || COUNTRY_THEMES.DEFAULT;

    // Si el país no tiene imágenes configuradas, no renderizamos nada
    if (!theme.bgLeft && !theme.bgRight) return null;

    return (
        /* fixed inset-0: Ocupa toda la pantalla y no se mueve al hacer scroll.
          z-[-10]: Lo manda al fondo, detrás de todo.
          pointer-events-none: ¡CRÍTICO! Evita que las imágenes bloqueen los clics en la web.
        */
        <div className="fixed inset-0 z-[-10] pointer-events-none flex justify-between overflow-hidden">
            
            {/* Contenedor Izquierdo */}
            <div 
                className="w-1/4 h-full bg-no-repeat bg-left-center bg-contain opacity-20"
                style={{ backgroundImage: `url(${theme.bgLeft})` }}
            ></div>

            {/* Contenedor Derecho */}
            <div 
                className="w-1/4 h-full bg-no-repeat bg-right-center bg-contain opacity-20"
                style={{ backgroundImage: `url(${theme.bgRight})` }}
            ></div>

        </div>
    );
};

export default CountryDecorations;