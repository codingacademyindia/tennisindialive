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
        <div className="max-w-4xl mx-auto p-1">
            <RequestModal
                open={open}
                handleClose={handleClose}
                title="Request To Add More Players"
                children={<RequestPlayerInfo />}
            />

            <div className="w-full flex flex-col sm:flex-row items-center justify-between border-b border-navy m-1 bg-slate-100 p-2">
                <div className="text-2xl font-bold text-left mb-2 sm:mb-0">ATP Players</div>

                <button
                    className="w-full sm:w-auto bg-blue-800 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base py-1 px-2 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 mb-2 sm:mb-0"
                    onClick={handleOpen}
                >
                    Missing a Player? Request Here! 🎾
                </button>

                <input
                    type="text"
                    placeholder="Search Player..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:w-[40%] mt-2 sm:mt-0 p-2 border rounded-md"
                    aria-label="Search Players"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                {filteredPlayers.length > 0 ? (
                    filteredPlayers.map((player, index) => (
                        <div key={index} className="p-2 border rounded-lg shadow-md text-center hover:bg-blue-200">
                            <a
                                href={`/player/atp/${player.player_name.replaceAll(" ", "-").toLowerCase()}`}
                                target="_blank"
                                className="bg-slate-10"
                            >
                                <div className="w-full mb-1 bg-green-700 text-white">
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
        </div>
    );
};

const PlayerImage = ({ player }) => {
    const [imgSrc, setImgSrc] = useState(player.photo);

    return (
        <CardMedia
            component="img"
            image={imgSrc}
            alt={player.player_name}
            className="w-full h-40 object-cover rounded-md"
            onError={() => setImgSrc('/images/players/atp/default.jpg')}
        />
    );
};

export default PlayersListATP;
