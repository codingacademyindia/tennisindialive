import SyncIcon from '@mui/icons-material/Sync';
import { FormControl, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CustomizedTables from '../../common/grids/CustomizedTablesJSON';
import Loader from '../../common/stateHandlers/LoaderState';
import CountryButtonGroup from '../../common/toolbar/CountryButtonGroup';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import SEO from '../../common/seo/SEO';
import { setItem, getItem } from '../../indexDb/indexedDB';
import CountryAutocomplete from '../../common/CountryAutoComplete';
import { getAlpha2FromName, getAlpha3, getCountryFullName, normalizeRankingCountry } from '../../utils/utils';
import CountryModal from '../../common/CountryModal';
import { getOfficialRankingsLatest } from '../../services/tennisApiService';
import TweetPreviewDialog from '../../admin/TweetPreview';

const rawApiUrl = process.env.REACT_APP_API_URL || '';
const REACT_APP_API_URL = rawApiUrl && rawApiUrl.includes('cai-service.onrender.com') ? '' : rawApiUrl;

const DEFAULT_TABS_RANKINGS = [
    { alpha3: 'all', alpha2: null, label: 'All' },
    { alpha3: 'IND', alpha2: 'IN', label: 'India' },
    { alpha3: 'USA', alpha2: 'US', label: 'USA' },
    { alpha3: 'GBR', alpha2: 'GB', label: 'GBR' },
    { alpha3: 'AUS', alpha2: 'AU', label: 'AUS' },
    { alpha3: 'ESP', alpha2: 'ES', label: 'Spain' },
];

const OfficialRankings = () => {
    const { type } = useParams();
    const { country } = useParams();
    const [rankingsData, setRankingsData] = useState(null);
    const [filteredData, setFilteredData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const [refreshScore, setRefreshScore] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(country || 'india');
    const [selectedCountryCode, setSelectedCountryCode] = useState(getAlpha2FromName(country) || 'IN');
    const [selectedCountryAlpha3, setSelectedCountryAlpha3] = useState(getAlpha3(country) || 'ind');

    const [excludeUnchanged, setExcludeUnchanged] = useState(false);
    const [pageHeader, setPageHeader] = useState("Official Ranking");
    const [rankingTimestamp, setRankingTimestamp] = useState("");
    const [pageRefreshTime, setPageRefreshTime] = useState("");

    const [countryModal, setCountryModal] = useState(false);
    const [countryTabs, setCountryTabs] = useState(() => {
        try { const s = localStorage.getItem('countryTabs'); return s ? JSON.parse(s) : DEFAULT_TABS_RANKINGS; } catch { return DEFAULT_TABS_RANKINGS; }
    });
    const [openTweetDialog, setOpenTweetDialog] = useState(false);
    const [tweetText, setTweetText] = useState('');
    const [tweetStatus, setTweetStatus] = useState('');
    const isAdmin = localStorage.getItem('mode') === 'admin';
    // document.title = `Tennis India Live - ${type.toUpperCase()} Live Rankings`;

    const rankingTypeConfig = {
        'atp-singles': { tour: 'atp', category: 'singles', pageHeader: 'Official ATP Ranking - Singles' },
        'atp-doubles': { tour: 'atp', category: 'doubles', pageHeader: 'Official ATP Ranking - Doubles' },
        'wta-singles': { tour: 'wta', category: 'singles', pageHeader: 'Official WTA Ranking - Singles' },
        'wta-doubles': { tour: 'wta', category: 'doubles', pageHeader: 'Official WTA Ranking - Doubles' },
    };

    const parseChangeValue = (changeText) => {
        if (changeText === null || changeText === undefined) return 0;
        const text = String(changeText).trim().toLowerCase();
        if (!text || text === '-' || text === 'same' || text === 'no change') return 0;

        const parsed = Number.parseInt(text.replace(/[^0-9+-]/g, ''), 10);
        return Number.isNaN(parsed) ? 0 : parsed;
    };

    const normalizeOfficialRankingRows = (rows = []) => {
        return rows.map((row) => ({
            rank: row.rank_text ?? row.rank_value ?? '',
            player: row.player ?? '',
            country: (normalizeRankingCountry(row.country) || '').toUpperCase(),
            change: parseChangeValue(row.change_text),
            points: row.points_text ?? row.points_value ?? '',
        }));
    };


    const getFlagUrl = (code) =>
        code ? `https://flagcdn.com/w20/${code.toLowerCase()}.png` : null;

    const countryFullName = getCountryFullName(selectedCountry);
    let objDomCountryButton = (<button
        onClick={() => setCountryModal(true)}
        className="
                flex items-center gap-2 
                px-3 py-1 rounded-lg 
                bg-[#1f2937] text-gray-200 
                border border-gray-700 
                hover:border-teal-400 hover:text-teal-300
                hover:shadow-[0_0_10px_rgba(34,211,238,0.25)]
                active:scale-95 transition-all duration-200
                text-sm font-medium
            "
    >
        {/* Flag or Globe */}
        {selectedCountryCode && selectedCountryCode !== "all" ? (
            <img
                src={getFlagUrl(selectedCountryCode)}
                alt={selectedCountryCode}
                className="w-5 h-4 object-cover rounded-sm shadow-sm"
                loading="eager"     // 🚀 load instantly
            />
        ) : (
            <span className="text-lg">🌍</span>
        )}

        {/* Country Name OR default */}
        <span className="truncate capitalize">
            {countryFullName || "Select Country"}
        </span>
    </button>
    )


    function getFilteredData(data) {
        if (data) {
            let rankingsDataCopy = JSON.parse(JSON.stringify(data));
            if (selectedCountryAlpha3.toLowerCase() !== 'all') {
                rankingsDataCopy = rankingsDataCopy.filter(item =>
                    item.country.toLowerCase() === selectedCountryAlpha3.toLowerCase()
                );
            }
            setFilteredData(rankingsDataCopy);
        }
    }

    const handleCountryClick = (event) => {
        if (event.target.innerText.toLowerCase() === 'india') {
            setSelectedCountry("ind");
        } else {
            setSelectedCountry("all");
        }
    };
    const handleCountryChange = async (newCountryCode, newValue) => {
        setSelectedCountry(newCountryCode);
        setSelectedCountryCode(newValue ? newValue.code : null)
        setSelectedCountryAlpha3(newValue ? newValue.alpha3.toLowerCase() : null);
        await setItem('country', newCountryCode);
        await setItem('countryCode', newValue ? newValue.code : null);
        await setItem('countryAlpha3', newValue ? newValue.alpha3.toLowerCase() : null);

        setTimeout(() => {
            toast.success("Loading scores now...", { autoClose: 2000 });
            window.location.href = `/rankings/official/${type}/${newCountryCode.toLowerCase()}`;
        }, 800);
    };

    const handleTabClick = (tab) => {
        setSelectedCountry(tab.alpha3);
        setSelectedCountryCode(tab.alpha2 || null);
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
            setSelectedCountryCode(null);
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

    const objTabBar = (
        <div className="flex items-center overflow-x-auto [&::-webkit-scrollbar]:hidden border-b border-gray-800 bg-[#0b1220] px-2 py-1">
            {countryTabs.map(tab => {
                const isActive = selectedCountry === tab.alpha3 ||
                    (tab.alpha3 === 'all' && (!selectedCountry || selectedCountry === 'all'));
                return (
                    <button
                        key={tab.alpha3}
                        onClick={() => handleTabClick(tab)}
                        className={`group flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 -mb-px transition-all duration-150 ${
                            isActive
                                ? 'border-teal-400 text-teal-200 bg-teal-900/40'
                                : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-800/40 hover:border-gray-700'
                        }`}
                    >
                        {tab.alpha3 === 'all' ? (
                            <span className="text-sm leading-none">🌍</span>
                        ) : tab.alpha2 ? (
                            <img src={`https://flagcdn.com/w20/${tab.alpha2.toLowerCase()}.png`} alt="" className="w-4 h-3 object-cover rounded-sm flex-shrink-0" loading="eager" />
                        ) : null}
                        <span>{tab.label}</span>
                        {tab.alpha3 !== 'all' && (
                            <span onClick={(e) => handleRemoveTab(tab.alpha3, e)} className="opacity-0 group-hover:opacity-100 ml-0.5 text-gray-500 hover:text-red-400 leading-none cursor-pointer transition-opacity" title="Remove tab">×</span>
                        )}
                    </button>
                );
            })}
            <button onClick={() => setCountryModal(true)} title="Add country tab" className="flex-shrink-0 mx-1 flex items-center justify-center w-5 h-5 rounded border border-dashed border-gray-700 text-gray-500 hover:text-teal-400 hover:border-teal-600 hover:bg-gray-800/40 transition-all text-sm leading-none">+</button>
        </div>
    );

    useEffect(() => {
        const fetchValue = async () => {
            const storedValue = await getItem('country');
            const storedCountryCode = await getItem('countryCode');
            const storedCountryAlpha3 = await getItem('countryAlpha3');
            setSelectedCountry(storedValue || 'india');
            setSelectedCountryCode(storedCountryCode || 'IN');
            setSelectedCountryAlpha3(getAlpha3(storedValue) || storedCountryAlpha3 || 'ind');
        };

        fetchValue();
    }, []);

    function getFilteredDataValue(data) {
        if (data) {
            let rankingsDataCopy = JSON.parse(JSON.stringify(data));
            if (selectedCountryAlpha3.toLowerCase() !== 'all') {
                rankingsDataCopy = rankingsDataCopy.filter(item =>
                    item.country.toLowerCase() === selectedCountryAlpha3.toLowerCase()
                );
            }
            return rankingsDataCopy
        }
    }

    const handleRefresh = () => {
        setRefreshScore(!refreshScore);
        setPageRefreshTime(new Date().toLocaleString());
    };

    useEffect(() => {
        const fetchRankings = async () => {
            const config = rankingTypeConfig[type];
            if (!config) {
                setError('Invalid ranking type.');
                setRankingsData([]);
                setFilteredData([]);
                return;
            }

            setLoading(true);
            setError(null);
            setPageRefreshTime(new Date().toLocaleString());

            try {
                const apiData = await getOfficialRankingsLatest({
                    tour: config.tour,
                    category: config.category,
                    limit: 1000,
                });
                const normalizedRows = normalizeOfficialRankingRows(apiData.rows || []);

                setRankingTimestamp(apiData.fetched_at ? new Date(apiData.fetched_at).toLocaleString() : 'N/A');
                setPageHeader(config.pageHeader);
                setRankingsData(normalizedRows);
                getFilteredData(normalizedRows);
            } catch (error) {
                setError("Failed to load rankings data: " + error.message);
                setRankingsData([]);
                setFilteredData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRankings();
    }, [refreshScore, type]);

    useEffect(() => {
        getFilteredData(rankingsData);
    }, [selectedCountry, selectedCountryAlpha3]);

    const handleTweetCurrentView = () => {
        const rows = getFilteredDataValue(rankingsData) || [];
        const top = rows.slice(0, 15);
        if (top.length === 0) { toast.info('No ranking data to tweet.'); return; }
        const cName = selectedCountry !== 'all' ? selectedCountry.toUpperCase() : 'Global';
        let tweet = `\uD83C\uDFBE ${pageHeader}\n\uD83D\uDCCA ${cName}\n\n`;
        top.forEach(row => { tweet += `${row.rank}. ${row.player} (${row.country}) - ${row.points} pts\n`; });
        tweet += `\n\uD83D\uDD17 tennisindialive.com/rankings/official/${type}`;
        setTweetText(tweet.trim());
        setTweetStatus('');
        setOpenTweetDialog(true);
    };

    const sendTweet = async () => {
        setTweetStatus('sending');
        try {
            const res = await fetch(`${REACT_APP_API_URL}/tweet/live`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ msg: tweetText, env: 'prod' }),
            });
            const data = await res.json();
            setTweetStatus(data.success ? 'pass' : 'fail:' + (data.detail || data.error || 'Unknown error'));
        } catch (err) {
            setTweetStatus('error:' + err.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617]">
            <TweetPreviewDialog
                open={openTweetDialog}
                onClose={() => setOpenTweetDialog(false)}
                onOk={sendTweet}
                tweet={tweetText}
                tweetStatus={tweetStatus}
                setTweetText={setTweetText}
            />
            <CountryModal
                open={countryModal}
                onClose={() => setCountryModal(false)}
                onSelect={handleAddTab}
            />
            <SEO
                title={`Tennis ${`countryFullName`.toUpperCase()} Live - Official ${type.toUpperCase()} Rankings | Countrywise Rankings & Live Scores`}
                description={`Real-time tennis rankings, live scores and updates for ${selectedCountry}. Follow ATP, WTA, and local tournaments.`}
                keywords={`tennis rankings, ${selectedCountry} tennis, live rankings, ATP, WTA, live scores, country wise rankings`}
                url={`https://tennisindialive.com/rankings/official/${type}/${selectedCountry}`}
            />
            <div
                className="
    sticky top-0 z-20
    flex flex-wrap gap-2 sm:gap-4
    items-center justify-between
    px-3 py-2
    bg-gradient-to-r from-[#0f172a] via-[#020617] to-black
    border-b border-white/10
    shadow-md
  "
            >
                {/* Left */}
                <div className="flex items-center gap-3 min-w-0">
                    <h1 className="text-sm sm:text-base md:text-lg font-bold text-white truncate">
                        {pageHeader}
                    </h1>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="hidden sm:inline">Updated:</span>
                    <span className="whitespace-nowrap">{rankingTimestamp}</span>

                    {isAdmin && (
                    <button
                        onClick={handleTweetCurrentView}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 border border-amber-400/25 text-amber-300 hover:bg-amber-500/20 hover:border-amber-300/50 transition-all duration-150"
                    >
                        Tweet
                    </button>
                    )}

                    <IconButton
                        onClick={handleRefresh}
                        size="small"
                        className="
        !text-slate-300
        hover:!text-emerald-400
        transition
      "
                    >
                        <SyncIcon fontSize="inherit" />
                    </IconButton>
                </div>
            </div>
            {objTabBar}


            {/* Description Section */}
            {/* <div className="bg-yellow-50 border border-yellow-200 text-gray-800 p-3 rounded-md mt-4 text-sm mx-2">
                <p className="mb-2">
                    {`This page shows the latest ${pageHeader} data, including Indian and international players 
                    competing in the ${type.toUpperCase()} tours.  `}
                </p>
                <p className="mb-2">
                    Rankings are updated weekly, sourced from official ATP and WTA data feeds. Country-wise filtering helps you
                    focus on Indian talent or explore global standings.
                </p>
            </div> */}


            {/* Main Content */}
            {error && <p className="text-red-500">{error}</p>}
            {loading ? (
                <Loader />
            ) : rankingsData && (
                <div className="w-full mx-auto border mt-4">
                    <CustomizedTables data={getFilteredDataValue(rankingsData)} countryName={selectedCountry} />
                </div>
            )}
            {/* FAQ Section */}
            {/* <div className="bg-white border border-gray-200 rounded-md mt-4 p-4 mx-2">
                <h3 className="text-md font-semibold mb-2">FAQs</h3>
                <ul className="list-disc ml-6 space-y-2 text-sm text-gray-700">
                    <li><strong>Q: How often is the ranking data updated?</strong><br />
                        A: Rankings are refreshed weekly, typically every Monday, based on ATP/WTA official releases.
                    </li>
                    <li><strong>Q: Can I filter rankings for Indian players only?</strong><br />
                        A: Yes! Use the India/All toggle above to view Indian players or the complete list.
                    </li>
                    <li><strong>Q: Where is this ranking data sourced from?</strong><br />
                        A: All data is sourced from ATP and WTA official websites and reformatted for clarity.
                    </li>
                    <li><strong>Q: What do “Updated At” timestamps mean?</strong><br />
                        A: This shows when the ranking data was last refreshed from official sources.
                    </li>
                </ul>
            </div> */}
            <div className="px-4 py-4">
                <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} className="bg-slate-100">
                        <Typography className="font-medium">FAQs - Official Rankings</Typography>
                    </AccordionSummary>
                    <AccordionDetails className="text-sm">
                        <ul className="list-disc ml-6 space-y-2 text-sm text-gray-700">
                            <li><strong>Q: How often is the ranking data updated?</strong><br />
                                A: Rankings are refreshed weekly, typically every Monday, based on ATP/WTA official releases.
                            </li>
                            <li><strong>Q: Can I filter rankings for Indian players only?</strong><br />
                                A: Yes! Use the India/All toggle above to view Indian players or the complete list.
                            </li>
                            <li><strong>Q: Where is this ranking data sourced from?</strong><br />
                                A: All data is sourced from ATP and WTA official websites and reformatted for clarity.
                            </li>
                            <li><strong>Q: What do “Updated At” timestamps mean?</strong><br />
                                A: This shows when the ranking data was last refreshed from official sources.
                            </li>
                        </ul>
                    </AccordionDetails>
                </Accordion>
            </div>
        </div>
    );
};

export default OfficialRankings;
