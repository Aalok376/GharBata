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