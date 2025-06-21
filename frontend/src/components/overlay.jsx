
import React from "react"

const Overlay=({onClose,children})=>{
    return(
        <div style={overlayStyle}>
            <div style={modalStyle}>
                {children}
                <button onClick={onClose}>X</button>
            </div>
        </div>
    )

}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
}

const modalStyle = {
  backgroundColor: 'rgba(0,0,0,0.5)',
  padding: '20px',
  borderRadius: '8px',
  position: 'relative',
  minWidth: '300px',
}

export default Overlay
{/*
import React from "react";

const Overlay = ({ onClose, children }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
      <div className="bg-black bg-opacity-50 p-6 rounded-lg min-w-[300px] relative">
        {children}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white font-bold"
        >
          X
        </button>
      </div>
    </div>
  );
};

export default Overlay;
*/}

