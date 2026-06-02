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
            <ToastProvider>
                <AuthProvider>
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