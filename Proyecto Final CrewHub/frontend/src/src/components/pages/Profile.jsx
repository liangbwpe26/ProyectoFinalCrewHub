import React, { Fragment, useContext, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { useProfileLogic } from "../../hooks/useProfileLogic.js";
import { fetchAPI } from '../../services/api.js';
import CreatePost from "../CreatePost.jsx";
import PostCard from "../PostCard.jsx";
import Navbar from "../structure/Navbar.jsx";

const Profile = () => {
    const { username } = useParams();
    const { activeUser, token } = useContext(AuthContext);

    const [activeTab, setActiveTab] = useState('posts');
    const [savedPosts, setSavedPosts] = useState([]);
    const [loadingSaved, setLoadingSaved] = useState(false);

    const {
        profile, loading, error, toggleFollow,
        posts, isModalOpen, setIsModalOpen, addNewPostToProfile,
        selectedPost, setSelectedPost, isFollowModalOpen,
        followModalType, followUsers, isFollowLoading, followHasMore,
        openFollowModal, closeFollowModal, handleFollowModalScroll,
        toggleModalUserFollow,
    } = useProfileLogic(username, token, activeUser);

    const isMyProfile = activeUser && profile && activeUser.username === profile.username;

    useEffect(() => {
        if (activeTab === 'saved' && savedPosts.length === 0) {
            const fetchSaved = async () => {
                setLoadingSaved(true);
                try {
                    const data = await fetchAPI('/saved-posts', {}, token);
                    if (data.success) setSavedPosts(data.posts);
                } catch (error) {
                    console.error("Error cargando guardados", error);
                } finally {
                    setLoadingSaved(false);
                }
            };
            fetchSaved();
        }
    }, [activeTab, token, savedPosts.length]);

    if (loading) return <div className="min-h-screen bg-[#0a0a0a]"><Navbar /><div className="pt-[120px] text-white text-center">Cargando perfil...</div></div>;
    if (error) return <div className="min-h-screen bg-[#0a0a0a]"><Navbar /><div className="pt-[120px] text-[#ff4d4d] text-center">{error}</div></div>;
    if (!profile) return null;

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
    const displayPosts = activeTab === 'saved' ? savedPosts : posts;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col relative">
            {/* Solo cargamos el Navbar, desaparecen los Sidebars */}
            <Navbar />

            {/* Contenedor principal alineado y centrado */}
            <main className="flex-1 w-full max-w-[900px] mx-auto pt-[100px] px-4 pb-12 flex flex-col items-center">

                {/* TARJETA DEL PERFIL (Agrupa todo para que no se vea desalineado) */}
                <div className="w-full bg-[#121212] border border-[#262626] rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center pt-10">

                    {/* Avatar */}
                    <img src={profileImageUrl} alt="Perfil" className="w-36 h-36 rounded-full object-cover border-4 border-[#1a1a1a] shadow-xl mb-5" />

                    {/* Botones de acción */}
                    <div className="flex gap-3 mb-5">
                        {isMyProfile ? (
                            <Fragment>
                                <Link to="/settings/edit-profile" className="px-6 py-2.5 rounded-full bg-[#262626] border border-[#363636] text-white text-sm font-bold no-underline hover:bg-[#333] transition-colors">
                                    Editar perfil
                                </Link>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="px-6 py-2.5 rounded-full bg-[#0095f6] border-none text-white text-sm font-bold cursor-pointer flex items-center gap-1 hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                                >
                                    <span className="text-lg leading-none mb-[2px]">+</span> Crear
                                </button>
                            </Fragment>
                        ) : (
                            <button
                                onClick={toggleFollow}
                                className={`px-8 py-2.5 rounded-full text-sm font-bold cursor-pointer transition-colors shadow-lg ${profile.follow_status === 'none'
                                    ? 'bg-[#0095f6] text-white border-none hover:bg-blue-600 shadow-blue-500/20'
                                    : 'bg-[#262626] text-white border border-[#363636] hover:bg-[#333] shadow-black/20'
                                    }`}
                            >
                                {profile.follow_status === 'pending' ? 'Pendiente' : (profile.follow_status === 'accepted' ? 'Siguiendo' : 'Seguir')}
                            </button>
                        )}
                    </div>

                    {/* Info de usuario */}
                    <div className="text-center mb-8 px-4">
                        <h2 className="m-0 text-3xl font-black text-white tracking-wide">{profile.display_name || profile.username}</h2>
                        <span className="text-[#0095f6] font-medium text-base">@{profile.username}</span>
                        {profile.is_private && <div className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-1">🔒 Cuenta Privada</div>}
                    </div>

                    {/* Estadísticas */}
                    <div className="flex justify-center gap-10 md:gap-20 mb-8 w-full px-8">
                        <div className="flex flex-col items-center">
                            <span className="font-black text-2xl text-white">{posts.length}</span>
                            <span className="text-gray-400 text-xs uppercase tracking-widest font-bold mt-1">Publicaciones</span>
                        </div>
                        <div onClick={() => openFollowModal('followers')} className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
                            <span className="font-black text-2xl text-white">{profile.followers_count || 0}</span>
                            <span className="text-gray-400 text-xs uppercase tracking-widest font-bold mt-1">Seguidores</span>
                        </div>
                        <div onClick={() => openFollowModal('following')} className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity">
                            <span className="font-black text-2xl text-white">{profile.following_count || 0}</span>
                            <span className="text-gray-400 text-xs uppercase tracking-widest font-bold mt-1">Seguidos</span>
                        </div>
                    </div>

                    {/* Pestañas de Navegación (Solo visibles en tu perfil) */}
                    {isMyProfile && (
                        <div className="flex w-full border-t border-[#262626] bg-[#0d0d0d]">
                            <button
                                onClick={() => setActiveTab('posts')}
                                className={`flex-1 py-4 font-bold uppercase text-xs flex justify-center items-center gap-2 cursor-pointer transition-all ${activeTab === 'posts' ? 'text-white bg-[#1a1a1a] shadow-[inset_0_2px_0_0_#fff]' : 'text-gray-500 hover:text-gray-300 hover:bg-[#151515] border-none'}`}
                            >
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2"></rect><line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="2"></line><line x1="9" y1="21" x2="9" y2="9" stroke="currentColor" strokeWidth="2"></line></svg>
                                Publicaciones
                            </button>
                            <button
                                onClick={() => setActiveTab('saved')}
                                className={`flex-1 py-4 bg-transparent border-none font-bold uppercase text-xs flex justify-center items-center gap-2 cursor-pointer transition-all ${activeTab === 'saved' ? 'text-white bg-[#1a1a1a] shadow-[inset_0_2px_0_0_#fff]' : 'text-gray-500 hover:text-gray-300 hover:bg-[#151515]'}`}
                            >
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                                Guardado
                            </button>


                        </div>
                    )}
                    {/* Cuadrícula de Publicaciones */}
                    <div className="w-full mt-6 px-4 md:px-8">
                        {isLocked ? (
                            <div className="text-center py-16 px-5 border border-[#262626] rounded-2xl bg-[#121212] shadow-lg">
                                <h3 className="m-0 text-white text-xl font-bold">Esta cuenta es privada</h3>
                                <p className="text-gray-400 mt-2">Síguele para ver sus fotos y videos.</p>
                            </div>
                        ) : (activeTab === 'saved' && loadingSaved) ? (
                            <div className="text-center py-16 text-gray-400 font-bold">Cargando tus favoritos...</div>
                        ) : displayPosts.length === 0 ? (
                            <div className="text-center py-16 text-gray-400 font-bold bg-[#121212] rounded-2xl shadow-lg">
                                {activeTab === 'saved' ? 'Aún no has guardado ninguna publicación.' : 'Aún no hay publicaciones.'}
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-1 md:gap-2 rounded-2xl overflow-hidden">
                                {displayPosts.map((post, index) => (
                                    <div
                                        key={post._id || post.id || index}
                                        onClick={() => setSelectedPost(post)}
                                        className="aspect-square bg-[#121212] relative cursor-pointer group"
                                    >
                                        <img src={getPostImage(post.image_path)} alt={post.description || "Publicación"} className="w-full h-full object-cover block" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>


                {/* Modales */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/85 z-[10000] flex justify-center items-center p-5 backdrop-blur-sm">
                        <div className="w-full max-w-[600px] relative">
                            <CreatePost onPostCreated={addNewPostToProfile} onCancel={() => setIsModalOpen(false)} />
                        </div>
                    </div>
                )}

                {selectedPost && (
                    <div className="fixed inset-0 bg-black/90 z-[10000] flex justify-center items-center p-5 backdrop-blur-sm" onClick={() => setSelectedPost(null)}>
                        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[600px] bg-[#121212] rounded-xl border border-[#262626] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
                            <PostCard
                                initialPost={{ ...selectedPost, user: selectedPost.user || (activeTab === 'saved' ? selectedPost.user : profile) }}
                                getAvatar={getAvatar}
                                isModal={true}
                                onCloseModal={() => setSelectedPost(null)}
                            />
                        </div>
                    </div>
                )}

                {isFollowModalOpen && (
                    <div className="fixed inset-0 bg-black/80 z-[10000] flex justify-center items-center backdrop-blur-sm" onClick={closeFollowModal}>
                        <div onClick={(e) => e.stopPropagation()} className="w-[400px] h-[500px] bg-[#121212] rounded-2xl flex flex-col border border-[#333] overflow-hidden shadow-2xl">

                            <div className="flex justify-between items-center p-5 border-b border-[#262626]">
                                <h3 className="m-0 text-lg text-white font-bold">
                                    {followModalType === 'followers' ? 'Seguidores' : 'Seguidos'}
                                </h3>
                                <button onClick={closeFollowModal} className="bg-transparent border-none text-gray-500 hover:text-white text-xl cursor-pointer font-bold transition-colors">✕</button>
                            </div>

                            <div onScroll={handleFollowModalScroll} className="flex-1 overflow-y-auto p-5 flex flex-col gap-5 custom-scrollbar">
                                {followUsers.map(user => {
                                    const isSelf = user.follow_status === 'self';
                                    const status = user.follow_status || 'none';

                                    return (
                                        <div key={user._id || user.id} className="flex items-center gap-3 justify-between">
                                            <Link to={`/${user.username}`} onClick={closeFollowModal} className="no-underline flex items-center gap-3 flex-1 min-w-0 group">
                                                <img src={getAvatar(user)} className="w-12 h-12 rounded-full object-cover border border-[#333]" alt="" />
                                                <div className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                                                    <div className="text-white font-bold text-sm group-hover:underline">{user.username}</div>
                                                    {user.display_name && <div className="text-gray-400 text-xs mt-0.5">{user.display_name}</div>}
                                                </div>
                                            </Link>

                                            {!isSelf && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); toggleModalUserFollow(user.user_id || user._id || user.id, status); }}
                                                    className={`px-5 py-2 rounded-full font-bold text-xs transition-colors shrink-0 ${status === 'none' ? 'bg-[#0095f6] hover:bg-blue-600 text-white border-none' : 'bg-[#262626] hover:bg-[#333] text-white border border-[#363636]'
                                                        }`}
                                                >
                                                    {status === 'pending' ? 'Pendiente' : (status === 'accepted' ? 'Siguiendo' : 'Seguir')}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}

                                {isFollowLoading && <p className="text-center text-gray-500 text-sm mt-2 font-bold">Cargando...</p>}
                                {!isFollowLoading && !followHasMore && followUsers.length > 0 && <p className="text-center text-gray-500 text-xs mt-2">No hay más usuarios</p>}
                                {!isFollowLoading && followUsers.length === 0 && (
                                    <p className="text-center text-gray-500 text-sm mt-8 font-bold">
                                        {followModalType === 'followers' ? 'Aún no tiene seguidores.' : 'Aún no sigue a nadie.'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Profile;