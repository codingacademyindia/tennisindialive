import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FixtureResults = () => {
    const [rankingsData, setRankingsData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRankings = async () => {
            const options = {
                method: 'GET',
                url: 'https://tennisapi1.p.rapidapi.com/api/tennis/events/19/7/2024',
                headers: {
                    'x-rapidapi-key': '49e3a5304emsh7795687cbb43a6ep1746dcjsn8338ac954795',
                    'x-rapidapi-host': 'tennisapi1.p.rapidapi.com'
                }
            };

            try {
                const response = await axios.request(options);
                setRankingsData(response.data['events']);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchRankings();
    }, []);

    function fetchResultRecord() {
        return rankingsData.map((item) =>
            <div>
                <div>{item.tournament.name}</div>
                <div>{item.homeTeam.name}</div>
                <div>{item.awayTeam.name}</div>
            </div>
        )
    }

    return (
        <div>
            <h2>Tennis Rankings</h2>
            {error && <p>Error: {error}</p>}
            {rankingsData && (
                <div>
                    <p>Rankings Data:</p>
                    {/* <pre>{JSON.stringify(rankingsData, null, 2)}</pre> */}
                    {fetchResultRecord()}
                </div>
            )}
        </div>
    );
};

export default FixtureResults;
