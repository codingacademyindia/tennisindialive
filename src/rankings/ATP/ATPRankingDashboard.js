import React, { useEffect, useState } from "react";
import CountryAutocomplete from "../../common/CountryAutoComplete";
import CustomizedTables from "../../common/grids/CustomizedTablesJSON";
import Loader from "../../common/stateHandlers/LoaderState";
import SEO from "../../common/seo/SEO";
import { getAlpha3, getCountryFullName } from "../../utils/utils";
import { setItem, getItem } from "../../indexDb/indexedDB";
import { toast } from "react-toastify";
import RankingAccordion from "../RankingAccordian";
import CountryModal from "../../common/CountryModal";

const rankingTypes = [
    {
        key: "atp-singles-live",
        url: "/ranking/live/atp/atp-live-ranking.json",
        header: "ATP Live Ranking - Singles",
        desc: "Real-time ATP Singles rankings. Use the country filter to focus on India or view all global players."
    },
    {
        key: "atp-singles-official",
        url: "/ranking/official/atp/official-atp-ranking.json",
        header: "ATP Official Ranking - Singles",
        desc: "Official ATP Singles rankings. Updated weekly. Use the country filter to focus on India or view all global players."
    },
    {
        key: "atp-doubles-live",
        url: "/ranking/live/atp/atp-doubles-live-ranking.json",
        header: "ATP Live Ranking - Doubles",
        desc: "Real-time ATP Doubles rankings. Use the country filter to focus on India or view all global players."
    },
    {
        key: "atp-doubles-official",
        url: "/ranking/official/atp/official-atp-doubles-ranking.json",
        header: "ATP Official Ranking - Doubles",
        desc: "Official ATP Doubles rankings. Updated weekly. Use the country filter to focus on India or view all global players."
    }
];

const ATPRankingDashboard = () => {
    const [selectedCountry, setSelectedCountry] = useState("india");
    const [selectedCountryAlpha3, setSelectedCountryAlpha3] = useState("ind");
    const [selectedCountryCode, setSelectedCountryCode] = useState("IN");

    const [rankingsData, setRankingsData] = useState({});
    const [loading, setLoading] = useState(true);
   const [countryModal, setCountryModal] = useState(false);
    // Load stored country from indexedDB
    useEffect(() => {
        const fetchStoredCountry = async () => {
            const storedValue = await getItem("country");
            const storedCode = await getItem("countryCode");
            const storedAlpha3 = await getItem("countryAlpha3");

            setSelectedCountry(storedValue || "india");
            setSelectedCountryCode(storedCode || "IN");
            setSelectedCountryAlpha3(getAlpha3(storedValue) || storedAlpha3 || "ind");
        };
        fetchStoredCountry();
    }, []);

    // Fetch all rankings
    useEffect(() => {
        const fetchAllRankings = async () => {
            setLoading(true);
            const dataObj = {};
            try {
                for (let r of rankingTypes) {
                    try {
                        const res = await fetch(`${window.location.origin}${r.url}`);
                        const data = await res.json();
                        // Filter by country
                        const filtered = selectedCountryAlpha3.toLowerCase() !== "all"
                            ? data.filter(item => item.country.toLowerCase() === selectedCountryAlpha3.toLowerCase())
                            : data;
                        dataObj[r.key] = filtered;
                    } catch (err) {
                        console.error(`Failed to fetch ${r.key}:`, err);
                        dataObj[r.key] = [];
                    }
                }
                setRankingsData(dataObj);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load rankings data");
            } finally {
                setLoading(false);
            }
        };

        fetchAllRankings();
    }, [selectedCountryAlpha3]);

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
    const handleCountryChange = async (newCountryCode, newValue) => {
        setSelectedCountry(newCountryCode);
        setSelectedCountryCode(newValue ? newValue.code : null);
        setSelectedCountryAlpha3(newValue ? newValue.alpha3.toLowerCase() : null);

        await setItem("country", newCountryCode);
        await setItem("countryCode", newValue ? newValue.code : null);
        await setItem("countryAlpha3", newValue ? newValue.alpha3.toLowerCase() : null);

        toast.success("Loading rankings...", { autoClose: 1500 });
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
    return (
        <div className="min-h-screen bg-gray-900 py-4 px-2 sm:px-4">
            <SEO
                title={`Tennis ${selectedCountry.toUpperCase()} ATP Rankings Dashboard | Live & Official`}
                description={`All ATP rankings (Singles & Doubles, Live & Official) in one page. Filter by country to view Indian players or global players.`}
                keywords={`ATP rankings, tennis ${selectedCountry}, live rankings, doubles rankings, singles rankings, official ATP`}
                url={`https://tennisindialive.com/rankings/atp/dashboard/${selectedCountry}`}
            />

            <div className="flex flex-row space-x-4 items-center mb-4">
                <div className="text-2xl font-bold text-white">ATP Rankings Dashboard</div>
                {/* <CountryAutocomplete
                    selectedCountry={selectedCountry}
                    handleCountryChange={handleCountryChange}
                /> */}
                {objDomCountryButton}
                <CountryModal
                    open={countryModal}
                    onClose={() => setCountryModal(false)}
                    onSelect={handleCountryChange}
                />
            </div>

            {loading ? (
                <Loader />
            ) : (
                <div>
                    {rankingTypes.map((r) => (
                        <div key={r.key} className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700">

                            {/* <CustomizedTables data={rankingsData[r.key] || []} countryName={selectedCountry} /> */}
                            <RankingAccordion
                                rankingsData={rankingsData[r.key]}
                                rankingType={r.key}
                                rankingHeader={r.header}
                                rankingDesc={r.desc}
                                selectedCountry={selectedCountry}
                                count={rankingsData[r.key] ? rankingsData[r.key].length : 0}
                                topCounts={selectedCountry === 'all' ? [] : rankingsData[r.key] ? getTopCounts(rankingsData[r.key]) : []}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ATPRankingDashboard;
