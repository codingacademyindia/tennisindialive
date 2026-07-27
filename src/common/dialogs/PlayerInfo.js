import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import React, { useEffect, useState } from "react";
import { CgUnavailable } from "react-icons/cg";
import { TbRuler3 } from 'react-icons/tb';
import useApiCall from '../apiCalls/useApiCall';
import CountryIcon from '../Country';
import Loader from '../stateHandlers/LoaderState';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(1), // Reduced padding
    overflowX: 'hidden'
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
  '& .MuiPaper-root': {
    maxWidth: '600px', // Increase the maxWidth of the dialog
    width: '100%', // Ensure the dialog takes the full width of the parent
  },
}));

export default function PlayerInfo(props) {
  const [p1Image, setP1Image] = useState(null);
  const { data: p1Data, loading: loadingP1, error: errorP1, setRequest: fetchP1Data } = useApiCall({ method: 'get', payload: [], url: '' });
  // const { data: p1Image, loading: loadingP1image, error: errorP1image, setRequest: fetchP1Image } = useApiCall({ method: 'get', payload: [], url: '' });
  // const { data: p2Image, loading: loadingP2image, error: errorP2image, setRequest: fetchP2Image } = useApiCall({ method: 'get', payload: [], url: '' });
  const { data: p1ranking, loading: loadingP1ranking, error: errorP1ranking, setRequest: fetchP1Ranking } = useApiCall({ method: 'get', payload: [], url: '' });


  useEffect(() => {

  }, [props.playerId, props.loading]);

  // function convertToPNG(stringData){
  //   let base64ImageString = Buffer.from(stringData, 'binary').toString('base64')
  //   return base64ImageString
  // }

  useEffect(() => {
    fetchP1Data({ method: 'get', url: `/api/tennis/team/${props.id}`, payload: [] })
    fetchP1Ranking({ method: 'get', url: `/api/tennis/team/${props.id}/rankings`, payload: [] })

  }, [props.id]);

  useEffect(() => {
    const fetchData = async (team) => {
      try {
        let reqUrl = `/api/tennis/team/${props.id}/image`
        const res = await fetch(reqUrl, {
          method: 'GET'
        });
        const blob = await res.blob();
        const url = URL.createObjectURL(blob)
        setP1Image(url);
      } catch (e) {
        console.log(`Error: ${e}`)
      }
    }
    fetchData()
  }, [props.id])







  function getPlayerDom1(p1, pImage) {
    try {
      return (<div key={`${p1.id}`} className="flex flex-col space-x-2 w-full h-full  items-center font-bold">
        <img src={pImage} alt={getFullName(p1.name, p1.slug)} id="player1" width={"100px"} height={"100px"} />
        <div className='flex flex-row items center m-1 space-x-1 items-center'>
          <div className="h-full flex items-center"><CountryIcon countryCode={p1.country?.alpha2} name={p1.country?.name} size={18} /></div>
          <div className="h-full w-full  flex items-center text-xs md:text-sm">
            {getFullName(p1.name, p1.slug)}
          </div>
        </div>
      </div>
      )


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

  const notAvailableDom = <div className='bg-slate-300 space-x-2 flex flex-row items-center text-xs'><CgUnavailable /> Not Available</div>

  function getPrizeMoney(prizeMoneyDict) {
    if (prizeMoneyDict) {
      return `${prizeMoneyDict.value} ${prizeMoneyDict.currency}`
    }
    else {
      return notAvailableDom
    }
  }

  function h2hFieldDom(playerInfo, field) {
    if (playerInfo) {
      if (playerInfo[field]) {
        return field === "height" ? metersToFeetInches(playerInfo[field]) : playerInfo[field]
      }
      else {
        return notAvailableDom
      }
    }
    else {
      return notAvailableDom
    }
  }
  function isAvailable(playerInfo, field) {
    if (playerInfo) {
      if (playerInfo[field]) {
        return TbRuler3
      }
      else {
        return false
      }
    }
    else {
      return false
    }
  }

  function calculateAge(dobTimestamp) {
    // Convert the timestamp to a Date object
    const dob = new Date(dobTimestamp * 1000); // Multiply by 1000 to convert seconds to milliseconds

    // Get today's date
    const today = new Date();

    // Calculate the difference in years
    let age = today.getFullYear() - dob.getFullYear();

    // Check if the birthday has occurred yet this year
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();

    // Adjust the age if the birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  }



  function readableTimeStamp(timestamp) {
    // Convert to milliseconds (JavaScript timestamps are in milliseconds)
    const date = new Date(timestamp * 1000);

    // Get date components
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' }); // 'default' locale, short month format
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    // Pad minutes with leading zero if needed
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;

    // Format date string
    const formattedDate = `${day}-${month}-${year}`;
    return formattedDate;
  }
  function CircleWithNumber(number) {
    return (
      <div className="flex items-center justify-center w-8 h-8 lg:w-12 lg:h-12 bg-indigo-800 text-white font-bold text-lg sm:text-xl rounded-full">
        {number}
      </div>
    );
  }
  let h2hFieldCss = "bg-blue-200 w-[30%] text-xm font-bold h-full"
  let h2hValueCss = "w-[30%] text-center flex flex-row justify-center bg-slate-100 font-bold"

  function metersToFeetInches(metersStr) {
    let meters = parseFloat(metersStr); // Convert string to number
    if (isNaN(meters)) {
      return "";
    }

    let totalInches = meters * 39.3701; // Convert meters to inches
    let feet = Math.floor(totalInches / 12); // Get whole feet
    let inches = Math.round(totalInches % 12); // Get remaining inches, rounded

    if (inches === 0) {
      return `${feet} ft`; // Only return feet if inches are 0
    }
    return `${feet} ft ${inches} in`;
  }


  function h2hDom() {
    let liveRanking1 = p1ranking ? p1ranking.rankings[1] : null
    let currentRanking1 = p1ranking ? p1ranking.rankings[0] : null
    if (!p1Data) {
      return ""
    }

    return (<div className='flex-col w-full h-[20h] flex mx-auto text-center overflow-x-hidden text-sm'>
      <div className='w-full'>
        <div className='flex flex-row w-full bg-slate-200 items-center text-sm'>
          <span className='text-left w-full flex justify-center '>{getPlayerDom1(p1Data['team'], p1Image)}</span>

        </div>
        {isAvailable(p1Data.team.playerTeamInfo, "birthDateTimestamp") && <div className='flex flex-row w-full  border m-1 justify-center text-center'>
          {/* <div className={h2hValueCss}>{p1ranking ? p1ranking.rankings && p1ranking.rankings[0]?.ranking : "N/A"}</div> */}
          <span className={h2hFieldCss}>Birthday</span>

          <div className={h2hValueCss}>{(p1Data ? readableTimeStamp(h2hFieldDom(p1Data.team.playerTeamInfo, "birthDateTimestamp")) : notAvailableDom)}</div>

        </div>}
        {isAvailable(p1Data.team.playerTeamInfo, "birthDateTimestamp") && <div className='flex flex-row w-full  border m-1 justify-center text-center'>
          {/* <div className={h2hValueCss}>{p1ranking ? p1ranking.rankings && p1ranking.rankings[0]?.ranking : "N/A"}</div> */}
          <span className={h2hFieldCss}>Age</span>

          <div className={h2hValueCss}>{(p1Data ? calculateAge(h2hFieldDom(p1Data.team.playerTeamInfo, "birthDateTimestamp")) : notAvailableDom)}</div>

        </div>}
        {isAvailable(currentRanking1, "bestRanking") && <div className='flex flex-row w-full  border m-1 justify-center text-center'>
          {/* <div className={h2hValueCss}>{p1ranking ? p1ranking.rankings && p1ranking.rankings[0]?.ranking : "N/A"}</div> */}
          <span className={h2hFieldCss}>Career Best Ranking</span>

          <div className={h2hValueCss}>{(currentRanking1 ? h2hFieldDom(currentRanking1, "bestRanking") : notAvailableDom)}</div>

        </div>}

        {isAvailable(currentRanking1, "ranking") && <div className='flex flex-row w-full  border m-1 justify-center text-center'>
          {/* <div className={h2hValueCss}>{p1ranking ? p1ranking.rankings && p1ranking.rankings[0]?.ranking : "N/A"}</div> */}
          <span className={h2hFieldCss}>Actual Ranking</span>

          <div className={h2hValueCss}>{(currentRanking1 ? h2hFieldDom(currentRanking1, "ranking") : notAvailableDom)}</div>

        </div>}
        {isAvailable(liveRanking1, "ranking") && <div className='flex flex-row w-full border m-1 justify-center'>
          <span className={h2hFieldCss}>Live Ranking</span>

          <div className={h2hValueCss}>{(liveRanking1 ? h2hFieldDom(liveRanking1, "ranking") : notAvailableDom)}</div>

        </div>}
        {p1Data?.team?.type == 1 && <>
          {isAvailable(p1Data.team.playerTeamInfo, "height") && <div className='flex flex-row w-full border m-1 justify-center'>
            <span className={h2hFieldCss}>Height</span>

            <div className={h2hValueCss}>{p1Data ? h2hFieldDom(p1Data.team.playerTeamInfo, "height") : notAvailableDom}</div>

          </div>}
          {isAvailable(p1Data.team.playerTeamInfo, "residence") && <div className='flex flex-row w-full  border m-1 justify-center'>
            <span className={h2hFieldCss}>Residence</span>

            <div className={h2hValueCss}>{p1Data ? h2hFieldDom(p1Data.team.playerTeamInfo, "residence") : notAvailableDom}</div>

          </div>}
          {isAvailable(p1Data.team.playerTeamInfo, "weight") && <div className='flex flex-row w-full border m-1 justify-center'>
            <span className={h2hFieldCss}>Weight</span>

            <div className={h2hValueCss}>
              {p1Data ? `${h2hFieldDom(p1Data.team.playerTeamInfo, "weight")} Kg` : notAvailableDom}
            </div>

          </div>}
          {isAvailable(p1Data.team.playerTeamInfo, "plays") && <div className='flex flex-row w-full  border m-1 justify-center'>
            <span className={h2hFieldCss}>Plays</span>
            <div className={h2hValueCss}>{p1Data ? h2hFieldDom(p1Data.team.playerTeamInfo, "plays") : "N/A"}</div>

          </div>}

          {isAvailable(p1Data.team.playerTeamInfo, "turnedPro") && <div className='flex flex-row w-full border m-1 justify-center'>
            <span className={h2hFieldCss}>Turned Pro</span>
            <div className={h2hValueCss}>{p1Data ? h2hFieldDom(p1Data.team.playerTeamInfo, "turnedPro") : "N/A"}</div>

          </div>}
          {/* {isAvailable(p1Data.team.playerTeamInfo, "prizeTotalRaw") && <div className='flex flex-row w-full border m-1 justify-center'>
              <span className={h2hFieldCss}>Total Prize Money </span>
              <div className={h2hValueCss}>{p1Data ? getPrizeMoney(h2hFieldDom(p1Data.team.playerTeamInfo, "prizeTotalRaw")) : "N/A"}</div>

            </div>}

            {isAvailable(p1Data.team.playerTeamInfo, "prizeCurrentRaw") && <div className='flex flex-row w-full  border m-1 justify-center'>
              <span className={h2hFieldCss}>YTD Price Money</span>
              <div className={h2hValueCss}>{p1Data ? getPrizeMoney(h2hFieldDom(p1Data.team.playerTeamInfo, "prizeCurrentRaw")) : "N/A"}</div>
            </div>} */}
        </>}
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
          Player Details
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
          {(!loadingP1 && !loadingP1ranking) ? h2hDom() : <Loader />}
        </div>
      </BootstrapDialog>
    </React.Fragment>
  );
}
