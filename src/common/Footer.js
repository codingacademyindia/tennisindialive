import React from 'react';
import { useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();

  // Determine if the link is active
  const isActive = (path) => location.pathname === path;

  return (
    <footer className="w-full mt-auto bg-gradient-to-r from-gray-900 to-gray-800 text-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* left: branding + note */}
          <div className="flex items-center space-x-3">
            {/* small inline tennis ball SVG */}
            {/* <span
              aria-hidden="true"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-yellow-500 text-gray-900"
              title="Tennis Live India"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="inline">
                <circle cx="12" cy="12" r="9" />
                <path d="M4 12a8 8 0 0 0 8 8" />
                <path d="M20 12a8 8 0 0 1-8 8" />
              </svg>
            </span> */}

            <div className="flex flex-col text-left">
              <span className="font-semibold text-white">tennisliveindia.com</span>
              <span className="text-xs text-gray-300">
                Created by{' '}
                <a
                  href="https://www.CodingAcademyIndia.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:underline"
                >
                  CodingAcademyIndia.com
                </a>
              </span>
            </div>
          </div>

          {/* center: copyright */}
          <div className="text-sm text-gray-300 text-center">
            &copy; {new Date().getFullYear()} tennisliveindia.com — All rights reserved
          </div>

          {/* right: links */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 text-xs">
            <a
              href="/aboutus"
              aria-current={isActive('/aboutus') ? 'page' : undefined}
              className={`px-2 py-1 rounded ${isActive('/aboutus') ? 'text-yellow-400 font-semibold' : 'text-gray-300 hover:text-yellow-400'} transition`}
            >
              About
            </a>

            <a
              href="/privacypolicy"
              aria-current={isActive('/privacypolicy') ? 'page' : undefined}
              className={`px-2 py-1 border-l border-gray-700 ${isActive('/privacypolicy') ? 'text-yellow-400 font-semibold' : 'text-gray-300 hover:text-yellow-400'} transition`}
            >
              Privacy
            </a>

            <a
              href="/contactus"
              aria-current={isActive('/contactus') ? 'page' : undefined}
              className={`px-2 py-1 border-l border-gray-700 ${isActive('/contactus') ? 'text-yellow-400 font-semibold' : 'text-gray-300 hover:text-yellow-400'} transition`}
            >
              Contact
            </a>

            <a
              href="/termsofservice"
              aria-current={isActive('/termsofservice') ? 'page' : undefined}
              className={`px-2 py-1 border-l border-gray-700 ${isActive('/termsofservice') ? 'text-yellow-400 font-semibold' : 'text-gray-300 hover:text-yellow-400'} transition`}
            >
              Terms
            </a>
          </div>
        </div>

        {/* subtle divider */}
        <div className="mt-4 border-t border-gray-800 pt-3 text-center text-xs text-gray-500">
          Built with ❤️ for the tennis community.
        </div>
      </div>
    </footer>
  );
};

export default Footer;