import React, { useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { ToastContext } from '../contexts/ToastContext.jsx'; 

const GlobalNotificationListener = () => {
    const { activeUser } = useContext(AuthContext);
    
    const toastContext = useContext(ToastContext); 
    const showToast = toastContext?.showToast || toastContext?.addToast; 

    useEffect(() => {
        if (activeUser && window.Echo) {
            const userId = activeUser._id || activeUser.id;
            
            const channelName = `App.Models.User.${userId}`; 

            console.log("📡 Antena conectada al canal:", channelName);

            window.Echo.private(channelName)
                .listen('NotificationSent', (event) => {
                    console.log("🔔 Chisme recibido en la antena:", event);
                    
                    if (showToast && event.notification) {
                        
                        let mensaje = "Tienes una nueva notificación 👀";
                        
                        switch (event.notification.type) {
                            case 'post_reaction':
                                mensaje = 'A alguien le gustó tu publicación ❤️';
                                break;
                            case 'reply':
                                mensaje = 'Alguien respondió a tu comentario 💬';
                                break;
                            case 'tag':
                                mensaje = 'Te han mencionado en un comentario 🏷️';
                                break;
                            case 'comment_reaction':
                                mensaje = 'A alguien le gustó tu comentario 👍';
                                break;
                        }

                        showToast(mensaje);
                    }
                });

            return () => {
                console.log("🔌 Desconectando antena de:", channelName);
                window.Echo.leave(channelName);
            };
        }
    }, [activeUser, showToast]);

    return null; // Componente fantasma, no dibuja nada en la web
};

export default GlobalNotificationListener;