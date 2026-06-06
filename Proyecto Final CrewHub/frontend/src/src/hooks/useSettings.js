import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { fetchAPI } from '../services/api.js';

export const useSettings = () => {
    // Estado para manejar mensajes de alerta, estado de carga y datos relacionados con la cuenta, notificaciones y soporte, 
    // así como funciones para mostrar alertas y manejar actualizaciones de cuenta, preferencias de notificaciones y envío de tickets de soporte
    const { activeUser } = useContext(AuthContext);

    const [alertMessage, setAlertMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [notifPrefs, setNotifPrefs] = useState({
        likes: true,
        follows: true,
        messages: true,
        communities: true
    });

    const [ticketSubject, setTicketSubject] = useState('');
    const [ticketMessage, setTicketMessage] = useState('');

    // Cargar datos iniciales
    useEffect(() => {
        if (activeUser) {
            setEmail(activeUser.email || '');
            if (activeUser.notification_prefs) {
                setNotifPrefs(activeUser.notification_prefs);
            }
        }
    }, [activeUser]);

    // Función para mostrar mensajes de alerta, estableciendo el mensaje y tipo de alerta, y limpiándolo después de un tiempo determinado
    const showAlert = (title, text, type) => {
        setAlertMessage({ title, text, type });
        setTimeout(() => setAlertMessage(null), 4000);
    };

    // Función para manejar la actualización de los datos de la cuenta, enviando los datos a la API para 
    // actualizar la cuenta del usuario y manejando el estado de carga y mensajes de alerta según corresponda
    const handleUpdateAccount = async (e) => {
        e.preventDefault();
        if (newPassword && newPassword !== confirmPassword) {
            return showAlert('Error', 'Las contraseñas nuevas no coinciden.', 'error');
        }

        setIsLoading(true);
        try {
            const body = { email, current_password: currentPassword, new_password: newPassword };
            const res = await fetchAPI('/settings/account', { 
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body) 
            });
            
            if (res.success) {
                showAlert('Actualizado', 'Datos de la cuenta guardados correctamente.', 'success');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                showAlert('Error', res.message || 'Contraseña incorrecta o error al actualizar.', 'error');
            }
        } catch (error) {
            showAlert('Error', 'Problema de conexión.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Función para manejar la actualización de las preferencias de notificaciones, enviando los datos a la API para 
    // actualizar las preferencias del usuario y manejando el estado de carga y mensajes de alerta según corresponda
    const handleUpdateNotifications = async () => {
        setIsLoading(true);
        try {
            const res = await fetchAPI('/settings/notifications', { 
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notifPrefs) 
            });
            if (res.success) showAlert('Guardado', 'Tus preferencias han sido actualizadas.', 'success');
        } catch (error) {
            showAlert('Error', 'No se pudieron guardar las preferencias.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Función para manejar el envío de un ticket de soporte, enviando los datos a la API para crear un nuevo ticket y 
    // manejando el estado de carga y mensajes de alerta según corresponda
    const handleSubmitTicket = async (e) => {
        e.preventDefault();
        if (!ticketSubject.trim() || !ticketMessage.trim()) {
            return showAlert('Error', 'Por favor llena todos los campos.', 'error');
        }

        setIsLoading(true);
        try {
            const body = { subject: ticketSubject, message: ticketMessage };
            const res = await fetchAPI('/support/tickets', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, // <-- PARCHE APLICADO
                body: JSON.stringify(body) 
            });
            
            if (res.success) {
                showAlert('Ticket Enviado', 'Los administradores revisarán tu caso pronto.', 'success');
                setTicketSubject('');
                setTicketMessage('');
            } else {
                showAlert('Error', res.message || 'No se pudo procesar el ticket.', 'error');
            }
        } catch (error) {
            showAlert('Error', 'No se pudo enviar el ticket.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        alertMessage, isLoading,
        email, setEmail,
        currentPassword, setCurrentPassword,
        newPassword, setNewPassword,
        confirmPassword, setConfirmPassword,
        notifPrefs, setNotifPrefs,
        ticketSubject, setTicketSubject,
        ticketMessage, setTicketMessage,
        handleUpdateAccount, handleUpdateNotifications, handleSubmitTicket
    };
};