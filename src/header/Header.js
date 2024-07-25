import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import SocialMedia from '../common/SocialMedia';
import { styled } from '@mui/material/styles';
// import { TennisBallIcon } from '@heroicons/react/solid'; // Import the tennis icon
import { GiTennisBall } from "react-icons/gi";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    // background: 'linear-gradient(to right, #f97316, #3b82f6, #16a34a)',
    background: 'navy',
    color: theme.palette.common.white,
}));

const pages = ['Live Scores', 'ATP Live Ranking', 'WTA Live Ranking'];
const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

function ResponsiveAppBar() {

    let date = new Date();
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1; // Months are zero-based, so add 1
    const day = date.getUTCDate();


    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const [anchorElUser, setAnchorElUser] = React.useState(null);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = (e) => {
        console.log("in handleCloseNavMenu.... ")
        if (e.target.innerText.toLowerCase() === 'live scores') {
            window.location.href = `/results/${year}/${month}/${day}`
        }
        else if (e.target.innerText.toLowerCase() === 'atp live ranking') {
            window.location.href = "/rankings/live/atp"
        }
        else if (e.target.innerText.toLowerCase() === 'wta live ranking') {
            window.location.href = "/rankings/live/wta"
        }

        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

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
    return (
        <StyledAppBar position="static">
            <Container maxWidth="xl" className="p-0">
                <Toolbar disableGutters className="p-0 m-0">

                    {/* <img src={`${process.env.PUBLIC_URL}/resources/logo.png`} alt="My Image" height={100} /> */}
                    <div className="text-3xl font-bold bg-gradient-to-r from-green-600 via-blue-500 to-orange-600 text-white text-center flex flex-col items-center rounded-xl p-1 sm:p-1 lg:p-2">
                        {/* <div className="text-3xl font-bold  text-white text-center flex flex-col items-center rounded-xl p-2 sm:p-3 lg:p-4"> */}
                        <div className="flex flex-col items-center sm:flex-row sm:items-center">
                            <GiTennisBall className="h-5 w-5 sm:h-8 sm:w-8 mr-0 sm:mr-2 text-green-300" /> {/* Tennis icon */}
                            <div className="text-lg sm:text-xl">TENNIS INDIA</div>
                            <div className="text-lg sm:text-xl animate-pulse  ml-0 sm:ml-2">LIVE</div>
                        </div>
                    </div>
                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
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
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: { xs: 'block', md: 'none' },
                            }}
                        >
                            {pages.map((page) => (
                                <MenuItem key={page} onClick={handleCloseNavMenu}
                                >
                                    <Typography textAlign="center">{page}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>

                    <Box sx={{ flexGrow: 1, ml:8, display: { xs: 'none', md: 'flex' } }}>
                        {pages.map((page) => (
                            <Button
                                key={page}
                                onClick={handleCloseNavMenu}
                                // sx={{ my: 2, color: 'white', display: 'block' }}
                                sx={{color:'white', ml:2, backgroundColor: getActivePage() === page.toLowerCase() ? 'rgba(255, 255, 255, 0.2)' : 'transparent' }}
                            >
                                {page}
                            </Button>
                        ))}
                    </Box>

                    <SocialMedia />
                    {/* <Box sx={{ flexGrow: 0 }}>
                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            {settings.map((setting) => (
                                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                                    <Typography textAlign="center">{setting}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box> */}
                </Toolbar>
            </Container>
        </StyledAppBar>
    );
}
export default ResponsiveAppBar;
