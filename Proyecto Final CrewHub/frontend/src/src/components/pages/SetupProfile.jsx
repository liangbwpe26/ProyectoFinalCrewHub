import React, { Fragment, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { useProfileForm } from "../../hooks/useProfileForm.js";
import "./Register.css"; 
import logoImg from "../../assets/logo.png";

const SetupProfile = () => {
    const { token, activeUser, setActiveUser } = useContext(AuthContext); 
    const navigate = useNavigate();

    const { 
        displayName, setDisplayName, dateOfBirth, setDateOfBirth, 
        previewUrl, handleImageChange, loading, submitProfile 
    } = useProfileForm(token, activeUser || {});

    const handleSetup = (e) => {
        e.preventDefault();
        submitProfile((updatedUser) => {
            if (setActiveUser) setActiveUser(updatedUser);
            navigate("/");
        });
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
                            <div className="register-form-title">Configura tu Perfil</div>
                            <p style={{ color: "gray", textAlign: "center", marginBottom: "20px", fontSize: "0.9rem" }}>Haz que otros tripulantes te reconozcan fácilmente.</p>

                            <form onSubmit={handleSetup} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                                    <img src={previewUrl} alt="Previsualización" style={{ width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover", border: "2px solid #363636" }} />
                                    <label style={{ cursor: "pointer", color: "#0095f6", fontWeight: "bold", fontSize: "0.9rem" }}>
                                        Subir foto (Opcional)
                                        <input type="file" accept="image/png, image/jpeg, image/gif" onChange={handleImageChange} style={{ display: "none" }} />
                                    </label>
                                </div>

                                <input className="register-input" name="displayName" type="text" placeholder="Tu nombre real (Opcional)" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={50} />
                                <input className="register-input" name="dateOfBirth" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} style={{ colorScheme: "dark" }} />

                                <button type="submit" className="register-btn" disabled={loading}>
                                    {loading ? "Guardando..." : "Guardar y Continuar"}
                                </button>
                            </form>

                            <div className="register-login-text" style={{ marginTop: "15px" }}>
                                <span className="register-login-link" onClick={() => navigate("/")} style={{ color: "gray" }}>Omitir este paso por ahora</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default SetupProfile;