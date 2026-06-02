import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { fetchAPI } from '../services/api.js';

// Recibimos la prop refreshKey (con valor por defecto 0 por si se usa en otros lados)
const StoriesBar = ({ refreshKey = 0 }) => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

    // Se ejecuta al cargar, y CADA VEZ que el refreshKey cambie
    useEffect(() => {
        const loadStories = async () => {
            try {
                const data = await fetchAPI('/stories/feed');
                if (data.success) {
                    setStories(data.stories || []);
                }
            } catch (error) {
                console.error("Error al cargar historias", error);
            } finally {
                setLoading(false);
            }
        };
        loadStories();
    }, [refreshKey]); 

    const getAvatar = (entity, isCommunity) => {
        if (isCommunity) {
            if (entity.avatar_path) return `${BACKEND_URL}${entity.avatar_path}`;
            const initial = entity.name ? entity.name.charAt(0).toUpperCase() : 'C';
            return `https://ui-avatars.com/api/?name=${initial}&background=1a1a1a&color=fff&bold=true`;
        } else {
            if (entity.profile_picture) return entity.profile_picture.startsWith('http') ? entity.profile_picture : `${BACKEND_URL}${entity.profile_picture}`;
            const initial = entity.username ? entity.username.charAt(0).toUpperCase() : 'U';
            return `https://ui-avatars.com/api/?name=${initial}&background=262626&color=fff&bold=true`;
        }
    };

    if (loading) {
        return (
            <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
                <div className="w-16 h-16 rounded-full bg-[#1a1a1a] animate-pulse shrink-0"></div>
                <div className="w-16 h-16 rounded-xl bg-[#1a1a1a] animate-pulse shrink-0"></div>
            </div>
        );
    }

    if (stories.length === 0) {
        return <div className="text-gray-500 text-xs py-2 text-center">No hay historias recientes.</div>;
    }

    return (
        <Fragment>
            <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2 pt-1 px-1">
                {stories.map(story => {
                    const isCommunity = !!story.community_id;
                    const entity = isCommunity ? story.community : story.user;
                    const entityName = isCommunity ? entity?.name : entity?.username;
                    const linkTo = isCommunity ? `/communities/${entity?.slug}` : `/${entity?.username}`;

                    return (
                        <Link
                            key={story.id || story._id}
                            to={linkTo}
                            className="flex flex-col items-center gap-2 w-16 shrink-0 no-underline group cursor-pointer"
                        >
                            <div className={`w-14 h-14 p-[2px] bg-gradient-to-tr from-[#0095f6] to-[#005bb5] transition-transform group-hover:scale-105 shadow-md ${isCommunity ? 'rounded-xl' : 'rounded-full'}`}>
                                <div className={`w-full h-full border-2 border-[#121212] overflow-hidden bg-[#1a1a1a] ${isCommunity ? 'rounded-xl' : 'rounded-full'}`}>
                                    <img src={getAvatar(entity, isCommunity)} alt={entityName} className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <span className="text-gray-400 text-[10px] truncate w-full text-center group-hover:text-white transition-colors font-bold tracking-wide">
                                {entityName}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </Fragment>
    );
};

export default StoriesBar;