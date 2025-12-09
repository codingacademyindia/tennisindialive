import React from 'react';
import { Box, Paper, Typography, Button, Stack, useTheme } from '@mui/material';
import SearchOffOutlinedIcon from '@mui/icons-material/SearchOffOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useNavigate } from 'react-router-dom';

const NotFound = ({ msg = "Page not found", subMsg = "Try different filters or go back to a safe page.", onBack }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleBack = () => {
    if (typeof onBack === 'function') return onBack();
    // try to go back in history, otherwise go to dashboard/home
    if (window.history.length > 1) navigate(-1);
    else navigate('/'); // fallback route - adjust if you want a different default
  };

  // dashboard-dark themed colors (falls back to theme.palette values)
  const bgCard =
    theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.9)' : theme.palette.background.paper;
  const borderColor =
    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(16,24,40,0.04)';
  const accent =
    theme.palette.primary?.main ?? (theme.palette.mode === 'dark' ? '#60a5fa' : '#2563eb');

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2,
        py: { xs: 6, sm: 10 },
        width: '100%',
        background: 'transparent',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 3, sm: 4 },
          textAlign: 'center',
          maxWidth: 640,
          width: '100%',
          borderRadius: 2,
          bgcolor: bgCard,
          border: `1px solid ${borderColor}`,
          boxShadow: theme.palette.mode === 'dark' ? '0 6px 18px rgba(2,6,23,0.6)' : undefined,
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 84,
            height: 84,
            borderRadius: '14px',
            mb: 2,
            mx: 'auto',
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)'}`,
          }}
        >
          <SearchOffOutlinedIcon sx={{ fontSize: 44, color: accent }} />
        </Box>

        <Typography variant="h5" sx={{ mt: 1, fontWeight: 700, color: 'text.primary' }}>
          {msg}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          {subMsg}
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mt: 1 }}>
          <Button
            startIcon={<ArrowBackIosNewIcon />}
            onClick={handleBack}
            variant="contained"
            color="primary"
            sx={{
              px: 3,
              py: 1,
              textTransform: 'none',
              boxShadow: 'none',
              bgcolor: accent,
              '&:hover': { bgcolor: theme.palette.mode === 'dark' ? accent : undefined },
            }}
          >
            Go back
          </Button>

          <Button
            startIcon={<HomeOutlinedIcon />}
            onClick={() => navigate('/')}
            variant="outlined"
            sx={{
              px: 3,
              py: 1,
              textTransform: 'none',
              color: 'text.primary',
              borderColor: borderColor,
              '&:hover': { borderColor: accent, color: accent },
            }}
          >
            Home
          </Button>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3 }}>
          If you think this is an error, please contact support or try refreshing the page.
        </Typography>
      </Paper>
    </Box>
  );
};

export default NotFound;