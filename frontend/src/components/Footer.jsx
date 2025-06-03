import React from 'react'
import { FaInstagram, FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <div className=' border border-gray-900 rounded-md text-gray-900 pt-8 px-6 md:px-16 lg:px-24 xl:px-32'>
        <div className='flex flex-wrap justify-between gap-12 md:gap-6'>
            <div className='max-w-80'>
                <p className='text-2xl font-bold mb-4 text-gray-800'>
                    GharBata
                </p>
                <p className='text-sm'>GharBata is a trusted in-home technician service platform
                    that connects skilled professionals with customers in need of reliable 
                    and timely support-right at their doorstep.
                </p>
                <div className='flex items-center gap-3 mt-4 text-gray-600'>
                    <div className='hover:text-black cursor-pointer'><FaInstagram size={24} /></div>
                    <div className='hover:text-black cursor-pointer'><FaFacebookF size={24}/></div>
                    <div className='hover:text-black cursor-pointer'><FaTwitter size={24}/></div>
                    <div className='hover:text-black cursor-pointer'><FaLinkedinIn size={24}/></div>
                </div>
            </div>
            <div>
            <p className='text-lg text-gray-800'>COMPANY</p>
            <ul className='mt-3 flex flex-col gap-2 text-sm'>
                <li><a href='#'>About</a></li>
                <li><a href='#'>Careers</a></li>
                <li><a href='#'>Press</a></li>
                <li><a href='#'>Blog</a></li>
                <li><a href='#'>Partners</a></li>
            </ul>
        </div>
        <div>
            <p className='text-lg text-gray-800'>SUPPORT</p>
            <ul className='mt-3 flex flex-col gap-2 text-sm'>
                <li><a href='#'>Help Center</a></li>
                <li><a href='#'>Safety Information</a></li>
                <li><a href='#'>Contact Us</a></li>
            </ul>
        </div>
        <div className='max-w-80'>
            <p className='text-lg text-gray-800'>STAY UPDATED</p>
            <p className='mt-3 text-sm'>Subscribe to our newsletter for inspiration and special offers.</p>
        <div className='flex items-center mt-4'>
            <input type='text' className='bg-white rounded-l border border-gray-800 h-9 px-3 outline-none' placeholder='Your email'/>
            <button className='flex items-center justify-center bg-black h-9 w-9 aspect-square rounded-r'>
               <svg className="w-4 h-4 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 12H5m14 0-4 4m4-4-4-4" />
                            </svg>
            </button>
        </div>
        </div>
    </div>
    <hr className='border-gray-400 mt-8'/>
    <div className='flex flex-col md:flex-row gap-2 items-center justify-between py-5'>
        <p>{new Date().getFullYear()} @ GharBata. All rights reserved.</p>
        <ul className='flex items-center gap-4'>
            <li><a href='#'>Privacy</a></li>
            <li><a href='#'>Terms</a></li>
            <li><a href='#'>Sitemap</a></li>
        </ul>
    </div>
    </div>

  );
};

export default Footer;