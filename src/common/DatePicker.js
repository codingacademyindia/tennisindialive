import * as React from 'react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';

const CustomDatePicker = styled(DatePicker)(({ theme }) => ({
  '& .MuiInputBase-input': {
    padding: '6px 10px',
    [theme.breakpoints.down('sm')]: {
      padding: '4px 8px', // Smaller padding on small screens
    }
  }
  // '& .MuiInputLabel-root': {
  //   color: 'white',
  // },
  // '& .MuiInputLabel-root.Mui-focused': {
  //   color: 'white',
  // },
  // '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
  //   borderColor: 'white',
  // },
  // '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
  //   borderColor: 'white',
  // },
  // '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
  //   borderColor: 'white',
  // },
}));

export default function DatePickerValue(props) {
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth);

  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSmallScreen = windowWidth <= 600; // Adjust the breakpoint as needed

  const formatDate = (date) => {
    return isSmallScreen ? dayjs(date).format('MM/DD') : dayjs(date).format('MM/DD/YYYY');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={['DatePicker', 'DatePicker']}>
        <CustomDatePicker
          label="Select Date"
          value={props.selectedDate}
          size="small"
          onChange={props.handleSelectDate}
          inputFormat={formatDate(props.selectedDate)} // Apply the format based on screen size
        />
      </DemoContainer>
    </LocalizationProvider>
  );
}
