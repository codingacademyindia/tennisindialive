import React from 'react';
import { FaYoutube, FaTwitter, FaFacebook, FaMailBulk } from 'react-icons/fa';
import IconButton from '@mui/material/IconButton';
import EmailIcon from '@mui/icons-material/Email';

const SocialMedia = ({ handleOpen }) => {
    return (
        <header className="flex justify-between items-center p-2">
            <div className="flex flex-row space-x-4 whitespace-nowrap items-center">
                {/* <a href="https://www.youtube.com/TheTennisOfIndia" target="_blank" rel="noopener noreferrer" className="text-red-500">
                    <FaYoutube style={{ fontSize: '1.5rem' }} className="md:text-2xl lg:text-3xl" />
                </a> */}
                <a href="https://x.com/TennisIndiaLive" target="_blank" rel="noopener noreferrer" className="text-blue-500">
                    <FaTwitter style={{ fontSize: '1.5rem' }} className="md:text-2xl lg:text-3xl" />
                </a>
                {/* <a href="https://www.facebook.com/TheTennisOfIndia/" target="_blank" rel="noopener noreferrer" className="text-blue-700">
                    <FaFacebook style={{ fontSize: '1.5rem' }} className="md:text-2xl lg:text-3xl" />
                </a> */}
                {/* <FaMailBulk style={{ fontSize: '1.5rem' }} className="md:text-2xl lg:text-3xl" /> */}
                <IconButton color="inherit" onClick={handleOpen} >
                <EmailIcon style={{ fontSize: '1.5rem' }} className="md:text-2xl lg:text-3xl" />
                </IconButton>
            </div>

        </header>
    );
};

export default SocialMedia;
