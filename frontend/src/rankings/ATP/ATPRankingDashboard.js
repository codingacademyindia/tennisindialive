import React, { useEffect, useState } from "react";
import Loader from "../../common/stateHandlers/LoaderState";
import SEO from "../../common/seo/SEO";
import { toast } from "react-toastify";
import PaginatedTablesJSON from "../../common/grids/PaginatedTablesJSON";
import CountryModal from "../../common/CountryModal";
import { normalizeRankingCountry } from "../../utils/utils";
import { getLiveRankingsLatest, getOfficialRankingsLatest } from "../../services/tennisApiService";
import TweetPreviewDialog from "../../admin/TweetPreview";

const rawApiUrl = process.env.REACT_APP_API_URL || '';
const REACT_APP_API_URL = rawApiUrl && rawApiUrl.includes('cai-service.onrender.com') ? '' : rawApiUrl;

const rankingTypes = [
    {
        key: "atp-singles-live",
        tab: "Live Singles",
        source: "live",
        tour: "atp",
        category: "singles",
        header: "ATP Live Ranking - Singles",
        desc: "Real-time ATP Singles rankings. Use the country filter to focus on India or view all global players."
    },
    {
        key: "atp-singles-official",
        tab: "Official Singles",
        source: "official",
        tour: "atp",
        category: "singles",
        header: "ATP Official Ranking - Singles",
        desc: "Official ATP Singles rankings. Updated weekly. Use the country filter to focus on India or view all global players."
    },
    {
        key: "atp-doubles-live",
        tab: "Live Doubles",
        source: "live",
        tour: "atp",
        category: "doubles",
        header: "ATP Live Ranking - Doubles",
        desc: "Real-time ATP Doubles rankings. Use the country filter to focus on India or view all global players."
    },
    {
        key: "atp-doubles-official",
        tab: "Official Doubles",
        source: "official",
        tour: "atp",
        category: "doubles",
        header: "ATP Official Ranking - Doubles",
        desc: "Official ATP Doubles rankings. Updated weekly. Use the country filter to focus on India or view all global players."
    }
];

const DEFAULT_TABS_RANKINGS = [
    { alpha3: 'all', alpha2: null, label: 'All' },
    { alpha3: 'IND', alpha2: 'IN', label: 'India' },
    { alpha3: 'USA', alpha2: 'US', label: 'USA' },
    { alpha3: 'GBR', alpha2: 'GB', label: 'GBR' },
    { alpha3: 'AUS', alpha2: 'AU', label: 'AUS' },
    { alpha3: 'ESP', alpha2: 'ES', label: 'Spain' },
];

const ATPRankingDashboard = () => {
    const [selectedCountry, setSelectedCountry] = useState("all");
    const [selectedCountryAlpha3, setSelectedCountryAlpha3] = useState("all");
    const [selectedCountryCode, setSelectedCountryCode] = useState(null);
    const [countryTabs, setCountryTabs] = useState(() => {
        try { const s = localStorage.getItem('countryTabs'); return s ? JSON.parse(s) : DEFAULT_TABS_RANKINGS; } catch { return DEFAULT_TABS_RANKINGS; }
    });

    const [rawRankingsData, setRawRankingsData] = useState({});
    const [rankingsTimeStamp, setRankingsTimeStamp] = useState({});
    const [loading, setLoading] = useState(true);
    const [countryModal, setCountryModal] = useState(false);
    const [selectedRankingKey, setSelectedRankingKey] = useState(rankingTypes[0].key);
    const [openTweetDialog, setOpenTweetDialog] = useState(false);
    const [tweetText, setTweetText] = useState('');
    const [tweetStatus, setTweetStatus] = useState('');
    const isAdmin = localStorage.getItem('mode') === 'admin';

    // Fetch all rankings from the backend API once; country filtering happens client-side on tab switch
    useEffect(() => {
        const parseChangeValue = (changeText) => {
            if (changeText === null || changeText === undefined) return 0;
            const text = String(changeText).trim().toLowerCase();
            if (!text || text === '-' || text === 'same' || text === 'no change') return 0;
            const parsed = Number.parseInt(text.replace(/[^0-9+-]/g, ''), 10);
            return Number.isNaN(parsed) ? 0 : parsed;
        };

        const normalizeRows = (rows = []) => rows.map(row => ({
            rank: row.rank_text ?? row.rank_value ?? '',
            player: row.player ?? '',
            country: (normalizeRankingCountry(row.country) || '').toUpperCase(),
            change: parseChangeValue(row.change_text),
            points: row.points_text ?? row.points_value ?? '',
            career_high: row.career_high ?? '',
        }));

        const fetchAllRankings = async () => {
            setLoading(true);

            const dataObj = {};
            const timeStampObject = {}
            try {
                for (let r of rankingTypes) {
                    try {
                        const apiData = r.source === 'official'
                            ? await getOfficialRankingsLatest({ tour: r.tour, category: r.category, limit: 1000 })
                            : await getLiveRankingsLatest({ tour: r.tour, category: r.category, limit: 1000 });
                        dataObj[r.key] = normalizeRows(apiData.rows || []);
                        timeStampObject[r.key] = apiData.fetched_at ? new Date(apiData.fetched_at).toLocaleString() : 'N/A';
                    } catch (err) {
                        console.error(`Failed to fetch ${r.key}:`, err);
                        dataObj[r.key] = [];
                    }
                }
                setRawRankingsData(dataObj);
                setRankingsTimeStamp(timeStampObject);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load rankings data");
            } finally {
                setLoading(false);
            }
        };

        fetchAllRankings();
    }, []);

    function getTopCounts(data) {
        const result = [];
        for (let i = 100; i <= 1000; i += 100) {
            result.push({
                label: `Top ${i}`,
                count: data.filter(player => Number(player.rank) <= i).length
            });
        }
        return result;
    }
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

    const handleTweetCurrentView = () => {
        const r = rankingTypes.find(r => r.key === selectedRankingKey);
        const allRows = rawRankingsData[r.key] || [];
        const filteredRows = selectedCountryAlpha3.toLowerCase() !== 'all'
            ? allRows.filter(item => item.country.toLowerCase() === selectedCountryAlpha3.toLowerCase())
            : allRows;
        const top = filteredRows.slice(0, 15);
        if (top.length === 0) { toast.info('No ranking data to tweet.'); return; }
        const cName = selectedCountry !== 'all' ? selectedCountry.toUpperCase() : 'Global';
        let tweet = `\uD83C\uDFBE ${r.header}\n\uD83D\uDCCA ${cName}\n\n`;
        top.forEach(row => { tweet += `${row.rank}. ${row.player} (${row.country}) - ${row.points} pts\n`; });
        tweet += `\n\uD83D\uDD17 tennisindialive.com/rankings/atp`;
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

    const objTabBar = (
        <div className="flex items-center overflow-x-auto [&::-webkit-scrollbar]:hidden border-b border-gray-800 mb-3 bg-gray-900/60 px-2 py-1">
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
return (
        <div className="min-h-screen bg-gray-900 py-4 px-2 sm:px-4">
            <SEO
                title={`ATP Ranking Dashboard - Tennis ${selectedCountry.toUpperCase()} ATP Rankings  | Live & Official`}
                description={`All ATP rankings (Singles & Doubles, Live & Official) in one page. Filter by country to view Indian players or global players.`}
                keywords={`ATP rankings, tennis ${selectedCountry}, live rankings, doubles rankings, singles rankings, official ATP`}
                url={`https://tennisindialive.com/rankings/atp/dashboard/${selectedCountry}`}
            />

            <div className="mb-1">
                <div className="text-2xl font-bold text-white mb-1">ATP Rankings Dashboard</div>
                {objTabBar}
                <div className="flex items-center gap-1 mb-4 mt-1">
                    {rankingTypes.map(r => (
                        <button
                            key={r.key}
                            onClick={() => setSelectedRankingKey(r.key)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ${
                                selectedRankingKey === r.key
                                    ? 'bg-gray-700 text-white'
                                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                            }`}
                        >
                            {r.tab}
                        </button>
                    ))}
                    {isAdmin && (
                    <button
                        onClick={handleTweetCurrentView}
                        className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-amber-500/10 border border-amber-400/25 text-amber-300 hover:bg-amber-500/20 hover:border-amber-300/50 transition-all duration-150"
                    >
                        Tweet
                    </button>
                    )}
                </div>
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
            </div>

            {loading ? (
                <Loader />
            ) : (() => {
                const r = rankingTypes.find(r => r.key === selectedRankingKey);
                const allRows = rawRankingsData[r.key] || [];
                const filteredRows = selectedCountryAlpha3.toLowerCase() !== 'all'
                    ? allRows.filter(item => item.country.toLowerCase() === selectedCountryAlpha3.toLowerCase())
                    : allRows;
                const topCounts = selectedCountry !== 'all' && filteredRows.length ? getTopCounts(filteredRows) : [];
                return (
                    <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 px-3 py-2 bg-slate-900/80 border border-white/10 rounded-lg mb-3">
                            <span className="text-sm font-semibold text-slate-100">{r.header}</span>
                            <span className="text-[10px] sm:text-xs text-slate-400 whitespace-nowrap">Updated: {rankingsTimeStamp[r.key]}</span>
                        </div>
                        {topCounts.length > 0 && (
                            <div className="flex flex-row flex-wrap gap-1 mb-3">
                                {topCounts.map(tc => tc.count > 0 && (
                                    <span key={tc.label} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-blue-900/40 rounded text-xs">
                                        <span className="text-blue-300">{tc.label}</span>
                                        <span className="text-blue-400">:</span>
                                        <span className="text-yellow-200">{tc.count}</span>
                                    </span>
                                ))}
                            </div>
                        )}
                        <PaginatedTablesJSON data={filteredRows} countryName={selectedCountry} />
                    </div>
                );
            })()}
        </div>
    );
};

export default ATPRankingDashboard;
