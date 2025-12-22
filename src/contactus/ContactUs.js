import React, { useEffect, useState } from 'react';
import { Box, Snackbar } from '@mui/material';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import { BiSolidMessageRoundedDetail } from 'react-icons/bi';
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
    const [message] = useState("Please fill in all required fields");

    const { data, loading, error, setRequest } = useApiCall({
        method: '',
        payload: [],
        url: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (
            !formData.requesterName.trim() ||
            !formData.requesterEmail.trim() ||
            !formData.additionalDetails.trim()
        ) {
            setOpenSnackbar(true);
            return;
        }

        const requestText =
            `From: ${formData.requesterName} - ${formData.requesterEmail}\n` +
            `---------------------------------\n` +
            `Query: ${formData.additionalDetails}\n` +
            `---------------------------------\n`;

        setRequest({
            method: 'post',
            payload: {
                to: "info@tennisindialive.com,tennisofindia@gmail.com,atul762@gmail.com",
                subject: `TennisIndiaLive - Player Info Request by ${formData.requesterName}`,
                text: requestText,
            },
            url: `${REACT_APP_API_URL}/email/send`,
        });

        setActionMsg("Thank you for your message!");
    };

    useEffect(() => {
        if (!loading && data) {
            setActionMsg("Thank you for your message! We’ll get back to you soon 🎾");
        } else if (error) {
            setActionMsg(
                "Something went wrong. Please email us at info@tennisindialive.com"
            );
        }
    }, [loading, data, error]);

    return (
        <div className="p-2">
            <Box
                className="
                mx-auto w-full max-w-5xl
                rounded-2xl
                bg-gradient-to-br from-[#0f172a] via-[#020617] to-black
                border border-white/10
                shadow-[0_0_40px_rgba(16,185,129,0.15)]
                flex flex-col lg:flex-row
                overflow-hidden
              "
            >
                {/* LEFT */}
                <Box className="w-full lg:w-1/2 p-6 md:p-10 text-center">
                    <BiSolidMessageRoundedDetail
                        size={72}
                        className="mx-auto mb-4 text-emerald-400 drop-shadow"
                    />

                    <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
                        Contact Us
                    </h2>

                    <p className="mt-4 text-sm md:text-base text-slate-300 leading-relaxed">
                        Got questions, feedback, or spotted an issue?
                        <br />
                        We love hearing from the tennis community 🎾
                        <br />
                        Drop us a message and help us improve!
                    </p>
                </Box>

                {/* RIGHT */}
                <Box className="w-full lg:w-1/2 p-6 md:p-10">
                    {actionMsg ? (
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-emerald-400">
                                Thank you!
                            </h3>
                            <p className="mt-2 text-slate-300">{actionMsg}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                placeholder="Your Name"
                                name="requesterName"
                                value={formData.requesterName}
                                onChange={handleChange}
                                className="
                                w-full px-4 py-2
                                rounded-lg
                                bg-slate-900
                                border border-white/10
                                text-white placeholder-slate-400
                                focus:outline-none focus:border-emerald-400
                                transition
                              "
                            />

                            <input
                                placeholder="Your Email"
                                name="requesterEmail"
                                value={formData.requesterEmail}
                                onChange={handleChange}
                                className="
                                w-full px-4 py-2
                                rounded-lg
                                bg-slate-900
                                border border-white/10
                                text-white placeholder-slate-400
                                focus:outline-none focus:border-emerald-400
                                transition
                              "
                            />

                            <TextareaAutosize
                                minRows={5}
                                placeholder="Enter your query / feedback..."
                                name="additionalDetails"
                                value={formData.additionalDetails}
                                onChange={handleChange}
                                className="
                                w-full px-4 py-2
                                rounded-lg
                                bg-slate-900
                                border border-white/10
                                text-white placeholder-slate-400
                                focus:outline-none focus:border-emerald-400
                                transition
                              "
                            />

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                    type="submit"
                                    className="
                                    flex-1 py-2 rounded-lg
                                    bg-gradient-to-r from-emerald-500 to-emerald-600
                                    text-black font-semibold
                                    hover:brightness-110
                                    transition
                                  "
                                >
                                    Submit
                                </button>

                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="
                                    flex-1 py-2 rounded-lg
                                    bg-slate-800
                                    border border-white/10
                                    text-slate-200
                                    hover:bg-slate-700
                                    transition
                                  "
                                >
                                    Close
                                </button>
                            </div>
                        </form>
                    )}

                    <Snackbar
                        open={openSnackbar}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                        autoHideDuration={4000}
                        onClose={() => setOpenSnackbar(false)}
                        message={message}
                    />
                </Box>
            </Box>
        </div>
    );
};

export default ContactUs;
