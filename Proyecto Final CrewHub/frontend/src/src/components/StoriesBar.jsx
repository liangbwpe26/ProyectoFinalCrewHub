import React, { Fragment, useRef, useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { useStories } from '../hooks/useStories.js';
import { useToast } from '../contexts/ToastContext.jsx';
import StoryViewer from './StoryViewer.jsx';
import ImageCropperModal from './ImageCropperModal.jsx';
import './StoriesBar.css'; // Importamos el CSS para ocultar el scroll

const StoriesBar = () => {
    const { token, activeUser } = useContext(AuthContext);
    const { storiesFeed, loadingStories, loadStories, uploadStory, markStoryAsViewed, deleteStory, toggleStoryLike, getStoryStats, replyToStory } = useStories(token);
    const { showToast } = useToast();
    
    const fileInputRef = useRef(null);
    const [viewerState, setViewerState] = useState({ isOpen: false, initialIndex: 0 });
    const [isUploading, setIsUploading] = useState(false);
    const [cropImageSrc, setCropImageSrc] = useState(null);

    useEffect(() => { loadStories(); }, [loadStories]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => setCropImageSrc(reader.result);
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
        if (data.success) showToast("Historia subida correctamente", "success");
        else showToast("Error al subir la historia", "error");
    };

    const getAvatar = (user) => {
        if (user?.profile_picture) return user.profile_picture.startsWith('http') ? user.profile_picture : `http://127.0.0.1:8000${user.profile_picture}`;
        return `https://ui-avatars.com/api/?name=${user?.username || 'U'}&background=262626&color=fff&bold=true`;
    };

    if (loadingStories) return <div className="p-5 text-gray-500 text-center text-sm">Cargando historias...</div>;

    const myStoryGroupIndex = storiesFeed.findIndex(group => (group.user._id || group.user.id) === (activeUser?._id || activeUser?.id));
    const hasMyStory = myStoryGroupIndex !== -1;

    return (
        <Fragment>
            <div className="flex gap-4 overflow-x-auto whitespace-nowrap hide-scrollbar pb-2 pt-1 px-1">
                
                {/* Tu Historia */}
                <div className="flex flex-col items-center cursor-pointer shrink-0 relative">
                    <div 
                        onClick={() => hasMyStory ? setViewerState({ isOpen: true, initialIndex: myStoryGroupIndex }) : fileInputRef.current.click()}
                        className={`w-16 h-16 rounded-full p-[3px] ${hasMyStory ? (storiesFeed[myStoryGroupIndex].all_viewed ? 'bg-[#333]' : 'bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600') : 'border border-[#333] bg-transparent'}`}
                    >
                        <img src={getAvatar(activeUser)} alt="Mi Historia" className="w-full h-full rounded-full object-cover border-[3px] border-[#121212]" />
                    </div>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
                        className="absolute bottom-6 right-0 w-6 h-6 rounded-full bg-[#0095f6] text-white border-2 border-[#121212] flex justify-center items-center cursor-pointer font-bold text-sm leading-none"
                    >
                        +
                    </button>

                    <span className="text-[11px] font-medium text-white mt-2">Tu historia</span>
                    {isUploading && <span className="text-[10px] text-[#0095f6]">Subiendo...</span>}
                    
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/mp4,video/quicktime" className="hidden" />
                </div>

                {/* Historias de otros */}
                {storiesFeed.map((group, index) => {
                    if ((group.user._id || group.user.id) === (activeUser?._id || activeUser?.id)) return null;

                    return (
                        <div key={group.user.username} onClick={() => setViewerState({ isOpen: true, initialIndex: index })} className="flex flex-col items-center cursor-pointer shrink-0">
                            <div className={`w-16 h-16 rounded-full p-[3px] ${group.all_viewed ? 'bg-[#333]' : 'bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600'}`}>
                                <img src={getAvatar(group.user)} alt={group.user.username} className="w-full h-full rounded-full object-cover border-[3px] border-[#121212]" />
                            </div>
                            <span className="text-[11px] font-medium text-gray-300 mt-2 max-w-[65px] overflow-hidden text-ellipsis">
                                {group.user.username}
                            </span>
                        </div>
                    );
                })}
            </div>

            {viewerState.isOpen && (
                <StoryViewer 
                    feed={storiesFeed} initialUserIndex={viewerState.initialIndex} 
                    onClose={() => { setViewerState({ isOpen: false, initialIndex: 0 }); loadStories(); }}
                    onStoryViewed={markStoryAsViewed} onDeleteStory={deleteStory}
                    onToggleLike={toggleStoryLike} onGetStats={getStoryStats} onReply={replyToStory} 
                />
            )}

            {cropImageSrc && (
                <ImageCropperModal imageSrc={cropImageSrc} aspectRatio={9 / 16} onCropComplete={handleCropComplete} onCancel={() => setCropImageSrc(null)} />
            )}
        </Fragment>
    );
};

export default StoriesBar;