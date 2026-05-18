import React, { Fragment, useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext.jsx";

// Importaciones de páginas
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import Home from "../pages/Home.jsx";
import Chats from "../pages/Chats.jsx"; // 👉 AQUÍ IMPORTAMOS LA NUEVA PÁGINA
import EditProfile from "../pages/EditProfile.jsx";
import Profile from "../pages/Profile.jsx";
import SetupProfile from "../pages/SetupProfile.jsx";
import SinglePost from "../pages/SinglePost"; 

const RoutesApp = () => {
    const { token } = useContext(AuthContext);

    return (
        <Fragment>
            <Routes>
                {/* RUTAS PÚBLICAS */}
                <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
                <Route path="/register" element={!token ? <Register /> : <Navigate to="/setup-profile" />} />
                
                {/* RUTAS PROTEGIDAS */}
                <Route path="/" element={token ? <Home /> : <Navigate to="/login" />} />
                
                {/* RUTAS DE CHATS */}
                <Route path="/chats" element={token ? <Chats /> : <Navigate to="/login" />} />
                <Route path="/chats/:username" element={token ? <Chats /> : <Navigate to="/login" />} />
                
                <Route path="/edit-profile" element={token ? <EditProfile /> : <Navigate to="/login" />} />
                <Route path="/setup-profile" element={token ? <SetupProfile /> : <Navigate to="/login" />} />

                {/* RUTAS CON PARÁMETROS */}
                <Route path="/post/:id" element={token ? <SinglePost /> : <Navigate to="/login" />} />
                <Route path="/:username" element={token ? <Profile /> : <Navigate to="/login" />} />
                
                {/* RUTA DE RESCATE (404) */}
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Fragment>
    );
};

export default RoutesApp;