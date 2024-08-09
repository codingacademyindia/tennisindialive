import CloseIcon from '@mui/icons-material/Close';
import {
  Grid, Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography
} from "@mui/material";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import React, { useState } from "react";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export default function MatchStats(props) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [periodData, setPeriodData] = useState(props.data ? props.data.statistics[selectedTab] : null);


  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
    let filteredData=props.data.statistics[newValue]
    setPeriodData(filteredData)
  };


  return (
    <React.Fragment>

      <BootstrapDialog
        onClose={props.handleClose}
        aria-labelledby="customized-dialog-title"
        open={props.open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          Match Stats
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={props.handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Tabs
                value={selectedTab}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
              >
                {props.data && props.data.statistics.map((period, index) => (
                  <Tab key={index} label={period.period} />
                ))}
              </Tabs>
            </Grid>

            {periodData && (
              <Grid item xs={12}>
                {periodData.groups.map((group, groupIndex) => (
                  <Paper key={groupIndex} style={{ padding: 16, marginBottom: 16 }}>
                    <Typography variant="h6" gutterBottom>
                      {group.groupName}
                    </Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Statistic</TableCell>
                            <TableCell>Home</TableCell>
                            <TableCell>Away</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {group.statisticsItems.map((item, itemIndex) => (
                            <TableRow key={itemIndex}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{item.home}</TableCell>
                              <TableCell>{item.away}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                ))}
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={props.handleClose}>
            Save changes
          </Button>
        </DialogActions>
      </BootstrapDialog>
    </React.Fragment>
  );
}
