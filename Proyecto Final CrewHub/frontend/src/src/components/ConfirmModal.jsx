import React, { Fragment } from 'react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Eliminar", cancelText = "Cancelar" }) => {
    if (!isOpen) return null;

    return (
        <Fragment>
            <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[10000] p-5" onClick={onCancel}>
                
                <div className="bg-[#1a1a1a] border border-[#333] rounded-xl w-full max-w-[400px] overflow-hidden shadow-2xl transition-all" onClick={(e) => e.stopPropagation()}>
                    
                    <div className="p-6 text-center">
                        <h3 className="m-0 mb-2 text-white text-lg font-bold">{title}</h3>
                        <p className="m-0 text-gray-400 text-sm leading-relaxed">{message}</p>
                    </div>

                    <div className="flex border-t border-[#333]">
                        <button 
                            onClick={onCancel}
                            className="flex-1 p-4 bg-transparent border-none border-r border-[#333] text-white cursor-pointer text-sm hover:bg-[#262626] transition"
                        >
                            {cancelText}
                        </button>
                        <button 
                            onClick={onConfirm}
                            className="flex-1 p-4 bg-transparent border-none text-[#ff4d4d] cursor-pointer font-bold text-sm hover:bg-[#262626] transition"
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