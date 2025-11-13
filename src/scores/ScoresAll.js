import CheckIcon from '@mui/icons-material/Check';
import SyncIcon from '@mui/icons-material/Sync';
import { Accordion, AccordionDetails, AccordionSummary, FormControl, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { AiOutlineClockCircle } from 'react-icons/ai';
import { FaGlobe } from "react-icons/fa";
import { FcBusinessman } from "react-icons/fc";
import { HiMiniTableCells } from "react-icons/hi2";
import { IoStatsChartSharp, IoTennisballSharp } from "react-icons/io5";
import { useParams } from 'react-router-dom';
import useApiCall from '../common/apiCalls/useApiCall';
import CountryIcon from '../common/Country';
import CountryDialog from '../common/country/CountryDialog';
import CountryAutocomplete from '../common/CountryAutoComplete';
import DatePickerValue from '../common/DatePicker';
import Head2Head from '../common/dialogs/HeadToHead';
import MatchStats from '../common/dialogs/MatchStats';
import PlayerInfo from '../common/dialogs/PlayerInfo';
import Loader from '../common/stateHandlers/LoaderState';
import NotFound from '../common/stateHandlers/NotFound';
import StatusButtonGroup from '../common/toolbar/StatusButtonGroup';
import { getItem, setItem } from '../indexDb/indexedDB';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FluidAd from '../ads/FluidAd';
import InArticleAd from '../ads/InArticleAd';
import FluidAdImage from '../ads/FluidAdImage';
import PushNotifier from '../common/PushNotifier';
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
    document.title = "Tennis India Live | Countrywise Live Scores & Global Updates"
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
    const [matchStatusList, setMatchStatusList] = useState(["notstarted", "inprogress", "canceled", "finished", "interrupted"]);
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
    const [playerId, setPlayerId] = React.useState(0);
    const [openPlayerInfo, setOpenPlayerInfo] = React.useState(false);
    const [expanded, setExpanded] = React.useState(false);


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

    const handleClickPlayerName = (item) => {
        setPlayerId(item.id)
        setOpenPlayerInfo(true);

    };


    const handleClosePlayerInfo = (item) => {
        setOpenPlayerInfo(false);

    };

    const handleCloseMatchStat = () => {
        setOpenMatchStat(false);
        setOpenH2H(false)
    };
    const handleCountryChange = async (newCountryCode, newValue) => {
        setSelectedCountry(newCountryCode);
        setSelectedCountryCode(newValue ? newValue.code : null)
        await setItem('country', newCountryCode);
        await setItem('countryCode', newValue ? newValue.code : null);
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
            setMatchStatusList(["notstarted", "inprogress", "canceled", "finished", 'interrupted'])
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


    function formatTennisScoreDom(homeScore, awayScore, currentStatus) {
        // Extract the sets' scores
        const homePeriods = [
            homeScore.period1 || 0,
            homeScore.period2 || 0,
            homeScore.period3 || 0,
            homeScore.period4 || 0,
            homeScore.period5 || 0
        ];

        const awayPeriods = [
            awayScore.period1 || 0,
            awayScore.period2 || 0,
            awayScore.period3 || 0,
            awayScore.period4 || 0,
            awayScore.period5 || 0
        ];

        // Handle tiebreak scores if present
        const homeTiebreaks = [
            homeScore.period1TieBreak || '',
            homeScore.period2TieBreak || '',
            homeScore.period3TieBreak || '',
            homeScore.period4TieBreak || '',
            homeScore.period5TieBreak || ''
        ];

        const awayTiebreaks = [
            awayScore.period1TieBreak || '',
            awayScore.period2TieBreak || '',
            awayScore.period3TieBreak || '',
            awayScore.period4TieBreak || '',
            awayScore.period5TieBreak || ''
        ];

        const homeScores = [];
        const awayScores = [];

        // Add scores for the first two sets
        for (let i = 0; i < 2; i++) {
            if (homeTiebreaks[i] && awayTiebreaks[i]) {
                homeScores.push(
                    <span key={`homePeriod${i + 1}`}>
                        {homePeriods[i]}
                        <sup className="font-bold">{homeTiebreaks[i]}</sup>
                    </span>
                );
                awayScores.push(
                    <span key={`awayPeriod${i + 1}`}>
                        {awayPeriods[i]}
                        <sup className="font-bold">{awayTiebreaks[i]}</sup>
                    </span>
                );
            } else {
                homeScores.push(`${homePeriods[i]}`);
                awayScores.push(`${awayPeriods[i]}`);
            }
        }

        // Add the 3rd set score if the match went to 3 sets
        if (homePeriods[2] !== 0 || awayPeriods[2] !== 0) {
            if (homeTiebreaks[2] && awayTiebreaks[2]) {
                homeScores.push(
                    <span key={`homePeriod3`}>
                        {homePeriods[2]}
                        <sup className="font-bold">{homeTiebreaks[2]}</sup>
                    </span>
                );
                awayScores.push(
                    <span key={`awayPeriod3`}>
                        {awayPeriods[2]}
                        <sup className="font-bold">{awayTiebreaks[2]}</sup>
                    </span>
                );
            } else {
                homeScores.push(`${homePeriods[2]}`);
                awayScores.push(`${awayPeriods[2]}`);
            }
        }

        // Add the 4th set score if the match went to 4 sets
        if (homePeriods[3] !== 0 || awayPeriods[3] !== 0) {
            if (homeTiebreaks[3] && awayTiebreaks[3]) {
                homeScores.push(
                    <span key={`homePeriod4`}>
                        {homePeriods[3]}
                        <sup className="font-bold">{homeTiebreaks[3]}</sup>
                    </span>
                );
                awayScores.push(
                    <span key={`awayPeriod4`}>
                        {awayPeriods[3]}
                        <sup className="font-bold">{awayTiebreaks[3]}</sup>
                    </span>
                );
            } else {
                homeScores.push(`${homePeriods[3]}`);
                awayScores.push(`${awayPeriods[3]}`);
            }
        }

        // Add the 5th set score if the match went to 5 sets
        if (homePeriods[4] !== 0 || awayPeriods[4] !== 0) {
            if (homeTiebreaks[4] && awayTiebreaks[4]) {
                homeScores.push(
                    <span key={`homePeriod5`}>
                        {homePeriods[4]}
                        <sup className="font-bold">{homeTiebreaks[4]}</sup>
                    </span>
                );
                awayScores.push(
                    <span key={`awayPeriod5`}>
                        {awayPeriods[4]}
                        <sup className="font-bold">{awayTiebreaks[4]}</sup>
                    </span>
                );
            } else {
                homeScores.push(`${homePeriods[4]}`);
                awayScores.push(`${awayPeriods[4]}`);
            }
        }

        return (
            <div className="flex flex-col h-full w-full items-center justify-center">
                <div className="flex flex-row space-x-2 w-full h-[1/2] text-sm border-b-2 border-slate-200">
                    {homeScores.map((score, index) => (
                        <div className="w-[20%] p-1" key={index}>{score}</div>
                    ))}
                    {currentStatus === 'inprogress' && <span className="border text-green-800 p-1 font-bold">{homeScore?.point}</span>}
                </div>
                <div className="flex flex-row space-x-2 w-full h-[1/2] text-sm">
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
            return (<div className='flex flex-row w-full justify-center text-xs space-x-1'>

                <span className='text-xs'>{readableDate(item.startTimestamp)}</span>
                <span className='text-xs'>({item?.status?.description})</span>
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
            'final': 'FINAL',
            'finals': 'FINAL'
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
            return name
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
            const uniqueTournament = item.tournament;
            if (uniqueTournament.name && uniqueTournament.name.includes(tournamentName)) {
                if (!uniqueTournament.name.toLowerCase().includes('double')) {
                    if ((selectedCountry === '' ||
                        ((p1.country && p1.country.name.toLowerCase() === selectedCountry) ||
                            (p2.country && p2.country.name.toLowerCase() === selectedCountry))
                    ) && matchStatusList.includes(item?.status?.type)) {
                        return (<div key={`${item.id}-${uniqueTournament}`} className='flex flex-col w-full h-full border'>
                            <div className="flex space-x-2 w-full h-full flex-row items-center  ">
                                <div className="h-full flex items-center"><CountryIcon countryCode={p1.country?.alpha2} name={p1.country?.name} size={15} /></div>
                                <div className="h-full flex items-center p-1">
                                    <button
                                        className="transition hover:bg-blue-500  hover:text-white hover:p-1"
                                        onClick={() => handleClickPlayerName(p1)}
                                    >{getFullName(p1.name, p1.slug)}</button></div>
                                {item.firstToServe === 1 && item?.status?.type === 'inprogress' ? <IoTennisballSharp size={15} className='text-green-500' /> : ""}
                                {item.winnerCode === 1 ? <CheckIcon sx={{ color: "green", fontSize: 20 }} /> : ""}

                            </div>
                            {/* {fetchH2HStatsDom(item)} */}
                            <div key={item.id} className="space-x-2 h-full flex flex-row items-center ">
                                <div className="h-full flex items-center "><CountryIcon countryCode={p2?.country.alpha2} name={p2.country?.name} size={15} /></div>
                                <div className="h-full flex items-center p-1"><button className="transition hover:p-1 hover:bg-blue-500  hover:text-white" onClick={() => handleClickPlayerName(p2)}>{getFullName(p2.name, p2.slug)}</button></div>
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
                                        <span><button className="transition hover:bg-blue-500 hover:p-1 hover:text-white" onClick={() => handleClickPlayerName(p1a)}>{getFullName(p1a.name, p1a.slug)}</button></span>
                                    </div>
                                    <div className='w-full flex flex-row space-x-2'>
                                        <span><CountryIcon countryCode={p1b.country?.alpha2} name={p1b.country?.name} size={15} /></span>
                                        <span><button className="transition hover:p-1 hover:bg-blue-500  hover:text-white" onClick={() => handleClickPlayerName(p1b)}>{getFullName(p1b.name, p1b.slug)}</button></span>
                                        {item.firstToServe === 1 && item?.status?.type === 'inprogress' ? <IoTennisballSharp size={15} className='text-green-500' /> : ""}
                                        {item.winnerCode === 1 ? <CheckIcon sx={{ color: "green", fontSize: 20 }} /> : ""}

                                    </div>

                                </div>
                            </div>
                            <div key={item.id} className="space-x-2  p-1 flex flex-row items-center">
                                <div className='w-full flex flex-col'>
                                    <div className='w-full flex flex-row space-x-2 items-center'>
                                        <span><CountryIcon countryCode={p2a.country?.alpha2} name={p2a.country?.name} size={15} /></span>
                                        <span><button className="transition hover:p-1 hover:bg-blue-500  hover:text-white" onClick={() => handleClickPlayerName(p2a)}>{getFullName(p2a.name, p2a.slug)}</button></span>
                                    </div>
                                    <div className='w-full flex flex-row space-x-2 items-center'>
                                        <span><CountryIcon countryCode={p2b.country?.alpha2} name={p2b.country?.name} size={15} /></span>
                                        <span><button className="transition hover:p-1 hover:bg-blue-500  hover:text-white" onClick={() => handleClickPlayerName(p2b)}>{getFullName(p2b.name, p2b.slug)}</button></span>
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
            console.log(err)
        }


    }

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
                            <div className="relative flex flex-col  min-h-full justify-center w-[60%] sm:w-[40%]">
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
                console.log(err)
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
            const uniqueTournament = item.tournament;
            if (uniqueTournament.name && uniqueTournament.name.includes(tournamentName)) {
                if (!uniqueTournament.name.toLowerCase().includes('double')) {
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
            console.log(err)
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
        let category = rankingsData[tournament][0]?.tournament?.category?.name
        let uniqueTournament = rankingsData[tournament][0]?.tournament?.uniqueTournament?.name
        if (name) {
            if (category.toLowerCase().includes("atp") || category.toLowerCase().includes("men") || category.toLowerCase().includes("challenger")) {
                return (<div className="flex flex-row bg-blue-300  items-center p-1">
                    <span>{category.toLowerCase().includes("itf") ? uniqueTournament : seasonName} </span>
                    {/* <FcBusinessman /> */}
                </div>
                )
            }
            else {
                return (<div className="flex flex-row bg-pink-300 items-center p-1">
                    <span>{category.toLowerCase().includes("itf") ? uniqueTournament : seasonName} </span>
                    {/* <FcBusinesswoman /> */}
                </div>
                )

            }
        }
        else {
            return (<div className="flex flex-row bg-gray-300 text-lg items-center p-1">
                <span>{seasonName} </span>
                <FcBusinessman />
            </div>)
        }
    }

    // function recordDom() {
    //     // Filter the rankingsData to only include tournaments with Indian players
    //     let rankingsDataCopy = JSON.parse(JSON.stringify(rankingsData))
    //     const filteredRankingsData = Object.keys(rankingsDataCopy).filter(tournament => hasIndianInAllScores(rankingsData[tournament], tournament));

    //     if (filteredRankingsData.length === 0) {
    //         return <NotFound msg="No Results Found" />
    //     }
    //     else {
    //         let objDom = filteredRankingsData.map((tournament, index) => (
    //             <div key={tournament + index} className="border m-1 bg-slate-300">
    //                 <div className='text-sm sm:text-base md:text-lg lg:text-lg xl:text-lg font-semi-bold'>{getScoreHeader(tournament)}</div>
    //                 <ul>
    //                     {rankingsData[tournament].filter(hasIndian).map((item, subIndex) => (
    //                         <li key={subIndex} className='m-2 border '>
    //                             {fetchScoreRecord(item)}
    //                         </li>
    //                     ))}
    //                 </ul>
    //             </div>
    //         ));
    //         return objDom
    //     }


    // }

    // function recordDom() {
    //     // Filter the rankingsData to only include tournaments with Indian players
    //     let rankingsDataCopy = JSON.parse(JSON.stringify(rankingsData))
    //     const filteredRankingsData = Object.keys(rankingsDataCopy).filter(tournament => hasIndianInAllScores(rankingsData[tournament], tournament));

    //     if (filteredRankingsData.length === 0) {
    //         return <NotFound msg="No Results Found" />
    //     }
    //     else {
    //         // Build result array and insert FluidAd after every 3rd or 4th tournament index
    //         const result = [];
    //         filteredRankingsData.forEach((tournament, index) => {
    //             result.push(
    //                 <div key={tournament + index} className="border m-1 bg-slate-300">
    //                     <div className='text-sm sm:text-base md:text-lg lg:text-lg xl:text-lg font-semi-bold'>{getScoreHeader(tournament)}</div>
    //                     <ul>
    //                         {rankingsData[tournament].filter(hasIndian).map((item, subIndex) => (
    //                             <li key={subIndex} className='m-2 border '>
    //                                 {fetchScoreRecord(item)}
    //                             </li>
    //                         ))}
    //                     </ul>
    //                 </div>
    //             );

    //             // Insert ad after every 4th item OR after every 3rd item (but not duplicate when it's also a 4th)
    //             const position = index + 1;
    //             const shouldInsertAd = (position % 4 === 0);
    //             if (shouldInsertAd) {
    //                 result.push(
    //                     <div key={`ad-${index}`} className="m-2">
    //                         <FluidAd />
    //                     </div>
    //                 );
    //             }
    //         });

    //         return result
    //     }


    // }

    // function recordDom() {
    //     let rankingsDataCopy = JSON.parse(JSON.stringify(rankingsData))
    //     const filteredRankingsData = Object.keys(rankingsDataCopy).filter(tournament => hasIndianInAllScores(rankingsData[tournament], tournament));

    //     if (filteredRankingsData.length === 0) {
    //         return <NotFound msg="No Results Found" />
    //     }
    //     else {
    //         const result = [];
    //         let adCounter = 0; // Counter to rotate between 3 ad types

    //         filteredRankingsData.forEach((tournament, index) => {
    //             result.push(
    //                 <div key={tournament + index} className="border m-1 bg-slate-300">
    //                     <div className='text-sm sm:text-base md:text-lg lg:text-lg xl:text-lg font-semi-bold'>{getScoreHeader(tournament)}</div>
    //                     <ul>
    //                         {rankingsData[tournament].filter(hasIndian).map((item, subIndex) => (
    //                             <li key={subIndex} className='m-2 border '>
    //                                 {fetchScoreRecord(item)}
    //                             </li>
    //                         ))}
    //                     </ul>
    //                 </div>
    //             );

    //             // Insert rotating ads after every 4th item
    //             const position = index + 1;
    //             if (position % 4 === 0) {
    //                 result.push(
    //                     <div key={`ad-${index}`} className="m-2">
    //                         {adCounter % 3 === 0 ? <FluidAdImage /> :
    //                             adCounter % 3 === 1 ? <FluidAd /> :
    //                                 <InArticleAd />}
    //                     </div>
    //                 );
    //                 adCounter++; // Increment counter to rotate next ad
    //             }
    //         });

    //         return result;
    //     }
    // }
    function recordDom() {
        let rankingsDataCopy = JSON.parse(JSON.stringify(rankingsData));
        const filteredRankingsData = Object.keys(rankingsDataCopy).filter(tournament =>
            hasIndianInAllScores(rankingsData[tournament], tournament)
        );

        if (filteredRankingsData.length === 0) {
            return <NotFound msg="No Results Found" />;
        }

        const result = [];
        let adCounter = 0;

        filteredRankingsData.forEach((tournament, index) => {
            const position = index + 1;

            // Push tournament block
            result.push(
                <div key={tournament} className="border m-1 bg-slate-300">
                    <div className='text-sm sm:text-base md:text-lg lg:text-lg xl:text-lg font-semibold'>
                        {getScoreHeader(tournament)}
                    </div>
                    <ul>
                        {rankingsData[tournament].filter(hasIndian).map((item, subIndex) => (
                            <li key={subIndex} className='m-2 border'>
                                {fetchScoreRecord(item)}
                            </li>
                        ))}
                    </ul>
                </div>
            );

            // Insert ad after every 4th tournament
            if (position % 4 === 0) {
                const adType = adCounter % 3;
                const adComponent = adType === 0 ? <FluidAdImage />
                    : adType === 1 ? <FluidAd />
                        : <InArticleAd />;

                const adName = adType === 0 ? "FluidAdImage"
                    : adType === 1 ? "FluidAd"
                        : "InArticleAd";

                result.push(
                    <div
                        key={`ad-${position}-${adName}`}
                        className="m-2 p-4 border border-dashed border-gray-400 bg-gray-50 text-center"
                        title={`Ad Slot: ${adName} (Position: ${position})`} // Hover to debug
                    >
                        {adComponent}
                    </div>
                );
                adCounter++;
            }
        });

        return result;
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
            <MatchStats
                open={openMatchStat}
                handleClose={handleCloseMatchStat}
                loadingStats={loadingStats}
                data={matchStatsData}
                scoreRecord={scoreRecord}
                eventId={eventId}
                selectedMatchStatus={selectedMatchStatus}
            />
            <Head2Head
                open={openH2H}
                handleClose={handleCloseMatchStat}
                loading={loadingH2H}
                data={h2hData}
                scoreRecord={scoreRecord}
                eventId={eventId}
            />
            <PlayerInfo
                open={openPlayerInfo}
                handleClose={handleClosePlayerInfo}
                loading={false}
                id={playerId}
            />

            {/* Informational Header to Increase Content Value for AdSense */}


            <div className="flex flex-row space-x-4 w-full bg-slate-200 items-center p-1 border m-1">
                <DatePickerValue handleSelectDate={handleSelectDate} selectedDate={selectedDate} />
                <StatusButtonGroup
                    matchStatus={matchStatus}
                    handleStatusButtonClick={handleStatusButtonClick}
                />
                <CountryAutocomplete
                    selectedCountry={selectedCountry}
                    handleCountryChange={handleCountryChange}
                />
                <IconButton onClick={handleRefresh} sx={{ color: 'black' }}>
                    <SyncIcon />
                </IconButton>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 text-gray-800 p-2 rounded-md m-2 text-sm">
                <div className="flex flex-row justify-between items-center mb-1">
                    <div className="text-sm sm:text-sm md:text-sm lg:text-sm font-semibold">
                        Live Scores - Countrywise
                    </div>
                    <div className="text-xs text-right whitespace-nowrap">
                        <b>Updated At:</b> {new Date().toLocaleString()}
                    </div>
                </div>
                <p className="text-xs sm:text-sm md:text-sm leading-relaxed text-gray-700">
                    This page provides real-time tennis scores for Indian players participating in ATP, WTA,
                    and ITF events. Along with the score updates, you can explore Head-to-Head records and
                    detailed Match Stats to dive deeper into the game.
                </p>
            </div>

            <div className="sm:hidden text-xs w-full bg-slate-700 text-white text-center flex flex-row justify-center space-x-1 items-center">
                <span className="mr-2">Showing Results for</span>
                <span>
                    {selectedCountryCode ? (
                        <CountryIcon countryCode={selectedCountryCode} size={15} />
                    ) : (
                        <FaGlobe className="text-green-100" />
                    )}
                </span>
                <span className="uppercase font-bold">
                    {selectedCountryCode ? selectedCountry : "All Countries"}
                </span>
            </div>

            {error && (
                <p className="text-red-600 mt-2 text-sm">
                    Error loading data. Please refresh or try again later.
                </p>
            )}

            {loading ? (
                <Loader />
            ) : (
                rankingsData && (
                    <div className="w-full mx-auto">
                        {recordDom()}

                        <div className="px-4 py-4">
                            <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />} className="bg-slate-100">
                                    <Typography className="font-medium">FAQs - Live Scores</Typography>
                                </AccordionSummary>
                                <AccordionDetails className="text-sm">
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                                        <li>
                                            <strong>How often are live scores updated?</strong> Live tennis scores are refreshed every 2 minutes using data from official sources. You can follow real-time progress for Indian players across various global events.
                                        </li>
                                        <li>
                                            <strong>What match filters are available?</strong> You can filter matches by <em>status</em> (Live, Completed, Not Started) and by <em>country</em>, helping you focus on matches that matter to you — including those featuring Indian athletes.
                                        </li>
                                        <li>
                                            <strong>Can I see Head-to-Head and Match Stats?</strong> Yes. For each match, you can view detailed <em>Head-to-Head</em> comparisons and <em>Match Stats</em>, offering deeper insights into player performance and history.
                                        </li>
                                        <li>
                                            <strong>Do you provide ATP and WTA rankings?</strong> Absolutely. We showcase up-to-date, official ATP and WTA rankings. Our ranking pages highlight global standings as well as Indian player positions.
                                        </li>
                                        <li>
                                            <strong>Are there profiles for Indian players?</strong> Yes. We feature detailed profiles for many Indian players, including rankings and career highlights — making it easier to track their journey on the professional circuit.
                                        </li>
                                        <li>
                                            <strong>How can I suggest a feature or report a missing player?</strong> We’d love your feedback! You can reach out via the Players section or our contact form to suggest improvements or request player additions.
                                        </li>
                                    </ul>
                                </AccordionDetails>
                            </Accordion>
                        </div>
                    </div>
                )
            )}
        </div>
    );

};

export default FixtureResultsAll;

