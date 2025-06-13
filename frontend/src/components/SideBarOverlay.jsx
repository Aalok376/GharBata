import React from "react"

const SideBarOverlay = ({ isSideBarOpen, setIsSideBarOpen }) => {
    return (
        <>
            <style>
                {` 
                .sidebar-overlay {
                          display: none;
                          position: fixed;
                          top: 70px;
                          left: 0;
                          right: 0;
                          bottom: 0;
                          background: rgba(0, 0, 0, 0.5);
                          z-index: 850;
                }

                .sidebar-overlay.active {
                    display: flex;
                }
        
                @media (min-width: 769px) {
                    .sidebar-overlay {
                        display: none !important;
                    }
                    body{
                        overflow:auto !important;
                    }
                }`}
            </style>

            <div className={`sidebar-overlay ${isSideBarOpen ? 'active' : ''}`} onClick={() => {
                setIsSideBarOpen(!isSideBarOpen)
                document.body.style.overflow = ''
            }}
            ></div>
        </>
    )
}

export default SideBarOverlay