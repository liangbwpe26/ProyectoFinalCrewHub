import React, { Fragment, useContext, useRef, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext.jsx";
import "./Register.css";
import logoImg from "../../assets/logo.png";

const initialUserData = {
    username: "",
    email: "",
    password: ""
};

const Register = () => {
    const { registerAPI } = useContext(AuthContext);
    const [userData, setUserData] = useState(initialUserData);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const usernameRef = useRef(null);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    const updateData = (event) => {
        let { name, value } = event.target;
        setUserData({ ...userData, [name]: value });
    };

    const validateForm = () => {
        if (!usernameRef.current.value || !emailRef.current.value || !passwordRef.current.value) {
            showToast("Todos los campos son obligatorios.", "error");
            return false;
        }
        return true;
    };

    const FORBIDDEN_USERNAMES = ['login', 'register', 'chat', 'home', 'api', 'admin', 'perfil', 'config', 'index'];

    const validateUsername = (username) => {
        const cleanUsername = username.trim().toLowerCase();
        
        if (cleanUsername.length < 3 || cleanUsername.length > 20) {
            return "El usuario debe tener entre 3 y 20 caracteres.";
        }
        const regex = /^[a-z0-9_]+$/;
        if (!regex.test(cleanUsername)) {
            return "Solo se permiten minúsculas, números y guiones bajos (_).";
        }
        if (FORBIDDEN_USERNAMES.includes(cleanUsername)) {
            return "Este nombre de usuario no está disponible.";
        }
        return null;
    };

    const handleRegister = (e) => {
        e.preventDefault();
        
        const usernameError = validateUsername(userData.username);
        if (usernameError) {
            showToast(usernameError, "error");
            return;
        }

        if (validateForm()) {
            registerAPI(userData)
                .then(() => navigate("/setup-profile"))
                .catch((error) => {
                    // El error ya es manejado por el AuthContext
                });
        }
    };

    return (
        <Fragment>
            <div className="register-page">
                <div className="register-split">
                    <div className="register-left">
                        <div className="register-brand-text">CREW HUB</div>
                        <img src={logoImg} alt="Crew Hub Logo" className="register-brand-logo" />
                    </div>

                    <div className="register-right">
                        <div className="register-card">
                            <div className="register-form-title">Regístrate en CrewHub</div>

                            <form onSubmit={handleRegister}>
                                <input
                                    className="register-input"
                                    ref={usernameRef}
                                    name="username"
                                    type="text"
                                    placeholder="Nombre de usuario"
                                    onChange={updateData}
                                    required
                                />

                                <input
                                    className="register-input"
                                    ref={emailRef}
                                    name="email"
                                    type="email"
                                    placeholder="Correo electrónico"
                                    onChange={updateData}
                                    required
                                />

                                <input
                                    className="register-input"
                                    ref={passwordRef}
                                    name="password"
                                    type="password"
                                    placeholder="Contraseña"
                                    onChange={updateData}
                                    required
                                />

                                <button type="submit" className="register-btn">
                                    Registrarse
                                </button>
                            </form>

                            <div className="register-login-text">
                                ¿Ya tienes cuenta? <span className="register-login-link" onClick={() => navigate("/login")}>Inicia sesión</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default Register;