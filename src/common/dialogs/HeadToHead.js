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
import useApiCall from '../apiCalls/useApiCall';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(1), // Reduced padding
    overflowX:'hidden'
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
  '& .MuiPaper-root': {
    maxWidth: '60 0px', // Increase the maxWidth of the dialog
    width: '100%', // Ensure the dialog takes the full width of the parent
  },
}));

const HEADERS = {
  'x-rapidapi-key': 'b40a588570mshd0ab93b20a9f16dp1cfbccjsneecf38833008',
  'x-rapidapi-host': 'tennisapi1.p.rapidapi.com'
}
export default function Head2Head(props) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [p1Image, setP1Image] = useState(null);
  const [p2Image, setP2Image] = useState(null);
  const [h2hData, setH2hData] = useState(null);
  const { data: p1Data, loading: loadingP1, error: errorP1, setRequest: fetchP1Data } = useApiCall({ method: 'get', payload: [], url: '' });
  const { data: p2Data, loading: loadingP2, error: errorP2, setRequest: fetchP2Data } = useApiCall({ method: 'get', payload: [], url: '' });
  // const { data: p1Image, loading: loadingP1image, error: errorP1image, setRequest: fetchP1Image } = useApiCall({ method: 'get', payload: [], url: '' });
  // const { data: p2Image, loading: loadingP2image, error: errorP2image, setRequest: fetchP2Image } = useApiCall({ method: 'get', payload: [], url: '' });
  const { data: p1ranking, loading: loadingP1ranking, error: errorP1ranking, setRequest: fetchP1Ranking } = useApiCall({ method: 'get', payload: [], url: '' });
  const { data: p2ranking, loading: loadingP2ranking, error: errorP2ranking, setRequest: fetchP2Ranking } = useApiCall({ method: 'get', payload: [], url: '' });

  const handleChange = (event, newValue) => {
    setSelectedTab(newValue);
    let filteredData = props.data.statistics[newValue];
  };

  useEffect(() => {
    setH2hData(null)
    if (props.data) {
      // if (props.data.teamDuel) {
      setH2hData(props.data.teamDuel)
      // }
    }

  }, [props.data, props.loading, props.scoreRecord, props.eventId]);

  // function convertToPNG(stringData){
  //   let base64ImageString = Buffer.from(stringData, 'binary').toString('base64')
  //   return base64ImageString
  // }

  useEffect(() => {
    if (props.scoreRecord) {
      fetchP1Data({ method: 'get', url: `https://tennisapi1.p.rapidapi.com/api/tennis/team/${props.scoreRecord.homeTeam.id}`, payload: [], headers: HEADERS })
      fetchP2Data({ method: 'get', url: `https://tennisapi1.p.rapidapi.com/api/tennis/team/${props.scoreRecord.awayTeam.id}`, payload: [], headers: HEADERS })
      // fetchP1Image({ method: 'image', url: `https://tennisapi1.p.rapidapi.com/api/tennis/team/${props.scoreRecord.homeTeam.id}/image`, payload: [], headers: HEADERS })
      // fetchP2Image({ method: 'image', url: `https://tennisapi1.p.rapidapi.com/api/tennis/team/${props.scoreRecord.awayTeam.id}/image`, payload: [], headers: HEADERS })
      fetchP1Ranking({ method: 'get', url: `https://tennisapi1.p.rapidapi.com/api/tennis/team/${props.scoreRecord.homeTeam.id}/rankings`, payload: [], headers: HEADERS })
      fetchP2Ranking({ method: 'get', url: `https://tennisapi1.p.rapidapi.com/api/tennis/team/${props.scoreRecord.awayTeam.id}/rankings`, payload: [], headers: HEADERS })
    }
  }, [props.scoreRecord, props.eventId]);

  useEffect(() => {
    const fetchData = async (team) => {
      try {
        let reqUrl = `https://tennisapi1.p.rapidapi.com/api/tennis/team/${props.scoreRecord.homeTeam.id}/image`
        if (team == "p2") {
          reqUrl = `https://tennisapi1.p.rapidapi.com/api/tennis/team/${props.scoreRecord.awayTeam.id}/image`
        }
        let IMAGE_HEADERS = JSON.parse(JSON.stringify(HEADERS))
        IMAGE_HEADERS['Accept'] = 'image/png'
        const res = await fetch(reqUrl, {
          method: 'GET',
          headers: IMAGE_HEADERS
        });
        const blob = await res.blob();
        const url = URL.createObjectURL(blob)
        if (team === "p1") {
          setP1Image(url);
        }
        else {
          setP2Image(url);
        }
      } catch (e) {
        console.log(`Error: ${e}`)
      }
    }
    fetchData("p1")
    fetchData("p2")
  }, [props.scoreRecord, props.eventId])







  function getPlayerDom1(p1, item, pImage) {
    try {
      // displayImageFromBinaryString(p1Image)
      // if (!item.tournament.name.toLowerCase().includes('davis cup') && !item.tournament.name.toLowerCase().includes('billie jean king cup')) {
      const uniqueTournament = item.tournament.uniqueTournament;
      if (!uniqueTournament.name.toLowerCase().includes('doubles')) {
        return (<div key={`${item.id}-${uniqueTournament}`} className='flex flex-col w-full h-full border'>
          <div className="flex flex-col space-x-2 w-full h-full  items-center font-bold ">
            <img src={pImage} alt="My Image" id="player1" width={"100px"} height={"100px"} />

            <div className='flex flex-row items center m-1 space-x-1 items-center'>
              <div className="h-full flex items-center"><CountryIcon countryCode={p1.country?.alpha2} name={p1.country?.name} size={15} /></div>
              <div className="h-full flex items-center ">{getFullName(p1.name, p1.slug)}</div>
            </div>
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

  function getPrizeMoney(prizeMoneyDict) {
    return `${prizeMoneyDict.value} ${prizeMoneyDict.currency}`
  }

  function CircleWithNumber( number) {
    return (
      <div className="flex items-center justify-center w-20 h-20 bg-blue-500 text-white font-bold text-xl rounded-full">
        {number}
      </div>
    );
  };
  let h2hFieldCss = "bg-blue-200 w-[30%] text-xm font-bold h-full"
  let h2hValueCss = "w-[30%] text-center flex flex-row justify-center "
  function h2hDom() {
    let liveRanking1=p1ranking?p1ranking.rankings[1]:null
    let liveRanking2=p1ranking?p2ranking.rankings[1]:null;


    return (<div className='flex-col w-full h-[20h] flex mx-auto text-center overflow-x-hidden'>
      <div className='w-full'>
        <div className='flex flex-row w-full bg-slate-200 items-center text-sm'>
          <span className='text-center w-[40%] flex justify-center'>{props.scoreRecord && getPlayerDom1(props.scoreRecord['homeTeam'], props.scoreRecord, p1Image)}</span>
          <div className="flex flex-row space-x-2">
            {CircleWithNumber(h2hData ? h2hData.homeWins : 0)}
            {CircleWithNumber(h2hData ? h2hData.awayWins : 0)}
            </div>
          <span className='text-center w-[40%] flex justify-center'>{props.scoreRecord && getPlayerDom1(props.scoreRecord['awayTeam'], props.scoreRecord, p2Image)}</span>
        </div>
      </div>
      <div className='flex flex-row w-full  border m-1 justify-center text-center'>
        <div className={h2hValueCss}>{p1ranking ? p1ranking.rankings && p1ranking.rankings[0]?.ranking : "N/A"}</div>
        <span className={h2hFieldCss}>Ranking</span>
        <div className={h2hValueCss}>{p2ranking ? p2ranking.rankings && p2ranking.rankings[0]?.ranking : "N/A"}</div>
      </div>
      <div className='flex flex-row w-full border m-1 justify-center'>
        <div className={h2hValueCss}>{p1ranking ? p1ranking.rankings && (liveRanking1 ? liveRanking1?.ranking : 'Not available') : "NA"}</div>
        <span className={h2hFieldCss}>Live Ranking</span>
        <div className={h2hValueCss}>{p2ranking ? p2ranking.rankings && (liveRanking2 ? liveRanking2?.ranking : 'Not available') : "N/A"}</div>
      </div>
      {p1Data?.team?.type == 1 && <>
        <div className='flex flex-row w-full border m-1 justify-center'>
          <div className={h2hValueCss}>{p1Data ? p1Data.team.playerTeamInfo && p1Data.team.playerTeamInfo.height : "N/A"}</div>
          <span className={h2hFieldCss}>Height</span>
          <div className={h2hValueCss}>{p2Data ? p2Data.team.playerTeamInfo && p2Data.team.playerTeamInfo.height : "N/A"}</div>
        </div>
        <div className='flex flex-row w-full  border m-1 justify-center'>
          <div className={h2hValueCss}>{p1Data ? p1Data.team.playerTeamInfo && p1Data.team.playerTeamInfo.residence : "N/A"}</div>
          <span className={h2hFieldCss}>Residence</span>
          <div className={h2hValueCss}>{p2Data ? p2Data.team.playerTeamInfo && p2Data.team.playerTeamInfo.residence : "N/A"}</div>
        </div>
        <div className='flex flex-row w-full border m-1 justify-center'>
          <div className={h2hValueCss}>{p1Data ? p1Data.team.playerTeamInfo && p1Data.team.playerTeamInfo.weight : "N/A"}</div>
          <span className={h2hFieldCss}>Weight</span>
          <div className={h2hValueCss}>{p2Data ? p2Data.team.playerTeamInfo && p2Data.team.playerTeamInfo.weight : "N/A"}</div>
        </div>
        <div className='flex flex-row w-full  border m-1 justify-center'>
          <div className={h2hValueCss}>{p1Data ? p1Data.team.playerTeamInfo && p1Data.team.playerTeamInfo.plays : "N/A"}</div>
          <span className={h2hFieldCss}>Plays</span>
          <div className={h2hValueCss}>{p2Data ? p2Data.team.playerTeamInfo && p2Data.team.playerTeamInfo.plays : "N/A"}</div>
        </div>

        <div className='flex flex-row w-full border m-1 justify-center'>
          <div className={h2hValueCss}>{p1Data ? p1Data.team.playerTeamInfo && p1Data.team.playerTeamInfo.turnedPro : "N/A"}</div>
          <span className={h2hFieldCss}>Turned Pro</span>
          <div className={h2hValueCss}>{p2Data ? p2Data.team.playerTeamInfo && p2Data.team.playerTeamInfo.turnedPro : "N/A"}</div>
        </div>
        <div className='flex flex-row w-full border m-1 justify-center'>
          <div className={h2hValueCss}>{p1Data ? p1Data.team.playerTeamInfo && getPrizeMoney(p1Data.team.playerTeamInfo.prizeTotalRaw) : "N/A"}</div>
          <span className={h2hFieldCss}>Total Prize Money </span>
          <div className={h2hValueCss}>{p2Data ? p2Data.team.playerTeamInfo && getPrizeMoney(p2Data.team.playerTeamInfo.prizeTotalRaw) : "N/A"}</div>
        </div>

        <div className='flex flex-row w-full  border m-1 justify-center'>
          <div className={h2hValueCss}>{p1Data ? p1Data.team.playerTeamInfo && getPrizeMoney(p1Data.team.playerTeamInfo?.prizeCurrentRaw) : "N/A"}</div>
          <span className={h2hFieldCss}>YTD Price Money</span>
          <div className={h2hValueCss}>{p2Data ? p2Data.team.playerTeamInfo && getPrizeMoney(p2Data.team.playerTeamInfo?.prizeCurrentRaw) : "N/A"}</div>
        </div>
      </>}

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
        <div className="w-full overflow-x-hidden">
          {props.loading ? <Loader /> : h2hDom()}
        </div>
      </BootstrapDialog>
    </React.Fragment>
  );
}
