import * as React from 'react';

import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useThemeProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const CustomDatePicker = styled(DatePicker)({
    '& .MuiInputBase-input': {
      color: 'white',
      padding: '6px 10px', //
    },
    '& .MuiInputLabel-root': {
      color: 'white'
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
  });

export default function DatePickerValue(props) {
  

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={['DatePicker', 'DatePicker']}>
        <DatePicker
          label="Select Date"
          value={props.selectedDate}
          size="small"
          onChange={props.handleSelectDate}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
}
