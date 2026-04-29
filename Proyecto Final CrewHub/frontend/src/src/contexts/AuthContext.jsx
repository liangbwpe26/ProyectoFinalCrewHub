import React, { createContext, Fragment, useState, useEffect } from "react";

const AuthContext = createContext();

const AuthProvider = (props) => {
    // NUEVO: Al iniciar la app (o hacer F5), leemos el token y los datos del usuario del disco duro
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [activeUser, setActiveUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    
    const [loading, setLoading] = useState(true);

    // El guardián: Verifica con Laravel si el token del disco duro sigue siendo válido
    useEffect(() => {
        const verifySession = async () => {
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('http://127.0.0.1:8000/api/user', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    setActiveUser(userData);
                    // Actualizamos los datos frescos en el disco duro
                    localStorage.setItem('user', JSON.stringify(userData)); 
                } else {
                    console.warn("El token expiró o es inválido al hacer F5.");
                    logout();
                }
            } catch (error) {
                console.error("Error de red al verificar sesión:", error);
            } finally {
                setLoading(false);
            }
        };

        verifySession();
    }, [token]);

    const loginAPI = async (credentials) => {
        const response = await fetch('http://127.0.0.1:8000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Error al iniciar sesión");
        }

        // NUEVO: Guardamos el token Y el usuario en el disco duro (localStorage)
        setToken(data.token);
        setActiveUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        return data;
    };

    const registerAPI = async (userData) => {
        const response = await fetch('http://127.0.0.1:8000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            let errorMessage = data.message || "Error al registrar el usuario.";
            if (data.errors) {
                const firstErrorKey = Object.keys(data.errors)[0];
                errorMessage = data.errors[firstErrorKey][0];
            }
            throw new Error(errorMessage);
        }

        // Guardamos todo igual que en el login
        setToken(data.token);
        setActiveUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        return data;
    };

    // NUEVO: Limpiamos absolutamente todo al cerrar sesión
    const logout = () => {
        setToken(null);
        setActiveUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password) => password.length >= 8;
    const validateUsername = (username) => username.length >= 3;

    const exports = {
        loginAPI,
        registerAPI,
        logout,
        token,
        activeUser,
        loading,
        validateEmail,
        validatePassword,
        validateUsername
    };

    return (
        <Fragment>
            <AuthContext.Provider value={exports}>
                {/* Evitamos parpadeos visuales esperando a que el loading termine */}
                {!loading && props.children}
            </AuthContext.Provider>
        </Fragment>
    );
};

export default AuthProvider;
export { AuthContext };