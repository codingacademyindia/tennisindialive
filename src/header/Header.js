import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import { GiTennisBall } from "react-icons/gi";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background: 'navy',
    color: theme.palette.common.white,
}));


const pages = ['Live Scores', 'ATP Live Ranking', 'WTA Live Ranking'];

function ResponsiveAppBar() {
    const [anchorElNav, setAnchorElNav] = React.useState(null);

    function getActivePage() {
        let href = window.location.href
        if (href.includes("results")) {
            return "live scores"
        }
        else if (href.includes("live/atp")) {
            return "atp live ranking"
        }
        else if (href.includes("live/wta")) {
            return "wta live ranking"
        }

    }

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleCloseNavMenu = (e) => {
        const text = e.target.innerText.toLowerCase();
        if (text === 'live scores') {
            window.location.href = `/results/${year}/${month}/${day}`;
        } else if (text === 'atp live ranking') {
            window.location.href = "/rankings/live/atp";
        } else if (text === 'wta live ranking') {
            window.location.href = "/rankings/live/wta";
        }
        setAnchorElNav(null);
    };

    const date = new Date();
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1; // Months are zero-based, so add 1
    const day = date.getUTCDate();

    return (
        <StyledAppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="open navigation menu"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                            keepMounted
                            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{ display: { xs: 'block', md: 'none' } }}
                        >
                            {pages.map((page) => (
                                <MenuItem key={page} onClick={handleCloseNavMenu}>
                                    <Typography textAlign="center">{page}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>

                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: { xs: 'center', md: 'center' } }}>
                        {/* <div className="text-3xl font-bold bg-gradient-to-r from-green-600 via-blue-500 to-orange-600 text-white text-center flex items-center rounded-xl p-1"> */}
                        <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-blue-400 to-green-600 text-white text-center flex items-center rounded-xl p-1">
                            <GiTennisBall className="h-5 w-5 sm:h-8 sm:w-8 mr-2 text-green-300" />
                            <div className="text-lg sm:text-xl">TENNIS INDIA</div>
                            <div className="text-lg sm:text-xl animate-pulse ml-2">LIVE</div>
                        </div>
                    </Box>

                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end' }}>
                        {pages.map((page) => (
                            <Button
                                key={page}
                                onClick={handleCloseNavMenu}
                                sx={{ color: 'white', ml: 2, backgroundColor: getActivePage() === page.toLowerCase() ? 'rgba(255, 255, 255, 0.2)' : 'transparent' }}
                            >
                                {page}
                            </Button>
                        ))}
                    </Box>
                </Toolbar>
            </Container>
        </StyledAppBar>
    );
}

export default ResponsiveAppBar;
