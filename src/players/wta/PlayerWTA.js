import React, { useState, useEffect } from "react";

const PlayersListWTA = () => {
    const [players, setPlayers] = useState([]);
    const [filteredPlayers, setFilteredPlayers] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch("/player_jsons/player_list_wta.json") // Fetching from public folder
            .then((response) => response.json())
            .then((data) => {
                setPlayers(data);
                setFilteredPlayers(data); // Initialize filtered list
            })
            .catch((error) => console.error("Error fetching players:", error));
    }, []);

    // Handle Search Input
    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setSearch(query);

        // Filter players based on name
        const filtered = players.filter(player =>
            player.player_name.toLowerCase().includes(query)
        );

        setFilteredPlayers(filtered);
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold text-center mb-4">ATP Players</h2>

            {/* Search Input */}
            <input
                type="text"
                placeholder="Search Player..."
                value={search}
                onChange={handleSearch}
                className="w-full p-2 border rounded-md mb-4"
            />

            {/* Players Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredPlayers.length > 0 ? (
                    filteredPlayers.map((player, index) => (
                        <div key={index} className="p-4 border rounded-lg shadow-md text-center">
                            <img
                                src={player.photo}
                                alt={player.player_name}
                                className="w-full h-40 object-cover rounded-md"
                            />
                            <a
                                href={`/player/${player.player_name.replaceAll(" ", "-").toLowerCase()}`}
                                target="_blank"
                                className="text-blue-900 underline text-lg p-1"
                            >
                                {player.player_name}
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

export default PlayersListWTA;
