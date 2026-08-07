import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import CountryModal from "../../common/CountryModal";
import SEO from "../../common/seo/SEO";
import Loader from "../../common/stateHandlers/LoaderState";
import PaginatedTablesJSON from "../../common/grids/PaginatedTablesJSON";
import { normalizeRankingCountry } from "../../utils/utils";
import { getLiveRankingsLatest, getOfficialRankingsLatest } from "../../services/tennisApiService";

const rankingTypes = [
    {
        key: "wta-singles-live",
        tab: "Live Singles",
        source: "live",
        tour: "wta",
        category: "singles",
        header: "WTA Live Ranking - Singles",
        desc: "Real-time wta Singles rankings. Use the country filter to focus on India or view all global players."
    },
    {
        key: "wta-singles-official",
        tab: "Official Singles",
        source: "official",
        tour: "wta",
        category: "singles",
        header: "WTA Official Ranking - Singles",
        desc: "Official wta Singles rankings. Updated weekly. Use the country filter to focus on India or view all global players."
    },
    {
        key: "wta-doubles-live",
        tab: "Live Doubles",
        source: "live",
        tour: "wta",
        category: "doubles",
        header: "WTA Live Ranking - Doubles",
        desc: "Real-time wta Doubles rankings. Use the country filter to focus on India or view all global players."
    },
    {
        key: "wta-doubles-official",
        tab: "Official Doubles",
        source: "official",
        tour: "wta",
        category: "doubles",
        header: "WTA Official Ranking - Doubles",
        desc: "Official wta Doubles rankings. Updated weekly. Use the country filter to focus on India or view all global players."
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

const WTARankingDashboard = () => {
    const [selectedCountry, setSelectedCountry] = useState("all");
    const [selectedCountryAlpha3, setSelectedCountryAlpha3] = useState("all");
    const [selectedCountryCode, setSelectedCountryCode] = useState(null);
    const [countryTabs, setCountryTabs] = useState(() => {
        try { const s = localStorage.getItem('countryTabs'); return s ? JSON.parse(s) : DEFAULT_TABS_RANKINGS; } catch { return DEFAULT_TABS_RANKINGS; }
    });
    const [countryModal, setCountryModal] = useState(false);
    const [rankingsTimeStamp, setRankingsTimeStamp] = useState({});
    const [rawRankingsData, setRawRankingsData] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedRankingKey, setSelectedRankingKey] = useState(rankingTypes[0].key);

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
        <div className="flex items-center overflow-x-auto [&::-webkit-scrollbar]:hidden border-b border-gray-700/50 mb-3">
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
                            <span onClick={(e) => handleRemoveTab(tab.alpha3, e)} className="opacity-0 group-hover:opacity-100 ml-0.5 text-gray-600 hover:text-red-400 leading-none cursor-pointer transition-opacity" title="Remove tab">×</span>
                        )}
                    </button>
                );
            })}
            <button onClick={() => setCountryModal(true)} title="Add country tab" className="flex-shrink-0 mx-1 flex items-center justify-center w-5 h-5 rounded border border-dashed border-gray-700 text-gray-600 hover:text-teal-400 hover:border-teal-600 transition-all text-sm leading-none">+</button>
        </div>
    );

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
            const timeStampObject = {};
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

    return (
        <div className="min-h-screen bg-gray-900 py-4 px-2 sm:px-4">
            <SEO
                title={`WTA  M
                    Ranking Dashboard - Tennis ${selectedCountry.toUpperCase()} ATP Rankings  | Live & Official`}
                description={`All wta rankings (Singles & Doubles, Live & Official) in one page. Filter by country to view Indian players or global players.`}
                keywords={`wta rankings, tennis ${selectedCountry}, live rankings, doubles rankings, singles rankings, official wta`}
                url={`https://tennisindialive.com/rankings/wta/dashboard/${selectedCountry}`}
            />

            <div className="mb-1">
                <div className="text-2xl font-bold text-white mb-1">WTA Rankings Dashboard</div>
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
                </div>
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

export default WTARankingDashboard;
