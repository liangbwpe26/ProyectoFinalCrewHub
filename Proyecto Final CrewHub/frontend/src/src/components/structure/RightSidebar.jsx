import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext.jsx';
import { useHomeLogic } from '../../hooks/useHomeLogic.js';
import './RightSidebar.css';

const RightSidebar = () => {
    const { token } = useContext(AuthContext);
    
    // Llamamos a la lógica solo para obtener los contactos mutuos
    const { mutuals } = useHomeLogic(token);

    const getAvatar = (user) => {
        if (user && user.profile_picture) {
            if (user.profile_picture.startsWith('http')) return user.profile_picture;
            return `http://127.0.0.1:8000${user.profile_picture}`;
        }
        const name = user && user.username ? user.username : 'U';
        return `https://ui-avatars.com/api/?name=${name}&background=262626&color=fff&bold=true`;
    };

    return (
        <aside className="w-[280px] hidden lg:flex flex-col h-[calc(100vh-100px)] sticky top-[100px]">
            
            <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 flex flex-col shadow-lg">
                <h3 className="mt-0 text-xl font-bold text-white">Tus Contactos</h3>
                <p className="text-sm text-gray-400 mt-1 mb-5">Solo puedes chatear con quienes te siguen de vuelta.</p>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[50vh]">
                    {mutuals.length === 0 ? (
                        <div className="text-center text-gray-400 py-5">
                            <p className="text-sm m-0">Aún no tienes contactos mutuos.</p>
                        </div>
                    ) : (
                        <ul className="list-none p-0 m-0 flex flex-col gap-3">
                            {mutuals.map((mutual) => {
                                const mutualId = mutual.id || mutual._id;
                                return (
                                    <li key={mutualId} className="flex justify-between items-center p-2 rounded-lg hover:bg-[#1a1a1a] transition">
                                        <Link to={`/${mutual.username}`} className="flex items-center gap-3 no-underline text-inherit">
                                            <img src={getAvatar(mutual)} alt={mutual.username} className="w-9 h-9 rounded-full object-cover" />
                                            <strong className="text-sm text-white">{mutual.username}</strong>
                                        </Link>

                                        <Link
                                            to={`/chats/${mutual.username}`}
                                            className="bg-transparent text-[#0095f6] border border-[#0095f6] px-4 py-1.5 rounded-full cursor-pointer text-xs font-bold no-underline hover:bg-[#0095f6] hover:text-white transition"
                                        >
                                            Chat
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>

        </aside>
    );
};

export default RightSidebar;