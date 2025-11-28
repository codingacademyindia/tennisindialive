import React from "react";
import { Box, Grid, Avatar, Chip, IconButton, Tooltip, Typography } from "@mui/material";
import { IoStatsChartSharp, IoTennisballSharp } from "react-icons/io5";
import { HiMiniTableCells } from "react-icons/hi2";
import CheckIcon from '@mui/icons-material/Check';
import ReactCountryFlag from "react-country-flag";

function getRoundAbbreviation(name) {
  if (!name) return "";
  const map = { "final": "FINAL", "semifinals": "SF", "semifinal": "SF", "quarterfinals": "QF", "quarterfinal": "QF" };
  const key = name.trim().toLowerCase();
  return map[key] || name.slice(0, 2).toUpperCase();
}

function getFullName(name, slug) { return name; }

function formatTennisScoreDom(homeScore, awayScore, status) {
  // Display scores or blanks (use your own logic here!)
  if (!homeScore || !awayScore) return "—";
  const render = score =>
    [score.period1, score.period2, score.period3, score.period4, score.period5]
      .filter(Boolean)
      .map((s, i) => <span key={i}>{s}{i < 4 ? " " : ""}</span>);
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Box display="flex" gap={0.8}>{render(homeScore)}</Box>
      <Box display="flex" gap={0.8}>{render(awayScore)}</Box>
    </Box>
  );
}

function PlayerFlag({ country }) {
  if (country?.flag) {
    return <Avatar src={country.flag} alt={country.name} sx={{ width: 24, height: 24 }} />;
  }
  if (country?.alpha2) {
    return (
      <Box sx={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ReactCountryFlag countryCode={country.alpha2} svg style={{ width: "20px", height: "20px" }} />
      </Box>
    );
  }
  return <Avatar sx={{ width: 24, height: 24, bgcolor: "#eee" }}>?</Avatar>;
}

function formatLocalMatchTime(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);
  return date.toLocaleString([], { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function PlayerRow({ player, firstToServe, winnerCode, isInProgress, score }) {
  return (
    <Box display="flex" alignItems="center" gap={1} sx={{ width: "100%" }}>
      {/* Flag */}
      <PlayerFlag country={player.country} />
      {/* Name (clickable) */}
      <Box 
        sx={{ flexGrow: 1, fontWeight: 600, color: "#243", fontSize: ".98em", minWidth: 0 }}
        component="span"
      >
        <span
          style={{ cursor: "pointer", wordBreak: "break-word" }}
          onClick={() => (typeof player.onClick === "function" ? player.onClick(player) : undefined)}
        >
          {getFullName(player.name, player.slug)}
        </span>
      </Box>
      {/* Icons stacked */}
      <Box display="flex" flexDirection="column" alignItems="center" ml={0.5}>
        {firstToServe && isInProgress && <IoTennisballSharp size={14} color="#0bb700" />}
        {winnerCode && <CheckIcon sx={{ color: "#16a34a", fontSize: 17 }}/>}
      </Box>
    </Box>
  );
}

function BeautifulScoreCard({
  item,
  handleClickPlayerName = () => {},
  handleClickOpenMatchStat = () => {},
  handleClickOpenH2H = () => {}
}) {
  const p1 = { ...item.homeTeam, onClick: handleClickPlayerName };
  const p2 = { ...item.awayTeam, onClick: handleClickPlayerName };
  const statusType = item?.status?.type;
  const round = getRoundAbbreviation(item?.roundInfo?.name);

  // Responsive card
  return (
    <Box sx={{
      width: "100%",
      px: { xs: .7, sm: 1.5, md: 2 }, py: { xs: 1, sm: 1.4 }, mb: 2,
      borderRadius: 3,
      boxShadow: "0 1px 4px #bcd",
      background: "#fff",
      overflow: "hidden"
    }}>
      {/* Chips: round/status/time */}
      <Box display="flex" alignItems="center" gap={.8} mb={.5} flexWrap="wrap">
        {round && (
          <Chip label={round} size="small" sx={{ bgcolor: "#eef2ff", color: "#2737a0", fontWeight: 700, fontSize: ".85rem", px: 1, py: 0.1 }} />
        )}
        <Chip label={item?.status?.description || statusType} size="small" sx={{ fontWeight: 600, fontSize: ".81rem", bgcolor: "#edf2ff", color: "#246", px: 1}} />
        {/* Local time for scheduled/not started matches */}
        {statusType === "notstarted" && (
          <Chip label={formatLocalMatchTime(item.startTimestamp)} size="small"
            sx={{ bgcolor: "#eaeaea", color: "#444", fontWeight: 500, fontSize: ".8rem", px: 1, py: .1 }} />
        )}
         <Grid item xs={2}
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 1,
          
          }}>
          <Tooltip title="Match Stats">
            <IconButton size="small" color="primary" onClick={() => handleClickOpenMatchStat(item)}
              sx={{ bgcolor: '#f0fcff', fontSize: "1.17rem", mb: 1 }}>
              <IoStatsChartSharp />
            </IconButton>
          </Tooltip>
          <Tooltip title="Head to Head">
            <IconButton size="small" color="secondary" onClick={() => handleClickOpenH2H(item)}
              sx={{ bgcolor: '#fff9e6', fontSize: "1.17rem" }}>
              <HiMiniTableCells />
            </IconButton>
          </Tooltip>
        </Grid>
      </Box>
      <Grid container alignItems="center" spacing={0}>
        {/* Players */}
        <Grid item xs={8}>
          <PlayerRow
            player={p1}
            firstToServe={item.firstToServe === 1}
            winnerCode={item.winnerCode === 1}
            isInProgress={statusType === "inprogress"}
            score={item.homeScore}
          />
          <PlayerRow
            player={p2}
            firstToServe={item.firstToServe === 2}
            winnerCode={item.winnerCode === 2}
            isInProgress={statusType === "inprogress"}
            score={item.awayScore}
          />
        </Grid>
        {/* Score section - always display, even when not started */}
        <Grid item xs={4}
          sx={{
            display: "flex", alignItems: "center",
            justifyContent: { xs: "flex-start", sm: "center" }
          }}
        >
          <Box sx={{
            borderRadius: 2,
            bgcolor: "#f8fbff",
            px: 1,
            py: .5,
            minWidth: { xs: 52, sm: 80, md: 110 },
            fontSize: { xs: ".97rem", sm: "1.07rem" },
            fontWeight: 500,
            textAlign: "center"
          }}>
            {formatTennisScoreDom(item.homeScore, item.awayScore, statusType)}
          </Box>
        </Grid>
        {/* Actions */}
        {/* <Grid item xs={2}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 1,
            minHeight: { xs: 55, sm: 60 }
          }}>
          <Tooltip title="Match Stats">
            <IconButton size="small" color="primary" onClick={() => handleClickOpenMatchStat(item)}
              sx={{ bgcolor: '#f0fcff', fontSize: "1.17rem", mb: 1 }}>
              <IoStatsChartSharp />
            </IconButton>
          </Tooltip>
          <Tooltip title="Head to Head">
            <IconButton size="small" color="secondary" onClick={() => handleClickOpenH2H(item)}
              sx={{ bgcolor: '#fff9e6', fontSize: "1.17rem" }}>
              <HiMiniTableCells />
            </IconButton>
          </Tooltip>
        </Grid> */}
      </Grid>
    </Box>
  );
}

export default BeautifulScoreCard;