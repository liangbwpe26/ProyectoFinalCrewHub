import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api.js';

const SingleDropModal = ({ dropId, onClose }) => {
    const [drop, setDrop] = useState(null);
    const [loading, setLoading] = useState(true);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

    useEffect(() => {
        const fetchSingleDrop = async () => {
            try {
                const data = await fetchAPI(`/drops/${dropId}`);
                if (data.success) setDrop(data.drop);
            } catch (error) {} finally {
                setLoading(false);
            }
        };
        fetchSingleDrop();
    }, [dropId]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/90 z-[9999] flex justify-center items-center backdrop-blur-sm cursor-pointer" onClick={onClose}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0095f6]"></div>
            </div>
        );
    }

    if (!drop) return null;

    return (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex justify-center items-center backdrop-blur-sm p-4 md:p-10 cursor-pointer" onClick={onClose}>
            <div 
                className="relative w-full max-w-[400px] h-full max-h-[800px] bg-black border border-[#333] rounded-2xl overflow-hidden shadow-2xl flex cursor-default" 
                onClick={e => e.stopPropagation()}
            >
                <video src={drop.video_url} autoPlay loop playsInline controls className="w-full h-full object-cover" />
                
                <button onClick={onClose} className="absolute top-4 right-4 bg-black/60 text-white border-none w-8 h-8 rounded-full flex justify-center items-center cursor-pointer hover:bg-[#ff4d4d] transition z-50">✕</button>

                <div className="absolute bottom-0 left-0 w-full p-5 pt-20 bg-gradient-to-t from-black via-black/60 to-transparent flex flex-col pointer-events-none">
                    <div className="flex items-center gap-2 pointer-events-auto">
                        <img src={drop.user?.profile_picture ? (drop.user.profile_picture.startsWith('http') ? drop.user.profile_picture : `${BACKEND_URL}${drop.user.profile_picture}`) : `https://ui-avatars.com/api/?name=${drop.user?.username}&background=262626&color=fff`} className="w-8 h-8 rounded-full border border-[#333] object-cover" alt="avatar" />
                        <strong className="text-white text-sm">@{drop.user?.username}</strong>
                    </div>
                    <p className="text-gray-300 text-sm mt-2 mb-0 drop-shadow-md pointer-events-auto">{drop.description}</p>
                </div>
            </div>
        </div>
    );
};

export default SingleDropModal;