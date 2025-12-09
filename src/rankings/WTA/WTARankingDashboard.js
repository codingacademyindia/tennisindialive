import React, { useEffect, useState } from "react";
import CountryAutocomplete from "../../common/CountryAutoComplete";
import CustomizedTables from "../../common/grids/CustomizedTablesJSON";
import Loader from "../../common/stateHandlers/LoaderState";
import SEO from "../../common/seo/SEO";
import { getAlpha3 } from "../../utils/utils";
import { setItem, getItem } from "../../indexDb/indexedDB";
import { toast } from "react-toastify";
import RankingAccordion from "../RankingAccordian";

const rankingTypes = [
    {
        key: "wta-singles-live",
        url: "/ranking/live/wta/wta-live-ranking.json",
        header: "WTA Live Ranking - Singles",
        desc: "Real-time wta Singles rankings. Use the country filter to focus on India or view all global players."
    },
    {
        key: "wta-singles-official",
        url: "/ranking/official/wta/official-wta-ranking.json",
        header: "WTA Official Ranking - Singles",
        desc: "Official wta Singles rankings. Updated weekly. Use the country filter to focus on India or view all global players."
    },
    {
        key: "wta-doubles-live",
        url: "/ranking/live/wta/wta-doubles-live-ranking.json",
        header: "WTA Live Ranking - Doubles",
        desc: "Real-time wta Doubles rankings. Use the country filter to focus on India or view all global players."
    },
    {
        key: "wta-doubles-official",
        url: "/ranking/official/wta/official-wta-doubles-ranking.json",
        header: "WTA Official Ranking - Doubles",
        desc: "Official wta Doubles rankings. Updated weekly. Use the country filter to focus on India or view all global players."
    }
];

const WTARankingDashboard = () => {
    const [selectedCountry, setSelectedCountry] = useState("india");
    const [selectedCountryAlpha3, setSelectedCountryAlpha3] = useState("ind");
    const [selectedCountryCode, setSelectedCountryCode] = useState("IN");

    const [rankingsData, setRankingsData] = useState({});
    const [loading, setLoading] = useState(true);

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

    const handleCountryChange = async (newCountryCode, newValue) => {
        setSelectedCountry(newCountryCode);
        setSelectedCountryCode(newValue ? newValue.code : null);
        setSelectedCountryAlpha3(newValue ? newValue.alpha3.toLowerCase() : null);

        await setItem("country", newCountryCode);
        await setItem("countryCode", newValue ? newValue.code : null);
        await setItem("countryAlpha3", newValue ? newValue.alpha3.toLowerCase() : null);

        toast.success("Loading rankings...", { autoClose: 1500 });
    };

    return (
        <div className="min-h-screen bg-gray-900 py-4 px-2 sm:px-4">
            <SEO
                title={`Tennis ${selectedCountry.toUpperCase()} wta Rankings Dashboard | Live & Official`}
                description={`All wta rankings (Singles & Doubles, Live & Official) in one page. Filter by country to view Indian players or global players.`}
                keywords={`wta rankings, tennis ${selectedCountry}, live rankings, doubles rankings, singles rankings, official wta`}
                url={`https://tennisindialive.com/rankings/wta/dashboard/${selectedCountry}`}
            />

            <div className="flex flex-row space-x-4 items-center mb-4">
                <div className="text-2xl font-bold text-white">wta Rankings Dashboard</div>
                <CountryAutocomplete
                    selectedCountry={selectedCountry}
                    handleCountryChange={handleCountryChange}
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
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WTARankingDashboard;
