import * as React from 'react';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { styled } from '@mui/material/styles';
import dayjs from 'dayjs';
import { useTheme } from '@mui/material/styles';

const CustomDatePicker = styled(DatePicker)(({ theme }) => ({
  '& .MuiInputBase-root': {
    width: '150px', // Default width
    [theme.breakpoints.down('sm')]: {
      width: '100px', // Smaller width on small screens
    },
  },
  '& .MuiInputBase-input': {
    padding: '6px 10px',
    [theme.breakpoints.down('sm')]: {
      padding: '4px 8px', // Smaller padding on small screens
    },
  },
  '& .MuiIconButton-root': {
    [theme.breakpoints.down('sm')]: {
      display: 'none', // Hide calendar icon on small screens
    },
  },
}));

export default function DatePickerValue(props) {
  const theme = useTheme(); // Get the theme object
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

  let styleCss = {
    overflowY: 'hidden',
    overflowX: 'hidden',
    width: '100%', // Default width
    maxWidth: '150px', // Maximum width
    [theme.breakpoints.down('sm')]: {
      width: '100%', // Adjusted width for small screens
      maxWidth: '100px', // Smaller maximum width for small screens
    },
    [theme.breakpoints.up('md')]: {
      width: '90%', // Adjusted width for medium and larger screens
    },
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={['DatePicker', 'DatePicker']} sx={styleCss}>
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
