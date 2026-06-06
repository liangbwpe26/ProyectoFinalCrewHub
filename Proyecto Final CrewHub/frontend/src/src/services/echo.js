// Importacion de las librerías necesarias para configurar Laravel Echo con Pusher, y la función fetchAPI para manejar la autenticación de canales privados.
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { fetchAPI } from './api.js';

// Configuración de Pusher para Laravel Echo, utilizando 
// variables de entorno para la clave y host, y una función personalizada de autorización para canales privados.
window.Pusher = Pusher;

// Configuración de Laravel Echo para usar Reverb como broadcaster, con soporte para WebSockets y autenticación personalizada.
const echo = new Echo({
    // Configuración de Reverb como broadcaster, utilizando 
    // variables de entorno para la clave, host y puerto, y una función personalizada de autorización para canales privados.
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    wssPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel, options) => {
        return {
            authorize: (socketId, callback) => {
                fetchAPI('/broadcasting/auth', {
                    method: 'POST',
                    body: {
                        socket_id: socketId,
                        channel_name: channel.name,
                    },
                })
                .then(data => callback(false, data))
                .catch(error => callback(true, error));
            }
        };
    },
});

export default echo;