import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../common/stateHandlers/LoaderState';
import { Card, CardContent, CardMedia, Typography, Divider } from '@mui/material';

const PlayerProfile = () => {
    document.title = "Tennis India Live - Player Info";
    const { player } = useParams();
    const [playerData, setPlayerData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPlayerInfo = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/player_jsons/atp/${player}.json`); // Adjust path as per JSON file location
                const data = await response.json();
                setPlayerData(data);
                setLoading(false);
            } catch (error) {
                setError("Unable to Load Player Info");
                setLoading(false);
            }
        };

        fetchPlayerInfo();
    }, [player]);

    if (loading) return <Loader />;
    if (error) return <p className="text-blue-500 text-center text-lg p-5">{error}</p>;

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
            {playerData && (
                <Card className="max-w-6xl w-full shadow-xl rounded-lg bg-white overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                        <CardMedia
                            component="img"
                            image={playerData.photo}
                            alt={playerData.name}
                            className="w-full h-full object-cover"
                        />

                        {/* Name and Ranking Section */}
                        <CardContent className="p-6 h-full flex flex-col justify-center bg-gray-800">
                            <Typography variant="h4" className="font-bold text-white mb-4">
                                {playerData.name}
                            </Typography>

                            {/* Table Format for Singles and Doubles */}
                            <div className="bg-gray-200 p-4 rounded-lg shadow-md">
                                <table className="w-full border border-gray-300 text-sm text-left shadow-lg rounded-lg overflow-hidden">
                                    <thead>
                                        <tr className="bg-gray-800 text-white">
                                            <th className="px-4 py-2 w-[40%]"></th>
                                            <th className="px-4 py-2 text-center">Singles</th>
                                            <th className="px-4 py-2 text-center">Doubles</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { label: "Current Rank", singles: playerData.singles.current_rank, doubles: playerData.doubles.current_rank },
                                            { label: "Career High", singles: playerData.singles.career_high_rank, doubles: playerData.doubles.career_high_rank },
                                            { label: "Titles", singles: playerData.singles.career_titles, doubles: playerData.doubles.career_titles },
                                            { label: "Career Wins", singles: playerData.singles.career_wins, doubles: playerData.doubles.career_wins },
                                            { label: "YTD Wins", singles: playerData.singles.ytd_wins, doubles: playerData.doubles.ytd_wins }
                                        ].map((row, index) => (
                                            <tr key={row.label} className={index % 2 === 0 ? "bg-gray-100" : "bg-white"}>
                                                <td className="px-4 py-2 font-semibold text-gray-700">{row.label}</td>
                                                <td className="px-4 py-2 text-center">{row.singles}</td>
                                                <td className="px-4 py-2 text-center">{row.doubles}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </div>

                    <Divider className="my-4" />

                    {/* Additional Player Information */}
                    <CardContent className="p-6">
                        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Typography variant="body1" className="text-gray-700"><strong>Nationality:</strong> {playerData.nationality}</Typography>
                                <Typography variant="body1" className="text-gray-700"><strong>Age:</strong> {playerData.date_of_birth}</Typography>
                                <Typography variant="body1" className="text-gray-700"><strong>Weight:</strong> {playerData.weight}</Typography>
                                <Typography variant="body1" className="text-gray-700"><strong>Turned Pro:</strong> {playerData.turned_pro}</Typography>
                                <Typography variant="body1" className="text-gray-700"><strong>Coach:</strong> {playerData.coach}</Typography>
                                <Typography variant="body1" className="text-gray-700"><strong>Plays:</strong> {playerData.plays}</Typography>
                                <Typography variant="body1" className="text-gray-700"><strong>Birthplace:</strong> {playerData.birthplace}</Typography>
                            </div>
                        </div>

                        <Divider className="my-4" />

                        {/* Bio Section */}
                        <Typography variant="body1" className="text-gray-800 leading-relaxed">
                            <strong>Bio:</strong> {playerData.bio}
                        </Typography>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default PlayerProfile;
