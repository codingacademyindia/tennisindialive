import React, { useEffect, useState } from 'react';
import { Box, Snackbar } from '@mui/material';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { BiSolidMessageRoundedDetail } from 'react-icons/bi';
import './ContactUs.css';
import useApiCall from '../reusables/useApiCall';

const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

const ContactUs = ({ handleClose }) => {
    const [formData, setFormData] = useState({
        requesterName: '',
        requesterEmail: '',
        additionalDetails: '',
    });
    
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [actionMsg, setActionMsg] = useState(null);
    const [isPosted, setIsPosted] = useState(false);
    const [message, setMessage] = useState("Please fill in all required fields");

    const { data, loading, error, setRequest } = useApiCall({ method: '', payload: [], url: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (
            formData.requesterName.trim() === '' ||
            formData.requesterEmail.trim() === '' ||
            formData.additionalDetails.trim() === ''
        ) {
            setOpenSnackbar(true);
        } else {
            let requestText = `From: ${formData.requesterName} - ${formData.requesterEmail}\n` +
                `---------------------------------\n` +
                `Query: ${formData.additionalDetails || 'None provided'}\n` +
                `---------------------------------\n`;

            let payload = {
                to: "info@tennisindialive.com,tennisofindia@gmail.com,atul762@gmail.com",
                subject: `TennisIndiaLive - Player Info Request by ${formData.requesterName}`,
                text: requestText,
            };
            setRequest({ method: 'post', payload: payload, url: `${REACT_APP_API_URL}/email/send` });
            setActionMsg("Thank you for your message, We will revert !");
            setIsPosted(true);
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    useEffect(() => {
        if (!loading && !error && data) {
            setActionMsg("Thank you for your message, We will revert !");
        } else if (error) {
            setActionMsg("Error while submitting request. Please email your query/suggestion on info@tennisindialive.com");
        }
    }, [loading, error]);

    return (
        <div className="m-1">
            <Box className="flex flex-col md:flex-col lg:flex-row border-solid border-[0px] bg-slate-100 border-slate-400 mx-auto rounded-xl w-full">
                <Box className=" w-full p-4 md:p-8 text-center">
                    <BiSolidMessageRoundedDetail size={70} className=" hidden md:block text-blue-800 mx-auto" />                 
                    
                    <div className="contact-desc">
                        Got questions, feedback or observed any issues on this site? Hit us up—we love a good chat! 😃 If our site is useful to you, drop a few kind words and make our day even brighter! 🌟
                    </div>
                </Box>
                <Box className=" w-full p-4 md:p-8">
                    {actionMsg ? (
                        <div className="p-1 flex flex-col">
                            <div className="contact-title">Thank you !</div>
                            <div className="contact-desc">
                                Your inputs are truly invaluable to us, We will get back to you at the earliest !
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <input
                                placeholder="Your Name"
                                name="requesterName"
                                value={formData.requesterName}
                                onChange={handleChange}
                                required
                                className="w-full p-2 mb-4 border-solid border-2 border-slate-200 rounded-lg hover:border-green-500"
                            />
                            <input
                                placeholder="Your Email"
                                name="requesterEmail"
                                value={formData.requesterEmail}
                                onChange={handleChange}
                                required
                                className="w-full p-2 mb-4 border-solid border-2 border-slate-200 rounded-lg hover:border-green-500"
                            />
                            <TextareaAutosize
                                minRows={5}
                                placeholder="Enter your query/feedback here..."
                                name="additionalDetails"
                                value={formData.additionalDetails}
                                onChange={handleChange}
                                className="w-full p-2 mb-4 border-solid border-2 border-slate-200 rounded-lg hover:border-green-500"
                            />
                            <div className="w-full flex flex-col md:flex-row gap-2">
                                <button
                                    className="p-2 bg-blue-800 text-white rounded-sm w-full md:w-[40%]"
                                    onClick={handleSubmit}
                                >
                                    Submit
                                </button>
                                <button
                                    className="p-2 bg-blue-800 text-white rounded-sm w-full md:w-[40%]"
                                    onClick={handleClose}
                                >
                                    Close
                                </button>
                            </div>
                        </form>
                    )}
                    <Snackbar
                        open={openSnackbar}
                        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                        autoHideDuration={6000}
                        onClose={handleCloseSnackbar}
                        message={message}
                    />
                </Box>
            </Box>
        </div>
    );
};

export default ContactUs;
