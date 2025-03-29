import React, { useEffect, useState } from 'react';
import { Box, Snackbar, TextareaAutosize } from '@mui/material';
import { BiSolidMessageRoundedDetail } from 'react-icons/bi';
import useApiCall from '../reusables/useApiCall';
import './ContactUs.css';

const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

const RequestPlayerInfo = ({ handleClose }) => {
    const [formData, setFormData] = useState({
        requesterName: '',
        requesterEmail: '',
        playerName: '',
        additionalDetails: '',
    });

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [actionMsg, setActionMsg] = useState('');
    const [message, setMessage] = useState("Please fill in all required fields");

    const { data, loading, error, setRequest } = useApiCall({ method: '', payload: [], url: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.requesterName.trim() || !formData.requesterEmail.trim() || !formData.playerName.trim()) {
            setOpenSnackbar(true);
        } else {
            let requestText = `From: ${formData.requesterName} - ${formData.requesterEmail}\n` +
                `---------------------------------\n` +
                `Player Name: ${formData.playerName}\n` +
                `Additional Details: ${formData.additionalDetails || 'None provided'}\n` +
                `---------------------------------\n` +
                `Request: Please provide information about this player.`;
            let payload = {
                to: "info@tennisindialive.com,tennisofindia@gmail.com,atul762@gmail.com",
                subject: `TennisIndiaLive - Player Info Request by ${formData.requesterName}`,
                text: requestText,
            };
            setRequest({ method: 'post', payload: payload, url: `${REACT_APP_API_URL}/email/send` });
            setActionMsg("Thank you for your message, We will revert!");
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    useEffect(() => {
        if (!loading && !error && data) {
            setActionMsg("Thank you for your message, We will revert!");
        } else if (error) {
            setActionMsg("Error while submitting request. Please email your query/suggestion on info@tennisindialive.com");
        }
    }, [loading, error]);

    return (
        <div className="m-1">
            <Box className="flex flex-col border-solid border-[0px] border-slate-400 w-full mx-auto rounded-xl p-4 md:p-8">
                <Box className="text-center mb-4">
                    <BiSolidMessageRoundedDetail size={70} style={{ color: 'navy' }} />
                    <div className="contact-title">Request Player Profile</div>
                    <div className="contact-desc">
                        Can’t find your favorite Indian player? 😲 No worries! Request their info here, and we’ll make sure they don’t feel left out! 🎾😆
                    </div>
                </Box>
                <Box className="w-full">
                    {actionMsg ? (
                        <div className="p-1 flex flex-col text-center">
                            <div className="contact-title">Thank you!</div>
                            <div className="contact-desc">
                                Your inputs are truly invaluable to us. We will get back to you at the earliest!
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col items-center w-full">
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
                            <input
                                placeholder="Player Name"
                                name="playerName"
                                value={formData.playerName}
                                onChange={handleChange}
                                required
                                className="w-full p-2 mb-4 border-solid border-2 border-slate-200 rounded-lg hover:border-green-500"
                            />
                            <TextareaAutosize
                                minRows={5}
                                placeholder="Additional Comments (optional)"
                                name="additionalDetails"
                                value={formData.additionalDetails}
                                onChange={handleChange}
                                className="w-full p-2 mb-4 border-solid border-2 border-slate-200 rounded-lg hover:border-green-500"
                            />
                            <div className='w-full flex flex-col md:flex-row gap-2'>
                                {!actionMsg && (
                                    <button
                                        className="p-2 bg-blue-800 text-white rounded-sm w-full md:w-[40%]"
                                        onClick={handleSubmit}
                                    >
                                        Request
                                    </button>
                                )}
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

export default RequestPlayerInfo;
