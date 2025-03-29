import React, { useEffect, useState } from 'react';
import { Button, TextField, Box, Snackbar, Divider } from '@mui/material';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { BiSolidMessageRoundedDetail, BiSolidSmile  } from 'react-icons/bi';
import useApiCall from '../reusables/useApiCall';
import { BiSmile } from 'react-icons/bi';

import './ContactUs.css'; // Assuming you'll create a new CSS file or reuse ContactUs.css

const REACT_APP_API_URL = process.env.REACT_APP_API_URL;
const REACT_APP_EMAIL_DL = process.env.REACT_APP_EMAIL_DL;

const ContactUs = ({ handleClose }) => {
    const [formData, setFormData] = useState({
        requesterName: '',
        requesterEmail: '',
        playerName: '',
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
            setActionMsg("Thank you for your message, We will revert !")
            setIsPosted(true)
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
            <Box className="flex flex-row border-solid border-[0px] border-slate-400 w-full  mx-auto rounded-xl">
                {!isPosted && <Box className="form-left">
                    {/* <Box className='contact-icon'>  */}
                    <BiSolidMessageRoundedDetail size={70} style={{ color: 'navy' }} />

                    {/* </Box> */}
                    <Box className="contact-title">

                        Contact Us

                    </Box>

                    <Box className="contact-desc">
                        <span>
                        Got questions, feedback or observed any issues on this site? Hit us up—we love a good chat! 😃 If our site is useful to you, drop a few kind words and make our day even brighter! 🌟
                        </span>
                    </Box>
                    {/* <BiSmile size={40} style={{ color: 'orange' }} /> */}
                    {/* <Divider /> */}

                </Box>}
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

                        <TextareaAutosize
                            minRows={5}
                            placeholder="Enter your query/feedback here..."
                            name="additionalDetails"
                            value={formData.additionalDetails}
                            onChange={handleChange}
                            className="w-[80%] p-1 m-1 border-solid border-2 border-slate-200 rounded-lg hover:border-green-500"
                        />

                    </form>}
                    <div className='w-full flex flex-row'>

                        {!actionMsg && <button className="p-2 m-1 bg-blue-800 text-white rounded-sm  w-[40%]"
                            onClick={handleSubmit}>
                            Submit
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

export default ContactUs;