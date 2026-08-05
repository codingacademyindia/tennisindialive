// ...existing code...
import React from 'react';
import { Box, Paper, Typography, Button, Stack, useTheme } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
const NotFound = ({ msg = "Page not found", subMsg = "Try with different filters", onBack }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
       
        p: 2,
        background: 'transparent'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 4 },
          textAlign: 'center',
          maxWidth: 560,
          width: '100%',
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <SearchOffOutlinedIcon color="error" sx={{ fontSize: 56 }} />
        <Typography variant="h5" sx={{ mt: 2, fontWeight: 700 }}>
          {msg}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          {subMsg}
        </Typography>

     
      </Paper>
    </Box>
  );
};

export default NotFound;
// ...existing code...