// src/components/WelcomeModal.js
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

const WelcomeModal = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem("til_hasVisited");
    if (!hasVisited) {
      setOpen(true);
      localStorage.setItem("til_hasVisited", "true");
    }
  }, []);

  const handleClose = () => setOpen(false);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 3, p: 1, textAlign: "center" },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: "1.4rem", backgroundColor: "navy", color: "white", borderRadius: 2, mb: 1 }}>
        Welcome to TennisIndiaLive.com
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Discover unique features crafted for the tennis community:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary="🏆 Countrywise Live Scores"
              secondary="Track tennis action by nation – ATP, WTA & ITF events."
            />
          </ListItem>
          {/* <ListItem>
            <ListItemText
              primary="🇮🇳 Indian Player Focus"
              secondary="Follow Indian players competing globally, all in one place."
            />
          </ListItem> */}
          <ListItem>
            <ListItemText
              primary="📊 Rankings"
              secondary="Live and OfficialRankings for ATP & WTA with country filters."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="🌍 Global Tennis Feed"
              secondary="Switch between countries to explore players from around the world."
            />
          </ListItem>
        </List>
        {/* <Typography variant="caption" color="text.secondary">
          (This message will appear only once)
        </Typography> */}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
        <Button variant="contained" onClick={handleClose} sx={{ borderRadius: 2 }}>
          Let’s Go →
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WelcomeModal;
