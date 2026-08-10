import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CustomizedTables from '../../common/grids/CustomizedTablesJSON';
import Loader from '../../common/stateHandlers/LoaderState';
import CountryButtonGroup from '../../common/toolbar/CountryButtonGroup'
import { toast } from 'react-toastify';
import SEO from '../../common/seo/SEO';
import { setItem, getItem } from '../../indexDb/indexedDB';
import CountryAutocomplete from '../../common/CountryAutoComplete';
import { getAlpha3, getCountryFullName, normalizeRankingCountry } from '../../utils/utils';
import CountryModal from '../../common/CountryModal';
import { getLiveRankingsLatest } from '../../services/tennisApiService';

const DEFAULT_TABS_RANKINGS = [
    { alpha3: 'all', alpha2: null, label: 'All' },
    { alpha3: 'IND', alpha2: 'IN', label: 'India' },
    { alpha3: 'USA', alpha2: 'US', label: 'USA' },
    { alpha3: 'GBR', alpha2: 'GB', label: 'GBR' },
    { alpha3: 'AUS', alpha2: 'AU', label: 'AUS' },
    { alpha3: 'ESP', alpha2: 'ES', label: 'Spain' },
];

const ATPCurrentRankings = () => {
    const { type } = useParams();
    const { country } = useParams();
    const [rankingsData, setRankingsData] = useState(null);
    const [filteredData, setFilteredData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshScore, setRefreshScore] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(country || 'india');
    const [selectedCountryCode, setSelectedCountryCode] = useState('IN');
    const [selectedCountryAlpha3, setSelectedCountryAlpha3] = useState(getAlpha3(country) || 'ind');
    const [pageHeader, setPageHeader] = useState("Live Ranking");
    const [rankingTimestamp, setRankingTimestamp] = useState("");
    const [pageDesc, setPageDesc] = useState("This page provides real-time updates of ATP and WTA live rankings across Singles and Doubles categories. Use the country filter to focus on Indian players or view all global players.");
    const [expanded, setExpanded] = useState(true);
    const [countryModal, setCountryModal] = useState(false);
    const [countryTabs, setCountryTabs] = useState(() => {
        try { const s = localStorage.getItem('countryTabs'); return s ? JSON.parse(s) : DEFAULT_TABS_RANKINGS; } catch { return DEFAULT_TABS_RANKINGS; }
    });
    // document.title = `Tennis India Live - ${type.toUpperCase()} Live Rankings`;

    const rankingTypeConfig = {
        'atp-singles': {
            tour: 'atp',
            category: 'singles',
            pageHeader: 'ATP Live Ranking - Singles',
            pageDesc: "This page provides real-time updates of ATP live rankings for Singles. Use the 'INDIA' button to focus on Indian players or 'ALL' global players.",
        },
        'atp-doubles': {
            tour: 'atp',
            category: 'doubles',
            pageHeader: 'ATP Live Ranking - Doubles',
            pageDesc: "This page provides real-time updates of ATP live rankings for Doubles. Use the 'INDIA' button to focus on Indian players or 'ALL' global players.",
        },
        'wta-singles': {
            tour: 'wta',
            category: 'singles',
            pageHeader: 'WTA Live Ranking - Singles',
            pageDesc: "This page provides real-time updates of WTA live rankings for Singles. Use the 'INDIA' button to focus on Indian players or 'ALL' global players.",
        },
        'wta-doubles': {
            tour: 'wta',
            category: 'doubles',
            pageHeader: 'WTA Live Ranking - Doubles',
            pageDesc: "This page provides real-time updates of WTA live rankings for Doubles. Use the 'INDIA' button to focus on Indian players or 'ALL' global players.",
        },
    };

    const parseChangeValue = (changeText) => {
        if (changeText === null || changeText === undefined) return 0;
        const text = String(changeText).trim().toLowerCase();
        if (!text || text === '-' || text === 'same' || text === 'no change') return 0;

        const parsed = Number.parseInt(text.replace(/[^0-9+-]/g, ''), 10);
        return Number.isNaN(parsed) ? 0 : parsed;
    };

    const normalizeLiveRankingRows = (rows = []) => {
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
                    String(item.country || '').toLowerCase() === selectedCountryAlpha3.toLowerCase()
                );
            }
            setFilteredData(rankingsDataCopy);
        }
    }

    function getFilteredDataValue(data) {
        if (data) {
            let rankingsDataCopy = JSON.parse(JSON.stringify(data));
            if (selectedCountryAlpha3.toLowerCase() !== 'all') {
                rankingsDataCopy = rankingsDataCopy.filter(item =>
                    String(item.country || '').toLowerCase() === selectedCountryAlpha3.toLowerCase()
                );
            }
            return rankingsDataCopy
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
        // toast.info("Saving your country...", { autoClose: 1000 });
        console.log("Selected country code:", newCountryCode);
        setSelectedCountry(newCountryCode);
        setSelectedCountryCode(newValue ? newValue.code : null)
        setSelectedCountryAlpha3(newValue ? newValue.alpha3.toLowerCase() : null);
        await setItem('country', newCountryCode);
        await setItem('countryCode', newValue ? newValue.code : null);
        await setItem('countryAlpha3', newValue ? newValue.alpha3.toLowerCase() : null);

        setTimeout(() => {
            toast.success(" Loading rankings...", { autoClose: 2000 });
            window.location.href = `/rankings/live/${type}/${newCountryCode.toLowerCase()}`;
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

    const handleRefresh = () => {
        setRefreshScore(!refreshScore);
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

            try {
                const apiData = await getLiveRankingsLatest({
                    tour: config.tour,
                    category: config.category,
                    limit: 1000,
                });
                const normalizedRows = normalizeLiveRankingRows(apiData.rows || []);

                setRankingTimestamp(apiData.fetched_at ? new Date(apiData.fetched_at).toLocaleString() : 'N/A');
                setPageHeader(config.pageHeader);
                setPageDesc(config.pageDesc);
                setRankingsData(normalizedRows);
                getFilteredData(normalizedRows);
            } catch (error) {
                setError("Failed to load rankings data.");
                setRankingsData([]);
                setFilteredData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRankings();
    }, [type, refreshScore]);

    useEffect(() => {
        getFilteredData(rankingsData);
    }, [selectedCountry, selectedCountryAlpha3]);

    console.log(selectedCountryAlpha3);
    return (
        <div className="min-h-screen bg-[#020617]">
            <CountryModal
                open={countryModal}
                onClose={() => setCountryModal(false)}
                onSelect={handleAddTab}
            />
            <SEO
                title={`Live Rankings ${countryFullName.toUpperCase()}  - ${type.toUpperCase()} Rankings | Countrywise Rankings & Live Scores`}
                description={`Real-time tennis rankings, live scores and updates for ${countryFullName}. Follow ATP, WTA, and local tournaments.`}
                keywords={`tennis rankings, ${countryFullName} tennis, live rankings, ATP, WTA, live scores, country wise rankings`}
                url={`https://tennisindialive.com/rankings/live/${type}/${selectedCountry}`}
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
                </div>
            </div>
            {objTabBar}

            {/* Page Description */}
            {/* <div className="bg-yellow-50 border border-yellow-200 text-gray-800 p-3 rounded-md m-1 text-sm">
                {pageDesc}
            </div> */}

            {error && <p className="px-3 py-2 text-red-400 bg-red-950/30 border border-red-900 rounded m-2">{error}</p>}

            {loading ? <Loader /> : rankingsData && (
                <div className="w-full mx-auto border">
                    {getFilteredDataValue(rankingsData)?.length > 0 ? (
                        <CustomizedTables data={getFilteredDataValue(rankingsData)} countryName={selectedCountry} />
                    ) : (
                        <div className="p-4 text-slate-300 bg-slate-900">No ranking data found for selected filters.</div>
                    )}
                </div>
            )}

            {/* FAQ Section */}
            <div className="px-4 py-4">
                <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />} className="bg-slate-100">
                        <Typography className="font-medium">FAQs - Live Rankings</Typography>
                    </AccordionSummary>
                    <AccordionDetails className="text-sm">
                        <p><strong>Q1:</strong> How frequently are these rankings updated?</p>
                        <p><strong>A:</strong> Rankings are updated live based on official ATP and WTA data feeds.</p>

                        <p className="mt-2"><strong>Q2:</strong> What does the 'Updated At' timestamp indicate?</p>
                        <p><strong>A:</strong> It shows the latest timestamp when the ranking data was refreshed.</p>

                        <p className="mt-2"><strong>Q3:</strong> Why do I see only Indian players sometimes?</p>
                        <p><strong>A:</strong> If 'India' is selected in the country filter, only Indian players are shown.</p>
                    </AccordionDetails>
                </Accordion>
            </div>
        </div>
    );
};

export default ATPCurrentRankings;
