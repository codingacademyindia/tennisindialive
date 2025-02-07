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
import SocialMedia from '../common/SocialMedia';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background: 'navy',
    color: theme.palette.common.white,
}));

const pages = ['Live Scores', 'ATP Ranking', 'WTA Ranking'];
const atpSubPages = ['Singles Live', 'Doubles Live', 'Singles Official', 'Doubles Official'];
const wtaSubPages = ['Singles Live', 'Doubles Live', 'Singles Official', 'Doubles Official'];

function ResponsiveAppBar() {
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElATP, setAnchorElATP] = React.useState(null);
    const [anchorElWTA, setAnchorElWTA] = React.useState(null);

    function getActivePage() {
        let href = window.location.href;
        if (href.includes("results")) {
            return "live scores";
        } else if (href.includes("live/atp")) {
            return "atp ranking";
        } else if (href.includes("live/wta")) {
            return "wta ranking";
        }
    }

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleCloseNavMenu = (e) => {
        const text = e.target.innerText.toLowerCase();
        if (text === 'live scores') {
            window.location.href = `/results/${year}/${month}/${day}`;
        } else if (text === 'atp ranking') {
            window.location.href = "/rankings/live/atp";
        } else if (text === 'wta ranking') {
            window.location.href = "/rankings/live/wta";
        }
        setAnchorElNav(null);
    };

    const handleOpenATPMenu = (event) => {
        setAnchorElATP(event.currentTarget);
    };
    const handleCloseATPMenu = (event) => {
        let text = event.target.innerText.toLowerCase()
        if (text==='singles live'){
            text="atp-singles"
            window.location.href = `/rankings/live/${text}`;

        }
        else if (text==='doubles live'){
            text="atp-doubles"
            window.location.href = `/rankings/live/${text}`;

        }
        else if (text==='singles official'){
            text="atp-singles"
            window.location.href = `/rankings/official/${text}`;

        }
        else if (text==='doubles official'){
            text="atp-doubles"
            window.location.href = `/rankings/official/${text}`;

        }

        setAnchorElATP(null);
    };

    const handleOpenWTAMenu = (event) => {
        setAnchorElWTA(event.currentTarget);
    };
    const handleCloseWTAMenu = (event) => {
        let text = event.target.innerText.toLowerCase()
        if (text==='singles live'){
            text="wta-singles"
            window.location.href = `/rankings/live/${text}`;

        }
        else if (text==='doubles live'){
            text="wta-doubles"
            window.location.href = `/rankings/live/${text}`;

        }
        else if (text==='singles official'){
            text="wta-singles"
            window.location.href = `/rankings/official/${text}`;

        }
        else if (text==='doubles official'){
            text="wta-doubles"
            window.location.href = `/rankings/official/${text}`;

        }

        setAnchorElWTA(null);
    };

    const date = new Date();
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1; // Months are zero-based, so add 1
    const day = date.getUTCDate();

    return (
        <StyledAppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    {/* Mobile Menu */}
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

                    {/* Logo */}
                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: { xs: 'center', md: 'left' } }}>
                        <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-blue-400 to-green-600 text-white text-center flex items-center rounded-xl p-1">
                            <a href="/" rel="noopener noreferrer" className="no-underline flex items-center">
                                <GiTennisBall className="h-5 w-5 sm:h-8 sm:w-8 mr-2 text-green-300" />
                                <div className="text-lg whitespace-nowrap">TENNIS INDIA</div>
                                <div className="text-lg animate-pulse ml-2">LIVE</div>
                            </a>
                        </div>
                    </Box>

                    {/* Desktop Menu */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                        <Button
                            onClick={() => (window.location.href = "/results")}
                            sx={{ color: 'white', ml: 2 }}
                        >
                            Live Scores
                        </Button>

                        {/* ATP Ranking Dropdown */}
                        <Button
                            onClick={handleOpenATPMenu}
                            sx={{ color: 'white', ml: 2 }}
                        >
                            ATP Ranking
                        </Button>
                        <Menu
                            anchorEl={anchorElATP}
                            open={Boolean(anchorElATP)}
                            onClose={handleCloseATPMenu}
                        >
                            {atpSubPages.map((page) => (
                                <MenuItem key={page} onClick={handleCloseATPMenu}>
                                    {page}
                                </MenuItem>
                            ))}
                        </Menu>

                        {/* WTA Ranking Dropdown */}
                        <Button
                            onClick={handleOpenWTAMenu}
                            sx={{ color: 'white', ml: 2 }}
                        >
                            WTA Ranking
                        </Button>
                        <Menu
                            anchorEl={anchorElWTA}
                            open={Boolean(anchorElWTA)}
                            onClose={handleCloseWTAMenu}
                        >
                            {wtaSubPages.map((page) => (
                                <MenuItem key={page} onClick={handleCloseWTAMenu}>
                                    {page}
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>

                    {/* Social Media Links */}
                    <SocialMedia />
                </Toolbar>
            </Container>
        </StyledAppBar>
    );
}

export default ResponsiveAppBar;
