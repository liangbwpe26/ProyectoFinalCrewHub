import React, { Fragment, useContext, useRef, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext.jsx";
import "./Login.css"; 
import logoImg from "../../assets/logo.png"; 

const initialCredentials = {
    login: "",
    password: ""
};

const Login = () => {
    const { loginAPI } = useContext(AuthContext);
    const [credentials, setCredentials] = useState(initialCredentials);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const loginRef = useRef(null);
    const passwordRef = useRef(null);

    const updateData = (event) => {
        let { name, value } = event.target;
        setCredentials({ ...credentials, [name]: value });
    };

    const validateForm = () => {
        if (!loginRef.current.value || !passwordRef.current.value) {
            showToast("Todos los campos son obligatorios.", "error");
            return false;
        }
        return true;
    };

    const handleLogin = (e) => {
        e.preventDefault(); 
        if (validateForm()) {
            loginAPI(credentials)
                .then(() => navigate("/"))
                .catch((error) => {
                });
        }
    };

    return (
        <Fragment>
            <div className="login-page">
                <div className="login-split">
                    <div className="login-left">
                        <div className="brand-text">CREW HUB</div>
                        <img src={logoImg} alt="Crew Hub Logo" className="brand-logo" />
                    </div>

                    <div className="login-right">
                        <div className="login-card">
                            <div className="login-white-band">
                                <div className="form-title">Inicia Sesión en CrewHub</div>
                                
                                <form onSubmit={handleLogin}>
                                    <input
                                        className="login-input"
                                        ref={loginRef}
                                        name="login"
                                        type="text"
                                        placeholder="Usuario o correo electrónico"
                                        onChange={updateData}
                                        required
                                    />
                                    
                                    <input
                                        className="login-input"
                                        ref={passwordRef}
                                        name="password"
                                        type="password"
                                        placeholder="Contraseña"
                                        onChange={updateData}
                                        required
                                    />
                                    
                                    <button type="submit" className="login-btn">
                                        Inicia Sesión
                                    </button>
                                </form>

                                <div className="login-register-text">
                                    ¿No tienes cuenta? <span className="login-register-link" onClick={() => navigate("/register")}>Regístrate</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default Login;