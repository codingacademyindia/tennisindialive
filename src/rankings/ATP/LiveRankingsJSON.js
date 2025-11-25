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
import { getAlpha3 } from '../../utils/utils';


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

    // document.title = `Tennis India Live - ${type.toUpperCase()} Live Rankings`;

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

    useEffect(() => {
        const fetchValue = async () => {
            const storedValue = await getItem('country');
            const storedCountryCode = await getItem('countryCode');
            const storedCountryAlpha3 = await getItem('countryAlpha3');
            setSelectedCountry(storedValue || 'india');
            setSelectedCountryCode(storedCountryCode || 'IN');
            setSelectedCountryAlpha3(getAlpha3(storedValue) || storedCountryAlpha3  || 'ind');
        };

        fetchValue();
    }, []);

    const handleRefresh = () => {
        setRefreshScore(!refreshScore);
    };

    useEffect(() => {
        const fetchRankings = async () => {
            setLoading(true);
            const timestamp = await fetch('/ranking/live/live_ranking_timestamp.json');
            const timeStampData = await timestamp.json();

            try {
                let response, data;
                switch (type) {
                    case 'atp-singles':
                        response = await fetch('/ranking/live/atp/atp-live-ranking.json');
                        data = await response.json();
                        setRankingTimestamp(timeStampData['atp-live-ranking']);
                        setPageHeader("ATP Live Ranking - Singles");
                        setPageDesc("This page provides real-time updates of ATP live rankings for Singles . Use the 'INDIA' button  to focus on Indian players or 'ALL' global players.")
                        break;
                    case 'atp-doubles':
                        response = await fetch('/ranking/live/atp/atp-doubles-live-ranking.json');
                        data = await response.json();
                        setRankingTimestamp(timeStampData['atp-doubles-live-ranking']);
                        setPageHeader("ATP Live Ranking - Doubles");
                        setPageDesc("This page provides real-time updates of ATP live rankings for Doubles . Use the 'INDIA' button  to focus on Indian players or 'ALL' global players.")
                        break;
                    case 'wta-singles':
                        response = await fetch('/ranking/live/wta/wta-live-ranking.json');
                        data = await response.json();
                        setRankingTimestamp(timeStampData['wta-live-ranking']);
                        setPageHeader("WTA Live Ranking - Singles");
                        setPageDesc("This page provides real-time updates of WTA live rankings for Singles . Use the 'INDIA' button  to focus on Indian players or 'ALL' global players.")
                        break;
                    case 'wta-doubles':
                        response = await fetch('/ranking/live/wta/wta-doubles-live-ranking.json');
                        data = await response.json();
                        setRankingTimestamp(timeStampData['wta-doubles-live-ranking']);
                        setPageHeader("WTA Live Ranking - Doubles");
                        setPageDesc("This page provides real-time updates of WTA live rankings for Doubles . Use the 'INDIA' button  to focus on Indian players or 'ALL' global players.")
                        break;
                    default:
                        data = [];
                }

                setRankingsData(data);
                getFilteredData(data);
            } catch (error) {
                setError("Failed to load rankings data.");
            } finally {
                setLoading(false);
            }
        };

        fetchRankings();
    }, [refreshScore]);

    useEffect(() => {
        setLoading(true);
        getFilteredData(rankingsData);
        setLoading(false);
    }, [selectedCountry, selectedCountryAlpha3]);

    console.log(selectedCountryAlpha3);
    return (
        <div>
           <SEO
                title={`Tennis ${selectedCountry.toUpperCase()} Live - ${type.toUpperCase()} Rankings | Countrywise Rankings & Live Scores`}
                description={`Real-time tennis rankings, live scores and updates for ${selectedCountry}. Follow ATP, WTA, and local tournaments.`}
                keywords={`tennis rankings, ${selectedCountry} tennis, live rankings, ATP, WTA, live scores, country wise rankings`}
                url={`https://tennisindialive.com/rankings/live/${type}/${selectedCountry}`}
            />
            <div className='flex flex-row space-x-4 w-full bg-slate-200 items-center p-2'>
                <div className='text-xl font-bold'>{pageHeader}</div>
                {/* <CountryButtonGroup countryName={selectedCountry} handleCountryClick={handleCountryClick} /> */}
                <CountryAutocomplete
                    selectedCountry={selectedCountry}
                    handleCountryChange={handleCountryChange}
                />
                <div className='flex flex-row space-x-1 text-xs'>
                    <span className='font-bold'>Updated At:</span>
                    <span>{rankingTimestamp}</span>
                </div>
            </div>

            {/* Page Description */}
            <div className="bg-yellow-50 border border-yellow-200 text-gray-800 p-3 rounded-md m-1 text-sm">
                {pageDesc}
            </div>

            {error && <p className="text-red-500">{error}</p>}

            {loading ? <Loader /> : rankingsData && (
                <div className="w-full mx-auto border">
                    <CustomizedTables data={getFilteredDataValue(rankingsData)} countryName={selectedCountry} />
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
