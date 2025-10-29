// ...existing code...
import React from 'react';
import { Box, Paper, Typography, Button, Stack, useTheme } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFound = ({ msg = "Page not found", subMsg = "We couldn't find what you're looking for.", onBack }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
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
        <ErrorOutlineIcon color="error" sx={{ fontSize: 56 }} />
        <Typography variant="h5" sx={{ mt: 2, fontWeight: 700 }}>
          {msg}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          {subMsg}
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            onClick={() => (typeof onBack === 'function' ? onBack() : window.history.back())}
          >
            Go back
          </Button>

          <Button
            variant="outlined"
            color="primary"
            onClick={() => (window.location.pathname === '/' ? window.location.reload() : (window.location.href = '/'))}
          >
            Home
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default NotFound;
// ...existing code...