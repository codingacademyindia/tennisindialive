import { Refresh } from '@mui/icons-material';
import CheckIcon from '@mui/icons-material/Check';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { FcBusinessman, FcBusinesswoman } from "react-icons/fc";
import { IoTennisballSharp } from "react-icons/io5";
import { useParams } from 'react-router-dom';
import DatePickerValue from '../common/DatePicker';
import Loader from '../common/stateHandlers/LoaderState';
import IconButton from '@mui/material/IconButton';
import SyncIcon from '@mui/icons-material/Sync';
import NotFound from '../common/stateHandlers/NotFound';
import StatusButtonGroup from '../common/toolbar/StatusButtonGroup';
import CountryIcon from '../common/CountryFlagName';

const CustomFormControl = styled(FormControl)({
    '& .MuiInputBase-root': {
        color: 'white',
    },
    '& .MuiInputLabel-root': {
        color: 'white',
    },
    '& .MuiInputLabel-root.Mui-focused': {
        color: 'white',
    },
    '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
        borderColor: 'white',
    },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'white',
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'white',
    },
    '& .MuiSelect-icon': {
        color: 'white',
    },
});

const tournamentName = ''

const FixtureResults = () => {
    document.title = "Tennis India Live - Live Scores and Results"
    let params = useParams();
    let day, month, year
    if (Object.keys(params).length === 0) {
        const date = new Date();

        // Extract the year, month, and date
        day = String(date.getDate());
        month = String(date.getMonth() + 1); // Months are zero-based, so add 1
        year = String(date.getFullYear());
    }
    else {
        day = params.day
        month = params.month
        year = params.year
    }

    const [rankingsData, setRankingsData] = useState(null);
    const [filteredData, setFilteredData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshScore, setRefreshScore] = useState(false);
    const [selectedDate, setDate] = React.useState(dayjs(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`));
    const [matchStatus, setMatchStatus] = useState("all");
    const [matchStatusList, setMatchStatusList] = useState(["live", "scheduled", "cancelled", "finished"]);
    const [selectedCountry, setSelectedCountry] = useState('india');
    const [indianCount, setIndianCount] = useState(0);

    const handleCountryChange = (newCountryCode) => {
        setSelectedCountry(newCountryCode);
    };

    const handleStatusChange = (event) => {
        setLoading(true)
        setMatchStatus(event.target.value);

    };



    const handleStatusButtonClick = (event) => {
        // if (event.target.innerText.toLowerCase() === 'live') {
        //     setMatchStatus("live");
        // }
        // else if (event.target.innerText.toLowerCase() === 'not started') {
        //     setMatchStatus("scheduled");
        // }
        // else if (event.target.innerText.toLowerCase() === 'finished') {
        //     setMatchStatus("finished");
        // }
        // else {
        //     setMatchStatus("all");
        // }
        setMatchStatus(event.target.innerText.toLowerCase())

    };

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

    const handleSelectDate = newValue => {
        const date = new Date(newValue);

        // Extract the year, month, and date
        const day = date.getDate();
        const month = date.getMonth() + 1; // Months are zero-based, so add 1
        const year = date.getFullYear();

        setDate(newValue)
        window.location.href = `/results/${year}/${month}/${day}`

    }


    function getStatusControl() {
        return (
            <FormControl variant="outlined" sx={{ width: 200 }}>
                <InputLabel id="status-label">Match Status</InputLabel>
                <Select
                    labelId="status-label"
                    id="status-select"
                    value={matchStatus}
                    onChange={handleStatusChange}
                    label="Match Status"
                    size="small"
                >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="live">Live</MenuItem>
                    <MenuItem value="finished">Finished</MenuItem>
                    <MenuItem value="scheduled">Not Started</MenuItem>
                </Select>
            </FormControl>
        );
    };

    useEffect(() => {
        const fetchRankings = async () => {
            setLoading(true);
            const options = {
                method: 'GET',
                url: `https://flashlive-sports.p.rapidapi.com/v1/events/list`,
                params: { "locale": "en_INT", "sport_id": "2", "timezone": "-4", "indent_days": 0 },
                headers: {
                    "x-rapidapi-key": "b40a588570mshd0ab93b20a9f16dp1cfbccjsneecf38833008",
                    "x-rapidapi-host": "flashlive-sports.p.rapidapi.com"
                }

            };
            try {
                const response = await axios.request(options);
                setRankingsData(response.data['DATA']);
                setFilteredData(response.data['DATA'])
                setLoading(false);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchRankings();
        const intervalId = setInterval(fetchRankings, 120000); // 

        return () => clearInterval(intervalId); // 
    }, [day, month, year, refreshScore]);

    useEffect(() => {
        if (matchStatus.includes("all")) {
            setMatchStatusList(["live", "scheduled", "cancelled", "finished"])
            filterDataByStatus(["live", "scheduled", "cancelled", "finished"])
        }
        else {
            setMatchStatusList([matchStatus])
            filterDataByStatus([matchStatus])
        }
        setLoading(false)


    }, [matchStatus]);



    function formatTennisScoreDom(item) {
        // Extract the sets' scores
        const homePeriod1 = item.HOME_SCORE_PART_1 || 0;
        const homePeriod2 = item.HOME_SCORE_PART_2 || 0;
        const homePeriod3 = item.HOME_SCORE_PART_3 || 0;
        const homePeriod4 = item.HOME_SCORE_PART_4 || 0;
        const homePeriod5 = item.HOME_SCORE_PART_5 || 0;

        const awayPeriod1 = item.AWAY_SCORE_PART_1 || 0;
        const awayPeriod2 = item.AWAY_SCORE_PART_2 || 0;
        const awayPeriod3 = item.AWAY_SCORE_PART_3 || 0;
        const awayPeriod4 = item.AWAY_SCORE_PART_4 || 0;
        const awayPeriod5 = item.AWAY_SCORE_PART_5 || 0;

        // Handle tiebreak scores if present
        const homePeriod2TieBreak = item['HOME_TIEBREAK_PART_1'] || '';
        const awayPeriod2TieBreak = item['AWAY_TIEBREAK_PART_1'] || '';

        // Format the scores
        const homeScores = [];
        const awayScores = [];

        homeScores.push(`${homePeriod1}`);
        awayScores.push(`${awayPeriod1}`);

        if (homePeriod2TieBreak && awayPeriod2TieBreak) {
            homeScores.push(
                <span key="homePeriod2">
                    {homePeriod2}
                    <sup className="font-bold">{homePeriod2TieBreak}</sup>
                </span>
            );
            awayScores.push(
                <span key="awayPeriod2">
                    {awayPeriod2}
                    <sup className="font-bold">{awayPeriod2TieBreak}</sup>
                </span>
            );
        } else {
            homeScores.push(`${homePeriod2}`);
            awayScores.push(`${awayPeriod2}`);
        }

        if (homePeriod3 !== 0 || awayPeriod3 !== 0) {
            homeScores.push(`${homePeriod3}`);
            awayScores.push(`${awayPeriod3}`);
        }

        if (homePeriod4 !== 0 || awayPeriod4 !== 0) {
            homeScores.push(`${homePeriod4}`);
            awayScores.push(`${awayPeriod4}`);
        }

        if (homePeriod5 !== 0 || awayPeriod5 !== 0) {
            homeScores.push(`${homePeriod5}`);
            awayScores.push(`${awayPeriod5}`);
        }

        let currentStatus = item.STAGE_TYPE ? item.STAGE_TYPE.toLowerCase() : ''

        return (
            <div className="flex flex-col h-full w-full items-center  justify-center">
                <div className="flex flex-row space-x-2 w-full h-[1/2]  text-sm border-b-2 border-slate-200">
                    {homeScores.map((score, index) => (
                        <div className="w-[20%] p-1" key={index}>{score}</div>
                    ))}
                    {currentStatus === 'live' && <span className="border text-green-800 p-1 font-bold">{item?.HOME_SCORE_PART_GAME}</span>}
                </div>
                <div className="flex flex-row space-x-2 w-full h-[1/2]  text-sm">
                    {awayScores.map((score, index) => (
                        <div className="w-[20%] p-1" key={index}>{score}</div>
                    ))}
                    {currentStatus === 'live' && <span className="border text-green-800 p-1 font-bold">{item?.AWAY_SCORE_PART_GAME}</span>}
                </div>
            </div>
        );
    }



    function getStatusDom(matchStatus, startTime) {
        if (matchStatus.toLowerCase() === 'live') {
            return (<Box sx={{ width: '50%', mt: 2 }}>
                <LinearProgress color="success" />
            </Box>)
        }
        else if (matchStatus.toLowerCase() === 'scheduled') {
            return readableTimeStamp(startTime)
        }
        else if (matchStatus.toLowerCase === 'finished') {
            return "Finished"
        }
        else {
            return matchStatus
        }
    }

    function getRoundAbbreviation(round) {
        if (!round) {
            return ""
        }
        round = round.toLowerCase()
        const roundMap = {
            'round of 128': 'R128',
            'round of 64': 'R64',
            'round of 32': 'R32',
            'round of 16': 'R16',
            'quarterfinal': 'QF',
            'quarterfinals': 'QF',
            'qualification round 1': 'QR1',
            'qualification round 2': 'QR2',
            'qualification round 3': 'QR3',
            'qualification final round': 'Final Q',
            'semifinals': 'SF',
            'semifinal': 'SF',
            'final': 'F',
            'finals': 'F'
        };

        const lowerCaseRound = round.toLowerCase();
        for (const [key, value] of Object.entries(roundMap)) {
            if (key.toLowerCase() === lowerCaseRound) {
                return value;
            }
        }

        // Default case if the round is not found
        return '';
    }


    function getPlayerDom(item, tournamentName) {

        try {
            let p1 = item['HOME_PARTICIPANT_NAME_ONE']
            let p2 = item['AWAY_PARTICIPANT_NAME_ONE']

            // if (!item.tournament.name.toLowerCase().includes('davis cup') && !item.tournament.name.toLowerCase().includes('billie jean king cup')) {

            // const uniqueTournament = tournamentName;
            // if (tournamentName && tournamentName.includes(tournamentName)) {
            if (!tournamentName.toLowerCase().includes('doubles')) {
                // if ((
                //     (p1['HOME_PARTICIPANT_COUNTRY_NAME_ONE'] === selectedCountry) ||
                //     (p2['AWAY_PARTICIPANT_COUNTRY_NAME_ONE'] === selectedCountry)
                // ) && matchStatusList.includes(item.STAGE_TYPE)) {
                return (<div className='flex flex-col w-full h-full border'>
                    <div key={item.id} className="flex space-x-2 w-full h-full flex-row items-center  ">
                        <div className="h-full flex items-center"><CountryIcon countryName={item['HOME_PARTICIPANT_COUNTRY_NAME_ONE']} name={p1.country?.name} size={15} /></div>
                        <div className="h-full flex items-center ">{p1}</div>
                        {item.SERVICE === 1 && item.STAGE_TYPE.toLowerCase() === 'live' ? <IoTennisballSharp size={15} className='text-green-500' /> : ""}
                        {item.WINNER === 1 ? <CheckIcon sx={{ color: "green", fontSize: 20 }} /> : ""}

                    </div>
                    <div key={item.id} className="space-x-2 h-full flex flex-row items-center ">
                        <div className="h-full flex items-center"><CountryIcon countryName={item['AWAY_PARTICIPANT_COUNTRY_NAME_ONE']} name={p1.country?.name} size={15} /></div>
                        <div className="h-full flex items-center">{p2}</div>
                        {item.SERVICE === 2 && item.STAGE_TYPE.toLowerCase() === 'live' ? <IoTennisballSharp size={15} className='text-green-500' /> : ""}
                        {item.WINNER === 2 ? <CheckIcon sx={{ color: "green", fontSize: 20 }} /> : ""}
                    </div>
                </div>
                )

                // }
            } else {
                const p1a = item['HOME_PARTICIPANT_NAME_ONE'];
                const p1b = item['HOME_PARTICIPANT_NAME_TWO']
                const p2a = item['AWAY_PARTICIPANT_NAME_ONE'];
                const p2b = item['AWAY_PARTICIPANT_NAME_TWO'];
                const countries = [
                    (item.HOME_PARTICIPANT_COUNTRY_NAME_ONE) ? item.HOME_PARTICIPANT_COUNTRY_NAME_ONE.toLowerCase() : null,
                    (item.HOME_PARTICIPANT_COUNTRY_NAME_TWO) ? item.HOME_PARTICIPANT_COUNTRY_NAME_ONE.toLowerCase() : null,
                    (item.AWAY_PARTICIPANT_COUNTRY_NAME_ONE) ? item.HOME_PARTICIPANT_COUNTRY_NAME_ONE.toLowerCase() : null,
                    (item.AWAY_PARTICIPANT_COUNTRY_NAME_ONE) ? item.HOME_PARTICIPANT_COUNTRY_NAME_ONE.toLowerCase() : null
                ];
                // if (countries.includes(selectedCountry) && matchStatusList.includes(item?.status?.type)) {
                return (<div>
                    <div key={item.id} className="space-x-2 p-1 flex flex-row items-center">
                        <div className='w-full flex flex-col'>
                            <div className='w-full flex flex-row space-x-2 items-center'>
                                <span><CountryIcon countryName={item['HOME_PARTICIPANT_COUNTRY_NAME_ONE']} name={p1.country?.name} size={15} /></span>
                                <span>{p1a}</span>
                            </div>
                            <div className='w-full flex flex-row space-x-2'>
                                <span><CountryIcon countryName={item['HOME_PARTICIPANT_COUNTRY_NAME_TWP']} name={p1.country?.name} size={15} /></span>
                                <span>{p1b}</span>
                                {/* {item.firstToServe === 1 && item?.status?.type === 'inprogress' ? <IoTennisballSharp size={15} className='text-green-500' /> : ""}
                                    {item.winnerCode === 1 ? <CheckIcon sx={{ color: "green", fontSize: 20 }} /> : ""} */}

                            </div>

                        </div>
                    </div>
                    <div key={item.id} className="space-x-2  p-1 flex flex-row items-center">
                        <div className='w-full flex flex-col'>
                            <div className='w-full flex flex-row space-x-2 items-center'>
                                <span><CountryIcon countryName={item['AWAY_PARTICIPANT_COUNTRY_NAME_ONE']} name={p1.country?.name} size={15} /></span>
                                <span>{p2a}</span>
                            </div>
                            <div className='w-full flex flex-row space-x-2 items-center'>
                                <span><CountryIcon countryName={item['AWAY_PARTICIPANT_COUNTRY_NAME_ONE']} name={p1.country?.name} size={15} /></span>
                                <span>{p2b}</span>
                                {/* {item.firstToServe === 2 && item?.status?.type === 'inprogress' ? <IoTennisballSharp size={15} className='text-green-500' /> : ""}
                                    {item.winnerCode === 2 ? <CheckIcon sx={{ color: "green", fontSize: 20 }} /> : ""} */}

                            </div>

                        </div>

                    </div>
                </div>
                )

                // }
            }
            // }
            // }
        }
        catch (err) {
            console.error(err)
        }


    }


    function fetchScoreRecord(item, tournament_name) {

        let objDom = []

        // if (!item.tournament.name.toLowerCase().includes('davis cup') && !item.tournament.name.toLowerCase().includes('billie jean king cup')) {
        const uniqueTournament = tournament_name;
        if (uniqueTournament) {
            try {
                console.log(matchStatusList)
                console.log(item.STAGE_TYPE)
                // if (matchStatusList.includes(item.STAGE_TYPE.toLowerCase())) {
                // if (hasIndian(item)) {

                objDom = (<div className="flex flex-row w-full h-full text-sm space-x-4 sm:space-x-8">
                    <div className='w-[20%] sm:w-[10%] flex flex-col justify-center text-center items-center bg-slate-100 font-bold'>
                        <span className="text-xs">{item?.ROUND} </span>
                        <span className="text-xs w-full flex justify-center">{getStatusDom(item.STAGE_TYPE, item.START_TIME)}</span>
                    </div>
                    <div className="flex flex-col min-h-full justify-center w-[60%] sm:w-[30%]">
                        {getPlayerDom(item, tournament_name)}
                    </div>

                    <div className='w-[20%] bg-slate-100'>{item?.status?.type !== "notstarted" && formatTennisScoreDom(item)}</div>
                </div>
                )
                return objDom
                // }
            }
            catch (err) {
                console.error(err)
            }

        }
        // }

        return objDom
    }

    function hasIndian(item) {

        try {
            let p1 = item['homeTeam']
            let p2 = item['awayTeam']
            // if (!item.tournament.name.toLowerCase().includes('davis cup') && !item.tournament.name.toLowerCase().includes('billie jean king cup')) {
            const uniqueTournament = item.tournament.uniqueTournament;
            if (uniqueTournament.name && uniqueTournament.name.includes(tournamentName)) {
                if (!uniqueTournament.name.toLowerCase().includes('doubles')) {
                    if ((
                        (p1.country && p1.country.name.toLowerCase() === selectedCountry) ||
                        (p2.country && p2.country.name.toLowerCase() === selectedCountry)
                    ) && matchStatusList.includes(item?.status?.type)) {
                        return true

                    }
                } else {
                    const p1a = p1.subTeams[0];
                    const p1b = p1.subTeams[1];
                    const p2a = p2.subTeams[0];
                    const p2b = p2.subTeams[1];
                    const countries = [
                        (p1a.country) ? p1a.country.name.toLowerCase() : null,
                        (p1a.country) ? p1b.country.name.toLowerCase() : null,
                        (p1a.country) ? p2a.country.name.toLowerCase() : null,
                        (p1a.country) ? p2b.country.name.toLowerCase() : null
                    ];
                    if (countries.includes(selectedCountry) && matchStatusList.includes(item?.status?.type)) {
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



    function hasIndianInAllScores(allTournamentScore, tournament) {
        let hasIndianList = allTournamentScore.map(item => hasIndian(item))
        return hasIndianList.includes(true)
    }


    // Example usage
    const homeScore = { period1: 6, period2: 7, period2TieBreak: 7 };
    const awayScore = { period1: 4, period2: 6, period2TieBreak: 5 };
    const handleRefresh = e => {
        setRefreshScore(!refreshScore)
    }

    function readableTimeStamp(timestamp) {
        // Convert to milliseconds (JavaScript timestamps are in milliseconds)
        const date = new Date(timestamp * 1000);

        // Get date components
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' }); // 'default' locale, short month format
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';

        // Convert hours to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'

        // Pad minutes with leading zero if needed
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;

        // Format date string
        const formattedDate = `${day}-${month} ${hours}:${minutesStr} ${ampm}`;
        return formattedDate;
    }

    function getScoreHeader(tournament) {
        if (tournament) {
            if (tournament.includes("Men")) {
                return (<div className="flex flex-row bg-blue-300 text-lg items-center p-1">
                    <span>{tournament} </span>
                    <FcBusinessman />
                </div>
                )
            }
            else {
                return (<div className="flex flex-row bg-pink-300 text-lg items-center p-1">
                    <span>{tournament} </span>
                    <FcBusinesswoman />
                </div>
                )

            }
        }
        else {
            return (<div className="flex flex-row bg-gray-300 text-lg items-center p-1">
                <span>{tournament} </span>
                <FcBusinessman />
            </div>)
        }
    }



    function recordDom() {
        return filteredData.map((item, index) => {
            return (<div className='flex flex-col'>
                {getScoreHeader(item.NAME)}
                {item['EVENTS'].map(event => fetchScoreRecord(event, item.NAME))}
                {/* {fetchScoreRecord(item, item.NAME)} */}
            </div>)
        }
        )
    }

    function filterEventsByStatus(events, statusList) {
        events = events.filter(item => statusList.includes(item.STAGE_TYPE.toLowerCase()))
        return events
    }

    function filterEventsByCountry(events) {
        events = events.filter(item => item.STAGE_TYPE.toLowerCase() === matchStatus)
        return events
    }
    // function filterDataByStatus(statusList) {
    //     let rankingsDataCopy = JSON.parse(JSON.stringify(rankingsData))
    //     if (rankingsDataCopy) {
    //         rankingsDataCopy.forEach((item, index) => {
    //             item.EVENTS = filterEventsByStatus(item.EVENTS, statusList)
    //         })
    //         setFilteredData(rankingsDataCopy)
    //     }
    // }

    function filterDataByStatus(statusList) {
        let rankingsDataCopy = JSON.parse(JSON.stringify(rankingsData));
        
        if (rankingsDataCopy) {
            // Iterate over each item and filter its EVENTS
            rankingsDataCopy = rankingsDataCopy.map(item => {
                item.EVENTS = filterEventsByStatus(item.EVENTS, statusList);
                return item;
            });
    
            // Discard items where EVENTS is empty
            rankingsDataCopy = rankingsDataCopy.filter(item => item.EVENTS && item.EVENTS.length > 0);
    
            setFilteredData(rankingsDataCopy);
        }
    }
    
    function filterDataByCountry() {
        let rankingsDataCopy = JSON.parse(JSON.stringify(rankingsData))
        rankingsDataCopy.forEach((item, index) => {
            item.EVENTS = filterEventsByCountry(item)
        })
        setFilteredData(rankingsDataCopy)
    }
    // function recordDom() {
    //     // Filter the rankingsData to only include tournaments with Indian players
    //     let rankingsDataCopy = JSON.parse(JSON.stringify(rankingsData))
    //     const filteredRankingsData = Object.keys(rankingsDataCopy).filter(tournament => hasIndianInAllScores(rankingsData[tournament], tournament));

    //     if (filteredRankingsData.length === 0) {
    //         return <NotFound msg="No Results Found" />
    //     }
    //     else {
    //         return filteredRankingsData.map((tournament, index) => (
    //             <div key={tournament + index} className="border m-1">
    //                 {getScoreHeader(tournament)}
    //                 <ul>
    //                     {rankingsData[tournament].filter(hasIndian).map((item, subIndex) => (
    //                         <li key={subIndex} className='m-1 border bg-slate-50'>
    //                             {fetchScoreRecord(item)}
    //                         </li>
    //                     ))}
    //                 </ul>
    //             </div>
    //         ));
    //     }
    // }


    return (
        <div>
            <div className='flex flex-row space-x-4 w-full bg-slate-200 items-center p-1  border'>
                {/* <div className="bg-slate-500 text-white">Scores</div> */}
                <DatePickerValue handleSelectDate={handleSelectDate} selectedDate={selectedDate} />
                {/* {getStatusControl()} */}

                {/* {getStatusButtons()} */}
                <StatusButtonGroup matchStatus={matchStatus} handleStatusButtonClick={handleStatusButtonClick} />
                {/* <CountryAutocomplete
                    selectedCountry={selectedCountry}
                    handleCountryChange={handleCountryChange}
                /> */}
                <IconButton onClick={handleRefresh}><SyncIcon /></IconButton>
            </div>
            {error && <p>Error: {error}</p>}
            {loading ? <Loader /> : filteredData && (
                <div className=" w-[100%] mx-auto">
                    {/* <pre>{JSON.stringify(rankingsData, null, 2)}</pre> */}
                    {true ? recordDom() : "No Indian"}
                </div>
            )}
        </div>
    );
};

export default FixtureResults;

