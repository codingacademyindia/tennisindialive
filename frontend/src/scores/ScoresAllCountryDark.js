import CheckIcon from '@mui/icons-material/Check';
import SyncIcon from '@mui/icons-material/Sync';
import {
    IconButton,
    Tooltip
} from '@mui/material';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { HiMiniChartBar, HiMiniTableCells } from "react-icons/hi2";
import { IoTennisballSharp } from "react-icons/io5";
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import FluidAd from '../ads/FluidAd';
import FluidAdImage from '../ads/FluidAdImage';
import InArticleAd from '../ads/InArticleAd';
import useApiCall from '../common/apiCalls/useApiCall';
import CountryIcon from '../common/Country';
import CountryDialog from '../common/country/CountryDialog';
import CountryModal from '../common/CountryModal';
import DatePickerValue from '../common/DatePicker';
import Head2Head from '../common/dialogs/HeadToHead';
import MatchStats from '../common/dialogs/MatchStats';
import PlayerInfo from '../common/dialogs/PlayerInfo';
import SEO from '../common/seo/SEO';
import ErrorMessage from '../common/stateHandlers/ErrorState';
import NotFound from '../common/stateHandlers/NotFoundDark';
import StatusButtonGroup from '../common/toolbar/StatusButtonGroup';
import { getItem, setItem } from '../indexDb/indexedDB';
import { getAlpha3, getBaseRoute, getCountryFullName } from '../utils/utils';
import { BiInfoCircle } from 'react-icons/bi';

const DEFAULT_TABS = [
    { alpha3: 'all', alpha2: null, label: 'All' },
    { alpha3: 'IND', alpha2: 'IN', label: 'India' },
    { alpha3: 'USA', alpha2: 'US', label: 'USA' },
    { alpha3: 'GBR', alpha2: 'GB', label: 'GBR' },
    { alpha3: 'AUS', alpha2: 'AU', label: 'AUS' },
    { alpha3: 'ESP', alpha2: 'ES', label: 'Spain' },
];

const tournamentName = '';
export const TOUR_ICONS = {
    WTA: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#d946ef">
            <circle cx="12" cy="12" r="10" />
        </svg>
    ),
    ATP: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6">
            <rect x="4" y="4" width="16" height="16" rx="4" />
        </svg>
    ),
    ITF: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#22c55e">
            <path d="M12 2 L22 22 H2 Z" />
        </svg>
    ),
    CH: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
            <path d="M12 2L20 8V16L12 22L4 16V8Z" />
        </svg>
    ),
    UTR: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#06b6d4">
            <circle cx="12" cy="12" r="8" />
        </svg>
    ),
};

export const SURFACE_ICONS = {
    Hardcourt: (
        <svg width="14" height="14" fill="#60a5fa" viewBox="0 0 24 24">
            <rect width="20" height="20" x="2" y="2" rx="3" />
        </svg>
    ),
    Clay: (
        <svg width="14" height="14" fill="#f87171" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
        </svg>
    ),
    Grass: (
        <svg width="14" height="14" fill="#4ade80" viewBox="0 0 24 24">
            <path d="M4 20 L8 10 L12 20 L16 10 L20 20Z" />
        </svg>
    ),
    Carpet: (
        <svg width="14" height="14" fill="#a78bfa" viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" stroke="#fff" strokeWidth="2" />
        </svg>
    ),
    Indoor: (
        <svg width="14" height="14" fill="#cbd5e1" viewBox="0 0 24 24">
            <path d="M3 20V10L12 4L21 10V20Z" />
        </svg>
    ),
};

function getTourIcon(category) {
    return TOUR_ICONS[category] || null;
}

function getSurfaceIcon(surface) {
    if (!surface) return null;

    if (surface.includes("Hard")) return SURFACE_ICONS.Hardcourt;
    if (surface.includes("Clay")) return SURFACE_ICONS.Clay;
    if (surface.includes("Grass")) return SURFACE_ICONS.Grass;
    if (surface.includes("Carpet")) return SURFACE_ICONS.Carpet;
    if (surface.includes("indoor")) return SURFACE_ICONS.Indoor;

    return null;
}

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
    // const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedCountryCode, setSelectedCountryCode] = useState('');
    const [selectedCountryAlpha3, setSelectedCountryAlpha3] = useState(params.country && params.country.toLowerCase() === 'all' ? null : getAlpha3(params.country));

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
    const [countryModal, setCountryModal] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState("all");
    const [countryTabs, setCountryTabs] = useState(() => {
        try { const s = localStorage.getItem('countryTabs'); return s ? JSON.parse(s) : DEFAULT_TABS; } catch { return DEFAULT_TABS; }
    });

    // -------------------- HANDLERS --------------------
    const handleCloseCountry = () => setDialogOpenCountry(false);
    const countryFullName = getCountryFullName(selectedCountry);


    const handleClickOpenMatchStat = (item) => {
        setEventId(item.id);
        setScoreRecord(item);
        setOpenMatchStat(true);
        fetchMatchStats({ method: 'get', payload: [], url: `/api/tennis/event/${item.id}/statistics` });
        setMatchStatus(item?.status?.type);
    };

    const handleClickOpenH2H = (item) => {
        setEventId(item.id);
        setScoreRecord(item);
        setOpenH2H(true);
        fetchH2H({ method: 'get', payload: [], url: `/api/tennis/event/${item.id}/duel` });
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

    const handleTabClick = (tab) => {
        setSelectedCountry(tab.alpha3);
        setSelectedCountryCode(tab.alpha2 || 'all');
        setSelectedCountryAlpha3(tab.alpha3 === 'all' ? 'all' : tab.alpha3.toLowerCase());
    };

    const handleRemoveTab = (alpha3, e) => {
        e.stopPropagation();
        setCountryTabs(prev => {
            const updated = prev.filter(t => t.alpha3 !== alpha3);
            localStorage.setItem('countryTabs', JSON.stringify(updated));
            return updated;
        });
        if (selectedCountry === alpha3) {
            setSelectedCountry('all');
            setSelectedCountryCode('all');
            setSelectedCountryAlpha3('all');
        }
    };

    const handleAddTab = (alpha3, value) => {
        if (!alpha3 || alpha3 === 'all') return;
        const newTab = { alpha3, alpha2: value?.code || null, label: value?.label || alpha3 };
        setCountryTabs(prev => {
            if (prev.some(t => t.alpha3 === alpha3)) return prev;
            const updated = [...prev, newTab];
            localStorage.setItem('countryTabs', JSON.stringify(updated));
            return updated;
        });
        setSelectedCountry(alpha3);
        setSelectedCountryCode(value?.code || null);
        setSelectedCountryAlpha3(alpha3.toLowerCase());
        setCountryModal(false);
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
        let isPollingInFlight = false;

        async function loadSequential() {
            if (cancelled) return;
            if (isPollingInFlight) return;

            isPollingInFlight = true;

            if (isFirstLoad.current) setLoading(true);

            const delay = (ms) => new Promise(res => setTimeout(res, ms));
            const delayMs = 400; // smooth stagger delay

            try {
                const calResp = await fetchWithRetry(
                    `/api/tennis/calendar/${day}/${month}/${year}/categories`,
                    {},
                    3,
                    250
                );
                const categories = calResp?.categories ?? [];
                const uniqueCategoryIds = [
                    ...new Set(
                        categories
                            .map((item) => item?.category?.id)
                            .filter(Boolean)
                    ),
                ];
                const seen = new Set();
                const events = [];
                for (const catId of uniqueCategoryIds) {
                    try {
                        const res = await fetchWithRetry(
                            `/api/tennis/category/${catId}/events/${day}/${month}/${year}`,
                            {},
                            3,
                            250
                        );
                        for (const evt of res?.events ?? []) {
                            if (!seen.has(evt.id)) { seen.add(evt.id); events.push(evt); }
                        }
                    } catch (e) { /* skip failed category */ }
                }

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
                isPollingInFlight = false;
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
    // function groupItems(items) {
    //     return items.reduce((acc, item) => {
    //         const key = item.season.name;
    //         if (!acc[key]) acc[key] = [];
    //         acc[key].push(item);
    //         return acc;
    //     }, {});
    // }

    function groupItems(items) {
        return items.reduce((acc, item) => {
            const category = item?.tournament?.category?.slug || "unknown";
            const tournamentName = item?.tournament?.uniqueTournament?.name || item?.tournament?.name || "unknown";

            const key = `${category}__${tournamentName}`;

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
                p1?.country?.alpha3?.toLowerCase() === selectedCountry?.toLowerCase() ||
                p2?.country?.alpha3?.toLowerCase() === selectedCountry?.toLowerCase()) &&
                matchStatusList.includes(item.status?.type);
        } else {
            const teams = [p1?.subTeams[0], p1?.subTeams[1], p2?.subTeams[0], p2?.subTeams[1]];
            const countries = teams.map(t => t?.country?.alpha3?.toLowerCase());
            return (getCountryCondition() || countries.includes(selectedCountry?.toLowerCase())) &&
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


    function getTextAfterLastSpace(str) {
        const lastSpaceIndex = str.lastIndexOf(' '); // Find the index of the last space
        return str.slice(lastSpaceIndex + 1); // Extract the text after the last space
    }

    function capitalize(str) {
        return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }
    function removeLastTwoCharacters(str) {
        let textToReplace = getTextAfterLastSpace(str)
        return str.replace(textToReplace, "").trim()
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
    // -------------------- DOM FUNCTIONS --------------------
    const getPlayerDom2 = (item) => {
        try {
            const uniqueTournament = item.tournament;
            const p1 = item.homeTeam;
            const p2 = item.awayTeam;
            const isSingle = !item.tournament.name.toLowerCase().includes('double');
            // if (isSingle && (getCountryCondition() || [p1?.country?.alpha3.toLowerCase(), p2?.country?.alpha3.toLowerCase()].includes(selectedCountryAlpha3))) {
            if (isSingle) {

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
            else {
                const p1a = p1.subTeams[0];
                const p1b = p1.subTeams[1];
                const p2a = p2.subTeams[0];
                const p2b = p2.subTeams[1];

                const countries = [
                    p1a?.country?.alpha3?.toLowerCase() || null,
                    p1b?.country?.alpha3?.toLowerCase() || null,
                    p2a?.country?.alpha3?.toLowerCase() || null,
                    p2b?.country?.alpha3?.toLowerCase() || null,
                ];
                // if ((countries.includes(selectedCountryAlpha3) || getCountryCondition())) {
                return (<div key={`dbl-${item.id}-${uniqueTournament}`}>
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
                    <div key={`dbl-${item.id}`} className="space-x-2  p-1 flex flex-row items-center">
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

                // }
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

                <div className="flex justify-center gap-1">
                    {validSets.map(([h, a], i) => {
                        const isLastSet = i === validSets.length - 1;
                        // Don't show tiebreak superscript on the active set — it's already shown via `point` in yellow
                        const showTiebreak = !(currentStatus === "inprogress" && isLastSet);
                        return (
                            <React.Fragment key={`set-${i}`}>
                                <div key={i} className="flex flex-col items-center min-w-[24px]">
                                    {/* Set scores */}
                                    <span>
                                        {h}{showTiebreak && homeTiebreaks[i] !== '' && <sup className="text-[0.6em]">{homeTiebreaks[i]}</sup>}
                                    </span>
                                    <span>
                                        {a}{showTiebreak && awayTiebreaks[i] !== '' && <sup className="text-[0.6em]">{awayTiebreaks[i]}</sup>}
                                    </span>

                                </div>
                                {currentStatus === "inprogress" && isLastSet && (
                                    <div key={`inprogress-${i}`} className="flex flex-col items-center min-w-[24px] ml-2">
                                        <span className="font-bold text-yellow-400">
                                            {homeScore?.point ?? ''}
                                        </span>
                                        <span className="font-bold text-yellow-400">
                                            {awayScore?.point ?? ''}
                                        </span>
                                    </div>
                                )}
                            </React.Fragment>
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
        const isNotStarted = item?.status?.type === "notstarted";
        const isLive = item?.status?.type === "inprogress";
        const isFinished = item?.status?.type === "finished";
        const matchTime = readableTimeStamp(item?.startTimestamp) || "TBD";
        const round = getRoundAbbreviation(item?.roundInfo?.name) || "";

        return (
            <div className="bg-gray-800  p-0.5 text-xs text-gray-200 flex flex-row justify-between space-x-2 shadow-md">
                <div className="flex items-center gap-1">
                    {/* Round - Always shown */}
                    <span className="px-2 py-0.5 text-xs font-semibold rounded 
bg-[#151515] text-[#D1D5DB]
border border-[#3F3F46]
shadow-[0_0_6px_rgba(255,255,255,0.1)]">
                        {round}
                    </span>


                    {isLive && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-green-500/20 text-green-300 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span className='hidden sm:inline'>Live -</span>{item?.status?.description}
                        </span>
                    )}


                    {isNotStarted && (
                        <span className="inline-block bg-gray-800 text-gray-100 
                   px-3 py-1 rounded-lg text-[11px] font-semibold
                   border border-gray-700 shadow-sm">
                            {matchTime}
                        </span>
                    )}

                    {isFinished && (
                        <span className="
    inline-flex items-center gap-1
    bg-gray-900/70 text-gray-300
    px-2.5 py-0.5 rounded-md
    text-[11px] font-medium
    border border-gray-700/60
  ">
                            {readableDate(item.startTimestamp)}
                            <span className="text-gray-400">• Ended</span>
                        </span>
                    )}


                </div>
                <div className='flex flex-row space-x-1'>
                    {/* Dashboard Button */}
                    <a
                        href={`/match-dashboard/${item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1 rounded-full font-medium
             bg-blue-500/10 border border-blue-400/25
             text-blue-300 text-[10px] sm:text-xs
             hover:bg-blue-500/20 hover:border-blue-300/50
             hover:shadow-[0_0_10px_rgba(100,150,255,0.4)]
             transition-all duration-200
             backdrop-blur-sm"
                    >
                        <HiMiniChartBar className="w-3.5 h-3.5" />
                        Dashboard
                    </a>
                    <button
                        onClick={() => handleClickOpenH2H(item)}
                        className="flex items-center gap-1 px-3 py-1 rounded-full font-medium
             bg-lime-500/10 border border-lime-400/25
             text-lime-300 text-[10px] sm:text-xs
             hover:bg-lime-500/20 hover:border-lime-300/50
             hover:shadow-[0_0_10px_rgba(150,255,100,0.4)]
             transition-all duration-200
             backdrop-blur-sm"
                    >
                        <HiMiniTableCells className="w-3.5 h-3.5" />
                        H2H
                    </button>











                    {/* <button
                        onClick={() => handleClickOpenMatchStat(item)}
                    >
                        <IoStatsChartSharp
                            className="text-blue-600 hover:text-blue-500 p-1 rounded-md transition-all duration-200 shadow-sm"
                            style={{ width: "28px", height: "28px" }} />

                    </button> */}
                </div>

            </div>
        );
    };


    const fetchScoreRecord = (item) => (
        <div className="flex flex-col border border-gray-700 mb-1 bg-gray-800">
            {fetchH2HStatsDom(item)}
            <div className="flex flex-row justify-between items-start p-1 space-x-1">
                <div className="flex-1 ">{getPlayerDom2(item)}</div>
                <div className="w-[40%]  my-auto">{item.status.type !== 'notstarted' && formatTennisScoreDom(item.homeScore, item.awayScore, item.status.type)}</div>
            </div>
        </div>
    );

    function buildHeaderString(match) {
        const info = getTournamentDetails(match);
        if (!info) return "";

        const parts = [];

        if (info.category) parts.push(info.category);          // "WTA"
        if (info.points) parts.push(info.points + "");         // "125"
        if (info.name) parts.push(info.name);                  // "Limoges, France"
        if (info.surface) parts.push(info.surface);            // "Hardcourt indoor"
        // if (info.round) parts.push(info.round);                // "Quarterfinals"

        return parts.join(" • ");
    }


    function getTournamentDetails(match) {
        if (!match) return {};

        // SAFE ACCESS using fallback empty objects
        const t = match.tournament ?? {};
        const ut = t.uniqueTournament ?? {};
        const cat = t.category ?? {};

        return {
            name: t.name || ut.name || "",
            category: cat.name || "",
            surface: ut.groundType || match.groundType || "",
            points: ut.tennisPoints || "",
            round: match.roundInfo?.name || "",
        };
    }
    function getCategoryColor(category = "", match = {}) {
        const c = category.toUpperCase();

        const gender =
            match?.homeTeam?.gender ||
            match?.awayTeam?.gender ||
            (match?.season?.name?.toLowerCase().includes("women")
                ? "F"
                : match?.season?.name?.toLowerCase().includes("men")
                    ? "M"
                    : "");

        // ATP (Men)
        if (c === "ATP")
            return "bg-[#0077C8]/30 text-[#4DB6FF] border-[#0077C8]/40";

        // WTA (Women)
        if (c === "WTA")
            return "bg-[#B337FF]/30 text-[#E7B3FF] border-[#B337FF]/40";

        // ATP Challenger
        if (c.includes("CH"))
            return "bg-[#4CAF50]/30 text-[#A5D6A7] border-[#4CAF50]/40";

        // ITF — now gender-based
        if (c.includes("ITF")) {
            if (gender === "M") {
                // ITF Men (Green)
                return "bg-[#00A86B]/30 text-[#AAFFDA] border-[#00A86B]/40";
            } else if (gender === "F") {
                // ITF Women (Pink)
                return "bg-[#FF6FB5]/30 text-[#FFD1E9] border-[#FF6FB5]/40";
            }
            // fallback ITF
            return "bg-[#1ABC9C]/30 text-[#A7FFF0] border-[#1ABC9C]/40";
        }

        // UTR
        if (c.includes("UTR"))
            return "bg-[#00ADC6]/30 text-[#9AF2FF] border-[#00ADC6]/40";

        return "bg-gray-900 text-gray-200 border-gray-700";
    }


    //     function buildHeaderDOM(match) {
    //         if (!match) return null;

    //         const info = getTournamentDetails(match);

    //         const noData =
    //             !info.name && !info.category && !info.surface && !info.points;
    //         if (noData) return null;

    //         // Detect Singles or Doubles (works for ATP/WTA/ITF)
    //         const isSingles =
    //             match.season?.name?.toLowerCase().includes("single") ?? false;
    //         const isDoubles =
    //             match.season?.name?.toLowerCase().includes("double") ?? false;

    //         const eventType = isSingles ? "Singles" : isDoubles ? "Doubles" : "";

    //         return (
    //             <div
    //                 className="
    //           flex items-center gap-2
    //           px-3 py-2 
    //           bg-gradient-to-r from-[#222733] to-[#1a1d21]
    //           border border-gray-600/70 shadow-lg
    //           text-gray-100 font-semibold
    //           text-xs sm:text-sm md:text-base
    //           whitespace-nowrap overflow-hidden text-ellipsis
    //         "
    //             >

    //                 {/* Category + Points Badge */}
    //                 {(info.category || info.points) && (
    //                     <span
    //                         className={`
    //     px-2 py-0.5 rounded-md 
    //     text-[10px] sm:text-xs font-bold shadow-inner
    //     border 
    //     ${getCategoryColor(info.category)}
    //   `}
    //                     >
    //                         {info.category} {info.points}
    //                     </span>
    //                 )}

    //                 {/* Singles/Doubles Badge */}
    //                 {eventType && (
    //                     <span
    //                         className="
    //               bg-blue-600/30 text-blue-200
    //               px-2 py-0.5 rounded-md 
    //               text-[10px] sm:text-xs font-semibold border border-blue-700/40
    //             "
    //                     >
    //                         {eventType}
    //                     </span>
    //                 )}

    //                 {/* Tournament Name */}
    //                 <span className="truncate text-gray-100">{info.name}</span>

    //                 {/* Surface */}
    //                 {info.surface && (
    //                     <>
    //                         <span className="text-gray-500">•</span>
    //                         <span className="text-gray-300 truncate">{info.surface}</span>
    //                     </>
    //                 )}

    //             </div>
    //         );
    //     }

    function buildHeaderDOM(match) {
        if (!match) return null;

        const info = getTournamentDetails(match);

        const noData =
            !info.name && !info.category && !info.surface && !info.points;
        if (noData) return null;

        const isSingles =
            match.season?.name?.toLowerCase().includes("single") ?? false;
        const isDoubles =
            match.season?.name?.toLowerCase().includes("double") ?? false;

        const eventType = isSingles ? "Singles" : isDoubles ? "Doubles" : "";

        return (
            <div
                className="
        flex items-center gap-1.5
        px-3 py-2
        bg-[#1e2228]
        border border-gray-700/60
        text-gray-200
        text-xs sm:text-sm
        font-medium
        whitespace-nowrap overflow-hidden
      "
            >
                {/* Category + Points */}
                {(info.category || info.points) && (
                    <span className="font-semibold text-gray-100">
                        {info.category}
                        {info.points && <span className="text-gray-400 ml-0.5">{info.points}</span>}
                    </span>
                )}

                {(info.category || info.points) && <span className="text-gray-500">•</span>}

                {/* Singles / Doubles */}
                {eventType && (
                    <>
                        <span className="text-[10px] sm:text-xs uppercase tracking-wide text-gray-400">
                            {eventType}
                        </span>
                        <span className="text-gray-500">•</span>
                    </>
                )}

                {/* Tournament Name (Primary) */}
                <span className="truncate font-semibold text-gray-100">
                    {info.name}
                </span>

                {/* Surface */}
                {info.surface && (
                    <>
                        <span className="text-gray-500">•</span>
                        <span className="truncate text-gray-400 text-[10px] sm:text-xs">
                            {info.surface}
                        </span>
                    </>
                )}
            </div>
        );
    }





    const recordDom = () => {
        if (!rankingsData) return null;

        const filteredTournaments = Object.keys(rankingsData).filter(t =>
            rankingsData[t].some(hasCountry)
        );

        if (filteredTournaments.length === 0)
            return <NotFound msg="No Results Found" subMsg='Please try with some other filter/country' />;

        const result = [];
        let adCounter = 0;

        filteredTournaments.forEach((tournament, idx) => {
            // Push tournament DOM
            result.push(
                <div
                    key={tournament}
                    className="border border-gray-700 rounded bg-gray-900 mb-2 p-1 text-xs text-gray-200"
                >
                    {/* Tournament Title */}
                    {/* <div className="font-semibold mb-2 text-sm md:text-lg">{buildHeaderString(rankingsData[tournament][idx])}</div> */}
                    {buildHeaderDOM(rankingsData[tournament][0])}
                    {/* Responsive Grid → minimum 2 per row on small+ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2">
                        {rankingsData[tournament]
                            .filter(hasCountry)
                            .map((item, i) => (
                                <div key={item.id}>
                                    {fetchScoreRecord(item)}
                                </div>
                            ))}
                    </div>
                </div>
            );

            // Insert ad after every 2nd tournament
            if ((idx + 1) % 2 === 0) {
                const adType = adCounter % 3;
                const adComponent = adType === 0 ? <FluidAdImage />
                    : adType === 1 ? <FluidAd />
                        : <InArticleAd />;

                const adName = adType === 0 ? "FluidAdImage"
                    : adType === 1 ? "FluidAd"
                        : "InArticleAd";

                result.push(
                    <div
                        key={`ad-${idx + 1}-${adName}`}
                        className="m-2 p-4 border border-dashed border-gray-400 bg-gray-50 text-center"
                        title={`Ad Slot: ${adName} (Position: ${idx + 1})`}
                    >
                        {adComponent}
                    </div>
                );
                adCounter++;
            }
        });

        return result;
    };

    const getFlagUrl = (code) =>
        code ? `https://flagcdn.com/w20/${code.toLowerCase()}.png` : null;

    const STATUS_FILTERS = [
        { label: 'All', key: 'all' },
        { label: 'Live', key: 'inprogress' },
        { label: 'Finished', key: 'finished' },
        { label: 'Not Started', key: 'notstarted' },
    ];

    const statusCounts = (() => {
        if (!rawData) return { all: 0, inprogress: 0, finished: 0, notstarted: 0 };
        const c = { all: 0, inprogress: 0, finished: 0, notstarted: 0 };
        const isAllCountry = !selectedCountryAlpha3 || selectedCountryAlpha3 === 'all';
        rawData.forEach(item => {
            const p1 = item.homeTeam;
            const p2 = item.awayTeam;
            let matchesCty;
            if (!item.tournament?.name?.toLowerCase().includes('double')) {
                matchesCty = isAllCountry ||
                    p1?.country?.alpha3?.toLowerCase() === selectedCountryAlpha3 ||
                    p2?.country?.alpha3?.toLowerCase() === selectedCountryAlpha3;
            } else {
                const teams = [p1?.subTeams?.[0], p1?.subTeams?.[1], p2?.subTeams?.[0], p2?.subTeams?.[1]];
                matchesCty = isAllCountry || teams.some(t => t?.country?.alpha3?.toLowerCase() === selectedCountryAlpha3);
            }
            if (!matchesCty) return;
            const type = item.status?.type;
            c.all++;
            if (type === 'inprogress') c.inprogress++;
            else if (type === 'finished') c.finished++;
            else if (type === 'notstarted') c.notstarted++;
        });
        return c;
    })();

    let objFilterBar = (
        <div className="border-b border-gray-800 mb-1">
            {/* Country tab bar */}
            <div className="flex items-center overflow-x-auto [&::-webkit-scrollbar]:hidden border-b border-gray-700/50">
                {countryTabs.map(tab => {
                    const isActive = selectedCountry === tab.alpha3 ||
                        (tab.alpha3 === 'all' && (!selectedCountry || selectedCountry === 'all'));
                    return (
                        <button
                            key={tab.alpha3}
                            onClick={() => handleTabClick(tab)}
                            className={`group flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-all duration-150 ${
                                isActive
                                    ? 'border-teal-400 text-teal-300 bg-teal-500/5'
                                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
                            }`}
                        >
                            {tab.alpha3 === 'all' ? (
                                <span className="text-sm leading-none">🌍</span>
                            ) : tab.alpha2 ? (
                                <img src={`https://flagcdn.com/w20/${tab.alpha2.toLowerCase()}.png`} alt="" className="w-4 h-3 object-cover rounded-sm flex-shrink-0" loading="eager" />
                            ) : null}
                            <span>{tab.label}</span>
                            {tab.alpha3 !== 'all' && (
                                <span
                                    onClick={(e) => handleRemoveTab(tab.alpha3, e)}
                                    className="opacity-0 group-hover:opacity-100 ml-0.5 text-gray-600 hover:text-red-400 leading-none cursor-pointer transition-opacity"
                                    title="Remove tab"
                                >×</span>
                            )}
                        </button>
                    );
                })}
                <button
                    onClick={() => setCountryModal(true)}
                    title="Add country tab"
                    className="flex-shrink-0 mx-1 flex items-center justify-center w-5 h-5 rounded border border-dashed border-gray-700 text-gray-600 hover:text-teal-400 hover:border-teal-600 transition-all text-sm leading-none"
                >+</button>
            </div>

            {/* Status filters + date row */}
            <div className="flex items-center justify-between px-2 py-1.5 gap-2">
                <div className="flex items-center gap-1 flex-wrap">
                    {STATUS_FILTERS.map(s => {
                        const count = statusCounts[s.key] ?? 0;
                        const isActive = matchStatus === s.key;
                        const isEmpty = count === 0 && s.key !== 'all';
                        return (
                            <button
                                key={s.key}
                                onClick={() => handleStatusButtonClick(s.key)}
                                disabled={isEmpty}
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 whitespace-nowrap ${
                                    isActive
                                        ? s.key === 'inprogress'
                                            ? 'bg-green-500/20 text-green-300 border border-green-500/40'
                                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                        : isEmpty
                                            ? 'text-gray-700 border border-gray-800 cursor-not-allowed'
                                            : 'text-gray-400 border border-gray-700 hover:text-gray-200 hover:border-gray-500'
                                }`}
                            >
                                {s.key === 'inprogress' && (
                                    <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                        isActive ? 'bg-green-400 animate-pulse' : count > 0 ? 'bg-green-600' : 'bg-gray-700'
                                    }`} />
                                )}
                                {s.label}
                                <span className={`text-[10px] font-bold ${
                                    isActive
                                        ? s.key === 'inprogress' ? 'text-green-300' : 'text-blue-300'
                                        : isEmpty ? 'text-gray-700' : 'text-gray-500'
                                }`}>{count}</span>
                            </button>
                        );
                    })}
                </div>
                <div className="flex items-center gap-1">
                    <DatePickerValue
                        selectedDate={selectedDate}
                        handleSelectDate={handleSelectDate}
                    />
                    <IconButton onClick={handleRefresh} className="text-gray-200">
                        <SyncIcon className="text-white" />
                    </IconButton>
                </div>
            </div>
        </div>
    );
    // -------------------- RENDER --------------------
    return (
        <div className="bg-gray-900 min-h-screen text-gray-200">
            <CountryModal
                open={countryModal}
                onClose={() => setCountryModal(false)}
                onSelect={handleAddTab}
            />
            <SEO
                title={`Tennis ${countryFullName} Live - Countrywise Tennis Scores & Live Updates`}
                description={`Real-time tennis scores, rankings and updates for ${selectedCountry}. Follow ATP, WTA, and local tournaments.`}
                keywords={`tennis scores, ${countryFullName} tennis, live scores, rankings, country wise ATP, WTA`}
                url={`https://tennisindialive.com/live-scores/${countryFullName}`}
            />

            <CountryDialog open={dialogOpenCountry} onClose={handleCloseCountry} />
            <MatchStats open={openMatchStat} handleClose={handleCloseMatchStat} loadingStats={loadingStats} data={matchStatsData} scoreRecord={scoreRecord} eventId={eventId} selectedMatchStatus={matchStatus} />
            <Head2Head open={openH2H} handleClose={handleCloseMatchStat} loading={loadingH2H} data={h2hData} scoreRecord={scoreRecord} eventId={eventId} />
            <PlayerInfo open={openPlayerInfo} handleClose={handleClosePlayerInfo} loading={false} id={playerId} />

            {objFilterBar}
            {error && <ErrorMessage />}
            {loading ? <div className="min-h-[30vh] flex flex-col items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mb-4"></div>
                <div className="text-blue-200 text-lg">Loading scores...</div>
            </div> : <div className="px-2">{recordDom()}</div>}
        </div>
    );
};

export default FixtureResultsCountry;
