import React, { Fragment } from "react";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./contexts/AuthContext.jsx";
import RoutesApp from "./components/structure/Routes.jsx";
import ReactDOM from 'react-dom/client';
import './index.css';

import 'bootstrap/dist/css/bootstrap.min.css';


const App = () => {
    return (
        <Fragment>
            {/* El AuthProvider envuelve todo para gestionar el estado de la sesión */}
            <AuthProvider>
                {/* BrowserRouter habilita la navegación sin recargar la página */}
                <BrowserRouter>
                    {/* Aquí inyectamos nuestro módulo de rutas */}
                    <RoutesApp />
                </BrowserRouter>
            </AuthProvider>
        </Fragment>
    );
};

export default App;