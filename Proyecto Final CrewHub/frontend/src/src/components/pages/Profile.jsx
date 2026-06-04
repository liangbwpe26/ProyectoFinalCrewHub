import React, { Fragment, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext.jsx";
import { useProfileLogic } from "../../hooks/useProfileLogic.js";
import CreatePost from "../CreatePost.jsx";
import PostCard from "../PostCard.jsx";
import Navbar from "../structure/Navbar.jsx";
import SingleDropModal from "../SingleDropModal.jsx";
import ReportModal from '../ReportModal.jsx';
import VerifiedBadge from "../VerifiedBadge.jsx";

const Profile = () => {
    const { username } = useParams();
    const { activeUser } = useContext(AuthContext);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

    const isMyProfile = activeUser?.username === username;

    const {
        profile, loading, error, toggleFollow, handleBlockUser, isOptionsOpen, setIsOptionsOpen,
        posts, isModalOpen, setIsModalOpen, addNewPostToProfile,
        selectedPost, setSelectedPost, isFollowModalOpen,
        followModalType, followUsers, handleFollowModalScroll,
        openFollowModal, closeFollowModal, toggleModalUserFollow,
        activeTab, setActiveTab, savedPosts, savedDrops, loadingSaved,
        repostedPosts, loadingReposts, selectedDropId, setSelectedDropId,
        isReportModalOpen, setIsReportModalOpen, isMetricsModalOpen, setIsMetricsModalOpen,
    } = useProfileLogic(username, isMyProfile);

    if (loading) return <div className="min-h-screen bg-[#0a0a0a]"><Navbar /><div className="pt-[120px] text-white text-center">Cargando perfil...</div></div>;
    if (error) return <div className="min-h-screen bg-[#0a0a0a]"><Navbar /><div className="pt-[120px] text-[#ff4d4d] text-center">{error}</div></div>;
    if (!profile) return null;

    const profileImageUrl = profile.profile_picture
        ? (profile.profile_picture.startsWith('http') ? profile.profile_picture : `${BACKEND_URL}${profile.profile_picture}`)
        : `https://ui-avatars.com/api/?name=${profile.username}&background=262626&color=fff&bold=true&size=150`;

    const getAvatar = (user) => {
        if (user && user.profile_picture) return user.profile_picture.startsWith('http') ? user.profile_picture : `${BACKEND_URL}${user.profile_picture}`;
        return `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=262626&color=fff&bold=true`;
    };

    const getPostImage = (path) => path?.startsWith('http') ? path : `${BACKEND_URL}${path}`;

    const isLocked = profile.is_private && profile.follow_status !== 'accepted' && !isMyProfile;
    const isBlockedState = profile.blocked_by_me || profile.blocked_by_them;

    const combinedSaved = [...savedPosts, ...savedDrops].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const displayPosts = activeTab === 'saved' ? combinedSaved : (activeTab === 'reposts' ? repostedPosts : posts);

    return (
        <Fragment>
            <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex flex-col relative" onClick={() => setIsOptionsOpen(false)}>
                <Navbar />

                <main className="flex-1 w-full max-w-[900px] mx-auto pt-[100px] px-4 pb-12 flex flex-col items-center">
                    <div className="w-full bg-[#121212] border border-[#262626] rounded-2xl shadow-2xl flex flex-col items-center relative overflow-hidden">

                        {profile.is_business && (
                            <div className="w-full h-40 md:h-52 bg-[#1a1a1a] relative border-b border-[#262626]">
                                {profile.banner_picture ? (
                                    <img
                                        src={profile.banner_picture.startsWith('http') ? profile.banner_picture : `${BACKEND_URL}${profile.banner_picture}`}
                                        alt="Banner"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-tr from-[#00ba7c]/20 to-[#121212]"></div>
                                )}
                            </div>
                        )}

                        {!isMyProfile && (
                            <div className={`absolute right-6 z-20 ${profile.is_business ? 'top-4' : 'top-6'}`}>
                                <button onClick={(e) => { e.stopPropagation(); setIsOptionsOpen(!isOptionsOpen); }} className="bg-black/50 backdrop-blur-md rounded-full border-none text-white cursor-pointer hover:bg-black/80 p-2 transition-colors">
                                    <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"></circle><circle cx="12" cy="12" r="2"></circle><circle cx="12" cy="19" r="2"></circle></svg>
                                </button>
                                {isOptionsOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl z-50 overflow-hidden" onClick={e => e.stopPropagation()}>
                                        <button onClick={handleBlockUser} className={`w-full text-left px-4 py-3 font-bold text-sm bg-transparent border-none cursor-pointer transition ${profile.blocked_by_me ? 'text-white hover:bg-[#262626]' : 'text-[#ff4d4d] hover:bg-[#262626]'}`}>
                                            {profile.blocked_by_me ? 'Desbloquear usuario' : 'Bloquear usuario'}
                                        </button>
                                        <button onClick={() => { setIsReportModalOpen(true); setIsOptionsOpen(false); }} className="w-full text-left px-4 py-3 font-bold text-sm bg-transparent border-t border-[#333] cursor-pointer text-[#ff4d4d] hover:bg-[#262626]">
                                            Reportar usuario
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <img
                            src={profileImageUrl}
                            alt="Perfil"
                            className={`w-36 h-36 rounded-full object-cover border-[6px] border-[#121212] bg-[#121212] shadow-xl mb-5 ${profile.is_business ? '-mt-16 z-10 relative' : 'mt-10'}`}
                        />

                        <div className="flex gap-3 mb-5 z-10 relative">
                            {isMyProfile ? (
                                <Fragment>
                                    <Link to="/settings/edit-profile" className="px-6 py-2.5 rounded-full bg-[#262626] border border-[#363636] text-white text-sm font-bold no-underline hover:bg-[#333] transition-colors">
                                        Editar perfil
                                    </Link>
                                    <button onClick={() => setIsModalOpen(true)} className="px-6 py-2.5 rounded-full bg-[#0095f6] border-none text-white text-sm font-bold cursor-pointer flex items-center gap-1 hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
                                        <span className="text-lg leading-none mb-[2px]">+</span> Crear
                                    </button>
                                    {profile.is_business && (
                                        <button onClick={() => setIsMetricsModalOpen(true)} className="px-6 py-2.5 rounded-full bg-transparent border border-[#00ba7c] text-[#00ba7c] text-sm font-bold cursor-pointer hover:bg-[#00ba7c]/10 transition-colors">
                                            Métricas
                                        </button>
                                    )}
                                </Fragment>
                            ) : profile.blocked_by_me ? (
                                <button onClick={handleBlockUser} className="px-8 py-2.5 rounded-full bg-[#0095f6] text-white border-none text-sm font-bold cursor-pointer hover:bg-blue-600 transition shadow-lg">
                                    Desbloquear
                                </button>
                            ) : profile.blocked_by_them ? (
                                <div className="h-10"></div>
                            ) : (
                                <Fragment>
                                    <button onClick={toggleFollow} className={`px-8 py-2.5 rounded-full text-sm font-bold cursor-pointer transition-colors shadow-lg ${profile.follow_status === 'none' ? 'bg-[#0095f6] text-white border-none hover:bg-blue-600 shadow-blue-500/20' : 'bg-[#262626] text-white border border-[#363636] hover:bg-[#333] shadow-black/20'}`}>
                                        {profile.follow_status === 'pending' ? 'Pendiente' : (profile.follow_status === 'accepted' ? 'Siguiendo' : 'Seguir')}
                                    </button>
                                    {profile.is_business && (
                                        <a href={`mailto:contacto@${profile.username}.com`} className="px-6 py-2.5 rounded-full bg-transparent border border-[#00ba7c] text-[#00ba7c] text-sm font-bold cursor-pointer hover:bg-[#00ba7c]/10 transition-colors no-underline flex items-center">
                                            Contactar
                                        </a>
                                    )}
                                </Fragment>
                            )}
                        </div>

                        <div className="text-center mb-8 px-4 w-full">
                            <h2 className="m-0 text-3xl font-black text-white tracking-wide flex items-center justify-center gap-2">
                                {profile.display_name || profile.username}
                                <VerifiedBadge className="w-7 h-7" />
                            </h2>
                            <span className="text-[#0095f6] font-medium text-base">@{profile.username}</span>

                            {profile.is_business && (
                                <div className="mt-4 flex flex-col items-center gap-2">
                                    <span className="text-[#00ba7c] text-[10px] font-bold uppercase tracking-widest border border-[#00ba7c] px-3 py-1 rounded-full bg-[#00ba7c]/10">
                                        {profile.business_category || 'Empresa'}
                                    </span>
                                    {profile.business_slogan && (
                                        <p className="text-gray-400 text-sm mt-1 italic max-w-sm mx-auto">
                                            "{profile.business_slogan}"
                                        </p>
                                    )}
                                </div>
                            )}

                            {isLocked && !isBlockedState && <div className="text-sm text-gray-500 mt-4 flex items-center justify-center gap-1 font-bold">🔒 Cuenta Privada</div>}
                        </div>

                        <div className="flex justify-center gap-10 md:gap-20 mb-8 w-full px-8 bg-[#1a1a1a]/30 backdrop-blur-md p-6 rounded-2xl border border-white/5 mx-auto max-w-[80%]">
                            <div className="flex flex-col items-center">
                                <span className="font-black text-2xl text-white">{isBlockedState ? 0 : (profile.posts_count ?? posts.length)}</span>
                                <span className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mt-1">Posts</span>
                            </div>
                            <div onClick={() => !isBlockedState && !isLocked && openFollowModal('followers')} className={`flex flex-col items-center transition-opacity ${isBlockedState || isLocked ? 'opacity-70 cursor-default' : 'cursor-pointer hover:opacity-80'}`}>
                                <span className="font-black text-2xl text-white">{isBlockedState ? 0 : (profile.followers_count || 0)}</span>
                                <span className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mt-1">Seguidores</span>
                            </div>
                            <div onClick={() => !isBlockedState && !isLocked && openFollowModal('following')} className={`flex flex-col items-center transition-opacity ${isBlockedState || isLocked ? 'opacity-70 cursor-default' : 'cursor-pointer hover:opacity-80'}`}>
                                <span className="font-black text-2xl text-white">{isBlockedState ? 0 : (profile.following_count || 0)}</span>
                                <span className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mt-1">Seguidos</span>
                            </div>
                        </div>

                        {!isBlockedState && (
                            <div className="flex w-full border-t border-[#262626] bg-[#0d0d0d]">
                                <button onClick={() => setActiveTab('posts')} className={`flex-1 py-4 font-bold uppercase text-xs flex justify-center items-center gap-2 cursor-pointer transition-all ${activeTab === 'posts' ? 'text-white bg-[#1a1a1a] shadow-[inset_0_2px_0_0_#fff]' : 'text-gray-500 hover:text-gray-300 hover:bg-[#151515] border-none'}`}>
                                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2"></rect><line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="2"></line><line x1="9" y1="21" x2="9" y2="9" stroke="currentColor" strokeWidth="2"></line></svg>
                                    <span className="hidden md:inline">Publicaciones</span>
                                </button>
                                <button onClick={() => setActiveTab('reposts')} className={`flex-1 py-4 bg-transparent border-none font-bold uppercase text-xs flex justify-center items-center gap-2 cursor-pointer transition-all ${activeTab === 'reposts' ? 'text-white bg-[#1a1a1a] shadow-[inset_0_2px_0_0_#00ba7c]' : 'text-gray-500 hover:text-gray-300 hover:bg-[#151515]'}`}>
                                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                                </button>
                                {isMyProfile && (
                                    <button onClick={() => setActiveTab('saved')} className={`flex-1 py-4 bg-transparent border-none font-bold uppercase text-xs flex justify-center items-center gap-2 cursor-pointer transition-all ${activeTab === 'saved' ? 'text-white bg-[#1a1a1a] shadow-[inset_0_2px_0_0_#fff]' : 'text-gray-500 hover:text-gray-300 hover:bg-[#151515]'}`}>
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
                                        <span className="hidden md:inline">Guardado</span>
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="w-full mt-6 px-4 md:px-8 pb-8">
                            {profile.blocked_by_me ? (
                                <div className="text-center py-16 px-5 border border-[#262626] rounded-2xl bg-[#121212] shadow-lg">
                                    <h3 className="m-0 text-white text-xl font-bold">Has bloqueado a este usuario</h3>
                                    <p className="text-gray-400 mt-2 text-sm">Desbloquéalo para ver su perfil y publicaciones.</p>
                                </div>
                            ) : profile.blocked_by_them ? (
                                <div className="text-center py-16 text-gray-400 font-bold bg-[#121212] rounded-2xl shadow-lg border border-[#262626]">
                                    Aún no hay publicaciones.
                                </div>
                            ) : isLocked ? (
                                <div className="text-center py-16 px-5 border border-[#262626] rounded-2xl bg-[#121212] shadow-lg">
                                    <h3 className="m-0 text-white text-xl font-bold">Esta cuenta es privada</h3>
                                    <p className="text-gray-400 mt-2 text-sm">Síguele para ver sus fotos y videos.</p>
                                </div>
                            ) : (activeTab === 'saved' && loadingSaved) ? (
                                <div className="text-center py-16 text-gray-400 font-bold">Cargando tus favoritos...</div>
                            ) : (activeTab === 'reposts' && loadingReposts) ? (
                                <div className="text-center py-16 text-[#00ba7c] font-bold">Cargando reposts...</div>
                            ) : displayPosts.length === 0 ? (
                                <div className="text-center py-16 text-gray-400 font-bold bg-[#121212] rounded-2xl shadow-lg border border-[#262626]">
                                    {activeTab === 'saved' ? 'Aún no has guardado nada.' :
                                        activeTab === 'reposts' ? 'Aún no ha reposteado nada.' :
                                            'Aún no hay publicaciones.'}
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-1 md:gap-2 rounded-2xl overflow-hidden">
                                    {displayPosts.map((item, index) => {
                                        const isDrop = !!item.video_url;
                                        const itemId = item._id || item.id || index;

                                        return (
                                            <div key={itemId} onClick={() => isDrop ? setSelectedDropId(itemId) : setSelectedPost(item)} className="aspect-square bg-[#121212] relative cursor-pointer group">
                                                {isDrop ? (
                                                    <video src={item.video_url} className="w-full h-full object-cover block" />
                                                ) : (
                                                    <img src={getPostImage(item.image_path)} alt="Publicación" className="w-full h-full object-cover block" />
                                                )}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
                                                {isDrop && (
                                                    <div className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-md text-white border border-[#333]">
                                                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                                                    </div>
                                                )}
                                                {activeTab === 'reposts' && !isDrop && (
                                                    <div className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-[#00ba7c]">
                                                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black/85 z-[10000] flex justify-center items-center p-5 backdrop-blur-sm">
                            <div className="w-full max-w-[600px] relative">
                                <CreatePost onPostCreated={addNewPostToProfile} onCancel={() => setIsModalOpen(false)} />
                            </div>
                        </div>
                    )}

                    {selectedPost && (
                        <div className="fixed inset-0 bg-black/90 z-[10000] flex justify-center items-center p-2 md:p-5 backdrop-blur-sm" onClick={() => setSelectedPost(null)}>
                            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[600px] bg-[#121212] rounded-xl border border-[#262626] overflow-y-auto custom-scrollbar flex flex-col max-h-[95vh] md:max-h-[90vh] shadow-2xl">
                                <PostCard
                                    initialPost={{ ...selectedPost, user: selectedPost.user || (activeTab === 'saved' || activeTab === 'reposts' ? selectedPost.user : profile) }}
                                    getAvatar={getAvatar}
                                    isModal={true}
                                    onCloseModal={() => setSelectedPost(null)}
                                />
                            </div>
                        </div>
                    )}

                    {selectedDropId && <SingleDropModal dropId={selectedDropId} onClose={() => setSelectedDropId(null)} />}

                    {isFollowModalOpen && !isBlockedState && (
                        <div className="fixed inset-0 bg-black/80 z-[10000] flex justify-center items-center backdrop-blur-sm" onClick={closeFollowModal}>
                            <div onClick={(e) => e.stopPropagation()} className="w-[90%] md:w-[400px] h-[70vh] md:h-[500px] max-h-[500px] bg-[#121212] rounded-2xl border border-[#333] overflow-hidden flex flex-col shadow-2xl">
                                <div className="flex justify-between items-center p-5 border-b border-[#262626]">
                                    <h3 className="m-0 text-lg text-white font-bold">{followModalType === 'followers' ? 'Seguidores' : 'Seguidos'}</h3>
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
                                                    <button onClick={(e) => { e.stopPropagation(); toggleModalUserFollow(user.user_id || user._id || user.id, status); }} className={`px-5 py-2 rounded-full font-bold text-xs transition-colors shrink-0 ${status === 'none' ? 'bg-[#0095f6] hover:bg-blue-600 text-white border-none' : 'bg-[#262626] hover:bg-[#333] text-white border border-[#363636]'}`}>
                                                        {status === 'pending' ? 'Pendiente' : (status === 'accepted' ? 'Siguiendo' : 'Seguir')}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {isReportModalOpen && (
                        <ReportModal
                            targetType="user"
                            targetId={null}
                            reportedUserId={profile._id || profile.id}
                            onClose={() => setIsReportModalOpen(false)}
                        />
                    )}

                    {isMetricsModalOpen && (
                        <div className="fixed inset-0 bg-black/80 z-[10000] flex justify-center items-center backdrop-blur-sm" onClick={() => setIsMetricsModalOpen(false)}>
                            <div onClick={(e) => e.stopPropagation()} className="w-[90%] md:w-[400px] bg-[#121212] rounded-2xl border border-[#333] overflow-hidden flex flex-col shadow-2xl">
                                <div className="flex justify-between items-center p-5 border-b border-[#262626]">
                                    <h3 className="m-0 text-lg text-[#00ba7c] font-black tracking-wide">Métricas Comerciales</h3>
                                    <button onClick={() => setIsMetricsModalOpen(false)} className="bg-transparent border-none text-gray-500 hover:text-white text-xl cursor-pointer font-bold transition-colors">✕</button>
                                </div>
                                <div className="p-6 flex flex-col gap-4">
                                    <div className="bg-[#1a1a1a] p-5 rounded-xl border border-[#333] flex justify-between items-center shadow-inner">
                                        <span className="text-gray-400 font-bold text-sm">Visitas al perfil (30 días)</span>
                                        <span className="text-2xl font-black text-white">+{Math.floor(Math.random() * 5000) + 1000}</span>
                                    </div>
                                    <div className="bg-[#1a1a1a] p-5 rounded-xl border border-[#333] flex justify-between items-center shadow-inner">
                                        <span className="text-gray-400 font-bold text-sm">Alcance de Ads</span>
                                        <span className="text-2xl font-black text-[#00ba7c]">+{Math.floor(Math.random() * 15000) + 5000}</span>
                                    </div>
                                    <div className="bg-[#1a1a1a] p-5 rounded-xl border border-[#333] flex justify-between items-center shadow-inner">
                                        <span className="text-gray-400 font-bold text-sm">Clics en 'Contactar'</span>
                                        <span className="text-2xl font-black text-[#0095f6]">+{Math.floor(Math.random() * 300) + 50}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-500 text-center mt-4">
                                        Las métricas tienen un desfase de 24 horas por políticas de privacidad. Sigue impulsando tus publicaciones para mejorar tu alcance.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </Fragment>
    );
};

export default Profile;