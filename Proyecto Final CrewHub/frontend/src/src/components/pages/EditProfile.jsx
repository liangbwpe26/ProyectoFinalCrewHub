import React, { Fragment, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { useProfileForm } from '../../hooks/useProfileForm.js';

const EditProfile = () => {
    const { activeUser, token, setActiveUser } = useContext(AuthContext); 
    const navigate = useNavigate();

    // Reutilizamos el mismo Hook mágico
    const { 
        displayName, setDisplayName, dateOfBirth, setDateOfBirth,
        isPrivate, setIsPrivate, previewUrl, handleImageChange, errors, successMsg, loading, submitProfile 
    } = useProfileForm(token, activeUser || {});

    const handleSubmit = (e) => {
        e.preventDefault();
        submitProfile((updatedUser) => {
            if (setActiveUser) setActiveUser(updatedUser);
            setTimeout(() => {
                navigate(`/${updatedUser.username}`);
            }, 1500);
        });
    };

    if (!activeUser) return null;

    return (
        <Fragment>
            <div style={{ minHeight: "100vh", backgroundColor: "#000", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "40px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
                
                <div style={{ width: "100%", maxWidth: "500px", padding: "0 20px", marginBottom: "20px", display: "flex", justifyContent: "space-between" }}>
                    <Link to={`/${activeUser.username}`} style={{ color: "#0095f6", textDecoration: "none", fontSize: "1.1rem", fontWeight: "bold" }}>&larr; Volver al perfil</Link>
                    <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Editar Perfil</h2>
                </div>

                <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "500px", padding: "20px", backgroundColor: "#121212", borderRadius: "10px", border: "1px solid #262626", display: "flex", flexDirection: "column", gap: "20px" }}>
                    
                    {errors.length > 0 && <div style={{ color: "#ff4d4d", backgroundColor: "rgba(255, 77, 77, 0.1)", padding: "10px", borderRadius: "5px", textAlign: "center" }}>{errors[0]}</div>}
                    {successMsg && <div style={{ color: "#4CAF50", backgroundColor: "rgba(76, 175, 80, 0.1)", padding: "10px", borderRadius: "5px", textAlign: "center" }}>{successMsg}</div>}

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                        <img src={previewUrl} alt="Previsualización" style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", border: "2px solid #363636" }} />
                        <label style={{ cursor: "pointer", color: "#0095f6", fontWeight: "bold", fontSize: "0.9rem" }}>
                            Cambiar foto
                            <input type="file" accept="image/png, image/jpeg, image/gif" onChange={handleImageChange} style={{ display: "none" }} />
                        </label>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        <label style={{ fontSize: "0.9rem", color: "gray" }}>Nombre a mostrar</label>
                        <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ej. Juan Pérez" maxLength={50} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #363636", backgroundColor: "#000", color: "#fff", outline: "none" }} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        <label style={{ fontSize: "0.9rem", color: "gray" }}>Fecha de nacimiento</label>
                        <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} style={{ padding: "12px", borderRadius: "8px", border: "1px solid #363636", backgroundColor: "#000", color: "#fff", outline: "none", colorScheme: "dark" }} />
                    </div>

                    {/* INTERRUPTOR DE PRIVACIDAD */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", backgroundColor: "#0a0a0a", borderRadius: "8px", border: "1px solid #363636" }}>
                        <div>
                            <span style={{ display: "block", fontWeight: "bold", fontSize: "0.95rem" }}>Cuenta Privada</span>
                            <span style={{ fontSize: "0.8rem", color: "gray" }}>Solo quienes apruebes podrán seguirte y ver tu muro.</span>
                        </div>
                        <label style={{ position: "relative", display: "inline-block", width: "44px", height: "24px" }}>
                            <input 
                                type="checkbox" 
                                checked={isPrivate} 
                                onChange={(e) => setIsPrivate(e.target.checked)} 
                                style={{ opacity: 0, width: 0, height: 0 }} 
                            />
                            {/* Un diseño de "Toggle Switch" estilo iOS/Android */}
                            <span style={{
                                position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: isPrivate ? "#0095f6" : "#363636", borderRadius: "24px", transition: "0.3s"
                            }}>
                                <span style={{
                                    position: "absolute", height: "18px", width: "18px", left: isPrivate ? "22px" : "3px", bottom: "3px",
                                    backgroundColor: "white", borderRadius: "50%", transition: "0.3s"
                                }}></span>
                            </span>
                        </label>
                    </div>

                    <button type="submit" disabled={loading} style={{ marginTop: "10px", padding: "12px", borderRadius: "8px", border: "none", backgroundColor: loading ? "#363636" : "#0095f6", color: "white", cursor: loading ? "default" : "pointer", fontWeight: "bold", transition: "0.2s" }}>
                        {loading ? "Guardando..." : "Guardar cambios"}
                    </button>
                </form>
            </div>
        </Fragment>
    );
};

export default EditProfile;