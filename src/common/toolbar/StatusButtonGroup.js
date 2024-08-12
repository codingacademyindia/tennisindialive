import React from 'react';
import { Button, ToggleButton, ToggleButtonGroup } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

const options = ['All', 'Live', 'Finished', 'Not Started'];

function StatusButtonGroup({ matchStatus, handleStatusButtonClick }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleClick = () => {
    console.info(`You clicked ${options[selectedIndex]}`);
  };

  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setOpen(false);
    handleStatusButtonClick(event);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  if (isSmallScreen) {
    return (
      <React.Fragment>
        <ButtonGroup
          variant="contained"
          ref={anchorRef}
          aria-label="Button group with a nested menu"
        >
          <Button onClick={handleClick} size="small">{options[selectedIndex]}</Button>
          <Button
            size="small"
            aria-controls={open ? 'split-button-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-label="select match status"
            aria-haspopup="menu"
            onClick={handleToggle}
          >
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>
        <Popper
          sx={{ zIndex: 1 }}
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
              }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList id="split-button-menu" autoFocusItem>
                    {options.map((option, index) => (
                      <MenuItem
                        key={option}
                        selected={index === selectedIndex}
                        onClick={(event) => handleMenuItemClick(event, index)}
                      >
                        {option}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </React.Fragment>
    );
  } else {
    return (
      <div className="flex flex-row space-x-2">
        <Button
          variant={matchStatus === 'inprogress' ? 'contained' : 'outlined'}
          color="primary"
          onClick={(e) => handleStatusButtonClick(e)}
          size="small"
        >
          Live
        </Button>
        <Button
          variant={matchStatus === 'finished' ? 'contained' : 'outlined'}
          color="primary"
          onClick={(e) => handleStatusButtonClick(e)}
          size="small"
        >
          Finished
        </Button>
        <Button
          variant={matchStatus === 'notstarted' ? 'contained' : 'outlined'}
          color="primary"
          onClick={(e) => handleStatusButtonClick(e)}
          size="small"
        >
          Not Started
        </Button>
        <Button
          variant={matchStatus === 'all' ? 'contained' : 'outlined'}
          color="primary"
          onClick={(e) => handleStatusButtonClick(e)}
          size="small"
        >
          All
        </Button>
      </div>
    );
  }
}

export default StatusButtonGroup;
