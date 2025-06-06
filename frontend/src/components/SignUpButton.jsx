import React, { useState } from "react"
import { FaUserPlus, FaWrench } from "react-icons/fa"
import styled from "styled-components"

const NavButton = styled.div`
    position: relative;
    display: inline-block;
    gap: 1rem;
    align-items: center;
`

const ButtonLink = styled.button`
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 50px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
    background: transparent;
    color: #667eea;
    border: 2px solid #667eea;

    &:hover {
        background: #667eea;
        color: white;
        transform: translateY(-2px);
    }
`

const SignUpBtn = () => {
    const [isSignUpOpen, setIsSignUpOpen] = useState(false)
    
    return (
        <NavButton>
            <ButtonLink onClick={() => setIsSignUpOpen(prev => !prev)}>
                Sign In
            </ButtonLink>
            
            <div className={`
                absolute right-0 mt-3 w-56 h-35
                bg-white rounded-sm shadow-xl
                border border-gray-200
                overflow-hidden
                transition-all duration-300 ease-out
                transform origin-top-right
                ${isSignUpOpen
                    ? 'opacity-100 visible scale-100 translate-y-0'
                    : 'opacity-0 invisible scale-95 -translate-y-2'
                }
                z-50
            `}>
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 h-7">
                    <p className="text-l font-semibold text-gray-700">Choose Account Type</p>
                </div>

                <div className="py-5">
                    <button className="
                        w-full flex items-center gap-4
                        text-gray-700 hover:bg-blue-50 hover:text-blue-600
                        transition-colors duration-150
                        text-left group h-14
                    ">
                        <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                            <FaUserPlus size={16} className="text-blue-600" />
                        </div>
                        <div>
                            <div className="font-medium text-sm">As Client</div>
                            <div className="text-xs text-gray-500">Book services & manage orders</div>
                        </div>
                    </button>

                    <button className="
                        w-full flex items-center gap-4
                        text-gray-700 hover:bg-green-50 hover:text-green-600
                        transition-colors duration-150
                        text-left group h-14
                    ">
                        <div className="p-2 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
                            <FaWrench size={16} className="text-green-600" />
                        </div>
                        <div>
                            <div className="font-medium text-sm">As Technician</div>
                            <div className="text-xs text-gray-500">Provide services & earn money</div>
                        </div>
                    </button>
                </div>
            </div>
        </NavButton>
    )
}

export default SignUpBtn