import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FixtureResults = () => {
    const [rankingsData, setRankingsData] = useState(null);
    const [error, setError] = useState(null);

    function groupItems(items) {
        const grouped = items.reduce((acc, item) => {
            const key = item.tournament.name;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(item);
            return acc;
        }, {});
        return grouped

    }

    useEffect(() => {
        const fetchRankings = async () => {
       
            const options = {
                method: 'GET',
                url: 'https://tennisapi1.p.rapidapi.com/api/tennis/events/23/7/2024',
                headers: {
                  'x-rapidapi-key': 'b40a588570mshd0ab93b20a9f16dp1cfbccjsneecf38833008',
                  'x-rapidapi-host': 'tennisapi1.p.rapidapi.com'
                }
              };
              

            try {
                const response = await axios.request(options);
                setRankingsData(groupItems(response.data['events']));
            } catch (error) {
                setError(error.message);
            }
        };

        fetchRankings();
    }, []);

    function formatTennisScoreSimple(homeScore, awayScore) {
        // Extract the sets' scores
        const homePeriod1 = homeScore.period1 || 0;
        const homePeriod2 = homeScore.period2 || 0;
        const awayPeriod1 = awayScore.period1 || 0;
        const awayPeriod2 = awayScore.period2 || 0;

        // Handle tiebreak scores if present
        const homePeriod2TieBreak = homeScore.period2TieBreak || '';
        const awayPeriod2TieBreak = awayScore.period2TieBreak || '';

        // Format the scores
        const scores = [];
        scores.push(`${homePeriod1}-${awayPeriod1}`);

        if (homePeriod2TieBreak && awayPeriod2TieBreak) {
            scores.push(`${homePeriod2}-${awayPeriod2} (${homePeriod2TieBreak}-${awayPeriod2TieBreak})`);
        } else {
            scores.push(`${homePeriod2}-${awayPeriod2}`);
        }

        return scores.join(', ');
    }

    function formatTennisScoreDom(homeScore, awayScore) {
        // Extract the sets' scores
        const homePeriod1 = homeScore.period1 || 0;
        const homePeriod2 = homeScore.period2 || 0;
        const awayPeriod1 = awayScore.period1 || 0;
        const awayPeriod2 = awayScore.period2 || 0;

        // Handle tiebreak scores if present
        const homePeriod2TieBreak = homeScore.period2TieBreak || '';
        const awayPeriod2TieBreak = awayScore.period2TieBreak || '';

        // Format the scores
        const homeScores = [];
        const awayScores = [];

        homeScores.push(`${homePeriod1}`);
        awayScores.push(`${awayPeriod1}`);

        if (homePeriod2TieBreak && awayPeriod2TieBreak) {
            homeScores.push(`${homePeriod2} (${homePeriod2TieBreak})`);
            awayScores.push(`${awayPeriod2} (${awayPeriod2TieBreak})`);
        } else {
            homeScores.push(`${homePeriod2}`);
            awayScores.push(`${awayPeriod2}`);
        }

        return (
            <div className="flex flex-row space-x-2">
                <div className="home-score">
                    {homeScores.map((score, index) => (
                        <div key={index}>{score}</div>
                    ))}
                </div>
                <div className="away-score">
                    {awayScores.map((score, index) => (
                        <div key={index}>{score}</div>
                    ))}
                </div>
            </div>
        );
    }



    function fetchScoreRecord(item) {
        let countryName = "india"
        let objDom = []

        try {
            let p1 = item['homeTeam']
            let p2 = item['awayTeam']
            // if (!item.tournament.name.toLowerCase().includes('davis cup') && !item.tournament.name.toLowerCase().includes('billie jean king cup')) {
            const uniqueTournament = item.tournament.uniqueTournament;
            if (uniqueTournament.name) {
                if (hasIndian(item)) {
                    objDom = (<div className="flex flex-row w-full">
                        <div className='w-[10%]'>
                            {item?.roundInfo?.name} - {item?.status?.type}
                        </div>
                        <div>{readableTimeStamp(item.startTimestamp)}</div>
                        <div className="flex flex-col w-[20%]">
                            <div key={item.id} className="ml-4">{item.homeTeam.name}</div>
                            <div key={item.id} className="ml-4">{item.awayTeam.name}</div>
                        </div>
                        <div className='w-[20%]'>{formatTennisScoreDom(item['homeScore'], item['awayScore'])}</div>

                    </div>)
                }
            }
            // }
        }
        catch (err) {
            console.error(err)
        }

        return objDom
    }

    function hasIndian(item) {
        let countryName = "india"

        try {
            let p1 = item['homeTeam']
            let p2 = item['awayTeam']
            // if (!item.tournament.name.toLowerCase().includes('davis cup') && !item.tournament.name.toLowerCase().includes('billie jean king cup')) {
            const uniqueTournament = item.tournament.uniqueTournament;
            if (uniqueTournament.name) {
                if (!uniqueTournament.name.toLowerCase().includes('doubles')) {
                    if (
                        (p1.country && p1.country.name.toLowerCase() === countryName) ||
                        (p2.country && p2.country.name.toLowerCase() === countryName)
                    ) {
                        return true

                    }
                } else {
                    const p1a = p1.subTeams[0];
                    const p1b = p1.subTeams[1];
                    const p2a = p2.subTeams[0];
                    const p2b = p2.subTeams[1];
                    const countries = [
                        p1a.country ? p1a.country.name.toLowerCase() : null,
                        p1b.country ? p1b.country.name.toLowerCase() : null,
                        p2a.country ? p2a.country.name.toLowerCase() : null,
                        p2b.country ? p2b.country.name.toLowerCase() : null
                    ];
                    if (countries.includes(countryName)) {
                        return true
                    }
                }
            }
            // }
        }
        catch (err) {
            console.error(err)
        }

        return false
    }

    function hasIndianInAllScores(allTournamentScore) {
        let hasIndianList = allTournamentScore.map(item => hasIndian(item))
        return hasIndianList.includes(true)


    }

    function hasIndianPlayer(item) {
        let countryName = "india"
        let objDom = []

        try {
            let p1 = item['homeTeam']
            let p2 = item['awayTeam']
            // if (!item.tournament.name.toLowerCase().includes('davis cup') && !item.tournament.name.toLowerCase().includes('billie jean king cup')) {
            const uniqueTournament = item.tournament.uniqueTournament;
            if (uniqueTournament.name) {
                if (!uniqueTournament.name.toLowerCase().includes('doubles')) {
                    if (
                        (p1.country && p1.country.name.toLowerCase() === countryName) ||
                        (p2.country && p2.country.name.toLowerCase() === countryName)
                    ) {
                        return true

                    }
                } else {
                    const p1a = p1.subTeams[0];
                    const p1b = p1.subTeams[1];
                    const p2a = p2.subTeams[0];
                    const p2b = p2.subTeams[1];
                    const countries = [
                        p1a.country ? p1a.country.name.toLowerCase() : null,
                        p1b.country ? p1b.country.name.toLowerCase() : null,
                        p2a.country ? p2a.country.name.toLowerCase() : null,
                        p2b.country ? p2b.country.name.toLowerCase() : null
                    ];
                    if (countries.includes(countryName)) {
                        return true
                    }
                }
            }
            // }
        }
        catch (err) {
            console.error(err)
        }

        return objDom
    }
    // Example usage
    const homeScore = { period1: 6, period2: 7, period2TieBreak: 7 };
    const awayScore = { period1: 4, period2: 6, period2TieBreak: 5 };


    function readableTimeStamp(timestamp) {

        // Convert to milliseconds (JavaScript timestamps are in milliseconds)
        const date = new Date(timestamp * 1000);

        // Format the date
        const formattedDate = date.toLocaleString();
        return formattedDate
    }
    function recordDom() {
        return Object.keys(rankingsData).map((tournament) => (
            (hasIndianInAllScores(rankingsData[tournament])) ?
                <div key={tournament}>
                    {<h2 className="text-xl font-bold bg-blue-300">
                        {/* {tournament.charAt(0).toUpperCase() + tournament.slice(1)} */}
                        {rankingsData[tournament][0]?.season?.name}
                        {/* {rankingsData[tournament][0]?.status?.type} */}

                    </h2>}
                    <ul>
                        {rankingsData[tournament].map((item, index) => (
                            (<div key={index} className='m-1 border'>
                                {fetchScoreRecord(item)}
                            </div>)
                        ))}

                    </ul>
                </div> : ""
        ))

    }

    function fetchResultRecord() {
        return rankingsData.map((item) =>
            <div>
                <div className='bg-orange-200'>{item.season.name} - {item?.roundInfo?.name} - {item?.status?.type}</div>
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
                    {recordDom()}
                </div>
            )}
        </div>
    );
};

export default FixtureResults;
