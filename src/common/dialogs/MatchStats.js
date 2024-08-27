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
import React, { useState, useEffect } from "react";
import { SiTicktick } from "react-icons/si";
import { FaCheckCircle } from "react-icons/fa";
import CountryIcon from '../Country';
import CheckIcon from '@mui/icons-material/Check';
import Loader from '../stateHandlers/LoaderState';
import NotFound from '../stateHandlers/NotFound';


const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(1), // Reduced padding
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export default function MatchStats(props) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [periodData, setPeriodData] = useState(props.data ? props.data.statistics[selectedTab] : null);
  const [statsData, setStatsData] = useState(props.data ? props.data.statistics : null);

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
    let filteredData = props.data.statistics[newValue];
    setPeriodData(filteredData);
  };

  useEffect(() => {
    setPeriodData(props.data ? props.data.statistics[selectedTab] : null);
    if (props.data) {
      let filteredStats = props.data.statistics.filter(item => item.groupName !== 'Miscellaneous');
      setStatsData(filteredStats);
    } else {
      setStatsData(props.data ? props.data.statistics : null);
    }
  }, [props.scoreRecord, props.matchStatsData, props.data]);


  function getPlayerDom1(p1, item) {

    try {
      // if (!item.tournament.name.toLowerCase().includes('davis cup') && !item.tournament.name.toLowerCase().includes('billie jean king cup')) {
      const uniqueTournament = item.tournament.uniqueTournament;
      if (!uniqueTournament.name.toLowerCase().includes('doubles')) {
        return (<div key={`${item.id}-${uniqueTournament}`} className='flex flex-col w-full h-full border'>
          <div className="flex space-x-2 w-full h-full flex-row items-center font-bold ">
            <div className="h-full flex items-center"><CountryIcon countryCode={p1.country?.alpha2} name={p1.country?.name} size={15} /></div>
            <div className="h-full flex items-center ">{getFullName(p1.name, p1.slug)}</div>


          </div>

        </div>
        )


      } else {
        const p1a = p1.subTeams[0];
        const p1b = p1.subTeams[1];

        return (<div key={`${item.id}-${uniqueTournament}`}>
          <div key={item.id} className="space-x-2 p-1 flex flex-row items-center">
            <div className='w-full flex flex-col'>
              <div className='w-full flex flex-row space-x-2 items-center'>
                <span><CountryIcon countryCode={p1a.country?.alpha2} name={p1a.country?.name} size={15} /></span>
                <span>{getFullName(p1a.name, p1a.slug)}</span>
              </div>
              <div className='w-full flex flex-row space-x-2'>
                <span><CountryIcon countryCode={p1b.country?.alpha2} name={p1b.country?.name} size={15} /></span>
                <span>{getFullName(p1b.name, p1b.slug)}</span>


              </div>

            </div>
          </div>
          <div key={item.id} className="space-x-2  p-1 flex flex-row items-center">

          </div>
        </div>
        )


      }

      // }
    }
    catch (err) {
      console.error(err)
    }


  }


  function capitalize(str) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  }
  function removeLastTwoCharacters(str) {
    let textToReplace = getTextAfterLastSpace(str)
    return str.replace(textToReplace, "").trim()
  }

  function getFullName(name, slug) {
    // Split the input name to get last name and initial
    try {
      if (slug.includes("mingge")) {
        let a = 1
      }
      const nameParts = name.split(' ');
      const lastName = removeLastTwoCharacters(name).toLowerCase();
      // Split the slug to get potential names
      // const slugParts = slug.replaceAll("-"," ")
      const normalizedLastName = lastName.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      const normalizedSlug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();


      let firstName = normalizedSlug.replaceAll(normalizedLastName.replaceAll(" ", "-"), "").replaceAll("-", " ").trim()
      const fullName = `${firstName} ${lastName}`;
      return capitalize(fullName)

      // Check if last_name is part of the slug_parts

    } catch (err) {

      return name
    }
  }

  function getTextAfterLastSpace(str) {
    const lastSpaceIndex = str.lastIndexOf(' '); // Find the index of the last space
    return str.slice(lastSpaceIndex + 1); // Extract the text after the last space
  }
  function getTabLabel(tab) {
    if (tab === "1ST") {
      return "SET 1"
    }
    else if (tab === "2ND") {
      return "SET 2"
    }
    else if (tab === "3RD") {
      return "SET 3"
    }
    else if (tab === "4RD") {
      return "SET 4"
    }

    else if (tab === "5TH") {
      return "SET 5"
    }

    else {
      return "MATCH"
    }

  }
  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={props.handleClose}
        aria-labelledby="customized-dialog-title"
        open={props.open}
      >
        <DialogTitle sx={{ m: 0, p: 1 }} id="customized-dialog-title"> {/* Reduced padding */}
          Match Stats
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
        </DialogTitle>
        <DialogContent dividers>
          {props.selectedMatchStatus==='notstarted'? <NotFound msg={<div className='text-xl '>Match Not Started Yet !</div>} />: <Grid container spacing={1}> {/* Reduced spacing */}
            <Grid item xs={12}>
              <Tabs
                value={selectedTab}
                onChange={handleChange}
                indicatorColor="primary"
                textColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                sx={{ minHeight: '36px' }}
              >
                {statsData && statsData.map((period, index) => (
                  <Tab key={index} label={getTabLabel(period.period)} sx={{ minHeight: '36px', padding: '6px 12px' }} />
                ))}
              </Tabs>
            </Grid>

            {props.loadingStats ? <Loader/>:
              periodData && (
                <Grid item xs={12}>
                  <div className='flex flex-row w-full bg-slate-200 items-center text-sm'>

                    <span className='text-center w-[45%] flex justify-center'>{getPlayerDom1(props.scoreRecord['homeTeam'], props.scoreRecord)}</span>
                    <span className='text-left w-[10%]'></span>
                    <span className='text-center w-[45%] flex justify-center'>{getPlayerDom1(props.scoreRecord['awayTeam'], props.scoreRecord)}</span>

                  </div>
                  {periodData.groups.map((group, groupIndex) => (
                    <Paper key={groupIndex} style={{ padding: 8, marginBottom: 8 }}> {/* Reduced padding and margin */}

                      <div className='w-full text-center text-2xl bg-blue-400'>
                        {group.groupName}
                      </div>
                      <TableContainer component={Paper}>
                        <Table size="small"> {/* Set table size to small */}
                          {/* {groupIndex === 0 && (
                         
                        )} */}
                          <TableBody>
                            {group.statisticsItems.map((item, itemIndex) => (
                              <TableRow key={itemIndex}>
                                <TableCell sx={{ color: 'black', textAlign: 'center', padding: '4px' }}>
                                  <div className='flex flex-row items-center justify-center space-x-1'>
                                    <span>{item.home}</span>
                                    <span>{item.compareCode === 1 && <FaCheckCircle color="green" size={10} />}</span>
                                  </div>
                                </TableCell>
                                <TableCell sx={{ color: 'black', textAlign: 'center', padding: '4px' }}>{item.name}</TableCell>
                                <TableCell sx={{ color: 'black', textAlign: 'center', padding: '4px' }}>
                                  <div className='flex flex-row items-center justify-center space-x-1'>
                                    <span>{item.away}</span>
                                    <span>{item.compareCode === 2 && <FaCheckCircle color="green" size={10} />}</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Paper>
                  ))}
                </Grid>
              )}
          </Grid>}
        </DialogContent>

      </BootstrapDialog>
    </React.Fragment>
  );
}
