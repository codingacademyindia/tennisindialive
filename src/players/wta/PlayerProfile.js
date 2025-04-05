import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '../../common/stateHandlers/LoaderState';
import { Card, CardContent, CardMedia, Typography, Divider } from '@mui/material';

// Utility function to decode escaped Unicode (optional fallback)
const decodeUnicode = (str) => {
    return str.replace(/\\u[\dA-F]{4}/gi, (match) => {
        return String.fromCharCode(parseInt(match.replace(/\\u/, ''), 16));
    });
};

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
                const response = await fetch(`/player_jsons/wta/${player}.json`);
                if (!response.ok) throw new Error("Player data not found");
                const data = await response.json();
                document.title = `Tennis India Live - ${data.name || "Player Info"}`;
                // Decode bio to handle any escaped Unicode (optional)
                if (data.bio) {
                    data.bio = decodeUnicode(data.bio);
                }
                setPlayerData(data);
                setLoading(false);
            } catch (err) {
                setError("Unable to Load Player Info: " + err.message);
                setLoading(false);
            }
        };

        fetchPlayerInfo();
    }, [player]);

    if (loading) return <Loader />;
    if (error) return <p className="text-red-500 text-center text-lg p-5">{error}</p>;
    if (!playerData) return <p className="text-gray-500 text-center text-lg p-5">No player data available</p>;

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
            <Card className="max-w-6xl w-full shadow-xl rounded-lg bg-white overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                    <div className="relative w-full">
                        <CardMedia
                            component="img"
                            image={playerData.photo || '/images/players/wta/default.png'}
                            alt={playerData.name}
                            onError={(e) => { e.target.src = '/images/players/wta/default.png'; }}
                            className="h-[250px] sm:min-h-[250px] md:min-h-[250px] lg:min-h-[300px] w-full object-cover"
                        />
                        <Typography
                            className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-lg px-3 py-1 rounded-md"
                        >
                            {playerData.name}
                        </Typography>
                        {playerData.source && (
                            <Typography
                                className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-3 py-1 rounded-md"
                                variant="caption"
                            >
                                Image Source: {playerData.source}
                            </Typography>
                        )}
                    </div>

                    <CardContent className="p-6 h-full flex flex-col justify-center bg-gray-800">
                        <a
                            href="/players/wta"
                            className="text-blue-600 hover:underline text-sm sm:text-base mx-2"
                        >
                            ← Back to WTA Players
                        </a>
                        <div className="text-xs text-white mb-2 w-full text-right">
                            <b>Updated At: </b> {playerData.updated_at || "N/A"}
                        </div>
                        <div className="bg-gray-200 p-2 rounded-lg shadow-md">
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
                                            <td className="px-4 py-2 text-center">{row.singles || "N/A"}</td>
                                            <td className="px-4 py-2 text-center">{row.doubles || "N/A"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </div>

                <Divider className="my-4" />

                <CardContent className="p-6">
                    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Typography variant="body1" className="text-gray-700"><strong>Nationality:</strong> {playerData.nationality || "N/A"}</Typography>
                            <Typography variant="body1" className="text-gray-700"><strong>Age:</strong> {playerData.date_of_birth || "N/A"}</Typography>
                            <Typography variant="body1" className="text-gray-700"><strong>Height:</strong> {playerData.height || "N/A"}</Typography>
                            <Typography variant="body1" className="text-gray-700"><strong>Turned Pro:</strong> {playerData.turned_pro || "N/A"}</Typography>
                            <Typography variant="body1" className="text-gray-700"><strong>Coach:</strong> {playerData.coach || "N/A"}</Typography>
                            <Typography variant="body1" className="text-gray-700"><strong>Plays:</strong> {playerData.plays || "N/A"}</Typography>
                            <Typography variant="body1" className="text-gray-700"><strong>Birthplace:</strong> {playerData.birthplace || "N/A"}</Typography>
                        </div>
                    </div>

                    <Divider className="my-4" />

                    <div className="bg-slate-100 p-4 rounded-lg shadow-md">
                        <Typography variant="body1" className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                            <strong>Bio:</strong>
                        </Typography>
                        <div dangerouslySetInnerHTML={{ __html: playerData.bio || "No bio available" }} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PlayerProfile;