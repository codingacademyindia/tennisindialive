import React, { useState, useEffect } from 'react';
import { Box, IconButton, TextField } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { CalendarToday as CalendarTodayIcon, ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import dayjs from 'dayjs';
import { PiEyedropperSample } from 'react-icons/pi';

const ITEMS_PER_PAGE = 1;

const formatDate = (date) => dayjs(date).format('DD-MMM'); // Format date as DD-MMM

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

const DatePagination = (props) => {
    const [page, setPage] = useState(5);
    const [dates, setDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const datesAroundSelected = generateDates(selectedDate);
        setDates(datesAroundSelected);
        const today = dayjs().startOf('day');
        const selectedDay = dayjs(selectedDate).startOf('day');
        const newOffset = selectedDay.diff(today, 'day');
        setOffset(newOffset);
        props.handleOffset(newOffset)
    }, [selectedDate]);

    const handleChange = (event, value) => {
        setPage(value);
        const selectedDateFromPage = dayjs(selectedDate).startOf('month').add(value - 1, 'day').toDate();
        setSelectedDate(selectedDateFromPage);
    };

    const handleDateChange = (date) => {
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

    console.log(offset)
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#DDDDD' }}>
            <IconButton onClick={handlePrev}>
                <ArrowBackIos />
            </IconButton>
            <Box sx={{ width: '85%', display: 'flex', justifyContent: 'center' }}>
                {dates.map((date, index) => (
                    <IconButton
                        key={index}
                        color={index + 1 === page ? 'primary' : 'default'}
                        onClick={(e) => handleChange(e, index + 1)}
                        sx={{ fontSize: '0.75rem' }}
                    >
                        {date}
                    </IconButton>
                ))}
            </Box>
            <IconButton onClick={handleNext}>
                <ArrowForwardIos />
            </IconButton>
            <Box sx={{ width: '5%', textAlign: 'center' }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        value={selectedDate}
                        onChange={handleDateChange}
                        renderInput={(params) => (
                            <TextField {...params} variant="standard" sx={{ display: 'none' }} />
                        )}
                        inputFormat="dd-MMM-yyyy"
                    />
                </LocalizationProvider>
            </Box>
        </Box>
    );
};

export default DatePagination;
