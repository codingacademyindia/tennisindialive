import React from "react";
import {
  Button,
  ButtonGroup,
  Popper,
  MenuItem,
  MenuList,
  Paper,
  Grow,
  ClickAwayListener,
  Tooltip,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

const STATUS_OPTIONS = [
  { label: "All", key: "all" },
  { label: "Live", key: "inprogress" },
  { label: "Finished", key: "finished" },
  { label: "Not Started", key: "notstarted" },
];

export default function StatusButtonGroup({ matchStatus, handleStatusButtonClick }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);

  const selectedIndex = STATUS_OPTIONS.findIndex(o => o.key === matchStatus);
  const selectedOption = STATUS_OPTIONS[selectedIndex] ?? STATUS_OPTIONS[0];

  const handleToggle = () => setOpen(prev => !prev);
  const handleMenuItemClick = (event, option) => {
    setOpen(false);
    handleStatusButtonClick(option.key);
  };
  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  const fontSize = {
    fontSize: isSmallScreen ? "0.7rem" : "0.75rem",
    borderRadius: 8,
    padding: isSmallScreen ? "3px 6px" : "3px 6px",
  };

  // if (isSmallScreen) {
  //   // 📱 Mobile Dropdown
  //   return (
  //     <>
  //       <ButtonGroup
  //         ref={anchorRef}
  //         variant="contained"
  //         size="small"
  //         sx={{ borderRadius: 2 }}
  //       >
  //         <Button sx={fontSize} onClick={() => handleStatusButtonClick(selectedOption.key)}>
  //           {selectedOption.label}
  //         </Button>
  //         <Button onClick={handleToggle}>
  //           <ArrowDropDownIcon fontSize="small" />
  //         </Button>
  //       </ButtonGroup>

  //       <Popper open={open} anchorEl={anchorRef.current} transition disablePortal sx={{ zIndex: 1500 }}>
  //         {({ TransitionProps }) => (
  //           <Grow {...TransitionProps}>
  //             <Paper sx={{ borderRadius: 2 }}>
  //               <ClickAwayListener onClickAway={handleClose}>
  //                 <MenuList autoFocusItem>
  //                   {STATUS_OPTIONS.map(option => (
  //                     <MenuItem
  //                       key={option.key}
  //                       selected={option.key === matchStatus}
  //                       onClick={() => handleMenuItemClick(null, option)}
  //                       sx={{ fontSize: "0.75rem" }}
  //                     >
  //                       {option.label}
  //                     </MenuItem>
  //                   ))}
  //                 </MenuList>
  //               </ClickAwayListener>
  //             </Paper>
  //           </Grow>
  //         )}
  //       </Popper>
  //     </>
  //   );
  // }

  // 🖥 Desktop Buttons
  return (
    <div className="flex flex-row gap-2">
      {STATUS_OPTIONS.map(option => (
        <Tooltip key={option.key} title={`Show ${option.label} Matches`} arrow>
          <Button
            variant={matchStatus === option.key ? "contained" : "outlined"}
            onClick={() => handleStatusButtonClick(option.key)}
            size="small"
            sx={{
              ...fontSize,
              textTransform: "none",
              transition: "0.2s",
              "&:hover": {
                boxShadow: theme.shadows[4],
              },
            }}
          >
            {option.label}
          </Button>
        </Tooltip>
      ))}
    </div>
  );
}
