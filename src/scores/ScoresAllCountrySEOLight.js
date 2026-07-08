import CheckIcon from '@mui/icons-material/Check';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SyncIcon from '@mui/icons-material/Sync';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Typography,
    IconButton,
    Tooltip,
    Chip,
    Grid,
    Card,
    CardContent,
    Avatar
} from '@mui/material';
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
import { toast } from 'react-toastify';
import FluidAd from '../ads/FluidAd';
import FluidAdImage from '../ads/FluidAdImage';
import InArticleAd from '../ads/InArticleAd';
import useApiCall from '../common/apiCalls/useApiCall';
import CountryIcon from '../common/Country';
import CountryDialog from '../common/country/CountryDialog';
import CountryAutocomplete from '../common/CountryAutoComplete';
import DatePickerValue from '../common/DatePicker';
import Head2Head from '../common/dialogs/HeadToHead';
import MatchStats from '../common/dialogs/MatchStats';
import PlayerInfo from '../common/dialogs/PlayerInfo';
import SEO from '../common/seo/SEO';
import ErrorMessage from '../common/stateHandlers/ErrorState';
import Loader from '../common/stateHandlers/LoaderState';
import NotFound from '../common/stateHandlers/NotFound';
import StatusButtonGroup from '../common/toolbar/StatusButtonGroup';
import { getItem, setItem } from '../indexDb/indexedDB';
import { getAlpha3, getAlpha2FromName, getRouteKeyword, getBaseRoute, getSeoDom, getH1 } from '../utils/utils';
import BeautifulScoreCard from './BeautifulScoreCard';

// --- STYLED COMPONENTS ---
const PageWrapper = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(128deg,#e0eafd 0%,#fffdee 100%)',
    padding: theme.spacing(0),
    [theme.breakpoints.up('sm')]: { padding: theme.spacing(0) }
}));
const CardGlass = styled(Card)(({ theme }) => ({
    backdropFilter: 'blur(8px)',
    background: 'rgba(255,255,255,0.9)',
    borderRadius: 18,
    boxShadow: '0 2px 24px -2px #8f9bb636, 0 4px 24px -7px #ccc',
    margin: theme.spacing(2, 'auto'),
    // maxWidth: 760
}));
const TournamentTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    fontSize: '1.16rem',
    letterSpacing: '0.01em',
    [theme.breakpoints.down('sm')]: { fontSize: '1rem' }
}));
const ScoreStatusPill = styled(Chip)(({ theme }) => ({
    fontWeight: 600,
    fontSize: '0.93rem',
    padding: theme.spacing(0.5, 1.2),
    color: '#fff',
    background: 'linear-gradient(90deg,#3a7bd5 0%,#00d2ff 95%)',
    margin: theme.spacing(0.5, 0),
}));
const MatchRow = styled(Grid)(({ theme }) => ({
    display: 'flex',
    alignItems: 'stretch',
    background: '#f7f7f7',
    borderRadius: '13px',
    boxShadow: '0 1px 4px -2px #d6dbff46',
    margin: theme.spacing(1, 0),
    padding: theme.spacing(1),
    transition: 'box-shadow .23s',
    "&:hover": {
        boxShadow: '0 4px 16px -2px #b9bef633'
    }
}));
const PlayerName = styled('button')(({ theme }) => ({
    fontWeight: 600,
    color: '#2554be',
    border: 0,
    background: 'transparent',
    cursor: 'pointer',
    padding: theme.spacing(0.5, 1),
    transition: 'color .14s',
    '&:hover': { color: theme.palette.primary.main, textDecoration: 'underline' }
}));
const ScoreBox = styled(Box)(({ theme }) => ({
    borderRadius: '8px',
    backgroundColor: '#eaf2ff',
    padding: theme.spacing(0.5, 1),
    fontSize: '1.09rem',
    minWidth: 70,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
}));
const StickyToolbar = styled(Box)(({ theme }) => ({
    background: 'rgba(255,255,255,0.8)',
    borderRadius: '12px',
    boxShadow: '0 2px 16px -2px #b9bbbe13',
    padding: theme.spacing(2, 2),
    display: 'flex',
    gap: theme.spacing(1.5),
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    position: 'sticky',
    top: 0,
    zIndex: 20,
}));

const HEADERS = {
    'x-rapidapi-key': process.env.REACT_APP_RAPIDAPI_KEY,
    'x-rapidapi-host': 'tennisapi1.p.rapidapi.com'
};
const tournamentName = '';

const FixtureResultsCountry = () => {
    let params = useParams();
    let day, month, year;
    const date = new Date();
    let dayCurrent = String(date.getDate());
    let monthCurrent = String(date.getMonth() + 1);
    let yearCurrent = String(date.getFullYear());
    day = params.day ?? dayCurrent;
    month = params.month ?? monthCurrent;
    year = params.year ?? yearCurrent;
    let countryFullName = params.country ?? null;
    let country = getAlpha3(params.country) ?? null;

    // --- STATE HOOKS ---
    const [rankingsData, setRankingsData] = useState(null);
    const [rawData, setRawData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshScore, setRefreshScore] = useState(false);
    const [selectedDate, setDate] = React.useState(dayjs(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`));
    const [matchStatus, setMatchStatus] = useState("all");
    const [matchStatusList, setMatchStatusList] = useState(["notstarted", "inprogress", "canceled", "finished", "interrupted"]);
    const [selectedCountry, setSelectedCountry] = useState(params.country ?? '');
    const [selectedCountryCode, setSelectedCountryCode] = useState('');
    const [selectedCountryAlpha3, setSelectedCountryAlpha3] = useState(country && country.toLowerCase() === 'all' ? null : country);
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
    const [openPlayerInfo, setOpenPlayerInfo] = useState(false);
    const [expanded, setExpanded] = React.useState(false);

    // --- BUSINESS HANDLERS (from original file) ---
    const handleCloseCountry = () => setDialogOpenCountry(false);
    const handleClickOpenMatchStat = (item) => {
        console.log(item)
        setEventId(item.id);
        setScoreRecord(item);
        setOpenMatchStat(true);
        fetchMatchStats({
            method: 'get', payload: [], url: `https://tennisapi1.p.rapidapi.com/api/tennis/event/${item.id}/statistics`, headers: HEADERS
        });
        setSelectedMatchStatus(item?.status?.type);
    };
    const handleClickOpenH2H = (item) => {
        setEventId(item.id);
        setScoreRecord(item);
        setOpenH2H(true);
        fetchH2H({
            method: 'get', payload: [], url: `https://tennisapi1.p.rapidapi.com/api/tennis/event/${item.id}/duel`, headers: HEADERS
        });
    };
    const handleClickPlayerName = (item) => {
        console.log(item)
        setPlayerId(item.id);
        setOpenPlayerInfo(true);
    };
    const handleClosePlayerInfo = () => setOpenPlayerInfo(false);
    const handleCloseMatchStat = () => {
        setOpenMatchStat(false);
        setOpenH2H(false);
    };

    const handleCountryChange = async (newCountryCode, newValue) => {
        setSelectedCountry(newCountryCode);
        setSelectedCountryCode(newValue ? newValue.code : null);
        setSelectedCountryAlpha3(newValue ? newValue.alpha3.toLowerCase() : null);
        await setItem('country', newCountryCode);
        await setItem('countryCode', newValue ? newValue.code : null);
        await setItem('countryAlpha3', newValue ? newValue.alpha3.toLowerCase() : null);
        setTimeout(() => {
            toast.success("Loading scores...", { autoClose: 2000 });
            window.location.href = `${getBaseRoute()}/${newCountryCode.toLowerCase()}`;
        }, 800);
    };
    const handleStatusButtonClick = (event) => {
        if (event.target.innerText.toLowerCase() === 'live') setMatchStatus("inprogress");
        else if (event.target.innerText.toLowerCase() === 'not started') setMatchStatus("notstarted");
        else if (event.target.innerText.toLowerCase() === 'finished') setMatchStatus("finished");
        else setMatchStatus("all");
    };
    function groupItems(items) {
        const grouped = items.reduce((acc, item) => {
            const key = item.tournament.name;
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});
        return grouped;
    }
    const handleSelectDate = newValue => {
        const date = new Date(newValue);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        setDate(newValue);
        window.location.href = `/results/all/${year}/${month}/${day}`;
    };

    function filterLiveMatches(matches, countryAlpha3 = null) {
        if (matches === null) {
            return [];
        }
        return matches.filter((m) => {
            const isLive = m.status?.type === "inprogress";
            const byCountry = !countryAlpha3 ||
                m.homeTeam?.country?.alpha3 === countryAlpha3 ||
                m.awayTeam?.country?.alpha3 === countryAlpha3;
            return isLive && byCountry;
        });
    }
    useEffect(() => {
        const fetchRankings = async () => {
            setLoading(true);
            setError("");
            try {
                const calResp = await axios.request({
                    method: 'GET',
                    url: `https://tennisapi1.p.rapidapi.com/api/tennis/calendar/${day}/${month}/${year}/categories`,
                    headers: HEADERS
                });
                const categories = calResp.data?.categories ?? [];
                const seen = new Set();
                const events = [];
                for (const item of categories) {
                    const catId = item.category?.id;
                    if (!catId) continue;
                    try {
                        const res = await axios.request({
                            method: 'GET',
                            url: `https://tennisapi1.p.rapidapi.com/api/tennis/category/${catId}/events/${day}/${month}/${year}`,
                            headers: HEADERS
                        });
                        for (const evt of res.data?.events ?? []) {
                            if (!seen.has(evt.id)) { seen.add(evt.id); events.push(evt); }
                        }
                    } catch (e) { /* skip failed category */ }
                }
                setRawData(events);
                setRankingsData(groupItems(events));
                setLoading(false);
            } catch (error) {
                setError(error.message);
            }
        };
        fetchRankings();
        const intervalId = setInterval(fetchRankings, 120000);
        return () => clearInterval(intervalId);
    }, [day, month, year, refreshScore]);
    useEffect(() => {
        if (matchStatus.includes("all")) {
            setMatchStatusList(["notstarted", "inprogress", "canceled", "finished", 'interrupted']);
        } else {
            setMatchStatusList([matchStatus]);
        }
    }, [matchStatus]);
    useEffect(() => {
        const fetchValue = async () => {
            const storedValue = await getItem('country');
            const storedCountryCode = await getItem('countryCode');
            const storedCountryAlpha3 = await getItem('countryAlpha3');
            setSelectedCountry(countryFullName || storedValue || 'all');
            setSelectedCountryCode(getAlpha2FromName(countryFullName) || 'all');
            setSelectedCountryAlpha3(country || storedCountryAlpha3 || 'all');
        };
        fetchValue();
    }, [country]);

    function formatTennisScoreDom(homeScore, awayScore, currentStatus) {
        const homePeriods = [homeScore.period1 || 0, homeScore.period2 || 0, homeScore.period3 || 0, homeScore.period4 || 0, homeScore.period5 || 0];
        const awayPeriods = [awayScore.period1 || 0, awayScore.period2 || 0, awayScore.period3 || 0, awayScore.period4 || 0, awayScore.period5 || 0];
        const homeTiebreaks = [homeScore.period1TieBreak || '', homeScore.period2TieBreak || '', homeScore.period3TieBreak || '', homeScore.period4TieBreak || '', homeScore.period5TieBreak || ''];
        const awayTiebreaks = [awayScore.period1TieBreak || '', awayScore.period2TieBreak || '', awayScore.period3TieBreak || '', awayScore.period4TieBreak || '', awayScore.period5TieBreak || ''];
        const homeScores = [], awayScores = [];
        for (let i = 0; i < 2; i++) {
            if (homeTiebreaks[i] && awayTiebreaks[i]) {
                homeScores.push(<span key={`homePeriod${i + 1}`}>{homePeriods[i]}<sup className="font-bold">{homeTiebreaks[i]}</sup></span>);
                awayScores.push(<span key={`awayPeriod${i + 1}`}>{awayPeriods[i]}<sup className="font-bold">{awayTiebreaks[i]}</sup></span>);
            } else {
                homeScores.push(`${homePeriods[i]}`);
                awayScores.push(`${awayPeriods[i]}`);
            }
        }
        if (homePeriods[2] !== 0 || awayPeriods[2] !== 0) {
            if (homeTiebreaks[2] && awayTiebreaks[2]) {
                homeScores.push(<span key={`homePeriod3`}>{homePeriods[2]}<sup className="font-bold">{homeTiebreaks[2]}</sup></span>);
                awayScores.push(<span key={`awayPeriod3`}>{awayPeriods[2]}<sup className="font-bold">{awayTiebreaks[2]}</sup></span>);
            } else {
                homeScores.push(`${homePeriods[2]}`);
                awayScores.push(`${awayPeriods[2]}`);
            }
        }
        if (homePeriods[3] !== 0 || awayPeriods[3] !== 0) {
            if (homeTiebreaks[3] && awayTiebreaks[3]) {
                homeScores.push(<span key={`homePeriod4`}>{homePeriods[3]}<sup className="font-bold">{homeTiebreaks[3]}</sup></span>);
                awayScores.push(<span key={`awayPeriod4`}>{awayPeriods[3]}<sup className="font-bold">{awayTiebreaks[3]}</sup></span>);
            } else {
                homeScores.push(`${homePeriods[3]}`);
                awayScores.push(`${awayPeriods[3]}`);
            }
        }
        if (homePeriods[4] !== 0 || awayPeriods[4] !== 0) {
            if (homeTiebreaks[4] && awayTiebreaks[4]) {
                homeScores.push(<span key={`homePeriod5`}>{homePeriods[4]}<sup className="font-bold">{homeTiebreaks[4]}</sup></span>);
                awayScores.push(<span key={`awayPeriod5`}>{awayPeriods[4]}<sup className="font-bold">{awayTiebreaks[4]}</sup></span>);
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
    function getStatusIcon(type) {
        switch (type) {
            case "inprogress": return "🔴";
            case "notstarted": return "⏳";
            case "finished": return "🏆";
            case "interrupted": return "⏸️";
            case "postponed": return "📅";
            case "cancelled":
            case "canceled":
            case "retired":
            case "walkover":
            case "wo": return "❌";
            default: return "🎾";
        }
    }
    function getStatusDom(item) {
        if (item?.status?.type === 'inprogress') {
            return (
                <div className='flex flex-row w-full text-center space-x-1 items-center justify-center'>
                    <span className="text-white font-bold px-2 py-1 rounded bg-green-600 inline-block animate-[blink_1s_infinite]">
                        Live
                    </span>
                    <span className='capitalize text-xs'>{item?.status?.description}</span>
                </div>
            );
        } else if (item?.status?.type === 'notstarted') {
            return (
                <div className='flex flex-row items-center text-xs justify-center space-x-1 w-full'>
                    <AiOutlineClockCircle />
                    <span>{readableTimeStamp(item.startTimestamp)}</span>
                </div>
            );
        } else {
            return (
                <div className='flex flex-row w-full justify-center text-xs space-x-1 items-center'>
                    <span>{getStatusIcon(item?.status?.type)}</span>
                    <span>{readableDate(item.startTimestamp)}</span>
                    <span className='capitalize'>({item?.status?.description})</span>
                </div>
            );
        }
    }
    function getRoundAbbreviation(round) {
        if (!round) return "";
        round = round.toLowerCase();
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
            if (key.toLowerCase() === lowerCaseRound) return value;
        }
        return '';
    }
    function capitalize(str) {
        return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }
    function removeLastTwoCharacters(str) {
        let textToReplace = getTextAfterLastSpace(str);
        return str.replace(textToReplace, "").trim()
    }
    function getTextAfterLastSpace(str) {
        const lastSpaceIndex = str.lastIndexOf(' ');
        return str.slice(lastSpaceIndex + 1);
    }
    function getFullName(name, slug) {
        try { return name; }
        catch { return name; }
    }
    function getCountryCondition() {
        return (selectedCountryAlpha3 === '' || selectedCountryAlpha3 === null || selectedCountryAlpha3 === 'all');
    }
    function getPlayerDom2(item) {
        try {
            let p1 = item['homeTeam']
            let p2 = item['awayTeam']
            const uniqueTournament = item.tournament;
            if (uniqueTournament.name && uniqueTournament.name.includes(tournamentName)) {
                if (!uniqueTournament.name.toLowerCase().includes('double')) {
                    if ((getCountryCondition() ||
                        ((p1.country && p1.country.alpha3.toLowerCase() === selectedCountryAlpha3) ||
                            (p2.country && p2.country.alpha3.toLowerCase() === selectedCountryAlpha3))
                    )) {
                        return (<div key={`${item.id}-${uniqueTournament}`} className='flex flex-col w-full h-full border'>
                            <div className="flex space-x-2 w-full h-full flex-row items-center  ">
                                <div className="h-full flex items-center">
                                    <CountryIcon countryCode={p1.country?.alpha2} name={p1.country?.name} size={15} />
                                </div>
                                <div className="h-full flex items-center p-1">
                                    <button className="transition hover:bg-blue-500  hover:text-white hover:p-1"
                                        onClick={() => handleClickPlayerName(p1)}
                                    >{getFullName(p1.name, p1.slug)}</button>
                                </div>
                                {item.firstToServe === 1 && item?.status?.type === 'inprogress' ? <IoTennisballSharp size={15} className='text-green-500' /> : ""}
                                {item.winnerCode === 1 ? <CheckIcon sx={{ color: "green", fontSize: 20 }} /> : ""}
                            </div>
                            <div key={item.id} className="space-x-2 h-full flex flex-row items-center ">
                                <div className="h-full flex items-center ">
                                    <CountryIcon countryCode={p2?.country.alpha2} name={p2.country?.name} size={15} />
                                </div>
                                <div className="h-full flex items-center p-1">
                                    <button className="transition hover:p-1 hover:bg-blue-500  hover:text-white"
                                        onClick={() => handleClickPlayerName(p2)}
                                    >{getFullName(p2.name, p2.slug)}</button>
                                </div>
                                {item.firstToServe === 2 && item?.status?.type === 'inprogress' ? <IoTennisballSharp size={15} className='text-green-500' /> : ""}
                                {item.winnerCode === 2 ? <CheckIcon sx={{ color: "green", fontSize: 20 }} /> : ""}
                            </div>
                        </div>);
                    }
                }
            }
        }
        catch (err) { }
    }
  function fetchH2HStatsDom(item) {
    return (
        <div className="flex flex-row space-x-2 w-full text-xs bg-indigo-200 rounded-md">
            <div className='w-[40%] md:w-[25%] flex flex-row items-center font-bold space-x-1'>
                <span className="text-xs text-center bg-slate-600 text-white p-1">{getRoundAbbreviation(item?.roundInfo?.name)} </span>
                <span className="text-xs w-[80%] whitespace-nowrap border text-center rounded p-1">{getStatusDom(item)}</span>
            </div>
            <Grid item xs={2} sm={3} md={3}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: { xs: "flex-end", sm: "center" },
                    gap: 1,
                    minWidth: 42,
                    mt: { xs: 1, sm: 0 }
                }}>
                {/* Option 1: Raw link */}
                <a href={`/match-dashboard/${item.id}`} target="_blank" rel="noopener noreferrer">
                    Match Dashboard
                </a>
                {/* Option 2: React Router Link (uncomment if using) */}
                {/* <Link to={`/match-dashboard/${item.id}`} target="_blank" rel="noopener noreferrer">
                    Match Dashboard
                </Link> */}
                <Tooltip title="Match Stats">
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleClickOpenMatchStat(item)}
                        sx={{
                            bgcolor: '#f0fcff',
                            fontSize: "1.17rem",
                            mb: 1,
                        }}
                    >
                        <IoStatsChartSharp />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Head to Head">
                    <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => handleClickOpenH2H(item)}
                        sx={{
                            bgcolor: '#fff9e6',
                            fontSize: "1.17rem",
                        }}
                    >
                        <HiMiniTableCells />
                    </IconButton>
                </Tooltip>
            </Grid>
        </div>
    );
}
   
    function hasCountry(item) {
        try {
            let p1 = item['homeTeam']
            let p2 = item['awayTeam']

            // if (!item.tournament.name.toLowerCase().includes('davis cup') && !item.tournament.name.toLowerCase().includes('billie jean king cup')) {
            const uniqueTournament = item.tournament;
            if (uniqueTournament.name && uniqueTournament.name.includes(tournamentName)) {
                if (!uniqueTournament.name.toLowerCase().includes('double')) {
                    if ((getCountryCondition() ||
                        ((p1.country && p1.country.alpha3.toLowerCase() === selectedCountryAlpha3.toLowerCase()) ||
                            (p2.country && p2.country.alpha3.toLowerCase() === selectedCountryAlpha3.toLowerCase()))
                    ) && matchStatusList.includes(item?.status?.type)) {
                        return true

                    }
                } else {
                    const p1a = p1.subTeams[0];
                    const p1b = p1.subTeams[1];
                    const p2a = p2.subTeams[0];
                    const p2b = p2.subTeams[1];
                    const countries = [
                        (p1a.country) ? p1a.country.alpha3.toLowerCase() : null,
                        (p1a.country) ? p1b.country.alpha3.toLowerCase() : null,
                        (p1a.country) ? p2a.country.alpha3.toLowerCase() : null,
                        (p1a.country) ? p2b.country.alpha3.toLowerCase() : null
                    ];
                    if ((getCountryCondition() || countries.includes(selectedCountryAlpha3.toLowerCase())) && matchStatusList.includes(item?.status?.type)) {
                        return true
                    }
                }
            }
            // }
        }
        catch (err) {
            console.log("error in checking country")
        }

        return false
    }
    function hasIndianInAllScores(allTournamentScore, tournament) {
        let hasIndianList = allTournamentScore.map(item => hasCountry(item));
        return hasIndianList.includes(true);
    }
    const handleRefresh = e => { setRefreshScore(!refreshScore); }
    function readableTimeStamp(timestamp) {
        const date = new Date(timestamp * 1000);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        const formattedDate = `${day}-${month} ${hours}:${minutesStr} ${ampm}`;
        return formattedDate;
    }
    function readableDate(timestamp) {
        const date = new Date(timestamp * 1000);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
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
                </div>
                )
            }
            else {
                return (<div className="flex flex-row bg-pink-300 items-center p-1">
                    <span>{category.toLowerCase().includes("itf") ? uniqueTournament : seasonName} </span>
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
    // ---- BEAUTIFUL UI WRAPPERS ----
    function FiltersBar() {
        return (
            <StickyToolbar>
                <DatePickerValue handleSelectDate={handleSelectDate} selectedDate={selectedDate} />
                <StatusButtonGroup matchStatus={matchStatus} handleStatusButtonClick={handleStatusButtonClick} />
                <CountryAutocomplete selectedCountry={selectedCountry} handleCountryChange={handleCountryChange} />
                <Tooltip title="Refresh scores">
                    <IconButton onClick={handleRefresh} sx={{ color: '#0056c1' }}>
                        <SyncIcon />
                    </IconButton>
                </Tooltip>
            </StickyToolbar>
        );
    }


    function recordDom() {
        if (!rankingsData) return null;
        let filteredTournaments = Object.keys(rankingsData)
            .filter(tournament => hasIndianInAllScores(rankingsData[tournament], tournament));
        if (filteredTournaments.length === 0) {
            return <NotFound msg="No Results Found" />;
        }
        const result = [];
        filteredTournaments.forEach((tournament, idx) => {
            // Ad placement logic as before

            result.push(
                <CardGlass key={tournament}>
                    <TournamentTitle>
                        {getScoreHeader(tournament)}
                    </TournamentTitle>
                    {/* Responsive Score Cards */}
                    <Grid container spacing={2}>
                        {rankingsData[tournament].filter(hasCountry).map((item, subIdx) =>
                            <Grid item xs={12} md={6} key={subIdx}>
                                <BeautifulScoreCard item={item} handleClickOpenH2H={handleClickOpenH2H} handleClickOpenMatchStat={handleClickOpenMatchStat}
                                    handleClickPlayerName={handleClickPlayerName} />
                            </Grid>
                        )}
                    </Grid>
                </CardGlass>
            );
            if ((idx + 1) % 3 === 0) {
                result.push(
                    <Box key={`ad-${idx}`} sx={{
                        m: 2, p: 3, textAlign: 'center',
                        bgcolor: "#fffdee", borderRadius: 2, border: "1px dashed #f0e8c0"
                    }}>
                        {idx % 2 === 0 ? <FluidAd /> : <FluidAdImage />}
                    </Box>
                )
            }
        });
        return result;
    }
    function PageHero() {
        return (
            <>
                <CardGlass sx={{ mx: 'auto', width: '100%' }}>
                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: { xs: '1.3rem', sm: '1.7rem', md: '2rem' },
                            fontWeight: 800,
                            background: "linear-gradient(95deg,#562cff 10%,#007cf0 90%)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            color: "transparent",

                        }}
                    >
                        {getH1(selectedCountry)}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" mb={1.5}>
                        Live Scores, Head-to-Head, Rankings | Indian Tennis, ATP/WTA/ITF
                    </Typography>
                    {/* <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                        <Chip
                            avatar={
                                selectedCountryCode ?
                                    <CountryIcon countryCode={getAlpha2FromName(selectedCountry)?.toUpperCase()} size={18} />
                                    : <FaGlobe size={16} />
                            }
                            label={selectedCountryCode ? selectedCountry : "All Countries"}
                            color="info"
                            sx={{ fontWeight: 600, fontSize: ".92rem", letterSpacing: ".04em" }}
                        />
                        <Typography variant="body2" sx={{ color: "#777", fontWeight: 500 }}>
                            <b>Updated:</b> {new Date().toLocaleString()}
                        </Typography>
                    </Box> */}
                </CardGlass>
            </>
        );
    }
    // --- MAIN RETURN ---
    return (
        <PageWrapper>
            {getSeoDom()}
            <PageHero />
            <FiltersBar />
            {loading ? (
                <Box sx={{ my: 6, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Loader />
                    <Typography sx={{ mt: 2, fontWeight: 600, color: '#245' }}>
                        Fetching latest scores...
                    </Typography>
                </Box>
            ) : error ? (
                <ErrorMessage />
            ) : (
                <Box mx="auto" px={{ xs: 1, sm: 0 }} width="100%">
                    {recordDom()}
                    <CardGlass sx={{ mt: 4 }}>
                        <Accordion sx={{ bgcolor: "#f6fafd" }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6" fontWeight={700}>
                                    FAQs & Help
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <ul style={{
                                    margin: 0, padding: '0 0 0 1em', fontSize: '1rem', color: '#40485a', lineHeight: 1.7
                                }}>
                                    <li><b>How often are live scores updated?</b> Every 2 minutes, auto-refreshed.</li>
                                    <li><b>Match filters?</b> Filter by Status & Country, focus on Indian players.</li>
                                    <li><b>Can I see H2H and stats?</b> Yes for most matches using buttons provided.</li>
                                    <li><b>Rankings?</b> Real ATP/WTA plus Indian player rankings available.</li>
                                    <li><b>Profiles?</b> Yes, detailed profiles for Indian players.</li>
                                    <li><b>Suggestions?</b> Use our contact form for feedback or missing players.</li>
                                </ul>
                            </AccordionDetails>
                        </Accordion>
                    </CardGlass>
                </Box>
            )}

            {/* ALL dialogs unchanged! */}
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
        </PageWrapper>
    );
};

export default FixtureResultsCountry;