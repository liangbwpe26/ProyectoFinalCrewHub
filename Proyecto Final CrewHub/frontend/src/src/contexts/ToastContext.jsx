import React, { createContext, useState, useRef, useContext } from 'react';

// 1. Creamos el contexto
export const ToastContext = createContext();

// 2. Creamos un Hook personalizado para que sea facilísimo de usar
export const useToast = () => useContext(ToastContext);

// 3. El Proveedor que envuelve la app
export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState({ message: '', visible: false, type: 'error' });
    const timerRef = useRef(null);

    const showToast = (message, type = 'error') => {
        // Mostramos el mensaje
        setToast({ message, visible: true, type });

        // Si ya había un temporizador corriendo, lo cancelamos para que no se oculte antes de tiempo
        if (timerRef.current) clearTimeout(timerRef.current);

        // Ocultamos después de 3 segundos
        timerRef.current = setTimeout(() => {
            setToast(prev => ({ ...prev, visible: false }));
        }, 3000);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            
            {/* LA VENTANA EMERGENTE (TOAST) */}
            <div style={{
                position: 'fixed',
                bottom: toast.visible ? '40px' : '-100px', // Sube o baja dependiendo de si está visible
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: toast.type === 'error' ? '#e53935' : '#43a047', // Rojo para error, verde para éxito
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '30px',
                fontWeight: 'bold',
                boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
                transition: 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Animación de rebote suave
                zIndex: 9999, // Siempre por encima de todo
                opacity: toast.visible ? 1 : 0,
                pointerEvents: 'none', // Para que no estorbe si haces clic rápido
                whiteSpace: 'nowrap'
            }}>
                {toast.message}
            </div>
        </ToastContext.Provider>
    );
};