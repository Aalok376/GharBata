import React, { useState } from "react";
import { Link } from "react-router-dom";
import {FaHome,FaUserPlus,FaSignInAlt,FaPhoneAlt} from "react-icons/fa";

const Navbar=()=>{
    const[isSignUpOpen,setIsSignUpOpen]=useState(false);
    const [isLoginOpen,setIsLoginOpen]=useState(false);
    return(
        <nav className="bg-blue-900 text-white p-4 shadow-md sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                {/*Left side:Logo*/}
                <div className="text-2xl font-bold"> 
                    <Link to='/'>GharBata</Link>
                </div>
                {/*Right side:Navigation Links*/}
                <div className="flex items-center space-x-6 ">
                    <Link to='/' className='flex items-center gap-1 hover:text-gray-200'>
                    <FaHome/>
                    Home
                    </Link>
                    {/*SignUp Dropdown */}
                    <div 
                    className="relative"
                    onMouseEnter={()=>setIsSignUpOpen(true)}
                    onMouseLeave={()=>setIsSignUpOpen(false)}
                    >
                        <button className="flex items-center gap-1 hover:text-gray-200 focus:outline-none cursor-pointer">
                            <FaUserPlus/>
                            SignUp
                            </button>
                      
                            <div
                             className={`absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded-md shadow-lg z-10  transition-all duration-300 ${
                                isSignUpOpen ? "opacity-100 visible" : "opacity-0 invisible"
                            }`}>
                                <Link
                                to="/client_signup"
                                className="block px-4 py-2 hover:bg-blue-100"
                                >
                                    User
                                </Link>
                                <Link 
                                to="/technician_signup"
                                className="block px-4 py-2 hover:bg-blue-100"
                                >
                                    Technician
                                </Link>
                            </div>
                        
                    </div>
                    {/* Login Dropdown */}
                    <div
                    className="relative"
                    onMouseEnter={()=>setIsLoginOpen(true)}
                    onMouseLeave={()=>setIsLoginOpen(false)}
                    >
                        <button className="flex items-center gap-1 hover:text-gray-200 focus:outline-none cursor-pointer">
                            <FaSignInAlt/>
                            Login
                        </button>
                        
                            <div 
                            className={`absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded-md shadow-lg z-10 transition-all duration-300 ${
                                isLoginOpen ? "opacity-100 visible":"opacity-0 invisible"
                            }`}>
                                <Link
                                to="/client_login"
                                className="block px-4 py-2 hover:bg-blue-100"
                                >
                                    User
                                </Link>
                                <Link
                                to="/technician_login"
                                className="block px-4 py-2 hover:bg-blue-100"
                                >
                                    Technician
                                </Link>

                            </div>
                        
                    </div>
                    <Link
                     to="/contact" 
                     className="flex items-center gap-1 hover:text-gray-200">
                        <FaPhoneAlt/>
                        Contact Us
                        </Link>
                </div>
            </div>
        </nav>
    );
};
export default Navbar;