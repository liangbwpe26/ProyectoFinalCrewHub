import React, { useContext, useRef } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { usePostForm } from '../hooks/usePostForm';

const CreatePost = ({ onPostCreated, onCancel }) => {
    const { token, activeUser } = useContext(AuthContext);
    const fileInputRef = useRef(null);

    // Invocamos nuestro Hook
    const { 
        description, setDescription, previewUrl, handleImageChange, 
        error, loading, submitPost, cancelPost 
    } = usePostForm(token, (newPost) => {
        if (onPostCreated) onPostCreated(newPost); // Avisamos al Muro que hay un nuevo post
    });

    const getAvatar = (user) => {
        if (user && user.profile_picture) {
            return user.profile_picture.startsWith('http') ? user.profile_picture : `http://127.0.0.1:8000${user.profile_picture}`;
        }
        return `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=262626&color=fff&bold=true`;
    };

    return (
        <div style={{ backgroundColor: "#121212", padding: "20px", borderRadius: "12px", border: "1px solid #262626", marginBottom: "30px" }}>
            <div style={{ display: "flex", gap: "15px", alignItems: "flex-start" }}>
                <img src={getAvatar(activeUser)} alt="Me" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                
                <form onSubmit={submitPost} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "15px" }}>
                    <textarea 
                        placeholder="¿Deseas subir algo hoy? Escribe una descripción..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ width: "100%", backgroundColor: "transparent", border: "none", color: "#fff", fontSize: "1rem", outline: "none", resize: "none", minHeight: "40px", fontFamily: "inherit" }}
                    />

                    {previewUrl && (
                        <div style={{ position: "relative" }}>
                            <img src={previewUrl} alt="Preview" style={{ width: "100%", maxHeight: "300px", objectFit: "contain", borderRadius: "8px", border: "1px solid #363636", backgroundColor: "#000" }} />
                            <button type="button" onClick={cancelPost} style={{ position: "absolute", top: "10px", right: "10px", backgroundColor: "rgba(0,0,0,0.7)", color: "white", border: "none", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", fontWeight: "bold" }}>X</button>
                        </div>
                    )}

                    {error && <div style={{ color: "#ff4d4d", fontSize: "0.85rem" }}>{error}</div>}

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #262626", paddingTop: "15px" }}>
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current.click()}
                            style={{ backgroundColor: "transparent", border: "none", color: "#0095f6", cursor: "pointer", fontWeight: "bold", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "5px" }}
                        >
                            📷 Subir Foto
                        </button>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: "none" }} />
                        
                        <div style={{ display: "flex", gap: "10px" }}>
                            {onCancel && (
                                <button type="button" onClick={onCancel} style={{ backgroundColor: "transparent", color: "gray", border: "none", cursor: "pointer", fontWeight: "bold" }}>
                                    Cancelar
                                </button>
                            )}
                            <button 
                                type="submit" 
                                disabled={loading || !previewUrl}
                                style={{ backgroundColor: loading || !previewUrl ? "#262626" : "#0095f6", color: "white", border: "none", padding: "8px 20px", borderRadius: "20px", cursor: loading || !previewUrl ? "default" : "pointer", fontWeight: "bold", transition: "0.2s" }}
                            >
                                {loading ? 'Publicando...' : 'Publicar'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;