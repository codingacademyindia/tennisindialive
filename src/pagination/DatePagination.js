import React, { useState, useEffect } from 'react';
import { Box, IconButton, TextField } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { CalendarToday as CalendarTodayIcon, ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import dayjs from 'dayjs';
import { PiEyedropperSample } from 'react-icons/pi';

const ITEMS_PER_PAGE = 1;




const DatePagination = (props) => {
  

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#DDDDD' }}>
            <IconButton onClick={props.handlePrev}>
                <ArrowBackIos />
            </IconButton>
            <Box sx={{ width: '85%', display: 'flex', justifyContent: 'center' }}>
                {props.dates.map((date, index) => (
                    <IconButton
                        key={index}
                        // color={index + 1 === page ? 'primary' : 'default'}
                        onClick={(e) => props.handleChange(e, date, index + 1)}
                        sx={{
                            fontSize: "0.75rem",
                            backgroundColor: date === props.buttonText ? 'primary.main' : 'default',
                            color: date === props.buttonText ? 'white' : 'black',
                            '&:hover': { backgroundColor: index + 1 === props.page ? 'primary.dark' : 'grey.300' }
                        }}
                    >
                        {date}
                    </IconButton>
                ))}
            </Box>
            <IconButton onClick={props.handleNext}>
                <ArrowForwardIos />
            </IconButton>
            <Box sx={{ width: '5%', textAlign: 'center' }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        value={props.selectedDate}
                        onChange={props.handleDateChange}
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
