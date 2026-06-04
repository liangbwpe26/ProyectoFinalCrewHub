import React, { Fragment } from 'react';
import { useStoriesBar } from '../hooks/useStoriesBar.js';
import StoryViewer from './StoryViewer.jsx';

const StoriesBar = ({ refreshKey = 0 }) => {
    const {
        storiesGroups, loading, viewingStoryOf, getAvatar, openStory, closeStory,
        onStoryViewed, onDeleteStory, onToggleLike, onGetStats, onReply
    } = useStoriesBar(refreshKey);

    if (loading) {
        return (
            <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
                <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-[#333] shadow-inner animate-pulse shrink-0"></div>
                <div className="w-16 h-16 rounded-xl bg-[#1a1a1a] border border-[#333] shadow-inner animate-pulse shrink-0"></div>
            </div>
        );
    }

    if (storiesGroups.length === 0) {
        return <div className="text-gray-500 text-xs py-2 text-center font-bold tracking-widest uppercase">No hay historias recientes</div>;
    }

    return (
        <Fragment>
            <div className="flex gap-5 overflow-x-auto custom-scrollbar pb-3 pt-2 px-1">
                {storiesGroups.map((group, index) => {
                    const isCommunity = group.is_community;
                    const entity = group.user; 
                    const entityName = entity?.display_name || entity?.username || 'Usuario';
                    const key = entity?._id || entity?.id || index;

                    const ringColor = group.all_viewed 
                        ? 'bg-[#333]' 
                        : 'bg-gradient-to-tr from-[#0095f6] via-[#00ba7c] to-[#005bb5] shadow-[0_0_12px_rgba(0,149,246,0.6)]';

                    return (
                        <div
                            key={key}
                            onClick={() => openStory(key)}
                            className="flex flex-col items-center gap-2 w-[70px] shrink-0 group cursor-pointer"
                        >
                            <div className={`w-16 h-16 p-[2.5px] ${ringColor} transition-transform duration-300 group-hover:scale-110 ${isCommunity ? 'rounded-[18px]' : 'rounded-full'}`}>
                                <div className={`w-full h-full border-[3px] border-[#121212] overflow-hidden bg-[#1a1a1a] ${isCommunity ? 'rounded-[15px]' : 'rounded-full'}`}>
                                    <img src={getAvatar(entity, isCommunity)} alt={entityName} className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <span className={`text-[10px] truncate w-full text-center transition-colors tracking-wide ${group.all_viewed ? 'text-gray-500 font-medium' : 'text-white font-bold drop-shadow-md'}`}>
                                {entityName}
                            </span>
                        </div>
                    );
                })}
            </div>

            {viewingStoryOf && (
                <StoryViewer 
                    feed={storiesGroups} 
                    initialUserId={viewingStoryOf} 
                    onClose={closeStory} 
                    onStoryViewed={onStoryViewed}
                    onDeleteStory={onDeleteStory}
                    onToggleLike={onToggleLike}
                    onGetStats={onGetStats}
                    onReply={onReply}
                />
            )}
        </Fragment>
    );
};

export default StoriesBar;