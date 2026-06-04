import React from 'react';

const PostSkeleton = () => {
    return (
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 md:p-5 mb-5 w-full animate-pulse shadow-lg">
            {/* Cabecera del Post (Avatar y Nombre) */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#262626]"></div>
                <div className="flex flex-col gap-2 flex-1">
                    <div className="h-4 bg-[#262626] rounded w-1/3"></div>
                    <div className="h-3 bg-[#262626] rounded w-1/4"></div>
                </div>
            </div>

            {/* Texto del post */}
            <div className="flex flex-col gap-2 mb-4">
                <div className="h-4 bg-[#262626] rounded w-full"></div>
                <div className="h-4 bg-[#262626] rounded w-5/6"></div>
                <div className="h-4 bg-[#262626] rounded w-2/3"></div>
            </div>

            {/* Imagen del post (Bloque grande) */}
            <div className="w-full h-[300px] md:h-[400px] bg-[#2a2a2a] rounded-xl mb-4"></div>

            {/* Botones de acción (Likes, comentarios) */}
            <div className="flex justify-between items-center pt-3 border-t border-[#262626]">
                <div className="flex gap-4">
                    <div className="h-8 w-16 bg-[#262626] rounded-full"></div>
                    <div className="h-8 w-16 bg-[#262626] rounded-full"></div>
                </div>
                <div className="h-8 w-8 bg-[#262626] rounded-full"></div>
            </div>
        </div>
    );
};

export default PostSkeleton;