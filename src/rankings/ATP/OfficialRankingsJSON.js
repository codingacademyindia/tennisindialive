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

const OfficialRankings = () => {
    const { type } = useParams();
    const { countryAlpha3 } = useParams();
    const [rankingsData, setRankingsData] = useState(null);
    const [filteredData, setFilteredData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const [refreshScore, setRefreshScore] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('india');
    const [selectedCountryCode, setSelectedCountryCode] = useState('IN');
    const [selectedCountryAlpha3, setSelectedCountryAlpha3] = useState(countryAlpha3 || 'ind');

    const [excludeUnchanged, setExcludeUnchanged] = useState(false);
    const [pageHeader, setPageHeader] = useState("Official Ranking");
    const [rankingTimestamp, setRankingTimestamp] = useState("");
    const [pageRefreshTime, setPageRefreshTime] = useState("");

    // document.title = `Tennis India Live - ${type?.toUpperCase()} Official Rankings`;

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
        toast.info("Saving your country...", { autoClose: 1000 });
        console.log("Selected country code:", newCountryCode);
        setSelectedCountry(newCountryCode);
        setSelectedCountryCode(newValue ? newValue.code : null)
        setSelectedCountryAlpha3(newValue ? newValue.alpha3.toLowerCase() : null);
        await setItem('country', newCountryCode);
        await setItem('countryCode', newValue ? newValue.code : null);
        await setItem('countryAlpha3', newValue ? newValue.alpha3.toLowerCase() : null);

        setTimeout(() => {
            toast.success("Saved Selected Country, Loading scores now...", { autoClose: 2000 });
            window.location.href = `/rankings/official/${type}/${newValue.alpha3.toLowerCase()}`;
        }, 800);
    };

    useEffect(() => {
        const fetchValue = async () => {
            const storedValue = await getItem('country');
            const storedCountryCode = await getItem('countryCode');
            const storedCountryAlpha3 = await getItem('countryAlpha3');
            setSelectedCountry(storedValue || 'india');
            setSelectedCountryCode(storedCountryCode || 'IN');
            setSelectedCountryAlpha3(countryAlpha3 ||storedCountryAlpha3  ||'ind');
        };

        fetchValue();
    }, []);


    const handleRefresh = () => {
        setRefreshScore(!refreshScore);
        setPageRefreshTime(new Date().toLocaleString());
    };

    useEffect(() => {
        const fetchRankings = async () => {
            setLoading(true);
            setError(null);
            setPageRefreshTime(new Date().toLocaleString());

            try {
                const timestampRes = await fetch('/ranking/official/official_ranking_timestamp.json');
                const timeStampData = await timestampRes.json();

                let response;
                let data;
                if (type === 'atp-singles') {
                    response = await fetch('/ranking/official/atp/official-atp-ranking.json');
                    data = await response.json();
                    setRankingTimestamp(timeStampData['official-atp-ranking']);
                    setPageHeader("Official ATP Ranking - Singles");
                } else if (type === 'atp-doubles') {
                    response = await fetch('/ranking/official/atp/official-atp-doubles-ranking.json');
                    data = await response.json();
                    setRankingTimestamp(timeStampData['official-atp-doubles-ranking']);
                    setPageHeader("Official ATP Ranking - Doubles");
                } else if (type === 'wta-singles') {
                    response = await fetch('/ranking/official/wta/official-wta-ranking.json');
                    data = await response.json();
                    setRankingTimestamp(timeStampData['official-wta-ranking']);
                    setPageHeader("Official WTA Ranking - Singles");
                } else if (type === 'wta-doubles') {
                    response = await fetch('/ranking/official/wta/official-wta-doubles-ranking.json');
                    data = await response.json();
                    setRankingTimestamp(timeStampData['official-wta-doubles-ranking']);
                    setPageHeader("Official WTA Ranking - Doubles");
                }

                setRankingsData(data);
                getFilteredData(data);
            } catch (error) {
                setError("Failed to load rankings data: " + error.message);
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

    return (
        <div>
            {/* Header Section */}
              <SEO
                title={`${selectedCountry.toUpperCase()} - Countrywise Tennis Rankings & Live Updates  | Tennis India Official Rankings`}
                description={`Real-time tennis rankings and updates for ${selectedCountry}. Follow ATP, WTA, and local tournaments.`}
                keywords={`tennis rankings, ${selectedCountry} tennis, live rankings, ATP, WTA`}
                url={`https://tennisindialive.com/rankings/official/${type}/${selectedCountry}`}
            />
            <div className='flex flex-wrap sm:flex-row sm:space-x-4 w-full bg-slate-200 items-center p-2 space-y-2 sm:space-y-0'>
                <div className='text-xl font-bold'>{pageHeader}</div>
                {/* <CountryButtonGroup countryName={selectedCountry} handleCountryClick={handleCountryClick} /> */}
                <CountryAutocomplete
                    selectedCountry={selectedCountry}
                    handleCountryChange={handleCountryChange}
                />
                <div className='flex flex-row items-center space-x-1 text-xs'>
                    <span className='font-bold'>Updated At:</span>
                    <span>{rankingTimestamp}</span>
                </div>

                <IconButton onClick={handleRefresh} size="small">
                    <SyncIcon fontSize="small" />
                </IconButton>
            </div>

            {/* Description Section */}
            <div className="bg-yellow-50 border border-yellow-200 text-gray-800 p-3 rounded-md mt-4 text-sm mx-2">
                <p className="mb-2">
                    {`This page shows the latest ${pageHeader} data, including Indian and international players 
                    competing in the ${type.toUpperCase()} tours.  `}
                </p>
                <p className="mb-2">
                    Rankings are updated weekly, sourced from official ATP and WTA data feeds. Country-wise filtering helps you
                    focus on Indian talent or explore global standings.
                </p>
            </div>


            {/* Main Content */}
            {error && <p className="text-red-500">{error}</p>}
            {loading ? (
                <Loader />
            ) : rankingsData && (
                <div className="w-full mx-auto border mt-4">
                    <CustomizedTables data={filteredData} countryName={selectedCountry} />
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
