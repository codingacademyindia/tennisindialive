import { Refresh } from '@mui/icons-material';
import CheckIcon from '@mui/icons-material/Check';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { FcBusinessman, FcBusinesswoman } from "react-icons/fc";
import { IoTennisballSharp } from "react-icons/io5";
import { useParams } from 'react-router-dom';
import DatePickerValue from '../common/DatePicker';
import Loader from '../common/stateHandlers/LoaderState';
import IconButton from '@mui/material/IconButton';
import SyncIcon from '@mui/icons-material/Sync';
import NotFound from '../common/stateHandlers/NotFound';
import StatusButtonGroup from '../common/toolbar/StatusButtonGroup';
import CountryIcon from '../common/CountryFlagName';
import CountryAutocomplete from '../common/CountryAutoComplete'
import DatePagination from '../pagination/DatePagination';


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

const TOURNAMENT_NAME = ''


const FixtureResults = () => {
    const formatDate = (date) => dayjs(date).format('DD-MMM'); // Format date as DD-MMM
    document.title = "Tennis India Live - Live Scores and Results"
    let params = useParams();
    let day, month, year
    if (Object.keys(params).length === 0) {
        const date = new Date();

        // Extract the year, month, and date
        day = String(date.getDate());
        month = String(date.getMonth() + 1); // Months are zero-based, so add 1
        year = String(date.getFullYear());
    }
    else {
        day = params.day
        month = params.month
        year = params.year
    }

    const formatDateToDayMonth = (day, month, year) => {
        // Create a Date object
        const date = new Date(year, month - 1, day);

        // Format the date using dayjs
        const formattedDate = dayjs(date).format('DD-MMM');

        return formattedDate;
    };

    const [rankingsData, setRankingsData] = useState(null);
    const [filteredData, setFilteredData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshScore, setRefreshScore] = useState(false);
    const [selectedDate, setSelectedDate] = React.useState(dayjs(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`));
    const [matchStatus, setMatchStatus] = useState("all");
    const [matchStatusList, setMatchStatusList] = useState(["live", "scheduled", "cancelled", "finished"]);
    const [selectedCountry, setSelectedCountry] = useState('');
    const [offset, setOffset] = useState(null);
    const [page, setPage] = useState(5);
    const [dates, setDates] = useState([]);
    const [buttonText, setButtonText] = useState(`${formatDateToDayMonth(day, month, year)}`)
    // const [selectedDate, setSelectedDate] = useState(new Date());




    const parseDateString = (dateString) => {
        const currentYear = dayjs().year(); // Get the current year
        const formattedDateString = `${dateString}-${currentYear}`; // Append the current year to the input string

        const parsedDate = dayjs(formattedDateString, 'DD-MMM-YYYY'); // Parse the date using dayjs

        if (!parsedDate.isValid()) {
            throw new Error('Invalid date format');
        }

        const day = parsedDate.date(); // Extract the day
        const month = parsedDate.month() + 1; // Extract the month (0-based index, hence the +1)
        const year = parsedDate.year(); // Extract the year

        return { day, month, year, parsedDate };
    };

    const handlePageChange = (event, dateValue, value) => {
        setPage(value);
        // const selectedDateFromPage = dayjs(selectedDate).startOf('month').add(value - 1, 'day').toDate();
        // const date = new Date(selectedDateFromPage);
        const { day, month, year, parsedDate } = parseDateString(dateValue)
        // Extract the year, month, and date
        // const day = date.getDate();
        // const month = date.getMonth() + 1; // Months are zero-based, so add 1
        // const year = date.getFullYear();
        setSelectedDate(parsedDate);
        window.location.href = `/results/${year}/${month}/${day}`
    };

    const handleDateChange = (date) => {
        const date1 = new Date(date);

        // Extract the year, month, and date
        const day = date1.getDate();
        const month = date1.getMonth() + 1; // Months are zero-based, so add 1
        const year = date1.getFullYear();

        setSelectedDate(date);
        const formattedDate = formatDate(date);
        const dateIndex = dates.findIndex(d => d === formattedDate);
        if (dateIndex !== -1) {
            setPage(dateIndex + 1);
        } else {
            const newDates = generateDates(date);
            setDates(newDates);
            setPage(newDates.indexOf(formattedDate) + 1);
        }
        window.location.href = `/results/${year}/${month}/${day}`

    };

    const handleNext = () => {
        if (page < dates.length) {
            setPage(page + 1);
        }
    };

    const handlePrev = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };
    const handleCountryChange = (newCountryCode) => {
        setSelectedCountry(newCountryCode);
    };

    const handleStatusChange = (event) => {
        setLoading(true)
        setMatchStatus(event.target.value);

    };


    const handleOffset = (value) => {
        setOffset(value)
    };



    const handleStatusButtonClick = (event) => {
        setMatchStatus(event.target.innerText.toLowerCase())

    };


    // const handleSelectDate = newValue => {
    //     const date = new Date(newValue);

    //     // Extract the year, month, and date
    //     const day = date.getDate();
    //     const month = date.getMonth() + 1; // Months are zero-based, so add 1
    //     const year = date.getFullYear();

    //     setDate(newValue)
    //     window.location.href = `/results/${year}/${month}/${day}`

    // }



    useEffect(() => {
        const datesAroundSelected = generateDates(selectedDate);
        setDates(datesAroundSelected);
        const today = dayjs().startOf('day');
        const selectedDay = dayjs(selectedDate).startOf('day');
        const newOffset = selectedDay.diff(today, 'day');
        setOffset(newOffset)

    }, [selectedDate]);


    useEffect(() => {
        const fetchRankings = async () => {
            setLoading(true);
            setError("")
            const options = {
                method: 'GET',
                url: `https://flashlive-sports.p.rapidapi.com/v1/events/list`,
                params: { "locale": "en_INT", "sport_id": "2", "timezone": "-4", "indent_days": offset },
                headers: {
                    'x-rapidapi-key': 'a26a45b260mshdc356af23e2935cp19491fjsn52a1e9b7db18',
                    'x-rapidapi-host': 'flashlive-sports.p.rapidapi.com'
                }
            };
            try {
                const response = await axios.request(options);
                setRankingsData(response.data['DATA']);
                setFilteredData(response.data['DATA'])
                setLoading(false);
            } catch (error) {
                setError(error.message);
            }
        };
        if (offset!==undefined || offset!==null) {
            fetchRankings();
        }
        // const intervalId = setInterval(fetchRankings, 12000000000); // 

        // return () => clearInterval(intervalId); // 
    }, [refreshScore, offset]);

    useEffect(() => {
        setLoading(true);
        let rankingsDataCopy = JSON.parse(JSON.stringify(rankingsData))
        let filterByCountry
        if (selectedCountry !== '') {
            filterByCountry = filterDataByCountry(rankingsDataCopy)
        }
        else {
            filterByCountry = rankingsDataCopy
        }
        // let rankingsDataCopy = JSON.parse(JSON.stringify(rankingsData));
        if (matchStatus.includes("all")) {
            setMatchStatusList(["live", "scheduled", "cancelled", "finished"])
            let filterByStatus = filterDataByStatus(filterByCountry, ["live", "scheduled", "cancelled", "finished"])
            setFilteredData(filterByStatus)
        }
        else {
            setMatchStatusList([matchStatus])
            let filterByStatus = filterDataByStatus(filterByCountry, [matchStatus])
            setFilteredData(filterByStatus)

        }
        setLoading(false)

    }, [matchStatus, selectedCountry, rankingsData]);

    // useEffect(() => {
    //     let rankingsDataCopy = JSON.parse(JSON.stringify(rankingsData))
    //     let filterByCountry
    //     if (selectedCountry !== '') {
    //         filterByCountry = filterDataByCountry(rankingsDataCopy)
    //     }
    //     else {
    //         filterByCountry = rankingsDataCopy
    //     }
    //     let filterByStatus = filterDataByStatus(filterByCountry, matchStatusList)
    //     setFilteredData(filterByStatus)

    // }, [matchStatusList, selectedCountry]);



    // useEffect(() => {
    //     filterDataByCountry()
    //     setLoading(false)


    // }, [selectedCountry]);


    function formatTennisScoreDom(item) {
        // Extract the sets' scores
        const homePeriod1 = item.HOME_SCORE_PART_1 || 0;
        const homePeriod2 = item.HOME_SCORE_PART_2 || 0;
        const homePeriod3 = item.HOME_SCORE_PART_3 || 0;
        const homePeriod4 = item.HOME_SCORE_PART_4 || 0;
        const homePeriod5 = item.HOME_SCORE_PART_5 || 0;

        const awayPeriod1 = item.AWAY_SCORE_PART_1 || 0;
        const awayPeriod2 = item.AWAY_SCORE_PART_2 || 0;
        const awayPeriod3 = item.AWAY_SCORE_PART_3 || 0;
        const awayPeriod4 = item.AWAY_SCORE_PART_4 || 0;
        const awayPeriod5 = item.AWAY_SCORE_PART_5 || 0;

        // Handle tiebreak scores if present
        const homePeriod2TieBreak = item['HOME_TIEBREAK_PART_1'] || '';
        const awayPeriod2TieBreak = item['AWAY_TIEBREAK_PART_1'] || '';

        // Format the scores
        const homeScores = [];
        const awayScores = [];

        homeScores.push(`${homePeriod1}`);
        awayScores.push(`${awayPeriod1}`);

        if (homePeriod2TieBreak && awayPeriod2TieBreak) {
            homeScores.push(
                <span key="homePeriod2">
                    {homePeriod2}
                    <sup className="font-bold">{homePeriod2TieBreak}</sup>
                </span>
            );
            awayScores.push(
                <span key="awayPeriod2">
                    {awayPeriod2}
                    <sup className="font-bold">{awayPeriod2TieBreak}</sup>
                </span>
            );
        } else {
            homeScores.push(`${homePeriod2}`);
            awayScores.push(`${awayPeriod2}`);
        }

        if (homePeriod3 !== 0 || awayPeriod3 !== 0) {
            homeScores.push(`${homePeriod3}`);
            awayScores.push(`${awayPeriod3}`);
        }

        if (homePeriod4 !== 0 || awayPeriod4 !== 0) {
            homeScores.push(`${homePeriod4}`);
            awayScores.push(`${awayPeriod4}`);
        }

        if (homePeriod5 !== 0 || awayPeriod5 !== 0) {
            homeScores.push(`${homePeriod5}`);
            awayScores.push(`${awayPeriod5}`);
        }

        let currentStatus = item.STAGE_TYPE ? item.STAGE_TYPE.toLowerCase() : ''

        return (
            <div className="flex flex-col h-full w-full items-center  justify-center">
                <div className="flex flex-row space-x-2 w-full h-[1/2]  text-sm border-b-2 border-slate-200">
                    {homeScores.map((score, index) => (
                        <div className="w-[20%] p-1" key={index}>{score}</div>
                    ))}
                    {currentStatus === 'live' && <span className="border text-green-800 p-1 font-bold">{item?.HOME_SCORE_PART_GAME}</span>}
                </div>
                <div className="flex flex-row space-x-2 w-full h-[1/2]  text-sm">
                    {awayScores.map((score, index) => (
                        <div className="w-[20%] p-1" key={index}>{score}</div>
                    ))}
                    {currentStatus === 'live' && <span className="border text-green-800 p-1 font-bold">{item?.AWAY_SCORE_PART_GAME}</span>}
                </div>
            </div>
        );
    }



    function getStatusDom(matchStatus, startTime) {
        if (matchStatus.toLowerCase() === 'live') {
            return (<Box sx={{ width: '50%', mt: 2 }}>
                <LinearProgress color="success" />
            </Box>)
        }
        else if (matchStatus.toLowerCase() === 'scheduled') {
            return readableTimeStamp(startTime)
        }
        else if (matchStatus.toLowerCase() === 'finished') {
            return (<div className='flex flex-row'><span>Finished</span>
                {readableDate(startTime)}
            </div>)
        }
        else {
            return matchStatus
        }
    }

    function getRoundAbbreviation(round) {
        if (!round) {
            return ""
        }
        round = round.toLowerCase()
        const roundMap = {
            'round of 128': 'R128',
            'round of 64': 'R64',
            'round of 32': 'R32',
            'round of 16': 'R16',
            'quarterfinal': 'QF',
            'quarterfinals': 'QF',
            'qualification round 1': 'QR1',
            'qualification round 2': 'QR2',
            'qualification round 3': 'QR3',
            'qualification final round': 'Final Q',
            'semifinals': 'SF',
            'semifinal': 'SF',
            'final': 'F',
            'finals': 'F'
        };

        const lowerCaseRound = round.toLowerCase();
        for (const [key, value] of Object.entries(roundMap)) {
            if (key.toLowerCase() === lowerCaseRound) {
                return value;
            }
        }

        // Default case if the round is not found
        return '';
    }

    function getPlayerDom(item, tournamentName) {
        try {
            let p1 = item['HOME_PARTICIPANT_NAME_ONE'];
            let p2 = item['AWAY_PARTICIPANT_NAME_ONE'];

            if (!tournamentName.toLowerCase().includes('doubles')) {

                return (
                    <div className='flex flex-col w-full h-full border'>
                        <div key={item.id} className="flex space-x-2 w-full h-full flex-row items-center">
                            <div className="h-full flex items-center"><CountryIcon countryName={item['HOME_PARTICIPANT_COUNTRY_NAME_ONE']} name={p1.country?.name} size={15} /></div>
                            <div className="h-full flex items-center">{p1}</div>
                            {item.SERVICE === 1 && item.STAGE_TYPE.toLowerCase() === 'live' ? <IoTennisballSharp size={15} className='text-green-500' /> : ""}
                            {item.WINNER === 1 ? <CheckIcon sx={{ color: "green", fontSize: 20 }} /> : ""}
                        </div>
                        <div key={item.id} className="space-x-2 h-full flex flex-row items-center">
                            <div className="h-full flex items-center"><CountryIcon countryName={item['AWAY_PARTICIPANT_COUNTRY_NAME_ONE']} name={p2.country?.name} size={15} /></div>
                            <div className="h-full flex items-center">{p2}</div>
                            {item.SERVICE === 2 && item.STAGE_TYPE.toLowerCase() === 'live' ? <IoTennisballSharp size={15} className='text-green-500' /> : ""}
                            {item.WINNER === 2 ? <CheckIcon sx={{ color: "green", fontSize: 20 }} /> : ""}
                        </div>
                    </div>
                );

            } else {
                const p1a = item['HOME_PARTICIPANT_NAME_ONE'];
                const p1b = item['HOME_PARTICIPANT_NAME_TWO'];
                const p2a = item['AWAY_PARTICIPANT_NAME_ONE'];
                const p2b = item['AWAY_PARTICIPANT_NAME_TWO'];
                return (
                    <div>
                        <div key={item.id} className="space-x-2 p-1 flex flex-row items-center">
                            <div className='w-full flex flex-col'>
                                <div className='w-full flex flex-row space-x-2 items-center'>
                                    <span><CountryIcon countryName={item['HOME_PARTICIPANT_COUNTRY_NAME_ONE']} name={p1a.country?.name} size={15} /></span>
                                    <span>{p1a}</span>
                                </div>
                                <div className='w-full flex flex-row space-x-2'>
                                    <span><CountryIcon countryName={item['HOME_PARTICIPANT_COUNTRY_NAME_TWO']} name={p1b.country?.name} size={15} /></span>
                                    <span>{p1b}</span>
                                </div>
                            </div>
                        </div>
                        <div key={item.id} className="space-x-2 p-1 flex flex-row items-center">
                            <div className='w-full flex flex-col'>
                                <div className='w-full flex flex-row space-x-2 items-center'>
                                    <span><CountryIcon countryName={item['AWAY_PARTICIPANT_COUNTRY_NAME_ONE']} name={p2a.country?.name} size={15} /></span>
                                    <span>{p2a}</span>
                                </div>
                                <div className='w-full flex flex-row space-x-2 items-center'>
                                    <span><CountryIcon countryName={item['AWAY_PARTICIPANT_COUNTRY_NAME_TWO']} name={p2b.country?.name} size={15} /></span>
                                    <span>{p2b}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            }
        } catch (err) {
            console.error(err);
        }
    }

    function hasIndian(item) {
        if (selectedCountry === '') {
            return true
        }
        const countries = [
            item.HOME_PARTICIPANT_COUNTRY_NAME_ONE ? item.HOME_PARTICIPANT_COUNTRY_NAME_ONE.toLowerCase() : null,
            item.HOME_PARTICIPANT_COUNTRY_NAME_TWO ? item.HOME_PARTICIPANT_COUNTRY_NAME_TWO.toLowerCase() : null,
            item.AWAY_PARTICIPANT_COUNTRY_NAME_ONE ? item.AWAY_PARTICIPANT_COUNTRY_NAME_ONE.toLowerCase() : null,
            item.AWAY_PARTICIPANT_COUNTRY_NAME_TWO ? item.AWAY_PARTICIPANT_COUNTRY_NAME_TWO.toLowerCase() : null,
        ];
        if (countries.includes(selectedCountry) && matchStatusList.includes(item.STAGE_TYPE.toLowerCase())) {
            return true
        }
        else {
            return false
        }
    }

    function fetchScoreRecord(item, tournament_name) {

        let objDom = []

        // if (!item.tournament.name.toLowerCase().includes('davis cup') && !item.tournament.name.toLowerCase().includes('billie jean king cup')) {
        const uniqueTournament = tournament_name;
        if (uniqueTournament) {
            try {
                // if (matchStatusList.includes(item.STAGE_TYPE.toLowerCase())) {
                if (hasIndian(item)) {

                    objDom = (<div className="flex flex-row w-full h-full text-sm space-x-4 sm:space-x-8">
                        <div className='w-[20%] sm:w-[10%] flex flex-col justify-center text-center items-center bg-slate-100 font-bold'>
                            <span className="text-xs">{item?.ROUND} </span>
                            <span className="text-xs w-full flex justify-center">{getStatusDom(item.STAGE_TYPE, item.START_TIME)}</span>
                        </div>
                        <div className="flex flex-col min-h-full justify-center w-[60%] sm:w-[30%]">
                            {getPlayerDom(item, tournament_name)}
                        </div>

                        <div className='w-[20%] bg-slate-100'>{item?.status?.type !== "notstarted" && formatTennisScoreDom(item)}</div>
                    </div>
                    )
                    return objDom
                }
            }
            catch (err) {
                console.error(err)
            }

        }
        // }

        return objDom
    }





    // Example usage
    const homeScore = { period1: 6, period2: 7, period2TieBreak: 7 };
    const awayScore = { period1: 4, period2: 6, period2TieBreak: 5 };
    const handleRefresh = e => {
        setRefreshScore(!refreshScore)
    }

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

    function readableDate(timestamp) {
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
        const formattedDate = `${day}-${month}`;
        return formattedDate;
    }

    function getScoreHeader(item) {
        if (item) {
            if (item.EVENTS.length === 0) {
                return ""
            }
            if (item.NAME.toLowerCase().includes("women") || item.NAME.toLowerCase().includes("wta")) {
                return (<div className="flex flex-row bg-pink-300 text-lg items-center p-1">
                    <img src={item.TOURNAMENT_IMAGE} height="30px" width="30px" />
                    <span className='ml-1'>{item.NAME} </span>
                </div>
                )
            }
            else {
                return (<div className="flex flex-row bg-blue-300 text-lg items-center p-1">
                    <img src={item.TOURNAMENT_IMAGE} height="30px" width="30px" />
                    <span className='ml-1'>{item.NAME} </span>
                </div>
                )

            }
        }
        else {
            return (<div className="flex flex-row bg-gray-300 text-lg items-center p-1">
                <img src={item.TOURNAMENT_IMAGE} height="30px" width="30px" />
                <span className='ml-1'>{item.NAME} </span>
            </div>)
        }
    }



    function recordDom() {
        if (filteredData.length > 0) {
            return filteredData.map((item, index) => {
                return (

                    (item.NAME === TOURNAMENT_NAME || TOURNAMENT_NAME === '') && (<div className='flex flex-col'>
                        {getScoreHeader(item)}
                        {item['EVENTS'].map(record => fetchScoreRecord(record, item.NAME))}
                        {/* {fetchScoreRecord(item, item.NAME)} */}
                    </div>))
            }
            )
        }
        else {
            return "NO RESULT"
        }
    }

    function filterEventsByStatus(events, statusList) {
        events = events.filter(item => statusList.includes(item.STAGE_TYPE.toLowerCase()))
        return events
    }

    function getProperty(dict, prop) {
        if (dict[prop]) {
            return dict[prop]
        }
        else {
            return ""
        }
    }
    function isIndianPlayerFound(item) {
        if (selectedCountry === '') {
            return true
        }
        let countryList = [getProperty(item, 'HOME_PARTICIPANT_COUNTRY_NAME_ONE').toLowerCase(),
        getProperty(item, 'HOME_PARTICIPANT_COUNTRY_NAME_TWO').toLowerCase(),
        getProperty(item, 'AWAY_PARTICIPANT_COUNTRY_NAME_ONE').toLowerCase(),
        getProperty(item, 'AWAY_PARTICIPANT_COUNTRY_NAME_TWO').toLowerCase()]
        if (countryList.includes(selectedCountry.toLowerCase())) {
            return true
        }
        else { return false }
    }
    function filterEventsByCountry(events) {
        events = events.filter(item => isIndianPlayerFound(item))
        return events
    }

    function filterDataByStatus(rankingsDataCopy, statusList) {


        if (rankingsDataCopy) {
            // Iterate over each item and filter its EVENTS
            rankingsDataCopy = rankingsDataCopy.map(item => {
                item.EVENTS = filterEventsByStatus(item.EVENTS, statusList);
                return item;
            });

            // Discard items where EVENTS is empty
            rankingsDataCopy = rankingsDataCopy.filter(item => item.EVENTS && item.EVENTS.length > 0);

            return rankingsDataCopy;
        }
    }

    function filterDataByCountry(rankingsDataCopy) {
        if (selectedCountry === '') {
            return rankingsDataCopy
        }
        if (rankingsDataCopy) {
            // Iterate over each item and filter its EVENTS
            rankingsDataCopy = rankingsDataCopy.map(item => {
                item.EVENTS = filterEventsByCountry(item.EVENTS);
                return item;
            });

            // Discard items where EVENTS is empty
            rankingsDataCopy = rankingsDataCopy.filter(item => item.EVENTS && item.EVENTS.length > 0);

            return rankingsDataCopy
        }
    }



    const generateDates = (selectedDate) => {
        // Generate dates around the selected date in DD-MMM format
        const startDate = dayjs(selectedDate).subtract(7, 'day');
        const endDate = dayjs(selectedDate).add(7, 'day');
        let dates = [];

        for (let date = startDate; date.isBefore(endDate); date = date.add(1, 'day')) {
            dates.push(formatDate(date));
        }

        return dates;
    };

    console.log(offset)
    return (
        <div>
            <div className='flex flex-row space-x-4 w-full bg-slate-200 items-center p-1  border'>
                {/* <div className="bg-slate-500 text-white">Scores</div> */}
                {/* <DatePickerValue handleSelectDate={handleSelectDate} selectedDate={selectedDate} /> */}

                {/* {getStatusControl()} */}

                {/* {getStatusButtons()} */}
                <div className="font-bold">Filter Scores</div>
                <StatusButtonGroup matchStatus={matchStatus} handleStatusButtonClick={handleStatusButtonClick} />
                <CountryAutocomplete
                    selectedCountry={selectedCountry}
                    handleCountryChange={handleCountryChange}
                />
                <IconButton onClick={handleRefresh}><SyncIcon /></IconButton>
            </div>
            <div className="w-full">
                <DatePagination dates={dates} page={page} handleNext={handleNext} handlePrev={handlePrev} handleDateChange={handleDateChange}
                    handleChange={handlePageChange} selectedDate={selectedDate} buttonText={buttonText} />
            </div>
            {error && <p>Error: {error}</p>}
            {loading ? <Loader /> : filteredData && (
                <div className=" w-[100%] mx-auto">
                    {recordDom()}
                </div>
            )}
        </div>
    );
};

export default FixtureResults;

