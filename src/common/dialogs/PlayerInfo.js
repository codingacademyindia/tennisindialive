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
  '& .MuiPaper-root': {
    maxWidth: '60 0px', // Increase the maxWidth of the dialog
    width: '100%', // Ensure the dialog takes the full width of the parent
  },
}));
export default function PlayerInfo(props) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [h2hData, setH2hData] = useState(props.data ? props.data.teamDuel : null);

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
    let filteredData = props.data.statistics[newValue];
  };

  useEffect(() => {
    setH2hData(null)
    if (props.data) {
      if (props.data.teamDuel) {
        setH2hData(props.data.teamDuel)
      }
    }

  }, [props.data, props.loading]);


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

  function h2hDom() {
    return (<div className='flex-col w-full h-[20h]'>
      <div>
        <div className='flex flex-row w-full bg-slate-200 items-center text-sm'>
          <span className='text-center w-[45%] flex justify-center'>{getPlayerDom1(props.scoreRecord['homeTeam'], props.scoreRecord)}</span>
          <span className='text-center w-[45%] flex justify-center'>{getPlayerDom1(props.scoreRecord['awayTeam'], props.scoreRecord)}</span>
        </div>
      </div>
      <div className='flex flex-row w-full p-4 font-bold bg-blue-300'>
        <div className='w-[50%] text-center'>{h2hData.homeWins}</div>
        <div className='w-[50%] text-center'>{h2hData.awayWins}</div>
      </div>
    </div>
    )
  }

  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={props.handleClose}
        aria-labelledby="customized-dialog-title"
        open={props.open}
      >
        <DialogTitle sx={{ m: 0, p: 1 }} id="customized-dialog-title"> {/* Reduced padding */}
          Head to Head
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
        <div className='w-full'>
          {props.loading ? <Loader /> : (h2hData ? h2hDom() : <NotFound />)}
        </div>
      </BootstrapDialog>
    </React.Fragment>
  );
}
