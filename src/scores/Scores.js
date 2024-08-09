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
import CountryIcon from '../common/Country';
import DatePickerValue from '../common/DatePicker';
import Loader from '../common/stateHandlers/LoaderState';
import IconButton from '@mui/material/IconButton';
import SyncIcon from '@mui/icons-material/Sync';
import NotFound from '../common/stateHandlers/NotFound';
import StatusButtonGroup from '../common/toolbar/StatusButtonGroup';
import CountryAutocomplete from '../common/CountryAutoComplete'
import { RiCalendarScheduleFill } from "react-icons/ri";
import { AiOutlineSchedule } from "react-icons/ai";
import MatchStats from '../common/dialogs/MatchStats';
import useApiCall from '../common/apiCalls/useApiCall';
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

const HEADERS = {
    'x-rapidapi-key': 'b40a588570mshd0ab93b20a9f16dp1cfbccjsneecf38833008',
    'x-rapidapi-host': 'tennisapi1.p.rapidapi.com'
}
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
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshScore, setRefreshScore] = useState(false);
    const [selectedDate, setDate] = React.useState(dayjs(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`));
    const [matchStatus, setMatchStatus] = useState("all");
    const [matchStatusList, setMatchStatusList] = useState(["notstarted", "inprogress", "cancelled", "finished"]);
    const [selectedCountry, setSelectedCountry] = useState('india');
    const [indianCount, setIndianCount] = useState(0);
    const { data: matchStatsData, loading: loadingStats, error: erroStats, setRequest: fetchMatchStats } = useApiCall({ method: 'get', payload: [], url: '' });
    const [openMatchStat, setOpenMatchStat] = React.useState(false);
    const [eventId, setEventId] = React.useState(0);

    const handleClickOpenMatchStat = (id) => {
        setEventId(id)
        setOpenMatchStat(true);
    };
    const handleCloseMatchStat = () => {
        setOpenMatchStat(false);
    };
    const handleCountryChange = (newCountryCode) => {
        setSelectedCountry(newCountryCode);
    };

    const handleStatusChange = (event) => {

        setMatchStatus(event.target.value);

    };



    const handleStatusButtonClick = (event) => {
        if (event.target.innerText.toLowerCase() === 'live') {
            setMatchStatus("inprogress");
        }
        else if (event.target.innerText.toLowerCase() === 'not started') {
            setMatchStatus("notstarted");
        }
        else if (event.target.innerText.toLowerCase() === 'finished') {
            setMatchStatus("finished");
        }
        else {
            setMatchStatus("all");
        }


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
                    <MenuItem value="inprogress">Live</MenuItem>
                    <MenuItem value="finished">Finished</MenuItem>
                    <MenuItem value="notstarted">Not Started</MenuItem>
                </Select>
            </FormControl>
        );
    };

    useEffect(() => {
        const fetchRankings = async () => {
            setLoading(true);
            setError("")
            const options = {
                method: 'GET',
                url: `https://tennisapi1.p.rapidapi.com/api/tennis/events/${day}/${month}/${year}`,
                headers: HEADERS
            };
            try {
                const response = await axios.request(options);
                setRankingsData(groupItems(response.data['events']));
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
            setMatchStatusList(["notstarted", "inprogress", "cancelled", "finished"])
        }
        else {
            setMatchStatusList([matchStatus])
        }

    }, [matchStatus]);



    useEffect(() => {
        if (openMatchStat) {
            const options = {
                method: 'GET',
                url: `https://tennisapi1.p.rapidapi.com/api/tennis/event/${eventId}/statistics`,
                headers: HEADERS
            };
            fetchMatchStats({ method: 'get', payload: [], url: options.url, headers: HEADERS })

        }


    }, [eventId]);

    // function formatTennisScoreDom(homeScore, awayScore, currentStatus) {
    //     // Extract the sets' scores
    //     const homePeriod1 = homeScore.period1 || 0;
    //     const homePeriod2 = homeScore.period2 || 0;
    //     const homePeriod3 = homeScore.period3 || 0;
    //     const homePeriod4 = homeScore.period4 || 0;
    //     const homePeriod5 = homeScore.period5 || 0;

    //     const awayPeriod1 = awayScore.period1 || 0;
    //     const awayPeriod2 = awayScore.period2 || 0;
    //     const awayPeriod3 = awayScore.period3 || 0;
    //     const awayPeriod4 = awayScore.period4 || 0;
    //     const awayPeriod5 = awayScore.period5 || 0;

    //     // Handle tiebreak scores if present
    //     const homePeriod2TieBreak = homeScore.period2TieBreak || '';
    //     const awayPeriod2TieBreak = awayScore.period2TieBreak || '';

    //     // Format the scores
    //     const homeScores = [];
    //     const awayScores = [];

    //     homeScores.push(`${homePeriod1}`);
    //     awayScores.push(`${awayPeriod1}`);

    //     if (homePeriod2TieBreak && awayPeriod2TieBreak) {
    //         homeScores.push(`${homePeriod2} (${homePeriod2TieBreak})`);
    //         awayScores.push(`${awayPeriod2} (${awayPeriod2TieBreak})`);
    //     } else {
    //         homeScores.push(`${homePeriod2}`);
    //         awayScores.push(`${awayPeriod2}`);
    //     }

    //     if (homePeriod3 !== 0 || awayPeriod3 !== 0) {
    //         homeScores.push(`${homePeriod3}`);
    //         awayScores.push(`${awayPeriod3}`);
    //     }

    //     if (homePeriod4 !== 0 || awayPeriod4 !== 0) {
    //         homeScores.push(`${homePeriod4}`);
    //         awayScores.push(`${awayPeriod4}`);
    //     }

    //     if (homePeriod5 !== 0 || awayPeriod5 !== 0) {
    //         homeScores.push(`${homePeriod5}`);
    //         awayScores.push(`${awayPeriod5}`);
    //     }

    //     return (
    //         <div className="flex flex-col bg-slate-50 w-full items-center">
    //             <div className="flex flex-row space-x-2">
    //                 {homeScores.map((score, index) => (
    //                     <div className="w-[20%] p-1" key={index}>{score}</div>
    //                 ))}
    //                 {currentStatus === 'inprogress' && <span className="border text-green-800 p-1 font-bold">{homeScore?.point}</span>}
    //             </div>
    //             <div className="flex flex-row space-x-2">
    //                 {awayScores.map((score, index) => (
    //                     <div className="w-[20%] p-1" key={index}>{score}</div>
    //                 ))}
    //                 {currentStatus === 'inprogress' && <span className="border text-green-800 p-1 font-bold">{awayScore?.point}</span>}
    //             </div>
    //         </div>
    //     );
    // }
    function formatTennisScoreDom(homeScore, awayScore, currentStatus) {
        // Extract the sets' scores
        const homePeriod1 = homeScore.period1 || 0;
        const homePeriod2 = homeScore.period2 || 0;
        const homePeriod3 = homeScore.period3 || 0;
        const homePeriod4 = homeScore.period4 || 0;
        const homePeriod5 = homeScore.period5 || 0;

        const awayPeriod1 = awayScore.period1 || 0;
        const awayPeriod2 = awayScore.period2 || 0;
        const awayPeriod3 = awayScore.period3 || 0;
        const awayPeriod4 = awayScore.period4 || 0;
        const awayPeriod5 = awayScore.period5 || 0;

        // Handle tiebreak scores if present
        const homePeriod2TieBreak = homeScore.period2TieBreak || '';
        const awayPeriod2TieBreak = awayScore.period2TieBreak || '';

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

        return (
            <div className="flex flex-col h-full w-full items-center  justify-center">
                <div className="flex flex-row space-x-2 w-full h-[1/2]  text-sm border-b-2 border-slate-200">
                    {homeScores.map((score, index) => (
                        <div className="w-[20%] p-1" key={index}>{score}</div>
                    ))}
                    {currentStatus === 'inprogress' && <span className="border text-green-800 p-1 font-bold">{homeScore?.point}</span>}
                </div>
                <div className="flex flex-row space-x-2 w-full h-[1/2]  text-sm">
                    {awayScores.map((score, index) => (
                        <div className="w-[20%] p-1" key={index}>{score}</div>
                    ))}
                    {currentStatus === 'inprogress' && <span className="border text-green-800 p-1 font-bold">{awayScore?.point}</span>}
                </div>
            </div>
        );
    }

    function getStatusDom(item) {
        if (item?.status?.type === 'inprogress') {
            return (<Box sx={{ width: '50%', mt: 2 }}>
                <LinearProgress color="success" />
            </Box>)
        }
        else if (item?.status?.type === 'notstarted') {
            return (<div className='flex flex-row items-center'>
                {readableTimeStamp(item.startTimestamp)}

            </div>)
        }
        else {
            return (<div className='flex flex-col'>

                {readableDate(item.startTimestamp)}
                <span>Ended</span>
            </div>)
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

    function getPlayerDom(item) {
        return (<div>
            <div key={item.id} className="space-x-2 p-1 flex flex-row items-center">
                <span><CountryIcon countryCode={item.homeTeam.country?.alpha2} name={item.homeTeam.country?.name} size={15} /></span>
                <span>{item.homeTeam.name}</span>
                {item.firstToServe === 1 && item?.status?.type === 'inprogress' ? <IoTennisballSharp size={15} className='text-green-500' /> : ""}
                {item.winnerCode === 1 ? <CheckIcon sx={{ color: "green", fontSize: 20 }} /> : ""}

            </div>
            <div key={item.id} className="space-x-2  p-1 flex flex-row items-center">
                <span><CountryIcon countryCode={item.awayTeam.country?.alpha2} name={item.homeTeam.country?.name} size={15} /></span>
                <span>{item.awayTeam.name}</span>
                {item.firstToServe === 2 && item?.status?.type === 'inprogress' ? <IoTennisballSharp size={15} className='text-green-500' /> : ""}
                {item.winnerCode === 2 ? <CheckIcon sx={{ color: "green", fontSize: 20 }} /> : ""}
            </div>
        </div>
        )
    }

    // function getFullName(name, slug) {
    //     // Split the input name to get last name and initial
    //     const nameParts = name.split(' ');
    //     const lastName = nameParts[0];
    //     const initial = nameParts[1].replace('.', ''); // Remove the period from the initial

    //     // Split the slug to get potential names
    //     const slugParts = slug.split('-');

    //     // Check if last_name is part of the slug_parts
    //     if (slugParts.some(part => part.toLowerCase() === lastName.toLowerCase())) {
    //         // Remove last_name from the slug_parts
    //         const firstNameParts = slugParts.filter(part => part.toLowerCase() !== lastName.toLowerCase());

    //         // Combine the initial with the remaining parts to form the first name
    //         const firstName = firstNameParts.join(' ');

    //         // Construct the full name
    //         const fullName = `${firstName} ${lastName}`;
    //         return fullName;
    //     } else {
    //         return "Name not matched in slug";
    //     }
    // }
    function capitalize(str) {
        return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }
    function removeLastTwoCharacters(str) {
        let textToReplace = getTextAfterLastSpace(str)
        return str.replace(textToReplace, "").trim()
    }



    function getTextAfterLastSpace(str) {
        const lastSpaceIndex = str.lastIndexOf(' '); // Find the index of the last space
        return str.slice(lastSpaceIndex + 1); // Extract the text after the last space
    }

    function getFullName(name, slug) {
        // Split the input name to get last name and initial
        try {
            if (slug.includes("mingge")) {
                let a = 1
            }
            const nameParts = name.split(' ');
            const lastName = removeLastTwoCharacters(name).toLowerCase();
            // Split the slug to get potential names
            // const slugParts = slug.replaceAll("-"," ")
            const normalizedLastName = lastName.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            const normalizedSlug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();


            let firstName = normalizedSlug.replaceAll(normalizedLastName.replaceAll(" ", "-"), "").replaceAll("-", " ").trim()
            const fullName = `${firstName} ${lastName}`;
            return capitalize(fullName)

            // Check if last_name is part of the slug_parts

        } catch (err) {

            return name
        }
    }
    function getPlayerDom1(item) {

        try {
            let p1 = item['homeTeam']
            let p2 = item['awayTeam']
            // if (!item.tournament.name.toLowerCase().includes('davis cup') && !item.tournament.name.toLowerCase().includes('billie jean king cup')) {
            const uniqueTournament = item.tournament.uniqueTournament;
            if (uniqueTournament.name && uniqueTournament.name.includes(tournamentName)) {
                if (!uniqueTournament.name.toLowerCase().includes('doubles')) {
                    if ((selectedCountry === '' ||
                        ((p1.country && p1.country.name.toLowerCase() === selectedCountry) ||
                            (p2.country && p2.country.name.toLowerCase() === selectedCountry))
                    ) && matchStatusList.includes(item?.status?.type)) {
                        return (<div key={`${item.id}-${uniqueTournament}`} className='flex flex-col w-full h-full border'>
                            <div className="flex space-x-2 w-full h-full flex-row items-center  ">
                                <div className="h-full flex items-center"><CountryIcon countryCode={p1.country?.alpha2} name={p1.country?.name} size={15} /></div>
                                <div className="h-full flex items-center ">{getFullName(p1.name, p1.slug)}</div>
                                {item.firstToServe === 1 && item?.status?.type === 'inprogress' ? <IoTennisballSharp size={15} className='text-green-500' /> : ""}
                                {item.winnerCode === 1 ? <CheckIcon sx={{ color: "green", fontSize: 20 }} /> : ""}

                            </div>
                            <div key={item.id} className="space-x-2 h-full flex flex-row items-center ">
                                <div className="h-full flex items-center"><CountryIcon countryCode={p2?.country.alpha2} name={p2?.name} size={15} /></div>
                                <div className="h-full flex items-center">{getFullName(p2.name, p2.slug)}</div>
                                {item.firstToServe === 2 && item?.status?.type === 'inprogress' ? <IoTennisballSharp size={15} className='text-green-500' /> : ""}
                                {item.winnerCode === 2 ? <CheckIcon sx={{ color: "green", fontSize: 20 }} /> : ""}
                            </div>
                        </div>
                        )

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
                    if ((countries.includes(selectedCountry) || selectedCountry === '') && matchStatusList.includes(item?.status?.type)) {
                        return (<div key={`${item.id}-${uniqueTournament}`}>
                            <div key={item.id} className="space-x-2 p-1 flex flex-row items-center">
                                <div className='w-full flex flex-col'>
                                    <div className='w-full flex flex-row space-x-2 items-center'>
                                        <span><CountryIcon countryCode={p1a.country?.alpha2} name={p1a.country?.name} size={15} /></span>
                                        <span>{getFullName(p1a.name, p1a.slug)}</span>
                                    </div>
                                    <div className='w-full flex flex-row space-x-2'>
                                        <span><CountryIcon countryCode={p1b.country?.alpha2} name={p1b.country?.name} size={15} /></span>
                                        <span>{getFullName(p1b.name, p1b.slug)}</span>
                                        {item.firstToServe === 1 && item?.status?.type === 'inprogress' ? <IoTennisballSharp size={15} className='text-green-500' /> : ""}
                                        {item.winnerCode === 1 ? <CheckIcon sx={{ color: "green", fontSize: 20 }} /> : ""}

                                    </div>

                                </div>
                            </div>
                            <div key={item.id} className="space-x-2  p-1 flex flex-row items-center">
                                <div className='w-full flex flex-col'>
                                    <div className='w-full flex flex-row space-x-2 items-center'>
                                        <span><CountryIcon countryCode={p2a.country?.alpha2} name={p2a.country?.name} size={15} /></span>
                                        <span>{getFullName(p2a.name, p2a.slug)}</span>
                                    </div>
                                    <div className='w-full flex flex-row space-x-2 items-center'>
                                        <span><CountryIcon countryCode={p2b.country?.alpha2} name={p2b.country?.name} size={15} /></span>
                                        <span>{getFullName(p2b.name, p2b.slug)}</span>
                                        {item.firstToServe === 2 && item?.status?.type === 'inprogress' ? <IoTennisballSharp size={15} className='text-green-500' /> : ""}
                                        {item.winnerCode === 2 ? <CheckIcon sx={{ color: "green", fontSize: 20 }} /> : ""}

                                    </div>

                                </div>

                            </div>
                        </div>
                        )

                    }
                }
            }
            // }
        }
        catch (err) {
            console.error(err)
        }


    }


    function fetchScoreRecord(item) {

        let objDom = []

        let p1 = item['homeTeam']
        let p2 = item['awayTeam']
        // if (!item.tournament.name.toLowerCase().includes('davis cup') && !item.tournament.name.toLowerCase().includes('billie jean king cup')) {
        const uniqueTournament = item.tournament.uniqueTournament;
        if (uniqueTournament.name) {
            try {

                if (hasIndian(item)) {

                    // objDom = (<div className="flex flex-row w-full text-sm space-x-8">
                    //     <div className='w-[10%] flex flex-col justify-center text-center items-center bg-slate-100  font-bold'>
                    //         <span className="text-xs">{getRoundAbbreviation(item?.roundInfo?.name)} </span>
                    //         <span className="text-xs w-full flex justify-center">{getStatusDom(item)}</span>
                    //     </div>
                    //     <div className="flex flex-col w-[30%]">
                    //         {getPlayerDom1(item)}
                    //     </div>
                    //     <div className='w-[20%] bg-slate-100'>{formatTennisScoreDom(item['homeScore'], item['awayScore'], item?.status?.type)}</div>

                    // </div>)
                    objDom = (<div className="flex flex-row w-full h-full text-sm space-x-4 sm:space-x-8">
                        <div className='w-[20%] sm:w-[10%] flex flex-col justify-center text-center items-center bg-slate-100 font-bold'>
                            <span className="text-sm">{getRoundAbbreviation(item?.roundInfo?.name)} </span>
                            <span className="text-xs w-full flex justify-center">{getStatusDom(item)}</span>
                            <span className="text-xs w-full flex justify-center"><button onClick={(e) => handleClickOpenMatchStat(item.id)}>Stats</button></span>
                        </div>
                        <div className="flex flex-col min-h-full justify-center w-[60%] sm:w-[30%]">
                            {getPlayerDom1(item)}
                        </div>

                        <div className='w-[20%] bg-slate-100'>{item?.status?.type !== "notstarted" && formatTennisScoreDom(item['homeScore'], item['awayScore'], item?.status?.type)}</div>
                    </div>
                    )
                    return objDom
                }
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
                    if ((selectedCountry === '' ||
                        ((p1.country && p1.country.name.toLowerCase() === selectedCountry) ||
                            (p2.country && p2.country.name.toLowerCase() === selectedCountry))
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
                    if ((selectedCountry === '' || countries.includes(selectedCountry)) && matchStatusList.includes(item?.status?.type)) {
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

    function readableDate(timestamp) {
        // Convert to milliseconds (JavaScript timestamps are in milliseconds)
        const date = new Date(timestamp * 1000);

        // Get date components
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' }); // 'default' locale, short month format
        const year = date.getFullYear();

        const formattedDate = `${day}-${month}`;
        return formattedDate;
    }


    function getScoreHeader(tournament) {
        let seasonName = rankingsData[tournament][0]?.season?.name
        let name = rankingsData[tournament][0]?.tournament?.name
        if (seasonName) {
            if (seasonName.includes("Men")) {
                return (<div className="flex flex-row bg-blue-300 text-lg items-center p-1">
                    <span>{seasonName} </span>
                    {/* <FcBusinessman /> */}
                </div>
                )
            }
            else {
                return (<div className="flex flex-row bg-pink-300 text-lg items-center p-1">
                    <span>{seasonName} </span>
                    {/* <FcBusinesswoman /> */}
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

    // function recordDom() {
    //     return Object.keys(rankingsData).map((tournament, index) => {
    //         if (hasIndianInAllScores(rankingsData[tournament])) {
    //             return (
    //                 <div key={tournament + index}>
    //                     {getScoreHeader(tournament)}
    //                     <ul>
    //                         {rankingsData[tournament].map((item, subIndex) => (
    //                             (hasIndian(item)) && (<li key={subIndex} className='m-1 border bg-slate-50'>
    //                                 {fetchScoreRecord(item)}
    //                             </li>)
    //                         ))}
    //                     </ul>
    //                 </div>
    //             );
    //         }
    //         return null; // Return null if the condition is false
    //     });
    // }

    function recordDom() {
        // Filter the rankingsData to only include tournaments with Indian players
        let rankingsDataCopy = JSON.parse(JSON.stringify(rankingsData))
        const filteredRankingsData = Object.keys(rankingsDataCopy).filter(tournament => hasIndianInAllScores(rankingsData[tournament], tournament));

        if (filteredRankingsData.length === 0) {
            return <NotFound msg="No Results Found" />
        }
        else {
            return filteredRankingsData.map((tournament, index) => (
                <div key={tournament + index} className="border m-1">
                    {getScoreHeader(tournament)}
                    <ul>
                        {rankingsData[tournament].filter(hasIndian).map((item, subIndex) => (
                            <li key={subIndex} className='m-1 border bg-slate-50'>
                                {fetchScoreRecord(item)}
                            </li>
                        ))}
                    </ul>
                </div>
            ));
        }
    }

    let statusButtonCss = "border p-1 bg-blue-900 text-white w-[100px] rounded-xl"
    let statusButtonActive = "border p-1 bg-blue-500 border-b-4 border-blue-900 text-white w-[100px] rounded-xl"



    // function getStatusButtons() {
    //     return (
    //         <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
    //             <button
    //                 className={matchStatus === "inprogress" ? statusButtonActive : statusButtonCss}
    //                 onClick={handleStatusButtonClick}
    //             >
    //                 Live
    //             </button>
    //             <button
    //                 className={matchStatus === "finished" ? statusButtonActive : statusButtonCss}
    //                 onClick={handleStatusButtonClick}
    //             >
    //                 Finished
    //             </button>
    //             <button
    //                 className={matchStatus === "notstarted" ? statusButtonActive : statusButtonCss}
    //                 onClick={handleStatusButtonClick}
    //             >
    //                 Not Started
    //             </button>
    //             <button
    //                 className={matchStatus === "all" ? statusButtonActive : statusButtonCss}
    //                 onClick={handleStatusButtonClick}
    //             >
    //                 All
    //             </button>
    //         </div>
    //     );
    // }

    return (
        <div>
            <MatchStats open={openMatchStat} handleClose={handleCloseMatchStat} data={matchStatsData}/>

            <div className='flex flex-row space-x-4 w-full bg-slate-200 items-center p-1  border'>
                {/* <div className="bg-slate-500 text-white">Scores</div> */}
                <DatePickerValue handleSelectDate={handleSelectDate} selectedDate={selectedDate} />
                {/* {getStatusControl()} */}

                {/* {getStatusButtons()} */}
                <StatusButtonGroup matchStatus={matchStatus} handleStatusButtonClick={handleStatusButtonClick} />
                <CountryAutocomplete
                    selectedCountry={selectedCountry}
                    handleCountryChange={handleCountryChange}
                />
                <IconButton onClick={handleRefresh}><SyncIcon /></IconButton>
            </div>
            {error && <p>Error: {error}</p>}
            {loading ? <Loader /> : rankingsData && (
                <div className=" w-[100%] mx-auto">
                    {/* <pre>{JSON.stringify(rankingsData, null, 2)}</pre> */}
                    {true ? recordDom() : "No Indian"}
                </div>
            )}
        </div>
    );
};

export default FixtureResults;

