import React, { useEffect, useState } from 'react';
import { Button, TextField, Box, Snackbar, Divider } from '@mui/material';
// import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import TextareaAutosize from '@mui/material';
import { BiSolidMessageRoundedDetail } from 'react-icons/bi'
import useApiCall from '../reusables/useApiCall';
import './ContactUs.css'
const REACT_APP_API_URL = process.env.REACT_APP_API_URL
const REACT_APP_EMAIL_DL = process.env.REACT_APP_EMAIL_DL



const ContactUs = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        question: '',
    });

    const [openSnackbar, setOpenSnackbar] = useState(false);

    const { data, loading, error, setRequest } = useApiCall({ method: '', payload: [], url: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (
            formData.name === '' ||
            formData.email.trim() === '' ||
            formData.question.trim() === ''
        ) {
            // Show a notification
            setOpenSnackbar(true);
        }
        else {
            let question = `From: ${formData.name} - ${formData.email} \n ---------------------------------\n ${formData.question}`
            let payload = {
                "to": "info@tennisindialive.com,tennisofindia@gmail.com,atul762@gmail.com",
                "subject": `TennisIndiaLive - Enquiry by ${formData.name}`,
                "text": question
            }
            setRequest({ method: 'post', payload: payload, url: REACT_APP_API_URL + '/email/send' });
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    let anchorOrigin = { vertical: 'bottom', horizontal: 'right' }; // Replace with your API endpoint

    const { vertical, horizontal } = anchorOrigin;
    return (
        <div className="m-5">
        <Box className="flex flex-row border-solid border-[1px] border-slate-400 w-[80%] mx-auto rounded-xl">
            <Box className="form-left">
                {/* <Box className='contact-icon'>  */}
                <BiSolidMessageRoundedDetail size={70} style={{ color: 'navy' }} />
                {/* </Box> */}
                <Box className="contact-title">

                    Contact Us

                </Box>

                <Box className="contact-desc">
                    Write to us with your queries and feedback for our initiative !</Box>
                {/* <Divider /> */}

            </Box>
            <Box className="form-right">
                <form onSubmit={handleSubmit}>


                    <input
                        placeholder="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-[80%] p-1 m-1 border-solid border-2 border-slate-200 rounded-lg hover:border-green-500"
                    />
                    <input
                        placeholder="Email"
                        name="email"
                        value={formData.email}
                        className="w-[80%] p-1 m-1 border-solid border-2 border-slate-10 rounded-lg hover:border-green-500"
                        onChange={handleChange}
                        required
                    />
                    {/* <input
                        placeholder="Contact Number"
                        name="number"
                        value={formData.number}
                        className="w-[80%] p-1 border-solid border-2 border-slate-10 rounded-lg hover:border-green-500"
                        onChange={handleChange}
                        required
                    /> */}


                    <textarea
                        rows="10"
                        cols="50"
                        placeholder="Enter your query here..."
                        name="question"
                        value={formData.question}
                        className="w-[80%] p-1 border-solid border-2 border-slate-10 rounded-lg hover:border-green-500"
                        onChange={handleChange}
                    />

                    <Button type="submit" variant="contained" className="form-submit" onClick={handleSubmit}>
                        Submit
                    </Button>
                </form>
                <Snackbar
                    open={openSnackbar}
                    anchorOrigin={{ vertical, horizontal }}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    message="Please fill in all fields"
                />
            </Box>




        </Box>
        </div>
    );
};

export default ContactUs;
