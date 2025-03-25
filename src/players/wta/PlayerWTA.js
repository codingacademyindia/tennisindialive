import { CardMedia } from "@mui/material";
import React, { useState, useEffect, useMemo } from "react";

const PlayersListWTA = () => {
    const [players, setPlayers] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("/player_jsons/player_list_wta.json") // Fetching from public folder
            .then((response) => response.json())
            .then((data) => setPlayers(data))
            .catch((error) => console.error("Error fetching players:", error));
    }, []);

    // Memoized filtered players to prevent unnecessary re-renders
    const filteredPlayers = useMemo(() => {
        return players.filter(player =>
            player.player_name.toLowerCase().includes(search.toLowerCase())
        );
    }, [players, search]);

    return (
        <div className="max-w-4xl mx-auto p-1">
            <div className="w-full flex flex-row  items-center border-solid border-navy border-b-[1px] m-1 bg-slate-100 ">
                <div className="text-2xl font-bold text-left  w-[50%]">WTA Players</div>

                {/* Search Input */}
                <input
                    type="text"
                    placeholder="Search Player..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-[50%] m-2 p-2 border rounded-md mb-4"
                    aria-label="Search Players"
                />
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPlayers.length > 0 ? (
                    filteredPlayers.map((player, index) => (
                        <div key={index} className="p-2 border rounded-lg shadow-md text-center hover:bg-blue-200">
                            <a
                                href={`/player/wta/${player.player_name.replaceAll(" ", "-").toLowerCase()}`}
                                target="_blank"
                                className=" bg-slate-10"
                            >
                                <div className=" w-full mb-1 bg-green-700 text-white">{player.player_name}</div>
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

// **Reusable Image Component with Error Handling**
const PlayerImage = ({ player }) => {

    return (
        <CardMedia
            component="img"
            image={player.photo}
            alt={player.player_name}
            className="w-full h-40 object-cover rounded-md"
            onError={(e) => e.target.src='/images/players/wta/default.png'}
        />
    );
};

export default PlayersListWTA;
