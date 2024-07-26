import SyncIcon from '@mui/icons-material/Sync';
import { FormControl, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CustomizedTables from '../../common/grids/CustomizedTables';
import Loader from '../../common/stateHandlers/LoaderState';
import CountryButtonGroup from '../../common/toolbar/CountryButtonGroup';

const CustomFormControl = styled(FormControl)({
    '& .MuiInputBase-root': {
        color: 'white',
    },
    '& .MuiInputLabel-root': {
        color: 'white',
    },
    '& .MuiInputLabel-root.Mui-focused': {
        color: 'white',
    },
    '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
        borderColor: 'white',
    },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'white',
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'white',
    },
    '& .MuiSelect-icon': {
        color: 'white',
    },
});


const WtaLiveRankings = () => {
    const { year, month, day } = useParams();
    const [rankingsData, setRankingsData] = useState(null);
    const [filteredData, setFilteredData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshScore, setRefreshScore] = useState(false);
    const [selectedDate, setDate] = React.useState(dayjs());
    const [matchStatus, setMatchStatus] = useState("all");
    const [matchStatusList, setMatchStatusList] = useState(["notstarted", "inprogress", "cancelled", "finished"]);
    const [selectedCountry, setSelectedCountry] = useState('all');
    const [updatedAtTimestamp, setUpdatedAtTimestamp] = useState(null)
    const [excludeUnchanged, setExcludeUnchanged] = useState(false)


    const handleExcludeUnchange = (event) => {
        let rankingsDataCopy = JSON.parse(JSON.stringify(rankingsData))
        if (rankingsData) {
            if (!excludeUnchanged) {


                setFilteredData(rankingsDataCopy.filter(item => item.previousRanking !== item.ranking))
            }
            else {
                setFilteredData(rankingsDataCopy)
            }
            setExcludeUnchanged(!excludeUnchanged)
        }
    };

    const handleCountryChange = (newCountryCode) => {
        setSelectedCountry(newCountryCode);
    };

    const handleRefresh = (event) => {

        setRefreshScore(!refreshScore);

    };

    const handleCountryClick = (event) => {

        setSelectedCountry(event.target.innerText.toLowerCase());

        if (event.target.innerText.toLowerCase() !== 'all') {
            let rankingsDataCopy = JSON.parse(JSON.stringify(rankingsData))

            // setFilteredData(rankingsDataCopy.filter(item => item.team?.country?.name.toLowerCase() === event.target.innerText.toLowerCase().toLowerCase()))
            setFilteredData(rankingsDataCopy.filter(item => {
                // Ensure item.team and item.team.country exist and event.target.innerText is a string
                const countryName = item.team?.country?.name;
                const filterText = event.target.innerText;

                // Check if both are defined and then compare
                if (countryName && filterText) {
                    return countryName.toLowerCase() === filterText.toLowerCase();
                }

                return false;
            }));

        }
        else {
            setFilteredData(rankingsData)
        }
    };




    useEffect(() => {

        const fetchRankings = async () => {
            setLoading(true)
            const options = {
                method: 'GET',
                url: 'https://tennisapi1.p.rapidapi.com/api/tennis/rankings/wta/live',
                headers: {
                    'x-rapidapi-key': 'b40a588570mshd0ab93b20a9f16dp1cfbccjsneecf38833008',
                    'x-rapidapi-host': 'tennisapi1.p.rapidapi.com'
                }
            };


            try {
                const response = await axios.request(options);
                setRankingsData(response?.data?.rankings);
                setFilteredData(response?.data?.rankings)
                setUpdatedAtTimestamp(response?.data?.updatedAtTimestamp);
                setLoading(false)
            } catch (error) {
                setError(error.message);
            }
        };

        fetchRankings();
    }, [refreshScore]);


    function readableTimeStamp(timestamp) {
        // Convert to milliseconds (JavaScript timestamps are in milliseconds)
        const date = new Date(timestamp * 1000);

        // Get date components
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' }); // 'default' locale, short month format
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';

        // Convert hours to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'

        // Pad minutes with leading zero if needed
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;

        // Format date string
        const formattedDate = `${day}-${month} ${hours}:${minutesStr} ${ampm}`;
        return formattedDate;
    }



    function getRankingHeader(record) {
        return (<div key={record.team.id} className="border m-1 p-1 space-x-2 flex flex-row items-center w-full font-bold">
            <span className='w-[5%]'>Ranking</span>
            <span className='w-[5%]'>Country</span>
            <span className='w-[30%]'>Player</span>
            <span className='w-[5%]'>Change</span>
            <span className='w-[10%]'>Points</span>
        </div>)
    }

    let statusButtonCss = "border p-1 bg-blue-900 text-white w-[100px] rounded-xl"
    let statusButtonActive = "border p-1 bg-blue-500 border-b-4 border-blue-900 text-white w-[100px] rounded-xl"
    let statusButtonCssExclude = "border p-1 bg-blue-900 text-white w-[200px] rounded-xl"
    let statusButtonActiveExclude = "border p-1 bg-blue-500 border-b-4 border-blue-900 text-white w-[200px] rounded-xl"

    function getStatusButtons() {
        return (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                className={selectedCountry === "india" ? statusButtonActive : statusButtonCss}
                onClick={handleCountryClick}
              >
                INDIA
              </button>
              <button
                className={selectedCountry === "all" ? statusButtonActive : statusButtonCss}
                onClick={handleCountryClick}
              >
                ALL
              </button>
              <button
                className={excludeUnchanged ? statusButtonActiveExclude : statusButtonCssExclude}
                onClick={handleExcludeUnchange}
              >
                {!excludeUnchanged ? "Exclude Unchanged" : "Include Unchanged"}
              </button>
            </div>
          );
          
    }

    return (
        <div>
           <div className='flex flex-row space-x-4 w-[]90%] bg-slate-200 items-center p-2 '>
                <div className='text-2xl font-bold'>WTA LIVE RANKING</div>
                <IconButton onClick={handleRefresh} variant="contained"><SyncIcon /></IconButton>

                {/* {getStatusButtons()} */}
                <CountryButtonGroup countryName={selectedCountry} handleCountryClick={handleCountryClick}/>
                <div>
                    <span>Last Updated At: </span>
                    <span>{readableTimeStamp(updatedAtTimestamp)}</span>
                </div>
            </div>
            {error && <p>Error: {error}</p>}
            {loading ? <Loader /> : rankingsData && (
                <div className=" w-[100%] mx-auto border">
                    {/* <pre>{JSON.stringify(rankingsData, null, 2)}</pre> */}
                    {/* {recordDom()} */}
                    <CustomizedTables data={filteredData} />
                    {/* {JSON.stringify(rankingsData)} */}
                </div>
            )}
        </div>
    );
};

export default WtaLiveRankings;
