import React, { Fragment, useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext.jsx";

// Importaciones de páginas
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Home from "../pages/Home.jsx";
import Chat from "../pages/Chat.jsx";
import EditProfile from "../pages/EditProfile.jsx";
import Profile from "../pages/Profile.jsx";
import SetupProfile from "../pages/SetupProfile.jsx";
import SinglePost from "../pages/SinglePost"; // O .jsx si tu archivo lo tiene

const RoutesApp = () => {
    // Extraemos el token para saber si el usuario ha iniciado sesión
    const { token } = useContext(AuthContext);

    return (
        <Fragment>
            <Routes>
                {/* 1. RUTAS PÚBLICAS (Si ya estás logueado, te mandan al Home) */}
                <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
                <Route path="/register" element={!token ? <Register /> : <Navigate to="/setup-profile" />} />
                
                {/* 2. RUTAS PROTEGIDAS (Si NO estás logueado, te mandan al Login) */}
                <Route path="/" element={token ? <Home /> : <Navigate to="/login" />} />
                <Route path="/chat/:id" element={token ? <Chat /> : <Navigate to="/login" />} />
                <Route path="/edit-profile" element={token ? <EditProfile /> : <Navigate to="/login" />} />
                <Route path="/setup-profile" element={token ? <SetupProfile /> : <Navigate to="/login" />} />

                {/* 3. RUTA COMODÍN (También la protegemos para que no vean perfiles sin registrarse) */}
                <Route path="/:username" element={token ? <Profile /> : <Navigate to="/login" />} />
                
                {/* AQUÍ ESTÁ LA CORRECCIÓN: Usamos la misma lógica que en el resto de tus rutas */}
                <Route path="/post/:id" element={token ? <SinglePost /> : <Navigate to="/login" />} />

                {/* 4. RUTA DE RESCATE (404) */}
                <Route path="*" element={<Navigate to="/login" />} />

            </Routes>
        </Fragment>
    );
};

export default RoutesApp;