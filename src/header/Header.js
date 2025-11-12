import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import EmailIcon from '@mui/icons-material/Email';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import { GiTennisBall } from "react-icons/gi";
import SocialMedia from '../common/SocialMedia';
import RequestModal from '../contactus/RequestModal';
import ContactUs from '../contactus/ContactUs';


const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background: 'navy',
    color: theme.palette.common.white,
}));

const pages = ['Live Scores', 'ATP Ranking', 'WTA Ranking'];
const atpSubPages = ['Singles Live', 'Doubles Live', 'Singles Official', 'Doubles Official'];
const wtaSubPages = ['Singles Live', 'Doubles Live', 'Singles Official', 'Doubles Official'];
const playersSubPages = ['ATP', "WTA"];

function ResponsiveAppBar() {
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElATP, setAnchorElATP] = React.useState(null);
    const [anchorElWTA, setAnchorElWTA] = React.useState(null);
    const [anchorElPlayers, setAnchorElPlayers] = React.useState(null);
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const activePage = getActivePage();

    function getActivePage() {
        let href = window.location.href;
        if (href.includes("results") || href.includes("live-scores")) {
            return "live scores";
        } else if (href.includes("player")) {
            return "player";
        }
         else if (href.includes("atp")) {
            return "atp";
        } else if (href.includes("wta")) {
            return "wta";
        } else if (href.includes("news")) {
            return "news";
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

    const handleOpenPlayersMenu = (event) => {
        setAnchorElPlayers(event.currentTarget);
    };


    const handleClosePlayersMenu = (event) => {
        let text = event.target.innerText.toLowerCase()
        if (text === 'atp') {
            window.location.href = `/players/atp`;

        }
        else if (text === 'wta') {
            window.location.href = `/players/wta`;

        }
        setAnchorElPlayers(null);
    };
    const handleCloseATPMenu = (event) => {
        let text = event.target.innerText.toLowerCase()
        if (text === 'singles live') {
            text = "atp-singles"
            window.location.href = `/rankings/live/${text}`;

        }
        else if (text === 'doubles live') {
            text = "atp-doubles"
            window.location.href = `/rankings/live/${text}`;

        }
        else if (text === 'singles official') {
            text = "atp-singles"
            window.location.href = `/rankings/official/${text}`;

        }
        else if (text === 'doubles official') {
            text = "atp-doubles"
            window.location.href = `/rankings/official/${text}`;

        }

        setAnchorElATP(null);
    };

    const handleOpenWTAMenu = (event) => {
        setAnchorElWTA(event.currentTarget);
    };
    const handleCloseWTAMenu = (event) => {
        let text = event.target.innerText.toLowerCase()
        if (text === 'singles live') {
            text = "wta-singles"
            window.location.href = `/rankings/live/${text}`;

        }
        else if (text === 'doubles live') {
            text = "wta-doubles"
            window.location.href = `/rankings/live/${text}`;

        }
        else if (text === 'singles official') {
            text = "wta-singles"
            window.location.href = `/rankings/official/${text}`;

        }
        else if (text === 'doubles official') {
            text = "wta-doubles"
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
            <RequestModal open={open} handleClose={handleClose} title="Contact Us" children={<ContactUs/>} />
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
                            <MenuItem onClick={() => window.location.href = `/live-scores`}>
                                <Typography textAlign="center">Live Scores</Typography>
                            </MenuItem>
                            {/* <MenuItem onClick={() => window.location.href = `/live-scores`}>
                                <Typography textAlign="center">News</Typography>
                            </MenuItem> */}

                            {/* ATP Ranking with Dropdown */}
                            <MenuItem onClick={handleOpenATPMenu}>
                                <Typography textAlign="center">ATP Ranking</Typography>
                            </MenuItem>
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

                            {/* WTA Ranking with Dropdown */}
                            <MenuItem onClick={handleOpenWTAMenu}>
                                <Typography textAlign="center">WTA Ranking</Typography>
                            </MenuItem>
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
                            <MenuItem onClick={handleOpenPlayersMenu}>
                                <Typography textAlign="center">Players</Typography>
                            </MenuItem>
                            <Menu
                                anchorEl={anchorElPlayers}
                                open={Boolean(anchorElPlayers)}
                                onClose={handleCloseWTAMenu}
                            >
                                {playersSubPages.map((page) => (
                                    <MenuItem key={page} onClick={handleClosePlayersMenu}>
                                        {page}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Menu>
                    </Box>

                    {/* Logo */}
                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: { xs: 'center', md: 'left' } }}>
                        <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-blue-400 to-green-600 text-white text-center flex items-center rounded-xl p-1">
                            <a href="/live-scores" rel="noopener noreferrer" className="no-underline flex items-center">
                                <GiTennisBall className="h-5 w-5 sm:h-8 sm:w-8 mr-2 text-green-300" />
                                <div className="text-lg whitespace-nowrap">TENNIS INDIA</div>
                                <div className="text-lg animate-pulse ml-2">LIVE</div>
                            </a>
                        </div>
                    </Box>

                    {/* Desktop Menu */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center' }}>
                        <Button
                            onClick={() => (window.location.href = `/live-scores`)}
                            sx={{
                                color: 'white', ml: 2,
                                backgroundColor: activePage === "live scores" ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                                fontWeight: activePage === "live scores" ? 'bold' : 'normal',
                            }}
                        >
                            Live Scores
                        </Button>

                      
                        <Menu
                            anchorEl={anchorElPlayers}
                            open={Boolean(anchorElPlayers)}
                            onClose={handleClosePlayersMenu}
                        >
                            {playersSubPages.map((page) => (
                                <MenuItem key={page} onClick={handleClosePlayersMenu}>
                                    {page}
                                </MenuItem>
                            ))}
                        </Menu>


                        {/* ATP Ranking Dropdown */}
                        <Button
                            onClick={handleOpenATPMenu}
                            sx={{
                                color: 'white', ml: 2,
                                backgroundColor: activePage === "atp" ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                                fontWeight: activePage === "atp" ? 'bold' : 'normal',
                            }}>
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
                            sx={{
                                color: 'white', ml: 2,
                                backgroundColor: activePage === "wta" ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                                fontWeight: activePage === "wta" ? 'bold' : 'normal',
                            }}>
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
                          {/* Players */}
                        <Button
                            onClick={handleOpenPlayersMenu}
                            sx={{
                                color: 'white', ml: 2,
                                backgroundColor: activePage === "player" ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                                fontWeight: activePage === "player" ? 'bold' : 'normal',
                            }}>
                            Players
                        </Button>
                        {/* <Button
                            onClick={() => (window.location.href = `/news`)}
                            sx={{
                                color: 'white', ml: 2,
                                backgroundColor: activePage === "news" ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                                fontWeight: activePage === "news" ? 'bold' : 'normal',
                            }}>
                            News
                        </Button> */}

                    </Box>

                    {/* Social Media Links */}
                    <SocialMedia handleOpen={handleOpen}/>
                   
                </Toolbar>
            </Container>
        </StyledAppBar>
    );
}

export default ResponsiveAppBar;
