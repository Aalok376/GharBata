import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar=()=>{
    const[isSignUpOpen,setIsSignUpOpen]=useState(false);
    const [isLoginOpen,setIsLoginOpen]=useState(false);
    return(
        <nav className="bg-blue-600 text-white p-4 shadow-md">
            <div className="container mx-auto flex justify-between items-center">
                {/*Left side:Logo*/}
                <div className="text-2xl font-bold"> 
                    <Link to='/'>GharBata</Link>
                </div>
                {/*Right side:Navigation Links*/}
                <div className="flex items-center space-x-6 ">
                    <Link to='/' className='hover:text-gray-200'>Home</Link>
                    {/*SignUp Dropdown */}
                    <div 
                    className="relative"
                    onMouseEnter={()=>setIsSignUpOpen(true)}
                    onMouseLeave={()=>setIsSignUpOpen(false)}
                    >
                        <button className="hover:text-gray-200 focus:outline-none">SignUp</button>
                      
                            <div className={`absolute right-0 mt-2 w-40 bg-green-600 text-black rounded-md shadow-lg z-10  transition-all duration-300 ${
                                isSignUpOpen ? "opacity-100 visible" : "opacity-0 invisible"
                            }`}>
                                <Link
                                to="/client_signup"
                                className="block px-4 py-2 hover:bg-gray-100"
                                >
                                    User
                                </Link>
                                <Link 
                                to="/technician_signup"
                                className="block px-4 py-2 hover:bg-gray-100"
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
                        <button className="hover:text-gray-200 focus:outline-none">
                            Login
                        </button>
                        
                            <div className={`absolute right-0 mt-2 w-40 bg-green-600 text-black rounded-md shadow-lg z-10 transition-all duration-300 ${
                                isLoginOpen ? "opacity-100 visible":"opacity-0 invisible"
                            }`}>
                                <Link
                                to="/client_login"
                                className="block px-4 py-2 hover:bg-gray-100"
                                >
                                    User
                                </Link>
                                <Link
                                to="/technician_login"
                                className="block px-4 py-2 hover:bg-gray-100"
                                >
                                    Technician
                                </Link>

                            </div>
                        
                    </div>
                    <Link to="/contact" className="hover:text-gray-200">Contact Us</Link>
                </div>
            </div>
        </nav>
    );
};
export default Navbar;