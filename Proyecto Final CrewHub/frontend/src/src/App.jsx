import React, { Fragment } from "react";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./contexts/AuthContext.jsx";
import RoutesApp from "./components/structure/Routes.jsx";
import { ToastProvider } from "./contexts/ToastContext.jsx";
import GlobalNotificationListener from "./components/GlobalNotificationListener.jsx";
import ReactDOM from 'react-dom/client';
import './index.css';

import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
    return (
        <Fragment>
            {/* El ToastProvider envuelve toda la aplicación para permitir el uso de notificaciones en cualquier componente, 
            y el AuthProvider maneja el estado de autenticación. */}
            <ToastProvider>
                <AuthProvider>
                    {/* BrowserRouter es el componente de enrutamiento que permite la navegación entre páginas sin recargar, 
                    y RoutesApp contiene la definición de todas las rutas de la aplicación. */}
                    <BrowserRouter>             
                        <GlobalNotificationListener />
                        <RoutesApp />
                    </BrowserRouter>
                </AuthProvider>
            </ToastProvider>
        </Fragment>
    );
};

export default App;