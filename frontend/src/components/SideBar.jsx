import React, { useState } from "react"

import { NavLink } from "react-router-dom"

const SideBar = ({components,isOpen}) => {

    const NavItems = components.map(comp => (
            <li className="nav-item" key={comp.id}>
                <NavLink to={comp.id} className='nav-link'>
                    <span className="nav-icon">{comp.icon}</span>
                    <span className="nav-text">{comp.text}</span>
                </NavLink>
            </li>))
    return (
        <>
            <style>
                {` 
                       .sidebar {
                            position: fixed;
                            top: 70px;
                            left: 0;
                            width: 280px;
                            height: calc(100vh - 70px);
                            background: rgba(255, 255, 255, 0.95);
                            backdrop-filter: blur(20px);
                            border-right: 1px solid rgba(255, 255, 255, 0.2);
                            padding: 2rem 0;
                            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                            overflow-y: auto;
                            transition: all 0.3s ease;
                            z-index: 900;
                         }

                        .nav-menu {
                            list-style: none;
                            padding: 0 1rem;
                        }
                
                        .nav-item {
                            margin-bottom: 0.5rem;
                        }
                
                        .nav-link {
                            display: flex;
                            align-items: center;
                            padding: 1rem 1.5rem;
                            text-decoration: none;
                            color: #666;
                            transition: all 0.3s ease;
                            border-radius: 12px;
                            border-left: 3px solid transparent;
                        }
                
                        .nav-link:hover,
                        .nav-link.active {
                            background: rgba(30, 60, 114, 0.1);
                            color: #1e3c72;
                            border-left-color: #1e3c72;
                            transform: translateX(5px);
                        }
                
                        .nav-icon {
                            margin-right: 1rem;
                            font-size: 1.2rem;
                            width: 20px;
                            text-align: center;
                        }
                
                        .nav-text {
                            font-weight: 500;
                        }
                            
                        @media (max-width: 769px) { 
                        .sidebar {
                            transform: translateX(-100%);
                        }
            
                        .sidebar.open {
                            transform: translateX(0);
                        }
                        }
                }`
                }
            </style>
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <nav>
                    <ul className="nav-menu">
                        {NavItems}
                    </ul>
                </nav>
            </aside>

        </>
    )
}

export default SideBar