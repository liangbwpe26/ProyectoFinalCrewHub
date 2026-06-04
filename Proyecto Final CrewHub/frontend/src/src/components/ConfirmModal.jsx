import React, { Fragment } from 'react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Eliminar", cancelText = "Cancelar" }) => {
    if (!isOpen) return null;

    return (
        <Fragment>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[10000] p-5" onClick={onCancel}>
                
                <div className="bg-[#121212]/95 backdrop-blur-2xl border border-[#333] rounded-3xl w-full max-w-[400px] overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.8)] transition-all transform animate-fade-in" onClick={(e) => e.stopPropagation()}>
                    
                    <div className="p-8 text-center flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-[#ff4d4d]/10 border border-[#ff4d4d]/30 flex items-center justify-center text-[#ff4d4d] mb-5 shadow-[0_0_20px_rgba(255,77,77,0.2)]">
                            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                        <h3 className="m-0 mb-3 text-white text-xl font-black tracking-wide">{title}</h3>
                        <p className="m-0 text-gray-400 text-sm leading-relaxed">{message}</p>
                    </div>

                    <div className="flex border-t border-[#333] bg-[#0a0a0a]/50">
                        <button 
                            onClick={onCancel}
                            className="flex-1 p-4 md:p-5 bg-transparent border-none border-r border-[#333] text-gray-300 font-bold uppercase tracking-widest cursor-pointer text-xs hover:bg-[#262626] hover:text-white transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button 
                            onClick={onConfirm}
                            className="flex-1 p-4 md:p-5 bg-transparent border-none text-[#ff4d4d] cursor-pointer font-black uppercase tracking-widest text-xs hover:bg-[#ff4d4d]/10 transition-colors shadow-inner"
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default ConfirmModal;