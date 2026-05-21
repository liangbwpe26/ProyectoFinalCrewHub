import React from 'react';
import Navbar from './Navbar.jsx';
import LeftSidebar from './LeftSidebar.jsx';
import RightSidebar from './RightSidebar.jsx';
import './Layout.css';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#2b2b2b] text-white font-sans flex flex-col">
            <Navbar />
            
            <div className="flex-1 flex justify-between px-8 py-6 max-w-[1400px] mx-auto w-full gap-8">
                <LeftSidebar />

                <main className="flex-1 max-w-[600px] w-full mt-4">
                    {children}
                </main>

                <RightSidebar />
            </div>
        </div>
    );
};

export default Layout;