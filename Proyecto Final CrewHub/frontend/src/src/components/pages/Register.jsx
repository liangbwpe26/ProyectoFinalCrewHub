import React, { Fragment, useContext, useRef, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import ShowErrors from "../ShowErrors.jsx";

// Importamos el nuevo CSS y el Logo
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
    const [errors, setErrors] = useState([]);
    const navigate = useNavigate();

    const usernameRef = useRef(null);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    const updateData = (event) => {
        let { name, value } = event.target;
        setUserData({ ...userData, [name]: value });
    };

    const validateForm = () => {
        let errorList = [];
        if (!usernameRef.current.value || !emailRef.current.value || !passwordRef.current.value) {
            errorList.push("Todos los campos son obligatorios.");
        }
        setErrors(errorList);
        return errorList.length === 0;
    };

    const handleRegister = (e) => {
        e.preventDefault();
        if (validateForm()) {
            registerAPI(userData)
                .then(() => navigate("/"))
                .catch((error) => setErrors([error.message]));
        }
    };

    return (
        <Fragment>
            <div className="register-page">
                <div className="register-split">
                    
                    {/* COLUMNA IZQUIERDA: Logo y Título */}
                    <div className="register-left">
                        <div className="register-brand-text">CREW HUB</div>
                        <img src={logoImg} alt="Crew Hub Logo" className="register-brand-logo" />
                    </div>

                    {/* COLUMNA DERECHA: Tarjeta de Formulario */}
                    <div className="register-right">
                        <div className="register-card">
                            <div className="register-form-title">Regístrate en CrewHub</div>
                            
                            <form onSubmit={handleRegister}>
                                {/* Campo Usuario */}
                                <input
                                    className="register-input"
                                    ref={usernameRef}
                                    name="username"
                                    type="text"
                                    placeholder="Nombre de usuario"
                                    onChange={updateData}
                                    required
                                />
                                
                                {/* Campo Correo */}
                                <input
                                    className="register-input"
                                    ref={emailRef}
                                    name="email"
                                    type="email"
                                    placeholder="Correo electrónico"
                                    onChange={updateData}
                                    required
                                />
                                
                                {/* Campo Contraseña */}
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

                            {/* Redirección al Login */}
                            <div className="register-login-text">
                                ¿Ya tienes cuenta? <span className="register-login-link" onClick={() => navigate("/login")}>Inicia sesión</span>
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
        </Fragment>
    );
};

export default Register;