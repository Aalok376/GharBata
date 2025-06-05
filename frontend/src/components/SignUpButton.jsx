import React,{useState}from "react"
import { FaUserPlus, FaWrench } from "react-icons/fa"
import styled from "styled-components"

const NavButton = styled.div`
            position:relative;
            display: inline-block;
            gap: 1rem;
            align-items: center;
`

const ButtonLink = styled.div`
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
            <ButtonLink onClick={() => setIsSignUpOpen(prev => !prev)}>Sign In{isSignUpOpen ? true : false}</ButtonLink>
            <div className={`
                                    absolute right-0 mt-3 w-48 
                                    bg-white rounded-xl shadow-xl
                                    border border-gray-200
                                    overflow-hidden
                                    transition-all duration-300 ease-out
                                    transform origin-top-right
                                    ${isSignUpOpen
                    ? 'opacity-100 visible scale-100 translate-y-0'
                    : 'opacity-0 invisible scale-95 -translate-y-2'
                }
                                    z-50
                                    `}
            >
                <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-gray-200 transform rotate-45"></div>

                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-700">Choose Account Type</p>
                </div>

                <div className="py-2">
                    <button className="
                                          w-full flex items-center gap-3 px-4 py-3
                                          text-gray-700 hover:bg-blue-50 hover:text-blue-600
                                          transition-colors duration-150
                                          text-left group
                                          "
                    >
                        <div className="p-1.5 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                            <FaUserPlus size={16} className="text-blue-600" />
                        </div>
                        <div>
                            <div className="font-medium">As Client</div>
                            <div className="text-xs text-gray-500">Book services & manage orders</div>
                        </div>
                    </button>

                    <button className="
                                           w-full flex items-center gap-3 px-4 py-3
                                           text-gray-700 hover:bg-green-50 hover:text-green-600
                                           transition-colors duration-150
                                           text-left group
                                           "
                    >
                        <div className="p-1.5 rounded-lg bg-green-100 group-hover:bg-green-200 transition-colors">
                            <FaWrench size={16} className="text-green-600" />
                        </div>
                        <div>
                            <div className="font-medium">As Technician</div>
                            <div className="text-xs text-gray-500">Provide services & earn money</div>
                        </div>
                    </button>
                </div>
            </div>
        </NavButton>
    )
}

export default SignUpBtn