import React, { Fragment, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { useProfileLogic } from "../../hooks/useProfileLogic.js";
import CreatePost from "../CreatePost.jsx";
import PostCard from "../PostCard.jsx"; 
import NotificationBell from "../NotificationBell.jsx";

const Profile = () => {
    const { username } = useParams();
    const { activeUser, token } = useContext(AuthContext);

    const {
        profile, loading, error, toggleFollow,
        posts, isModalOpen, setIsModalOpen, addNewPostToProfile,
        selectedPost, setSelectedPost, isFollowModalOpen,
        followModalType, followUsers, isFollowLoading, followHasMore,
        openFollowModal, closeFollowModal, handleFollowModalScroll,
        toggleModalUserFollow,
    } = useProfileLogic(username, token, activeUser);

    if (loading) return <div style={{ color: "white", textAlign: "center", padding: "50px", backgroundColor: "#000", minHeight: "100vh" }}>Cargando perfil...</div>;
    if (error) return <div style={{ color: "#ff4d4d", textAlign: "center", padding: "50px", backgroundColor: "#000", minHeight: "100vh" }}>{error}</div>;
    if (!profile) return null;

    const isMyProfile = activeUser && activeUser.username === profile.username;

    const profileImageUrl = profile.profile_picture
        ? (profile.profile_picture.startsWith('http') ? profile.profile_picture : `http://127.0.0.1:8000${profile.profile_picture}`)
        : `https://ui-avatars.com/api/?name=${profile.username}&background=262626&color=fff&bold=true&size=150`;

    const getAvatar = (user) => {
        if (user && user.profile_picture) {
            return user.profile_picture.startsWith('http') ? user.profile_picture : `http://127.0.0.1:8000${user.profile_picture}`;
        }
        return `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=262626&color=fff&bold=true`;
    };

    const getPostImage = (path) => {
        if (!path) return '';
        return path.startsWith('http') ? path : `http://127.0.0.1:8000${path}`;
    };

    const isLocked = profile.is_private && profile.follow_status !== 'accepted' && !isMyProfile;

    return (
        <Fragment>
            <div style={{ minHeight: "100vh", backgroundColor: "#000", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "40px", fontFamily: "system-ui, -apple-system, sans-serif", paddingBottom: "50px" }}>

                <div style={{ width: "100%", maxWidth: "800px", padding: "0 20px", marginBottom: "30px", display: "flex", justifyContent: "space-between" }}>
                    <Link to="/" style={{ color: "#0095f6", textDecoration: "none", fontSize: "1.1rem", fontWeight: "bold" }}>&larr; Volver al Inicio</Link>
                    <NotificationBell />
                </div>

                <div style={{ width: "100%", maxWidth: "800px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", borderBottom: "1px solid #262626", paddingBottom: "30px" }}>
                    <img src={profileImageUrl} alt="Perfil" style={{ width: "130px", height: "130px", borderRadius: "50%", objectFit: "cover", border: "3px solid #262626" }} />

                    <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
                        {isMyProfile ? (
                            <Fragment>
                                <Link to="/edit-profile" style={{ display: "inline-block", padding: "8px 24px", borderRadius: "20px", backgroundColor: "#262626", border: "1px solid #363636", color: "white", textDecoration: "none", fontWeight: "bold", transition: "0.2s" }}>
                                    Editar perfil
                                </Link>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    style={{ padding: "8px 20px", borderRadius: "20px", backgroundColor: "#0095f6", border: "none", color: "white", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}
                                >
                                    <span style={{ fontSize: "1.2rem" }}>+</span> Crear
                                </button>
                            </Fragment>
                        ) : (
                            <button
                                onClick={toggleFollow}
                                style={{ padding: "8px 24px", borderRadius: "20px", cursor: "pointer", fontWeight: "bold", transition: "0.2s", border: profile.follow_status === 'none' ? "none" : "1px solid #363636", backgroundColor: profile.follow_status === 'none' ? "#0095f6" : "#262626", color: "white" }}
                            >
                                {profile.follow_status === 'pending' ? 'Pendiente' : (profile.follow_status === 'accepted' ? 'Siguiendo' : 'Seguir')}
                            </button>
                        )}
                    </div>

                    <div style={{ textAlign: "center", marginTop: "10px" }}>
                        <h2 style={{ margin: "0", fontSize: "1.6rem" }}>{profile.display_name || profile.username}</h2>
                        <span style={{ color: "gray", fontSize: "1.1rem" }}>@{profile.username}</span>
                        {profile.is_private && <div style={{ fontSize: "0.85rem", color: "gray", marginTop: "5px" }}> Cuenta Privada</div>}
                    </div>

                    <div style={{ display: "flex", gap: "40px", marginTop: "20px" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <span style={{ fontWeight: "bold", fontSize: "1.3rem", margin: 0 }}>{posts.length}</span>
                            <span style={{ color: "gray", fontSize: "0.95rem" }}>Publicaciones</span>
                        </div>

                        <div onClick={() => openFollowModal('followers')} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: 'pointer' }}>
                            <span style={{ fontWeight: "bold", fontSize: "1.3rem", margin: 0 }}>{profile.followers_count || 0}</span>
                            <span style={{ color: "gray", fontSize: "0.95rem" }}>Seguidores</span>
                        </div>

                        <div onClick={() => openFollowModal('following')} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: 'pointer' }}>
                            <span style={{ fontWeight: "bold", fontSize: "1.3rem", margin: 0 }}>{profile.following_count || 0}</span>
                            <span style={{ color: "gray", fontSize: "0.95rem" }}>Seguidos</span>
                        </div>
                    </div>
                </div>

                <div style={{ width: "100%", maxWidth: "800px", marginTop: "30px" }}>
                    {isLocked ? (
                        <div style={{ textAlign: "center", padding: "50px 20px", border: "1px solid #262626", borderRadius: "12px", backgroundColor: "#121212" }}>
                            <h3 style={{ margin: 0 }}>Esta cuenta es privada</h3>
                            <p style={{ color: "gray" }}>Síguele para ver sus fotos y videos.</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "50px 20px", color: "gray" }}>
                            <p>Aún no hay publicaciones.</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "5px" }}>
                            {posts.map((post, index) => (
                                <div
                                    key={post._id || post.id || index}
                                    onClick={() => setSelectedPost(post)}
                                    style={{ aspectRatio: "1 / 1", backgroundColor: "#121212", overflow: "hidden", position: "relative", cursor: "pointer" }}
                                >
                                    <img
                                        src={getPostImage(post.image_path)}
                                        alt={post.description || "Publicación"}
                                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                    />
                                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0)", transition: "0.2s" }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0.1)"}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = "rgba(255,255,255,0)"}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
                    <div style={{ width: "100%", maxWidth: "600px", position: "relative" }}>
                        <CreatePost onPostCreated={addNewPostToProfile} onCancel={() => setIsModalOpen(false)} />
                    </div>
                </div>
            )}

            {selectedPost && (
                <div
                    style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.9)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}
                    onClick={() => setSelectedPost(null)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: "100%", maxWidth: "600px", backgroundColor: "#121212", borderRadius: "12px", border: "1px solid #262626", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "90vh" }}
                    >
                        <PostCard 
                            initialPost={{ ...selectedPost, user: selectedPost.user || profile }} 
                            getAvatar={getAvatar} 
                            isModal={true} 
                            onCloseModal={() => setSelectedPost(null)} 
                        />
                    </div>
                </div>
            )}

            {isFollowModalOpen && (
                <div
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    onClick={closeFollowModal}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '400px', height: '400px', backgroundColor: '#121212', borderRadius: '12px', display: 'flex', flexDirection: 'column', border: '1px solid #333', overflow: 'hidden' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #262626' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>
                                {followModalType === 'followers' ? 'Seguidores' : 'Seguidos'}
                            </h3>
                            <button onClick={closeFollowModal} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
                        </div>
                        <div
                            onScroll={handleFollowModalScroll}
                            style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}
                        >
                            {followUsers.map(user => {
                                const isSelf = user.follow_status === 'self';
                                const status = user.follow_status || 'none';

                                return (
                                    <div key={user._id || user.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>

                                        <Link to={`/${user.username}`} onClick={closeFollowModal} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                                            <img
                                                src={user.profile_picture ? (user.profile_picture.startsWith('http') ? user.profile_picture : `http://127.0.0.1:8000${user.profile_picture}`) : `https://ui-avatars.com/api/?name=${user.username}&background=262626&color=fff&bold=true`}
                                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                                alt=""
                                            />
                                            <div style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }}>{user.username}</div>
                                                {user.display_name && <div style={{ color: 'gray', fontSize: '0.85rem' }}>{user.display_name}</div>}
                                            </div>
                                        </Link>

                                        {!isSelf && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); 
                                                    toggleModalUserFollow(user._id || user.id, status);
                                                }}
                                                style={{
                                                    padding: '6px 16px',
                                                    borderRadius: '20px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.8rem',
                                                    transition: '0.2s',
                                                    border: status === 'none' ? 'none' : '1px solid #363636',
                                                    backgroundColor: status === 'none' ? '#0095f6' : '#262626',
                                                    color: 'white',
                                                    flexShrink: 0 
                                                }}
                                            >
                                                {status === 'pending' ? 'Pendiente' : (status === 'accepted' ? 'Siguiendo' : 'Seguir')}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}

                            {isFollowLoading && <p style={{ textAlign: 'center', color: 'gray', fontSize: '0.85rem' }}>Cargando...</p>}
                            {!isFollowLoading && !followHasMore && followUsers.length > 0 && (
                                <p style={{ textAlign: 'center', color: 'gray', fontSize: '0.85rem', marginTop: '10px' }}>No hay más usuarios</p>
                            )}
                            {!isFollowLoading && followUsers.length === 0 && (
                                <p style={{ textAlign: 'center', color: 'gray', fontSize: '0.9rem', marginTop: '20px' }}>
                                    {followModalType === 'followers' ? 'Aún no tiene seguidores.' : 'Aún no sigue a nadie.'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
};

export default Profile;