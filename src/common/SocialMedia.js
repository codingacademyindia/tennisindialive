import React from 'react';
import { FaYoutube, FaTwitter, FaFacebook } from 'react-icons/fa';

const SocialMedia = () => {
    return (
        <header className="flex justify-between items-center p-4">
            <div className="hidden md:flex space-x-4">
                <a href="https://www.youtube.com/TennisIndiaLive" target="_blank" rel="noopener noreferrer" className="text-red-500">
                    <FaYoutube size={30} />
                </a>
                <a href="https://x.com/TennisOfIndia" target="_blank" rel="noopener noreferrer" className="text-blue-500">
                    <FaTwitter size={30} />
                </a>
                <a href="https://www.facebook.com/TheTennisOfIndia/" target="_blank" rel="noopener noreferrer" className="text-blue-700">
                    <FaFacebook size={30} />
                </a>
            </div>
        </header>
    );
};

export default SocialMedia;
