import React, { Fragment } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx"; // Importamos la nueva página
import Home from "../pages/Home.jsx";
import Chat from '../pages/Chat.jsx';

const RoutesApp = () => {
    return (
        <Fragment>
            <Routes> 
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} /> {/* Nueva ruta */}
                <Route path="/" element={<Home />} />
                <Route path="/chat/:id" element={<Chat />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Fragment>
    );
};

export default RoutesApp;