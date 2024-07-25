// Loader.js
import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const NotFound = (props) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '50vh',
                fontSize: 30
            }}
        >
            {props.msg}
        </Box>
    );
};

export default NotFound;
