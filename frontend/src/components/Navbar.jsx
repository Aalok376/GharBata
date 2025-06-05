import React, { useState } from "react"
import { Link } from "react-router-dom"
import styled from "styled-components"

import SignUpBtn from "./SignUpButton"

const Navbar = () => {
    return (
        <HeaderComp>
            <NavBar>
                <LoGo><Link to='/'>GharBata</Link></LoGo>
                <NavLink>
                    <li><NavLinks to="#services">Services</NavLinks></li>
                    <li><NavLinks to="#how-it-works">How It Works</NavLinks></li>
                    <li><NavLinks to="#contact">Contact</NavLinks></li>
                </NavLink>
                <SignUpBtn/>
            </NavBar>
        </HeaderComp>
    )
}

const HeaderComp = styled.div` 
            position: fixed;
            top: 0;
            width: 100%;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            z-index: 1000;
            transition: all 0.3s ease;
`

const NavBar = styled.div`
            max-width: 1300px;
            margin: 0 auto;
            padding: 0 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            `

const LoGo = styled.div`
            font-size: 1.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;`

const NavLink = styled.ul`
            display: flex;
            list-style: none;
            gap: 2rem;`

const NavLinks = styled(Link)`
            text-decoration: none;
            color: #4a5568;
            font-weight: 500;
            transition: color 0.3s ease;
            position: relative;

            &:hover {
            color: #667eea;
            }

            &::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 0;
            height: 2px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            transition: width 0.3s ease;
            }

            &:hover::after {
            width: 100%;
            }

            @media (max-width: 768px) {
                    display:none;
            }
`

export default Navbar