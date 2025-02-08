import SyncIcon from '@mui/icons-material/Sync';
import { FormControl, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CustomizedTables from '../../common/grids/CustomizedTablesJSON';
import Loader from '../../common/stateHandlers/LoaderState';
import CountryButtonGroup from '../../common/toolbar/CountryButtonGroup';

const CustomFormControl = styled(FormControl)({
    '& .MuiInputBase-root': {
        color: 'white',
    },
    '& .MuiInputLabel-root': {
        color: 'white',
    },
    '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
        borderColor: 'white',
    },
    '& .MuiSelect-icon': {
        color: 'white',
    },
});

const OfficialRankings = () => {
    document.title = "Tennis India Live - ATP Live Rankings";
    const { type } = useParams();
    const [rankingsData, setRankingsData] = useState(null);
    const [filteredData, setFilteredData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshScore, setRefreshScore] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('all');
    const [excludeUnchanged, setExcludeUnchanged] = useState(false);
    const [pageHeader, setPageHeader] = useState("Official Ranking");

    // Function to filter data based on country selection
    function getFilteredData(data) {
        if (data) {
            let rankingsDataCopy = JSON.parse(JSON.stringify(data));
            if (selectedCountry.toLowerCase() !== 'all') {
                rankingsDataCopy = rankingsDataCopy.filter(item =>
                    item.country.toLowerCase() === selectedCountry.toLowerCase()
                );
            }
            setFilteredData(rankingsDataCopy);
        }
    }

    // Handle Country Selection
    const handleCountryClick = (event) => {
        if (event.target.innerText.toLowerCase() === 'india') {
            setSelectedCountry("ind");
        }
        else {
            setSelectedCountry("all")
        }
    };

    // Handle Refresh Button
    const handleRefresh = () => {
        setRefreshScore(!refreshScore);
    };

    useEffect(() => {
        const fetchRankings = async () => {
            setLoading(true);
            try {
                if (type === 'atp-singles') {
                    const response = await fetch('/ranking/atp/official-atp-ranking.json'); // Load local JSON file
                    const data = await response.json();
                    setRankingsData(data);
                    getFilteredData(data);
                    setLoading(false);
                    setPageHeader("Official ATP Ranking - Singles")

                }
                else if (type === 'atp-doubles') {
                    console.log('inside atp-doubles')
                    const response = await fetch('/ranking/atp/official-atp-doubles-ranking.json'); // Load local JSON file
                    const data = await response.json();
                    console.log(data)
                    setRankingsData(data);
                    getFilteredData(data);
                    setLoading(false);
                    setPageHeader("Official ATP Ranking - Doubles")

                }
                else if (type === 'wta-singles') {
                    const response = await fetch('/ranking/wta/official-wta-ranking.json'); // Load local JSON file
                    const data = await response.json();
                    setRankingsData(data);
                    getFilteredData(data);
                    setLoading(false);
                    setPageHeader("Official WTA Ranking - Singles")

                }

                else if (type === 'wta-doubles') {
                    console.log('inside wta-doubles')
                    const response = await fetch('/ranking/wta/official-wta-doubles-ranking.json'); // Load local JSON file
                    const data = await response.json();
                    setRankingsData(data);
                    getFilteredData(data);
                    setLoading(false);
                    setPageHeader("Official WTA Ranking - Doubles")


                }

            } catch (error) {
                setError("Failed to load rankings data.");
                setLoading(false);
            }
        };

        fetchRankings();
    }, [refreshScore]);

    useEffect(() => {
        setLoading(true)

        getFilteredData(rankingsData);
        setLoading(false)

    }, [selectedCountry]);


   

    return (
        <div>
            <div className='flex flex-row space-x-4 w-[90%] bg-slate-200 items-center p-2'>
                <div className='text-xl font-bold'>{pageHeader}</div>
                <IconButton onClick={handleRefresh} variant="contained">
                    <SyncIcon />
                </IconButton>

                <CountryButtonGroup countryName={selectedCountry} handleCountryClick={handleCountryClick} />
            </div>

            {error && <p className="text-red-500">{error}</p>}
            {loading ? <Loader /> : rankingsData && (
                <div className="w-[100%] mx-auto border">
                    <CustomizedTables data={filteredData} countryName={selectedCountry} />
                    {/* {JSON.stringify(rankingsData)} */}
                </div>
            )}
        </div>
    );
};

export default OfficialRankings;
