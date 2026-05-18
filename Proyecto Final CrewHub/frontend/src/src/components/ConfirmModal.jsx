import React, { Fragment } from 'react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Eliminar", cancelText = "Cancelar" }) => {
    if (!isOpen) return null;

    return (
        <Fragment>
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                zIndex: 10000, padding: '20px'
            }} onClick={onCancel}>
                
                <div style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: '400px',
                    overflow: 'hidden',
                    animation: 'modalFadeIn 0.2s ease-out'
                }} onClick={(e) => e.stopPropagation()}>
                    
                    <div style={{ padding: '25px', textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: '1.2rem' }}>{title}</h3>
                        <p style={{ margin: 0, color: 'gray', fontSize: '0.95rem', lineHeight: '1.4' }}>{message}</p>
                    </div>

                    <div style={{ display: 'flex', borderTop: '1px solid #333' }}>
                        <button 
                            onClick={onCancel}
                            style={{
                                flex: 1, padding: '15px', background: 'none', border: 'none',
                                borderRight: '1px solid #333', color: '#fff', cursor: 'pointer',
                                fontWeight: 'normal', fontSize: '0.9rem'
                            }}
                        >
                            {cancelText}
                        </button>
                        <button 
                            onClick={onConfirm}
                            style={{
                                flex: 1, padding: '15px', background: 'none', border: 'none',
                                color: '#ff4d4d', cursor: 'pointer', fontWeight: 'bold',
                                fontSize: '0.9rem'
                            }}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes modalFadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </Fragment>
    );
};

export default ConfirmModal;