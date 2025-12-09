import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import dayjs from 'dayjs';
import {
    Accordion, AccordionSummary, AccordionDetails,
    Typography, IconButton, LinearProgress
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SyncIcon from '@mui/icons-material/Sync';
import { AiOutlineClockCircle } from 'react-icons/ai';
import { FaGlobe } from "react-icons/fa";
import { IoStatsChartSharp, IoTennisballSharp } from "react-icons/io5";
import { HiMiniTableCells } from "react-icons/hi2";

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
import useApiCall from '../common/apiCalls/useApiCall';
import FluidAd from '../ads/FluidAd';
import FluidAdImage from '../ads/FluidAdImage';
import InArticleAd from '../ads/InArticleAd';

const HEADERS = {
    'x-rapidapi-key': process.env.REACT_APP_RAPIDAPI_KEY,
    'x-rapidapi-host': 'tennisapi1.p.rapidapi.com'
};

const tournamentName = '';

const FixtureResultsCountry = () => {
    const params = useParams();
    const date = new Date();
    const dayCurrent = String(date.getDate());
    const monthCurrent = String(date.getMonth() + 1);
    const yearCurrent = String(date.getFullYear());

    const day = params.day ?? dayCurrent;
    const month = params.month ?? monthCurrent;
    const year = params.year ?? yearCurrent;

    const [rankingsData, setRankingsData] = useState(null);
    const [rawData, setRawData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshScore, setRefreshScore] = useState(false);
    const [selectedDate, setDate] = useState(dayjs(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`));
    const [matchStatus, setMatchStatus] = useState("all");
    const [matchStatusList, setMatchStatusList] = useState(["notstarted", "inprogress", "canceled", "finished", "interrupted"]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedCountryCode, setSelectedCountryCode] = useState('');
    const [selectedCountryAlpha3, setSelectedCountryAlpha3] = useState(params.country && params.country.toLowerCase() === 'all' ? null : params.country);

    const { data: matchStatsData, loading: loadingStats, setRequest: fetchMatchStats } = useApiCall({ method: 'get', payload: [], url: '' });
    const { data: h2hData, loading: loadingH2H, setRequest: fetchH2H } = useApiCall({ method: 'get', payload: [], url: '' });

    const [openMatchStat, setOpenMatchStat] = useState(false);
    const [openH2H, setOpenH2H] = useState(false);
    const [eventId, setEventId] = useState(0);
    const [scoreRecord, setScoreRecord] = useState(null);
    const [dialogOpenCountry, setDialogOpenCountry] = useState(false);
    const [playerId, setPlayerId] = useState(0);
    const [openPlayerInfo, setOpenPlayerInfo] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [indianCount, setIndianCount] = useState(0);

    // -------------------- HANDLERS --------------------
    const handleCloseCountry = () => setDialogOpenCountry(false);

    const handleClickOpenMatchStat = (item) => {
        setEventId(item.id);
        setScoreRecord(item);
        setOpenMatchStat(true);
        fetchMatchStats({ method: 'get', payload: [], url: `https://tennisapi1.p.rapidapi.com/api/tennis/event/${item.id}/statistics`, headers: HEADERS });
        setMatchStatus(item?.status?.type);
    };

    const handleClickOpenH2H = (item) => {
        setEventId(item.id);
        setScoreRecord(item);
        setOpenH2H(true);
        fetchH2H({ method: 'get', payload: [], url: `https://tennisapi1.p.rapidapi.com/api/tennis/event/${item.id}/duel`, headers: HEADERS });
    };

    const handleClickPlayerName = (item) => {
        setPlayerId(item.id);
        setOpenPlayerInfo(true);
    };
    const handleClosePlayerInfo = () => setOpenPlayerInfo(false);
    const handleCloseMatchStat = () => {
        setOpenMatchStat(false);
        setOpenH2H(false);
    };

    const handleCountryChange = async (newCountryCode, newValue) => {
        toast.info("Saving your country...", { autoClose: 1000 });
        setSelectedCountry(newCountryCode);
        setSelectedCountryCode(newValue?.code || null);
        setSelectedCountryAlpha3(newValue?.alpha3.toLowerCase() || null);

        await setItem('country', newCountryCode);
        await setItem('countryCode', newValue?.code || null);
        await setItem('countryAlpha3', newValue?.alpha3.toLowerCase() || null);

        setTimeout(() => {
            toast.success("Saved Selected Country, Loading scores now...", { autoClose: 2000 });
            window.location.href = `/live-scores/${newValue.alpha3.toLowerCase()}`;
        }, 800);
    };

    const handleStatusButtonClick = (status) => {
        setMatchStatus(status);
    };

    const handleRefresh = () => setRefreshScore(!refreshScore);

    const handleSelectDate = (newValue) => {
        const dateObj = new Date(newValue);
        const day = dateObj.getDate();
        const month = dateObj.getMonth() + 1;
        const year = dateObj.getFullYear();
        setDate(newValue);
        window.location.href = `/results/all/${year}/${month}/${day}`;
    };

    const isFirstLoad = React.useRef(true);

    async function fetchWithRetry(url, options = {}, retries = 3, backoffMs = 500) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, options);
            if (response.status === 429) {
                if (attempt === retries) {
                    const text = await response.text().catch(() => '');
                    throw new Error(`Rate limit (429): ${text || 'Too Many Requests'}`);
                }
                await sleep(backoffMs * Math.pow(2, attempt));
                continue;
            }
            if (!response.ok) {
                const text = await response.text().catch(() => '');
                throw new Error(text || response.statusText || `HTTP ${response.status}`);
            }
            return await response.json();
        } catch (err) {
            if (attempt === retries) throw err;
            await sleep(backoffMs * Math.pow(2, attempt));
        }
    }
    throw new Error('Failed to fetch after retries');
}


const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

    useEffect(() => {
        if (!day || !month || !year) return;

        let cancelled = false;
        let pollingTimer = null;

        async function loadSequential() {
            if (cancelled) return;

            if (isFirstLoad.current) setLoading(true);

            const delay = (ms) => new Promise(res => setTimeout(res, ms));
            const delayMs = 400; // smooth stagger delay

            try {
                const url = `https://tennisapi1.p.rapidapi.com/api/tennis/events/${day}/${month}/${year}`;
                const resp = await fetchWithRetry(url, { headers: HEADERS }, 3, 250);
                const events = resp?.events ?? [];

                if (!cancelled) {
                    setRawData(events);
                    setRankingsData(groupItems(events));
                    setError("");
                }

                // If the date is in past and everything is finished — stop polling
                const anyLive = events.some(e => e?.status?.type === "inprogress");
                if (!anyLive) return stopPolling();

            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled && isFirstLoad.current) {
                    setLoading(false);
                    isFirstLoad.current = false;
                }
            }
        }

        function stopPolling() {
            cancelled = true;
            setLoading(false);
            if (pollingTimer) clearInterval(pollingTimer);
        }

        // Initial load
        loadSequential();

        // Auto-poll every 12 seconds while matches are live
        pollingTimer = setInterval(loadSequential, 12000);

        return stopPolling;
    }, [day, month, year]);


    useEffect(() => {
        if (matchStatus === "all") setMatchStatusList(["notstarted", "inprogress", "canceled", "finished", "interrupted"]);
        else setMatchStatusList([matchStatus]);
    }, [matchStatus]);

    useEffect(() => {
        const fetchValue = async () => {
            const storedValue = await getItem('country');
            const storedCode = await getItem('countryCode');
            const storedAlpha3 = await getItem('countryAlpha3');
            setSelectedCountry(storedValue || 'all');
            setSelectedCountryCode(storedCode || 'all');
            setSelectedCountryAlpha3(params.country || storedAlpha3 || 'all');
        };
        fetchValue();
    }, [params.country]);

    // -------------------- HELPERS --------------------
    function groupItems(items) {
        return items.reduce((acc, item) => {
            const key = item.tournament.name;
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});
    }

    const getCountryCondition = () => !selectedCountryAlpha3 || selectedCountryAlpha3 === 'all';

    const hasCountry = (item) => {
        const p1 = item.homeTeam;
        const p2 = item.awayTeam;
        if (!item.tournament.name.includes(tournamentName)) return false;

        if (!item.tournament.name.toLowerCase().includes('double')) {
            return (getCountryCondition() ||
                p1?.country?.alpha3?.toLowerCase() === selectedCountryAlpha3?.toLowerCase() ||
                p2?.country?.alpha3?.toLowerCase() === selectedCountryAlpha3?.toLowerCase()) &&
                matchStatusList.includes(item.status?.type);
        } else {
            const teams = [p1?.subTeams[0], p1?.subTeams[1], p2?.subTeams[0], p2?.subTeams[1]];
            const countries = teams.map(t => t?.country?.alpha3?.toLowerCase());
            return (getCountryCondition() || countries.includes(selectedCountryAlpha3?.toLowerCase())) &&
                matchStatusList.includes(item.status?.type);
        }
    };

    const readableTimeStamp = (timestamp) => {
        const date = new Date(timestamp * 1000);
        const hours12 = date.getHours() % 12 || 12;
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
        const month = date.toLocaleString('default', { month: 'short' });
        return `${date.getDate()}-${month} ${hours12}:${minutes} ${ampm}`;
    };

    const readableDate = (timestamp) => {
        const date = new Date(timestamp * 1000);
        const month = date.toLocaleString('default', { month: 'short' });
        return `${date.getDate()}-${month}`;
    };

    // -------------------- DOM FUNCTIONS --------------------
    const getPlayerDom2 = (item) => {
        try {
            const p1 = item.homeTeam;
            const p2 = item.awayTeam;
            const isSingle = !item.tournament.name.toLowerCase().includes('double');
            if (isSingle && (getCountryCondition() || [p1?.country?.alpha3, p2?.country?.alpha3].includes(selectedCountryAlpha3))) {
                return (
                    <div className="flex flex-col w-full  border-gray-700 p-1 text-xs">
                        <div className="flex items-center space-x-2">
                            <CountryIcon countryCode={p1.country?.alpha2} name={p1.country?.name} size={14} />
                            <button className="hover:text-blue-400" onClick={() => handleClickPlayerName(p1)}>{p1.name}</button>
                            {item.firstToServe === 1 && item.status.type === 'inprogress' && <IoTennisballSharp size={14} className='text-green-400' />}
                            {item.winnerCode === 1 && <CheckIcon sx={{ fontSize: 18, color: "green" }} />}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                            <CountryIcon countryCode={p2.country?.alpha2} name={p2.country?.name} size={14} />
                            <button className="hover:text-blue-400" onClick={() => handleClickPlayerName(p2)}>{p2.name}</button>
                            {item.firstToServe === 2 && item.status.type === 'inprogress' && <IoTennisballSharp size={14} className='text-green-400' />}
                            {item.winnerCode === 2 && <CheckIcon sx={{ fontSize: 18, color: "green" }} />}
                        </div>
                    </div>
                );
            }
            // TODO: handle doubles
            return null;
        } catch (err) {
            console.log("Error in getPlayerDom2");
            return null;
        }
    };

    const formatTennisScoreDom = (homeScore, awayScore, currentStatus) => {
        const periods = Array.from({ length: 5 }, (_, i) => [
            homeScore[`period${i + 1}`] ?? 0,
            awayScore[`period${i + 1}`] ?? 0
        ]);
        const homeTiebreaks = Array.from({ length: 5 }, (_, i) => homeScore[`period${i + 1}TieBreak`] ?? '');
        const awayTiebreaks = Array.from({ length: 5 }, (_, i) => awayScore[`period${i + 1}TieBreak`] ?? '');

        // Filter out extra empty sets like [0,0]
        const validSets = periods.filter(([h, a]) => h !== 0 || a !== 0);

        return (
            <div className="flex flex-col text-xs text-gray-300 items-center">

                {/* Round / Event Name — change props according to your data */}
                {/* {matchInfo?.round && (
                    <span className="text-[11px] text-gray-400 mb-1 uppercase tracking-wide">
                        {matchInfo.round}
                    </span>
                )} */}

                <div className="flex justify-center gap-3">
                    {validSets.map(([h, a], i) => {
                        const isLastSet = i === validSets.length - 1;
                        return (
                            <>
                                <div key={i} className="flex flex-col items-center min-w-[24px]">
                                    {/* Set scores */}
                                    <span>
                                        {h}{homeTiebreaks[i] && <sup className="text-[0.6em]">{homeTiebreaks[i]}</sup>}
                                    </span>
                                    <span>
                                        {a}{awayTiebreaks[i] && <sup className="text-[0.6em]">{awayTiebreaks[i]}</sup>}
                                    </span>

                                </div>
                                {currentStatus === "inprogress" && isLastSet && (
                                    <div className="flex flex-col items-center min-w-[24px] ml-2">
                                        <span className="font-bold text-yellow-400">
                                            {homeScore?.point ?? ''}
                                        </span>
                                        <span className="font-bold text-yellow-400">
                                            {awayScore?.point ?? ''}
                                        </span>
                                    </div>
                                )}
                            </>
                        );
                    })}
                </div>

            </div>
        );


    };

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


    // function readableTimeStamp(timestamp) {
    //     // Convert to milliseconds (JavaScript timestamps are in milliseconds)
    //     const date = new Date(timestamp * 1000);

    //     // Get date components
    //     const day = date.getDate();
    //     const month = date.toLocaleString('default', { month: 'short' }); // 'default' locale, short month format
    //     const year = date.getFullYear();
    //     let hours = date.getHours();
    //     const minutes = date.getMinutes();
    //     const ampm = hours >= 12 ? 'PM' : 'AM';

    //     // Convert hours to 12-hour format
    //     hours = hours % 12;
    //     hours = hours ? hours : 12; // the hour '0' should be '12'

    //     // Pad minutes with leading zero if needed
    //     const minutesStr = minutes < 10 ? '0' + minutes : minutes;

    //     // Format date string
    //     const formattedDate = `${day}-${month} ${hours}:${minutesStr} ${ampm}`;
    //     return formattedDate;
    // }


    const fetchH2HStatsDom = (item) => {
        const isNotStarted = item?.status?.type === "notstarted"; // Adjust based on your API
        const matchTime = readableTimeStamp(item?.startTimestamp) || "TBD";
        const round = getRoundAbbreviation(item?.roundInfo?.name) || "";

        return (
            <div className="bg-gray-800  p-0.5 text-xs text-gray-200 flex flex-row justify-between space-x-2 shadow-md">
                <div className="flex items-center gap-1">
                    {/* Round - Always shown */}
                    <span className="bg-gray-700 p-0.5 rounded-md font-semibold">
                        {round}
                    </span>

                    {/* Match Time - Only if Not Started */}
                    {isNotStarted && (
                        <span className="bg-gray-700 p-0.5 rounded-md font-semibold">
                            {matchTime}
                        </span>
                    )}
                </div>
                <div className='flex flex-row space-x-1'>

                    <a href={`/match-dashboard/${item.id}`} className="text-xs flex items-center gap-1 bg-green-600 hover:bg-green-500 p-1 rounded-md text-white font-medium transition-all duration-200 shadow-sm" target="_blank" rel="noopener noreferrer">
                        Match Dashboard
                    </a>
                    {/* Buttons Section */}
                    <button
                        className="flex items-center gap-1 bg-yellow-600 hover:bg-yellow-500 p-1 rounded-md text-white font-medium transition-all duration-200 shadow-sm"
                        onClick={() => handleClickOpenH2H(item)}
                    >
                        <HiMiniTableCells className="text-sm" />

                    </button>

                    <button
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 p-1 rounded-md text-white font-medium transition-all duration-200 shadow-sm"
                        onClick={() => handleClickOpenMatchStat(item)}
                    >
                        <IoStatsChartSharp className="text-sm" />

                    </button>
                </div>

            </div>
        );
    };


    const fetchScoreRecord = (item) => (
        <div className="flex flex-col border border-gray-700 mb-1 bg-gray-800">
            {fetchH2HStatsDom(item)}
            <div className="flex flex-row justify-between items-start p-1 space-x-1">
                <div className="flex-1">{getPlayerDom2(item)}</div>
                <div className="w-1/4">{item.status.type !== 'notstarted' && formatTennisScoreDom(item.homeScore, item.awayScore, item.status.type)}</div>
            </div>
        </div>
    );

    const recordDom = () => {
        if (!rankingsData) return null;

        const filteredTournaments = Object.keys(rankingsData).filter(t =>
            rankingsData[t].some(hasCountry)
        );

        if (filteredTournaments.length === 0)
            return <NotFound msg="No Results Found" />;

        return filteredTournaments.map((tournament, idx) => (
            <div
                key={tournament}
                className="border border-gray-700 rounded bg-gray-900 mb-2 p-2 text-xs text-gray-200"
            >
                {/* Tournament Title */}
                <div className="font-semibold mb-2 text-lg">{tournament}</div>

                {/* Responsive Grid → minimum 3 per row on medium+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2">
                    {rankingsData[tournament]
                        .filter(hasCountry)
                        .map((item, i) => (
                            <div key={i}>
                                {fetchScoreRecord(item)}
                            </div>
                        ))}
                </div>
            </div>
        ));
    };



    // -------------------- RENDER --------------------
    return (
        <div className="bg-gray-900 min-h-screen text-gray-200">
            <SEO
                title={`Tennis ${selectedCountry.toUpperCase()} Live - Countrywise Tennis Scores & Live Updates`}
                description={`Real-time tennis scores, rankings and updates for ${selectedCountry}. Follow ATP, WTA, and local tournaments.`}
                keywords={`tennis scores, ${selectedCountry} tennis, live scores, rankings, country wise ATP, WTA`}
                url={`https://tennisindialive.com/live-scores/${selectedCountry}`}
            />

            <CountryDialog open={dialogOpenCountry} onClose={handleCloseCountry} />
            <MatchStats open={openMatchStat} handleClose={handleCloseMatchStat} loadingStats={loadingStats} data={matchStatsData} scoreRecord={scoreRecord} eventId={eventId} selectedMatchStatus={matchStatus} />
            <Head2Head open={openH2H} handleClose={handleCloseMatchStat} loading={loadingH2H} data={h2hData} scoreRecord={scoreRecord} eventId={eventId} />
            <PlayerInfo open={openPlayerInfo} handleClose={handleClosePlayerInfo} loading={false} id={playerId} />

            <div className="flex flex-col md:flex-row items-center justify-between p-2 space-y-2 md:space-y-0">
                <DatePickerValue selectedDate={selectedDate} handleSelectDate={handleSelectDate} />
                <StatusButtonGroup matchStatus={matchStatus} handleStatusButtonClick={handleStatusButtonClick} />
                <CountryAutocomplete selectedCountry={selectedCountry} handleCountryChange={handleCountryChange} />
                <IconButton onClick={handleRefresh} className="text-gray-200"><SyncIcon /></IconButton>
            </div>

            {error && <ErrorMessage />}
            {loading ? <Loader /> : <div className="px-2">{recordDom()}</div>}
        </div>
    );
};

export default FixtureResultsCountry;
