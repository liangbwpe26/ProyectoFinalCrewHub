import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="fixed top-0 w-full z-50">
            <div className="nav-container">
                
                <Link to="/chats" className="nav-tab tab-left">
                    <span className="font-bold flex items-center gap-2 text-xs tracking-wider">
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                        </svg>
                        CHATS
                    </span>
                </Link>

                <Link to="/" className="nav-tab tab-center">
                    <span className="font-black text-xl tracking-widest uppercase">
                        Crew Hub
                    </span>
                </Link>

                <Link to="/comunidades" className="nav-tab tab-right">
                    <span className="font-bold flex items-center gap-2 text-xs tracking-wider">
                        COMUNIDADES
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                        </svg>
                    </span>
                </Link>

            </div>
        </nav>
    );
};

export default Navbar;