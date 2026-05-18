import React, { Fragment, useRef, useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { useStories } from '../hooks/useStories.js';
import { useToast } from '../contexts/ToastContext.jsx';
import StoryViewer from './StoryViewer.jsx';
import ImageCropperModal from './ImageCropperModal.jsx';

const StoriesBar = () => {
    const { token, activeUser } = useContext(AuthContext);
    const { storiesFeed, loadingStories, loadStories, uploadStory, markStoryAsViewed, deleteStory } = useStories(token);
    const { showToast } = useToast();

    const fileInputRef = useRef(null);
    const [viewerState, setViewerState] = useState({ isOpen: false, initialIndex: 0 });
    const [isUploading, setIsUploading] = useState(false);

    const [cropImageSrc, setCropImageSrc] = useState(null);

    useEffect(() => {
        loadStories();
    }, [loadStories]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setCropImageSrc(reader.result);
            };
        } else {
            executeUpload(file);
        }
        e.target.value = '';
    };

    const handleCropComplete = async (croppedFile) => {
        setCropImageSrc(null);
        executeUpload(croppedFile);
    };

    const executeUpload = async (fileToUpload) => {
        setIsUploading(true);
        const data = await uploadStory(fileToUpload);
        setIsUploading(false);

        if (data.success) {
            showToast("Historia subida correctamente", "success");
        } else {
            showToast("Error al subir la historia", "error");
        }
    };

    const getAvatar = (user) => {
        if (user?.profile_picture) return user.profile_picture.startsWith('http') ? user.profile_picture : `http://127.0.0.1:8000${user.profile_picture}`;
        return `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=262626&color=fff&bold=true`;
    };

    if (loadingStories) return <div style={{ padding: '20px', color: 'gray', textAlign: 'center' }}>Cargando historias...</div>;

    const myStoryGroupIndex = storiesFeed.findIndex(group => (group.user._id || group.user.id) === (activeUser?._id || activeUser?.id));
    const hasMyStory = myStoryGroupIndex !== -1;

    return (
        <Fragment>
            <div style={{ backgroundColor: '#121212', padding: '20px 15px', borderRadius: '12px', border: '1px solid #262626', marginBottom: '30px', display: 'flex', gap: '15px', overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>

                {/* 1. SECCIÓN DE TU HISTORIA */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flexShrink: 0, position: 'relative' }}>

                    {/* Al hacer clic en tu foto, se abre el visor (si tienes historias) o el selector de archivos (si no tienes) */}
                    <div
                        onClick={() => hasMyStory ? setViewerState({ isOpen: true, initialIndex: myStoryGroupIndex }) : fileInputRef.current.click()}
                        style={{
                            width: '65px', height: '65px', borderRadius: '50%', padding: '3px',
                            background: hasMyStory ? (storiesFeed[myStoryGroupIndex].all_viewed ? '#333' : 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)') : 'transparent',
                            border: hasMyStory ? 'none' : '1px solid #333'
                        }}
                    >
                        <img src={getAvatar(activeUser)} alt="Mi Historia" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #121212' }} />
                    </div>

                    {/* EL BOTÓN DE "+" AHORA ESTÁ SIEMPRE VISIBLE */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Evita que se abra el visor al pulsar el +
                            fileInputRef.current.click();
                        }}
                        style={{ position: 'absolute', bottom: '20px', right: '0', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#0095f6', color: '#fff', border: '2px solid #121212', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', padding: 0 }}
                    >
                        +
                    </button>

                    <span style={{ fontSize: '0.75rem', color: '#fff', marginTop: '8px' }}>Tu historia</span>
                    {isUploading && <span style={{ fontSize: '0.65rem', color: '#0095f6' }}>Subiendo...</span>}

                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/mp4,video/quicktime" style={{ display: 'none' }} />
                </div>

                {/* 2. HISTORIAS DE OTROS USUARIOS */}
                {storiesFeed.map((group, index) => {
                    if ((group.user._id || group.user.id) === (activeUser?._id || activeUser?.id)) return null;

                    return (
                        <div key={group.user.username} onClick={() => setViewerState({ isOpen: true, initialIndex: index })} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}>
                            <div style={{
                                width: '65px', height: '65px', borderRadius: '50%', padding: '3px',
                                background: group.all_viewed ? '#333' : 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
                            }}>
                                <img src={getAvatar(group.user)} alt={group.user.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #121212' }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#fff', marginTop: '8px', maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {group.user.username}
                            </span>
                        </div>
                    );
                })}
            </div>

            {viewerState.isOpen && (
                <StoryViewer
                    feed={storiesFeed}
                    initialUserIndex={viewerState.initialIndex}
                    onClose={() => {
                        setViewerState({ isOpen: false, initialIndex: 0 });
                        loadStories();
                    }}
                    onStoryViewed={markStoryAsViewed}
                    onDeleteStory={deleteStory}
                />
            )}

            {cropImageSrc && (
                <ImageCropperModal
                    imageSrc={cropImageSrc}
                    aspectRatio={9 / 16}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setCropImageSrc(null)}
                />
            )}
        </Fragment>
    );
};

export default StoriesBar;