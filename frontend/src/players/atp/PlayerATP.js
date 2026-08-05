import { Button, CardMedia } from "@mui/material";
import React, { useState, useEffect, useMemo } from "react";
import RequestModal from "../../contactus/RequestModal";
import RequestPlayerInfo from "../../contactus/RequestPlayerInfo";

const PlayersListATP = () => {
    const [players, setPlayers] = useState([]);
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    document.title = `Tennis India Live - ATP Players`;

    useEffect(() => {
        fetch("/player_jsons/player_list_atp.json")
            .then((response) => response.json())
            .then((data) => setPlayers(data))
            .catch((error) => console.error("Error fetching players:", error));
    }, []);

    const filteredPlayers = useMemo(() => {
        return players.filter(player =>
            player.player_name.toLowerCase().includes(search.toLowerCase())
        );
    }, [players, search]);

    return (
        <div className="max-w-5xl mx-auto p-4">
            {/* Informational Section for AdSense and Users */}
           

            {/* Request Button and Search Bar */}
            <RequestModal open={open} handleClose={handleClose} title="Request To Add More Players" children={<RequestPlayerInfo />} />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-100 border p-3 rounded-md mb-4 space-y-3 sm:space-y-0">
                <div className="text-2xl font-bold text-left">ATP Players</div>
                <button
                    className="bg-blue-800 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95"
                    onClick={handleOpen}
                >
                    Missing a Player? Request Here 🎾
                </button>
                <input
                    type="text"
                    placeholder="Search Player..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-1/3 p-2 border rounded-md"
                    aria-label="Search Players"
                />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 text-gray-800 p-4 rounded-md mb-4 text-sm">
                <p>This page showcases atp profiles of Indian tennis players, including names, photos, and profile links. You can search by name and request missing players via the button below. Player pages contain official atp rankings and match stats, updated regularly.</p>
            </div>

            {/* Player Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPlayers.length > 0 ? (
                    filteredPlayers.map((player, index) => (
                        <div key={index} className="p-2 border rounded-lg shadow-md text-center hover:bg-blue-100">
                            <a
                                href={`/player/atp/${player.player_name.replaceAll(" ", "-").toLowerCase()}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <div className="w-full mb-1 bg-green-700 text-white py-1 rounded-t-md">
                                    {player.player_name}
                                </div>
                                <PlayerImage player={player} />
                            </a>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 col-span-full">No players found</p>
                )}
            </div>

            {/* FAQ Section */}
            <div className="bg-slate-100 border border-slate-300 rounded-md p-4 mt-6 text-sm">
                <h3 className="font-semibold text-md mb-2">Frequently Asked Questions</h3>
                <ul className="list-disc list-inside">
                    <li><strong>How often is this updated?</strong> Player data is synced periodically with official atp and ITF sources.</li>
                    <li><strong>Can I request a missing player?</strong> Yes! Click the "Request Here" button to submit a name.</li>
                    <li><strong>What kind of player info is available?</strong> You'll find name, profile photo, match results, and live rankings where applicable.</li>
                </ul>
            </div>
        </div>
    );
};

// Image Component with Fallback
const PlayerImage = ({ player }) => {
    return (
        <CardMedia
            component="img"
            image={player.photo}
            alt={player.player_name}
            className="w-full h-40 object-cover rounded-md"
            onError={(e) => e.target.src = '/images/players/atp/default.png'}
        />
    );
};

export default PlayersListATP;
