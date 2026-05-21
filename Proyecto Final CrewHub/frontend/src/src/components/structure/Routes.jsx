import React, { Fragment, useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext.jsx";

// Importaciones de páginas
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Home from "../pages/Home.jsx";
import Chats from "../pages/Chats.jsx";
import Settings from "../pages/Settings.jsx";
import Profile from "../pages/Profile.jsx";
import SetupProfile from "../pages/SetupProfile.jsx";
import SinglePost from "../pages/SinglePost";
import VerifyEmail from "../pages/VerifyEmail.jsx";
import ForgotPassword from "../pages/ForgotPassword.jsx";
import ResetPassword from "../pages/ResetPassword.jsx";
import Onboarding from "../pages/Onboarding.jsx";

const RoutesApp = () => {
    const { token, activeUser } = useContext(AuthContext);

    // Guardián para rutas principales: Exige token Y tener intereses
    const ProtectedRoute = ({ children }) => {
        if (!token) {
            return <Navigate to="/login" replace />;
        }
        
        // Si tiene sesión pero el arreglo de intereses está vacío o no existe, lo forzamos al onboarding
        if (activeUser && (!activeUser.interests || activeUser.interests.length === 0)) {
            return <Navigate to="/onboarding" replace />;
        }
        
        return children;
    };

    // Guardián para el Onboarding: Exige token, pero te saca si ya tienes intereses
    const OnboardingRoute = ({ children }) => {
        if (!token) {
            return <Navigate to="/login" replace />;
        }
        
        // Si ya tiene intereses, no tiene sentido que vea el onboarding, va al feed
        if (activeUser && activeUser.interests && activeUser.interests.length > 0) {
            return <Navigate to="/" replace />;
        }
        
        return children;
    };

    return (
        <Fragment>
            <Routes>
                {/* RUTAS PÚBLICAS */}
                <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
                <Route path="/register" element={!token ? <Register /> : <Navigate to="/setup-profile" />} />
                <Route path="/verify-email" element={!token ? <VerifyEmail /> : <Navigate to="/" />} />
                <Route path="/forgot-password" element={!token ? <ForgotPassword /> : <Navigate to="/" />} />
                <Route path="/reset-password" element={!token ? <ResetPassword /> : <Navigate to="/" />} />

                {/* RUTAS DE CONFIGURACIÓN INICIAL (Requieren login pero no intereses) */}
                <Route path="/setup-profile" element={token ? <SetupProfile /> : <Navigate to="/login" />} />
                
                {/* RUTA DE ONBOARDING CON SU GUARDIÁN */}
                <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />

                {/* RUTAS PROTEGIDAS (Requieren login y haber completado intereses) */}
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />

                {/* RUTAS DE CHATS */}
                <Route path="/chats" element={<ProtectedRoute><Chats /></ProtectedRoute>} />
                <Route path="/chats/:username" element={<ProtectedRoute><Chats /></ProtectedRoute>} />

                {/* NUEVA RUTA DE CONFIGURACIÓN (Acepta parámetros dinámicos) */}
                <Route path="/settings/:tab?" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                {/* RUTAS CON PARÁMETROS */}
                <Route path="/post/:id" element={<ProtectedRoute><SinglePost /></ProtectedRoute>} />
                <Route path="/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                {/* RUTA DE RESCATE (404) */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Fragment>
    );
};

export default RoutesApp;