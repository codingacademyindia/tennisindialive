import React, { useEffect, useState } from 'react';
import { BiSolidMessageRoundedDetail } from 'react-icons/bi';
import useApiCall from '../reusables/useApiCall';

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

    const handleCloseSnackbar = () => setOpenSnackbar(false);

    useEffect(() => {
        if (!loading && !error && data) {
            setActionMsg("Thank you for your message, We will revert!");
        } else if (error) {
            setActionMsg("Error while submitting request. Please email your query/suggestion on info@tennisindialive.com");
        }
    }, [loading, error]);

    return (
        <div className="m-2 p-4 max-w-xl mx-auto shadow-lg rounded-xl">
            <div className="text-center mb-4">
                <BiSolidMessageRoundedDetail size={70} className=" hidden md:block text-blue-800 mx-auto" />
                <h2 className="text-lg font-semibold">Request Player Profile</h2>
                <p className="text-gray-600 text-sm">
                    Can’t find your favorite Indian player? 😲 No worries! Request their info here, and we’ll make sure they don’t feel left out! 🎾😆
                </p>
            </div>
            {actionMsg ? (
                <div className="text-center">
                    <h3 className="text-lg font-semibold">Thank you!</h3>
                    <p className="text-gray-600">Your inputs are truly invaluable to us. We will get back to you at the earliest!</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Your Name"
                        name="requesterName"
                        value={formData.requesterName}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <input
                        type="email"
                        placeholder="Your Email"
                        name="requesterEmail"
                        value={formData.requesterEmail}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <input
                        type="text"
                        placeholder="Player Name"
                        name="playerName"
                        value={formData.playerName}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <textarea
                        placeholder="Additional Comments (optional)"
                        name="additionalDetails"
                        value={formData.additionalDetails}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                        rows={4}
                    />
                    <div className="flex flex-col md:flex-row gap-2">
                        {!actionMsg && (
                            <button type="submit" className="w-full md:w-1/2 p-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700">
                                Request
                            </button>
                        )}
                        <button
                            type="button"
                            className="w-full md:w-1/2 p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                            onClick={handleClose}
                        >
                            Close
                        </button>
                    </div>
                </form>
            )}
            {openSnackbar && (
                <div className="mt-4 p-2 bg-red-100 text-red-700 text-sm text-center rounded-md">
                    {message}
                </div>
            )}
        </div>
    );
};

export default RequestPlayerInfo;