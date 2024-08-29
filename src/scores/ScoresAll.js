import { Refresh } from '@mui/icons-material';
import CheckIcon from '@mui/icons-material/Check';
import { FormControl, InputLabel, MenuItem, Select, Button, Tooltip } from '@mui/material';
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
import Head2Head from '../common/dialogs/HeadToHead';
import useApiCall from '../common/apiCalls/useApiCall';
import { IoStatsChartSharp } from "react-icons/io5";
import CountryDialog from '../common/country/CountryDialog';
import { FaFlag } from "react-icons/fa6";
import { RxTable } from "react-icons/rx";
import { HiMiniTableCells } from "react-icons/hi2";
import { setItem, getItem } from '../indexDb/indexedDB';
import { AiOutlineClockCircle } from 'react-icons/ai'
import { FlagIcon } from 'react-flag-kit';
import { FaGlobe } from "react-icons/fa";
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

const FixtureResultsAll = () => {
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
    const [selectedCountryCode, setSelectedCountryCode] = useState('IN');
    const [indianCount, setIndianCount] = useState(0);
    const { data: matchStatsData, loading: loadingStats, error: erroStats, setRequest: fetchMatchStats } = useApiCall({ method: 'get', payload: [], url: '' });
    const { data: h2hData, loading: loadingH2H, error: errorH2H, setRequest: fetchH2H } = useApiCall({ method: 'get', payload: [], url: '' });

    const [openMatchStat, setOpenMatchStat] = React.useState(false);
    const [selectedMatchStatus, setSelectedMatchStatus] = React.useState("notstarted");

    const [openH2H, setOpenH2H] = React.useState(false);
    const [eventId, setEventId] = React.useState(0);
    const [scoreRecord, setScoreRecord] = React.useState(null);
    const [dialogOpenCountry, setDialogOpenCountry] = useState(false);

    const handleClickOpenCountry = () => {
        setDialogOpenCountry(true);
    };

    const handleCloseCountry = () => {
        setDialogOpenCountry(false);
    };
    const handleClickOpenMatchStat = (item) => {

        setEventId(item.id)
        setScoreRecord(item)
        setOpenMatchStat(true);
        const options = {
            method: 'GET',
            url: `https://tennisapi1.p.rapidapi.com/api/tennis/event/${item.id}/statistics`,
            headers: HEADERS
        };
        fetchMatchStats({ method: 'get', payload: [], url: options.url, headers: HEADERS })
        setSelectedMatchStatus(item?.status?.type)


    };

    const handleClickOpenH2H = (item) => {
        setEventId(item.id)
        setScoreRecord(item)
        setOpenH2H(true);
        const options = {
            method: 'GET',
            url: `https://tennisapi1.p.rapidapi.com/api/tennis/event/${item.id}/duel`,
            headers: HEADERS
        };
        fetchH2H({ method: 'get', payload: [], url: options.url, headers: HEADERS })



    };

    const handleCloseMatchStat = () => {
        setOpenMatchStat(false);
        setOpenH2H(false)
    };
    const handleCountryChange = async (newCountryCode, newValue) => {
        setSelectedCountry(newCountryCode);
        setSelectedCountryCode(newValue?newValue.code:null)
        await setItem('country', newCountryCode);
        await setItem('countryCode', newValue?newValue.code:null);
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
        window.location.href = `/results/all/${year}/${month}/${day}`

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
        const fetchValue = async () => {
            const storedValue = await getItem('country');
            const storedCountryCode = await getItem('countryCode');
            setSelectedCountry(storedValue || 'india');
            setSelectedCountryCode(storedCountryCode || 'IN');
        };

        fetchValue();
    }, []);

    // useEffect(() => {
    //     if (openMatchStat) {
    //         const options = {
    //             method: 'GET',
    //             url: `https://tennisapi1.p.rapidapi.com/api/tennis/event/${eventId}/statistics`,
    //             headers: HEADERS
    //         };
    //         fetchMatchStats({ method: 'get', payload: [], url: options.url, headers: HEADERS })

    //     }


    // }, [eventId]);

    // useEffect(() => {
    //     if (openH2H) {
    //         const options = {
    //             method: 'GET',
    //             url: `https://tennisapi1.p.rapidapi.com/api/tennis/event/${eventId}/duel`,
    //             headers: HEADERS
    //         };
    //         fetchH2H({ method: 'get', payload: [], url: options.url, headers: HEADERS })

    //     }


    // }, [eventId]);

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

    // function getStatusDom(item) {
    //     if (item?.status?.type === 'inprogress') {
    //         return (<Box sx={{ width: '50%', mt: 2 }}>
    //             <LinearProgress color="success" />
    //         </Box>)
    //     }
    //     else if (item?.status?.type === 'notstarted') {
    //         return (<div className='flex flex-row items-center'>
    //             {readableTimeStamp(item.startTimestamp)}

    //         </div>)
    //     }
    //     else {
    //         return (<div className='flex flex-col'>

    //             {readableDate(item.startTimestamp)}
    //             <span>Ended</span>
    //         </div>)
    //     }

    // }

    function getStatusDom(item) {
        if (item?.status?.type === 'inprogress') {
            return (<div className='flex flex-row w-full text-center space-x-1 items-center justify-center'>
                <span className='capitalize text-xs'>{item?.status?.description}</span>
                <span className='w-8'><LinearProgress color="success" /></span>
            </div>)
        }
        else if (item?.status?.type === 'notstarted') {
            return (<div className='flex flex-row items-center text-xs justify-center space-x-1 w-full'>
                <AiOutlineClockCircle />
                <span>{readableTimeStamp(item.startTimestamp)}</span>

            </div>)
        }
        else {
            return (<div className='flex flex-col w-full justify-center'>

                {readableDate(item.startTimestamp)}
            </div>)
        }

    }

    // function getStatusDom(item) {

    //     return (<div className='flex flex-row items-center text-[xs] justify-center space-x-1 w-full'>
    //         {readableTimeStamp(item.startTimestamp)}

    //     </div>)


    // }

    function getStatusOnlyDom(item) {
        if (item?.status?.type === 'inprogress') {
            return (<Box sx={{ width: '100%' }}>
                <span className='capitalize text-xs'>{item?.status?.description}</span>
                <LinearProgress color="success" sx={{ width: '50%', mx: 'auto', mt: 1 }} />
            </Box>)
        }
        else {
            return (<div className='flex flex-col w-full '>
                <span className='capitalize'>{item?.status?.description}</span>
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
    // function getPlayerDom1(item) {

    //     try {
    //         let p1 = item['homeTeam']
    //         let p2 = item['awayTeam']
    //         // if (!item.tournament.name.toLowerCase().includes('davis cup') && !item.tournament.name.toLowerCase().includes('billie jean king cup')) {
    //         const uniqueTournament = item.tournament.uniqueTournament;
    //         if (uniqueTournament.name && uniqueTournament.name.includes(tournamentName)) {
    //             if (!uniqueTournament.name.toLowerCase().includes('doubles')) {
    //                 if ((
    //                     (p1.country && p1.country.name.toLowerCase() === selectedCountry) ||
    //                     (p2.country && p2.country.name.toLowerCase() === selectedCountry)
    //                 ) && matchStatusList.includes(item?.status?.type)) {
    //                     return (<div key={`${item.id}-${uniqueTournament}`} className='flex flex-col w-full h-full border text-xs sm:text-sm xs:text-base'>
    //                         <div className="flex space-x-2 w-full h-full flex-row items-center  ">
    //                             <div className="h-full flex items-center"><CountryIcon countryCode={p1.country?.alpha2} name={p1.country?.name} size={15} /></div>
    //                             <div className="h-full flex items-center ">{getFullName(p1.name, p1.slug)}</div>
    //                             {item.firstToServe === 1 && item?.status?.type === 'inprogress' ? <IoTennisballSharp size={15} className='text-green-500' /> : ""}
    //                             {item.winnerCode === 1 ? <CheckIcon sx={{ color: "green", fontSize: 20 }} /> : ""}

    //                         </div>
    //                         <div key={item.id} className="space-x-2 h-full flex flex-row items-center ">
    //                             <div className="h-full flex items-center"><CountryIcon countryCode={p2?.country.alpha2} name={p2?.name} size={15} /></div>
    //                             <div className="h-full flex items-center">{getFullName(p2.name, p2.slug)}</div>
    //                             {item.firstToServe === 2 && item?.status?.type === 'inprogress' ? <IoTennisballSharp size={15} className='text-green-500' /> : ""}
    //                             {item.winnerCode === 2 ? <CheckIcon sx={{ color: "green", fontSize: 20 }} /> : ""}
    //                         </div>
    //                     </div>
    //                     )

    //                 }
    //             } else {
    //                 const p1a = p1.subTeams[0];
    //                 const p1b = p1.subTeams[1];
    //                 const p2a = p2.subTeams[0];
    //                 const p2b = p2.subTeams[1];
    //                 const countries = [
    //                     (p1a.country) ? p1a.country.name.toLowerCase() : null,
    //                     (p1a.country) ? p1b.country.name.toLowerCase() : null,
    //                     (p1a.country) ? p2a.country.name.toLowerCase() : null,
    //                     (p1a.country) ? p2b.country.name.toLowerCase() : null
    //                 ];
    //                 if (countries.includes(selectedCountry) && matchStatusList.includes(item?.status?.type)) {
    //                     return (<div key={`${item.id}-${uniqueTournament}`}>
    //                         <div key={item.id} className="space-x-2 p-1 flex flex-row items-center text-xs sm:text-sm xs:text-base">
    //                             <div className='w-full flex flex-col'>
    //                                 <div className='w-full flex flex-row space-x-2 items-center'>
    //                                     <span><CountryIcon countryCode={p1a.country?.alpha2} name={p1a.country?.name} size={15} /></span>
    //                                     <span>{getFullName(p1a.name, p1a.slug)}</span>
    //                                 </div>
    //                                 <div className='w-full flex flex-row space-x-2'>
    //                                     <span><CountryIcon countryCode={p1b.country?.alpha2} name={p1b.country?.name} size={15} /></span>
    //                                     <span>{getFullName(p1b.name, p1b.slug)}</span>
    //                                     {item.firstToServe === 1 && item?.status?.type === 'inprogress' ? <IoTennisballSharp size={15} className='text-green-500' /> : ""}
    //                                     {item.winnerCode === 1 ? <CheckIcon sx={{ color: "green", fontSize: 20 }} /> : ""}

    //                                 </div>

    //                             </div>
    //                         </div>
    //                         <div key={item.id} className="space-x-2  p-1 flex flex-row items-center text-xs sm:text-sm xs:text-base">
    //                             <div className='w-full flex flex-col'>
    //                                 <div className='w-full flex flex-row space-x-2 items-center'>
    //                                     <span><CountryIcon countryCode={p2a.country?.alpha2} name={p2a.country?.name} size={15} /></span>
    //                                     <span>{getFullName(p2a.name, p2a.slug)}</span>
    //                                 </div>
    //                                 <div className='w-full flex flex-row space-x-2 items-center'>
    //                                     <span><CountryIcon countryCode={p2b.country?.alpha2} name={p2b.country?.name} size={15} /></span>
    //                                     <span>{getFullName(p2b.name, p2b.slug)}</span>
    //                                     {item.firstToServe === 2 && item?.status?.type === 'inprogress' ? <IoTennisballSharp size={15} className='text-green-500' /> : ""}
    //                                     {item.winnerCode === 2 ? <CheckIcon sx={{ color: "green", fontSize: 20 }} /> : ""}

    //                                 </div>

    //                             </div>

    //                         </div>
    //                     </div>
    //                     )

    //                 }
    //             }
    //         }
    //         // }
    //     }
    //     catch (err) {
    //         console.error(err)
    //     }


    // }

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
                            {/* {fetchH2HStatsDom(item)} */}
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

    // function fetchH2HStatsDom(item) {
    //     return (<div className="flex flex-row  justify-center  space-x-2  text-white w-full text-xs bg-green-200">   {item?.status?.type !== "notstarted" &&
    //         <button className="bg-green-600 p-[1px] rounded-sm flex items-center space-x-2 w-[40%]" onClick={(e) => handleClickOpenMatchStat(item)}>
    //             <IoStatsChartSharp color="white" /> <span>MATCH STATS</span></button>}
    //         <button className="bg-yellow-600 text-white  p-[2px] rounded-sm w-[40%]" onClick={(e) => handleClickOpenH2H(item)}>H2H</button></div>)
    // }
    function fetchH2HStatsDom(item) {
        return (
            <div className="flex flex-row  space-x-2 w-full text-xs bg-indigo-200   rounded-md">
                <div className='w-[40%] md:w-[25%] flex flex-row items-center font-bold space-x-1'>
                    <span className="text-xs  text-center bg-slate-600 text-white p-1">{getRoundAbbreviation(item?.roundInfo?.name)} </span>
                    <span className="text-xs w-[80%] whitespace-nowrap border text-center rounded p-1">{getStatusDom(item)}</span>

                </div>

                {(
                    <button
                        className="text-center font-bold justify-center bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-sm flex items-center space-x-2 w-[25%] md:w-[20%]"
                        onClick={(e) => handleClickOpenMatchStat(item)}
                    // disabled={item?.status?.type === "notstarted"}
                    >
                        <IoStatsChartSharp color="white" />
                        <span className="hidden md:inline">MATCH STATS</span> {/* Shown on md and larger screens */}
                        <span className="inline md:hidden">STATS</span> {/* Shown on screens smaller than md */}
                    </button>
                )}

                <button
                    className="space-x-2 flex flex-row items-center justify-center font-bold bg-yellow-600 hover:bg-yellow-700 text-white p-1 rounded-sm w-[20%] md:w-[20%]"
                    onClick={(e) => handleClickOpenH2H(item)}
                >
                    <span><HiMiniTableCells /> </span>
                    <span>H2H</span>
                </button>
            </div>
        );
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

                    objDom = (<div className='flex flex-col bg-slate-200 border'>
                        <div className='bg-indigo-300'>{fetchH2HStatsDom(item)}</div>

                        <div className="flex flex-row w-full h-full text-sm sm:text-xs xs:text-xs space-x-2 sm:space-x-4 border">
                            {/* <div className='w-[10%] sm:w-[10%] flex flex-col justify-center text-center items-center font-bold'>
                                <span className="text-xs w-full flex justify-center">{getStatusOnlyDom(item)}</span>
                            </div> */}
                            <div className="relative flex flex-col  min-h-full justify-center w-[60%] sm:w-[30%]">
                                {getPlayerDom1(item)}
                            </div>

                            <div className='w-[20%]'>{item?.status?.type !== "notstarted" && formatTennisScoreDom(item['homeScore'], item['awayScore'], item?.status?.type)}</div>
                        </div>
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
                return (<div className="flex flex-row bg-blue-300  items-center p-1">
                    <span>{seasonName} </span>
                    {/* <FcBusinessman /> */}
                </div>
                )
            }
            else {
                return (<div className="flex flex-row bg-pink-300 items-center p-1">
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
                <div key={tournament + index} className="border m-1 bg-slate-300">
                    <div className='text-sm sm:text-base md:text-lg lg:text-lg xl:text-lg font-semi-bold'>{getScoreHeader(tournament)}</div>
                    <ul>
                        {rankingsData[tournament].filter(hasIndian).map((item, subIndex) => (
                            <li key={subIndex} className='m-2 border '>
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


    function formatDate(isoDate) {

        const dateObj = new Date(isoDate);
        const day = dateObj.getUTCDate();
        const month = dateObj.toLocaleString('default', { month: 'short' });
        const year = dateObj.getUTCFullYear();

        // Format the date as "DD-MMM-YYYY"
        const formattedDate = `${day}-${month}-${year}`;
        return formattedDate
    }

    return (
        <div>
            <CountryDialog open={dialogOpenCountry} onClose={handleCloseCountry} />
            <MatchStats open={openMatchStat} handleClose={handleCloseMatchStat}
                loadingStats={loadingStats}
                data={matchStatsData}
                scoreRecord={scoreRecord}
                eventId={eventId}
                selectedMatchStatus={selectedMatchStatus}
            />
            <Head2Head open={openH2H} handleClose={handleCloseMatchStat}
                loading={loadingH2H}
                data={h2hData}
                scoreRecord={scoreRecord}
                eventId={eventId}
            />

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
                {/* <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                    <Tooltip title="Country Details">
                        <IconButton variant="contained" onClick={handleClickOpenCountry}>
                            <FaFlag />
                        </IconButton>
                    </Tooltip>
                </Box> */}
                <IconButton onClick={handleRefresh} sx={{ color: 'black' }}><SyncIcon /></IconButton>
            </div>
            <div className="sm:hidden text-xs w-full bg-slate-700 text-white text-center flex flex-row justify-center space-x-1 items-center">
                <span className="mr-2">Showing Results for</span>
                <span>{selectedCountryCode?<CountryIcon countryCode={selectedCountryCode} size={15} />:<FaGlobe className='text-green-100'/>}</span>
                <span className="uppercase  font-bold">{selectedCountryCode?selectedCountry:"All Countries"}</span>
                {/* <div className='flex flex-row space-x-1 items-center ml-2'>
                    <AiOutlineClockCircle  />
                    <span className="capitalize">{formatDate(selectedDate)}</span>
                </div> */}
            </div>
            {error && <p></p>}
            {loading ? <Loader /> : rankingsData && (
                <div className="w-[100%] mx-auto">
                    {/* <pre>{JSON.stringify(rankingsData, null, 2)}</pre> */}
                    {true ? recordDom() : "No Indian"}
                </div>
            )}
        </div>
    );
};

export default FixtureResultsAll;

