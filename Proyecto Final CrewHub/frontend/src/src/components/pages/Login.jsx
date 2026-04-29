import React, { Fragment, useContext, useRef, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { useNavigate, Link } from "react-router-dom";
import ShowErrors from "../ShowErrors.jsx";

import "./Login.css"; 
import logoImg from "../../assets/logo.png"; 

const initialCredentials = {
    login: "",
    password: ""
};

const Login = () => {
    const { loginAPI } = useContext(AuthContext);
    const [credentials, setCredentials] = useState(initialCredentials);
    const [errors, setErrors] = useState([]);
    const navigate = useNavigate();

    const loginRef = useRef(null);
    const passwordRef = useRef(null);

    const updateData = (event) => {
        let { name, value } = event.target;
        setCredentials({ ...credentials, [name]: value });
    };

    const validateForm = () => {
        let errorList = [];
        if (!loginRef.current.value || !passwordRef.current.value) {
            errorList.push("Todos los campos son obligatorios.");
        }
        setErrors(errorList);
        return errorList.length === 0;
    };

    const handleLogin = (e) => {
        e.preventDefault(); // Evita que el formulario recargue la página si se presiona Enter
        if (validateForm()) {
            loginAPI(credentials)
                .then(() => navigate("/"))
                .catch((error) => setErrors([error.message]));
        }
    };

    return (
        <Fragment>
            <div className="login-page">
                <div className="login-split">
                    
                    {/* COLUMNA IZQUIERDA: Logo y Título */}
                    <div className="login-left">
                        <div className="brand-text">CREW HUB</div>
                        <img src={logoImg} alt="Crew Hub Logo" className="brand-logo" />
                    </div>

                    {/* COLUMNA DERECHA: Tarjeta de Formulario */}
                    <div className="login-right">
                        <div className="login-card">
                            
                            {/* La franja blanca central */}
                            <div className="login-white-band">
                                <div className="form-title">Inicia Sesión en CrewHub</div>
                                
                                <form onSubmit={handleLogin}>
                                    <input
                                        className="login-input"
                                        ref={loginRef}
                                        name="login"
                                        type="text"
                                        placeholder="Username or email address"
                                        onChange={updateData}
                                        required
                                    />
                                    
                                    <input
                                        className="login-input"
                                        ref={passwordRef}
                                        name="password"
                                        type="password"
                                        placeholder="Password"
                                        onChange={updateData}
                                        required
                                    />
                                    
                                    <button type="submit" className="login-btn">
                                        Log in
                                    </button>
                                </form>

                                <div className="login-register-text">
                                    ¿No tienes cuenta? <span className="login-register-link" onClick={() => navigate("/register")}>Regístrate</span>
                                </div>

                                {/* Mostrar errores si los hay */}
                                {errors.length > 0 && (
                                    <div style={{ marginTop: "15px" }}>
                                        <ShowErrors errors={errors} />
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </Fragment>
    );
};

export default Login;