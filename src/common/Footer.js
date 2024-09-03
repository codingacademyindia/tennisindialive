import React from 'react';
import { useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();

  // Determine if the link is active
  const isActive = (path) => location.pathname === path;

  return (
    <footer className="bg-gray-800 text-white text-center py-4 mt-auto w-full flex flex-col items-center">
      <div className="w-full text-center h-full items-center">
        &copy; {new Date().getFullYear()} tennisliveindia.com
      </div>
      <div className="w-full justify-center text-xs h-full items-center flex flex-row space-x-1">
        <a
          href="/aboutus"
          className={`px-2 border-r border-gray-400 ${isActive('/aboutus') ? 'text-yellow-500 font-bold' : ''}`}
        >
          About Us
        </a>
        <a
          href="/privacypolicy"
          className={`px-2 border-r border-gray-400 ${isActive('/privacypolicy') ? 'text-yellow-500 font-bold' : ''}`}
        >
          Privacy Policy
        </a>
        <a
          href="/contactus"
          className={`px-2 border-r border-gray-400 ${isActive('/contactus') ? 'text-yellow-500 font-bold' : ''}`}
        >
          Contact Us
        </a>
        <a
          href="/termsofservice"
          className={`px-2 ${isActive('/termsofservice') ? 'text-yellow-500 font-bold' : ''}`}
        >
          Terms Of Service
        </a>
      </div>
    </footer>
  );
};

export default Footer;
