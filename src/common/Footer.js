import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white text-center py-4 mt-auto w-full flex flex-row items-center">
      <div className='w-[90%] text-center h-full items-center'>
        &copy; {new Date().getFullYear()} tennisliveindia.com
      </div>
      <div className='w-[9%] text-right text-xs h-full items-center'>
        <a href="/privacypolicy">Privacy Policy</a>

      </div>
    </footer>
  );
};

export default Footer;
