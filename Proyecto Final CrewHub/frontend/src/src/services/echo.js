import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { fetchAPI } from './api.js';

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT,
    forceTLS: false,
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