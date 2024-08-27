import React from 'react';
import { FaYoutube, FaTwitter, FaFacebook } from 'react-icons/fa';

const SocialMedia = () => {
    return (
        <header className="flex justify-between items-center p-4">
            <div className="flex flex-row space-x-4 whitespace-nowrap">
                <a href="https://www.youtube.com/TheTennisOfIndia" target="_blank" rel="noopener noreferrer" className="text-red-500">
                    <FaYoutube style={{ fontSize: '1.5rem' }} className="md:text-2xl lg:text-3xl" />
                </a>
                <a href="https://x.com/TennisIndiaLive" target="_blank" rel="noopener noreferrer" className="text-blue-500">
                    <FaTwitter style={{ fontSize: '1.5rem' }} className="md:text-2xl lg:text-3xl" />
                </a>
                <a href="https://www.facebook.com/TheTennisOfIndia/" target="_blank" rel="noopener noreferrer" className="text-blue-700">
                    <FaFacebook style={{ fontSize: '1.5rem' }} className="md:text-2xl lg:text-3xl" />
                </a>
            </div>

        </header>
    );
};

export default SocialMedia;
