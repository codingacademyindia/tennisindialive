import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white text-center py-4 mt-auto w-full">
      <div>
        &copy; {new Date().getFullYear()} tennisliveindia.com
      </div>
    </footer>
  );
};

export default Footer;
