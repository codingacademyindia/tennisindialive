/** BEST VISUAL VERSION FOR DARK THEME — FULLY UPGRADED UI **/
import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import React, { useState, useEffect } from "react";
import { CgUnavailable } from "react-icons/cg";
import CountryIcon from '../Country';
import Loader from '../stateHandlers/LoaderState';
import useApiCall from '../apiCalls/useApiCall';
import { HiOutlineMinusCircle } from "react-icons/hi2";
import { FiSlash } from "react-icons/fi";
import { HiOutlineExclamationCircle } from "react-icons/hi";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: 0,
    background: '#0f0f14',
  },
  '& .MuiPaper-root': {
    background: '#0f0f14',
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 0 25px rgba(0,255,255,0.2)",
    width: "100%",
    maxWidth: "680px",
  },
}));

export default function Head2Head(props) {

  const [selectedTab, setSelectedTab] = useState(0);
  const [p1Image, setP1Image] = useState(null);
  const [p2Image, setP2Image] = useState(null);
  const [h2hData, setH2hData] = useState(null);

  const { data: p1Data, loading: loadingP1, setRequest: fetchP1Data } = useApiCall({ method: 'get', url: '' });
  const { data: p2Data, loading: loadingP2, setRequest: fetchP2Data } = useApiCall({ method: 'get', url: '' });
  const { data: p1ranking, loading: loadingP1ranking, setRequest: fetchP1Ranking } = useApiCall({ method: 'get', url: '' });
  const { data: p2ranking, loading: loadingP2ranking, setRequest: fetchP2Ranking } = useApiCall({ method: 'get', url: '' });

  useEffect(() => {
    setH2hData(props.data?.teamDuel ?? null);
  }, [props.data]);

  useEffect(() => {
    if (props.scoreRecord) {
      fetchP1Data({ method: 'get', url: `/api/tennis/team/${props.scoreRecord.homeTeam.id}` });
      fetchP2Data({ method: 'get', url: `/api/tennis/team/${props.scoreRecord.awayTeam.id}` });
      fetchP1Ranking({ method: 'get', url: `/api/tennis/team/${props.scoreRecord.homeTeam.id}/rankings` });
      fetchP2Ranking({ method: 'get', url: `/api/tennis/team/${props.scoreRecord.awayTeam.id}/rankings` });
    }
  }, [props.scoreRecord]);

  useEffect(() => {
    const loadImage = async (team) => {
      let id = team === "p1" ? props.scoreRecord?.homeTeam.id : props.scoreRecord?.awayTeam.id;
      if (!id) return;

      let reqUrl = `/api/tennis/team/${id}/image`;

      try {
        const res = await fetch(reqUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);

        if (team === "p1") setP1Image(url);
        else setP2Image(url);
      } catch (e) { }
    };

    loadImage("p1");
    loadImage("p2");
  }, [props.scoreRecord]);



const notAvailableDom1 = (
  <div className="flex items-center gap-1 text-[11px]
                  text-gray-300 bg-gray-700/20 border border-gray-600/30
                  px-2 py-[2px] rounded-full">
    <FiSlash className="w-3.5 h-3.5 opacity-80" />
    Not Available
  </div>
);
const notAvailableDom = (
  <div className="flex items-center gap-1 text-[11px]
                  text-amber-300/80 text-center">
    <HiOutlineExclamationCircle className="w-3.5 h-3.5 opacity-80" />
    Not Available
  </div>
);

const notAvailableDom2 = (
  <div className="flex items-center gap-1 text-[11px] text-gray-500">
    <CgUnavailable className="w-3 h-3 text-gray-500" />
    <span className="opacity-80">N/A</span>
  </div>
);

  function h2hFieldDom(info, field) {
    if (!info) return notAvailableDom;
    if (!info[field]) return notAvailableDom;
    return info[field];
  }

  function playerBlock(player, img) {
    if (!player) return null;

    return (
      <div className="flex flex-col items-center w-full">
        <img
          src={img}
          className="w-20 h-20 rounded-full object-cover border border-cyan-400/40 shadow-lg"
        />
        <div className="flex items-center gap-1 mt-1 text-[12px] text-gray-200">
          <CountryIcon countryCode={player.country?.alpha2} size={17} />
          <span className="font-semibold">{player.name}</span>
        </div>
      </div>
    );
  }

  function Circle(number) {
    return (
      <div className="w-9 h-9 flex items-center justify-center rounded-full bg-cyan-900 text-cyan-300 font-bold shadow-md text-sm">
        {number}
      </div>
    );
  }

  function H2H() {
    let liveRanking1 = p1ranking?.rankings?.[1];
    let liveRanking2 = p2ranking?.rankings?.[1];

    let currentRanking1 = p1ranking?.rankings?.[0];
    let currentRanking2 = p2ranking?.rankings?.[0];

    return (
      <div className="w-full text-gray-200 text-sm px-3 py-3">

        {/* TOP BLOCK */}
        <div className="flex w-full justify-between items-center bg-[#141621] rounded-xl p-3 border border-white/5 shadow-lg">
          {playerBlock(props.scoreRecord?.homeTeam, p1Image)}

          <div className="flex flex-col items-center gap-2">
            {Circle(h2hData?.homeWins ?? 0)}
            <div className="h-[1px] bg-white/10 w-12"></div>
            {Circle(h2hData?.awayWins ?? 0)}
          </div>

          {playerBlock(props.scoreRecord?.awayTeam, p2Image)}
        </div>

        {/* RANKING */}
        <div className="mt-4 space-y-2">

          {[
            ["Career Best Ranking", "bestRanking", currentRanking1, currentRanking2],
            ["Actual Ranking", "ranking", currentRanking1, currentRanking2],
            ["Live Ranking", "ranking", liveRanking1, liveRanking2],
          ].map(([label, key, left, right], i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-[#161922] px-3 py-2 rounded-lg border border-white/5"
            >
              <div className="w-1/3 text-center flex justify-center">
                {h2hFieldDom(left, key)}
              </div>

              <div className="w-1/3 text-center text-cyan-300 font-semibold">
                {label}
              </div>

              <div className="w-1/3 text-center">
                {h2hFieldDom(right, key)}
              </div>
            </div>
          ))}

        </div>

      </div>
    );
  }

  return (
    <React.Fragment>
      <BootstrapDialog onClose={props.handleClose} open={props.open}>
        <DialogTitle
          className="bg-[#0e1016] text-gray-200 px-4 py-3 border-b border-white/10 flex items-center justify-between text-lg font-semibold"
        >
          Head to Head
          <IconButton
            onClick={props.handleClose}
            sx={{ color: "white" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent className="p-0">
          {(props.loading || loadingP1 || loadingP2 || loadingP1ranking || loadingP2ranking)
            ? <Loader />
            : <H2H />
          }
        </DialogContent>
      </BootstrapDialog>
    </React.Fragment>
  );
}
