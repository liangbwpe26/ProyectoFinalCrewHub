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
import Communities from "../pages/Communities.jsx";
import Community from '../pages/Community.jsx';
import DropsFeed from "../pages/DropsFeed.jsx";
import AdminPanel from "../pages/AdminPanel.jsx";
import Premium from "../pages/Premium.jsx";
import Checkout from "../pages/Checkout.jsx";
import Explore from "../pages/Explore.jsx";

// Componente: RoutesApp
// Define rutas públicas y protegidas de la aplicación.
const RoutesApp = () => {
    const { activeUser } = useContext(AuthContext);

    const ProtectedRoute = ({ children }) => {
        if (!activeUser) {
            return <Navigate to="/login" replace />;
        }

        if (!activeUser.interests || activeUser.interests.length === 0) {
            return <Navigate to="/onboarding" replace />;
        }

        return children;
    };

    const OnboardingRoute = ({ children }) => {
        if (!activeUser) {
            return <Navigate to="/login" replace />;
        }

        if (activeUser.interests && activeUser.interests.length > 0) {
            return <Navigate to="/" replace />;
        }

        return children;
    };

    return (
        <Fragment>
            <Routes>
                {/* RUTAS PÚBLICAS Y DE AUTENTICACIÓN */}
                <Route path="/login" element={!activeUser ? <Login /> : <Navigate to="/" />} />
                <Route path="/register" element={!activeUser ? <Register /> : <Navigate to="/setup-profile" />} />
                
                <Route path="/verify-email" element={!activeUser ? <VerifyEmail /> : <Navigate to="/" />} />
                <Route path="/forgot-password" element={!activeUser ? <ForgotPassword /> : <Navigate to="/" />} />
                <Route path="/reset-password" element={!activeUser ? <ResetPassword /> : <Navigate to="/" />} />
                
                {/* RUTAS DEL FLUJO INICIAL */}
                <Route path="/setup-profile" element={activeUser ? <SetupProfile /> : <Navigate to="/login" />} />
                <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />

                {/* RUTAS DE PAGO / PREMIUM */}
                <Route path="/premium" element={<ProtectedRoute><Premium /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                
                {/* RUTAS ESTÁTICAS PROTEGIDAS */}
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
                <Route path="/drops" element={<ProtectedRoute><DropsFeed /></ProtectedRoute>} />
                <Route path="/communities" element={<ProtectedRoute><Communities /></ProtectedRoute>} />
                
                {/* PANEL ADMIN PROTEGIDO */}
                <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
                
                {/* RUTAS DE CHATS */}
                <Route path="/conversations" element={<ProtectedRoute><Chats /></ProtectedRoute>} />
                <Route path="/conversations/:username" element={<ProtectedRoute><Chats /></ProtectedRoute>} />
                
                {/* CONFIGURACIÓN */}
                <Route path="/settings/:tab?" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

                {/* RUTAS DINÁMICAS */}
                <Route path="/communities/:slug" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                <Route path="/post/:id" element={<ProtectedRoute><SinglePost /></ProtectedRoute>} />
                <Route path="/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                {/* RUTA DE RESCATE (404) */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Fragment>
    );
};

export default RoutesApp;