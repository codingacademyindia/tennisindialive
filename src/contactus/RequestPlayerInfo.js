import React, { useEffect, useState } from 'react';
import { Button, TextField, Box, Snackbar, Divider } from '@mui/material';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { BiSolidMessageRoundedDetail } from 'react-icons/bi';
import useApiCall from '../reusables/useApiCall';

import './ContactUs.css'; // Assuming you'll create a new CSS file or reuse ContactUs.css

const REACT_APP_API_URL = process.env.REACT_APP_API_URL;
const REACT_APP_EMAIL_DL = process.env.REACT_APP_EMAIL_DL;

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
        if (
            formData.requesterName.trim() === '' ||
            formData.requesterEmail.trim() === '' ||
            formData.playerName.trim() === ''
        ) {
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
            setActionMsg("Thank you for your message, We will revert !")
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const anchorOrigin = { vertical: 'top', horizontal: 'left' };
    const { vertical, horizontal } = anchorOrigin;

    useEffect(() => {
        if (!loading && !error && data) {
            setActionMsg("Thank you for your message, We will revert !")
            // handleClose()
        }
        else if (error) {
            setActionMsg("Error while submitting request. Please email your query/suggestion on info@tennisindialive.com")
        }

    }, [loading, error])


    let objAction = (<div className="p-1 flex flex-col">
        <div className="contact-title">Thank you !</div>
        <div className="contact-desc">
            Your inputs are truly invaluable to us, We will get back to you at the earliest !
        </div>
    </div>)
    return (
        <div className="m-1">
            <Box className="flex flex-row border-solid border-[0px] border-slate-400 w-full mx-auto rounded-xl">
                <Box className="form-left">
                    <BiSolidMessageRoundedDetail size={70} style={{ color: 'navy' }} />
                    <Box className="contact-title">Request Player Profile</Box>
                    <Box className="contact-desc">
                    Can’t find your favorite Indian player? 😲 No worries! Request their info here, and we’ll make sure they don’t feel left out! 🎾😆
                    </Box>
                </Box>
                <Box className="form-right">
                    {actionMsg ? objAction : <form onSubmit={handleSubmit}>
                        <input
                            placeholder="Your Name"
                            name="requesterName"
                            value={formData.requesterName}
                            onChange={handleChange}
                            required
                            className="w-[80%] p-1 m-1 border-solid border-2 border-slate-200 rounded-lg hover:border-green-500"
                        />
                        <input
                            placeholder="Your Email"
                            name="requesterEmail"
                            value={formData.requesterEmail}
                            onChange={handleChange}
                            required
                            className="w-[80%] p-1 m-1 border-solid border-2 border-slate-200 rounded-lg hover:border-green-500"
                        />
                        <input
                            placeholder="Player Name"
                            name="playerName"
                            value={formData.playerName}
                            onChange={handleChange}
                            required
                            className="w-[80%] p-1 m-1 border-solid border-2 border-slate-200 rounded-lg hover:border-green-500"
                        />
                        <TextareaAutosize
                            minRows={5}
                            placeholder="Additional Comments (optional)"
                            name="additionalDetails"
                            value={formData.additionalDetails}
                            onChange={handleChange}
                            className="w-[80%] p-1 m-1 border-solid border-2 border-slate-200 rounded-lg hover:border-green-500"
                        />

                    </form>}
                    <div className='w-full flex flex-row'>
                     
                    {!actionMsg && <button className="p-2 m-1 bg-blue-800 text-white rounded-sm  w-[40%]"
                            onClick={handleSubmit}>
                            Request
                        </button>}
                        <button
                            className="p-2 m-1 bg-blue-800 text-white rounded-sm float-right w-[40%]"
                            onClick={handleClose}
                        >
                            Close
                        </button>
                    </div>
                    <Snackbar
                        open={openSnackbar}
                        anchorOrigin={{ vertical, horizontal }}
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