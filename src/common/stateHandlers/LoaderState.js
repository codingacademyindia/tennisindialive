// Loader.js
import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const Loader = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '80vh',
                width:'50vw'
            }}
        >
            <CircularProgress />
        </Box>
    );
};

export default Loader;
