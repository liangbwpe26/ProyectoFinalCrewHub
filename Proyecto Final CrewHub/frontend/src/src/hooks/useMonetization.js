import { useState, useContext } from 'react';
import { fetchAPI } from '../services/api.js';
import { useToast } from '../contexts/ToastContext.jsx';
import { AuthContext } from '../contexts/AuthContext.jsx';

export const useMonetization = () => {
    // Estado para manejar la carga durante las operaciones de monetización y acceso a funciones de actualización del usuario y mostrar mensajes de toast
    const { setActiveUser } = useContext(AuthContext);
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Función para manejar la compra de verificación, enviando la solicitud a la API y actualizando el estado del usuario y mostrando mensajes de toast según corresponda
    const buyVerification = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAPI('/monetization/subscribe', { method: 'POST' });
            if (data.success) {
                if (setActiveUser) setActiveUser(data.user);
                showToast(data.message, "success");
            } else {
                showToast(data.message || "Transacción rechazada", "error");
            }
        } catch (error) {
            showToast("Se cayó el sistema de Visa, mano.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Función para manejar la actualización a una cuenta de negocio, enviando la solicitud a la API con la categoría seleccionada y 
    // actualizando el estado del usuario y mostrando mensajes de toast según corresponda
    const upgradeBusiness = async (category) => {
        setIsLoading(true);
        try {
            const data = await fetchAPI('/monetization/business', {
                method: 'POST',
                body: { business_category: category }
            });
            if (data.success) {
                if (setActiveUser) setActiveUser(data.user);
                showToast(data.message, "success");
            } else {
                showToast(data.message || "Rebotó la tarjeta", "error");
            }
        } catch (error) {
            showToast("Error de conexión. F por tu saldo.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Función para manejar la promoción de un post, enviando la solicitud a la API con el ID del post y la cantidad de días, 
    // y mostrando mensajes de toast según corresponda
    const promotePost = async (postId, days) => {
        setIsLoading(true);
        try {
            const data = await fetchAPI(`/monetization/promote/${postId}`, {
                method: 'POST',
                body: { days: parseInt(days) }
            });
            if (data.success) {
                showToast(data.message, "success");
                return true;
            } else {
                showToast(data.message || "No se pudo promocionar", "error");
                return false;
            }
        } catch (error) {
            showToast("Error al procesar la pauta", "error");
            return false;
        } finally {
            setIsLoading(false);
        }
    };
    
    // Función para manejar la degradación de una cuenta de negocio, enviando la solicitud a la API y actualizando el estado 
    // del usuario y mostrando mensajes de toast según corresponda
    const downgradeBusiness = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAPI('/monetization/downgrade', { method: 'POST' });
            if (data.success) {
                if (setActiveUser) setActiveUser(data.user);
                showToast(data.message, "success");
            } else {
                showToast(data.message || "Error al desactivar", "error");
            }
        } catch (error) {
            showToast("Error de conexión.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return { buyVerification, upgradeBusiness, promotePost, downgradeBusiness, isLoading };
};