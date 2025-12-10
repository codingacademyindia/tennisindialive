import React, { useMemo } from 'react';
import { FaTrophy } from 'react-icons/fa';

function fractionalToDecimal(frac) {
  if (!frac) return null;
  if (typeof frac === 'number') return frac;
  const s = String(frac).trim();
  const parts = s.split('/');
  if (parts.length === 2) {
    const a = Number(parts[0]);
    const b = Number(parts[1]);
    if (!Number.isNaN(a) && !Number.isNaN(b) && b !== 0) {
      return 1 + a / b;
    }
  }
  const asNum = Number(s);
  return Number.isFinite(asNum) ? asNum : null;
}

function decimalToPercent(dec) {
  if (!dec || !Number.isFinite(dec) || dec === 0) return null;
  return (1 / dec) * 100;
}

function formatOddsLabel(choice) {
  const frac = choice?.fractionalValue || choice?.initialFractionalValue || '';
  const dec = fractionalToDecimal(frac);
  const prob = dec ? decimalToPercent(dec) : null;
  const decStr = dec ? dec.toFixed(2) : '-';
  const probStr = prob ? `${prob.toFixed(0)}%` : '-';
  return { frac, dec, decStr, probStr };
}

function OddsBadge({ choice }) {
  if (!choice) return null;
  const { frac, decStr, probStr } = formatOddsLabel(choice);
  const fav = !!choice.winning;
  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded-md ${fav ? 'ring-1 ring-yellow-400 bg-gradient-to-br from-gray-900/60 to-gray-900' : 'bg-gray-900/60'}`}>
      <div className={`w-3 h-3 rounded-full ${fav ? 'bg-yellow-400' : 'bg-white/10'}`} />
      <div className="flex flex-col leading-none min-w-[64px]">
        <div className="text-xs text-blue-200 font-semibold truncate">{frac || '-'}</div>
        <div className="text-[10px] text-gray-400">{decStr} • {probStr}</div>
      </div>
    </div>
  );
}
function formatPoints(event) {
  if (event?.status?.type !== "inprogress") return null;

  const homePoint = event.homeScore?.point ?? 0;
  const awayPoint = event.awayScore?.point ?? 0;

  return (
    <div className="flex gap-1 text-xs font-bold text-white">
      <div
        className={`px-2 py-0.5 rounded ${homePoint > awayPoint ? "bg-orange-600 text-white" : "bg-gray-700 text-gray-200"
          }`}
      >
        {homePoint}
      </div>

      <div className="text-gray-400">-</div>

      <div
        className={`px-2 py-0.5 rounded ${awayPoint > homePoint ? "bg-orange-600 text-white" : "bg-gray-700 text-gray-200"
          }`}
      >
        {awayPoint}
      </div>
    </div>
  );
}


export default function MatchHeader({ event, oddsData }) {
  const rawOdds = oddsData ?? (event ? event.odds : null) ?? null;

  const market = useMemo(() => {
    if (!rawOdds) return null;
    return (rawOdds.markets ?? [])[0] || null;
  }, [rawOdds]);

  const mapped = useMemo(() => {
    const home = event?.homeTeam;
    const away = event?.awayTeam;
    const result = { homeChoice: null, awayChoice: null, otherChoices: [] };
    if (!market || !Array.isArray(market.choices)) return result;

    market.choices.forEach(c => {
      const name = String(c.name ?? '').trim();
      if (name === '1') result.homeChoice = c;
      else if (name === '2') result.awayChoice = c;
      else result.otherChoices.push(c);
    });

    if ((!result.homeChoice || !result.awayChoice) && result.otherChoices.length) {
      const remaining = [];
      result.otherChoices.forEach(c => {
        const nm = String(c.name ?? '').toLowerCase();
        const homeName = String(home?.name ?? '').toLowerCase();
        const awayName = String(away?.name ?? '').toLowerCase();
        if (!result.homeChoice && nm.includes(homeName)) result.homeChoice = c;
        else if (!result.awayChoice && nm.includes(awayName)) result.awayChoice = c;
        else remaining.push(c);
      });
      result.otherChoices = remaining;
    }

    return result;
  }, [market, event]);

  if (!event) return null;

  const { homeScore, awayScore } = event;
  const setCount = Math.max(...[1, 2, 3, 4, 5].map(i => (homeScore?.[`period${i}`] || awayScore?.[`period${i}`]) ? i : 0));
  const sets = [];
  for (let i = 1; i <= setCount; i++) {
    sets.push({ home: homeScore?.[`period${i}`] ?? '', away: awayScore?.[`period${i}`] ?? '' });
  }

  const statusColor = event.status?.type === 'finished' ? 'bg-gray-600'
    : event.status?.type === 'notstarted' ? 'bg-yellow-600'
      : 'bg-green-600';
  const statusText = event.status?.type === 'inprogress' ? `Live - ${event.status.description}` : event.status?.type === 'finished' ? 'Finished' : 'Not Started';

  const homeShort = event.homeTeam?.shortName ?? event.homeTeam?.name;
  const awayShort = event.awayTeam?.shortName ?? event.awayTeam?.name;

  return (
    <div className="mb-4 bg-gray-800 rounded-2xl shadow p-3">
      {/* SMALL SCREEN VERSION */}
      <div className="flex flex-col sm:hidden gap-2">
        <div className="flex justify-between items-center text-sm font-bold text-white">
          <div className="flex items-center gap-1">
            {homeShort}
          </div>
          <div className="flex items-center gap-1">
            {awayShort}
          </div>
        </div>
        <div className='flex flex-row w-full justify-center'>
          <div className="flex justify-center gap-2 text-[12px] text-gray-400 font-mono">
            {sets.length ? sets.map((s, i) => (
              <span key={i} className='text-sm'>{s.home}-{s.away}</span>
            )) : <span>—</span>}
          </div>
          <span className="ml-2">{formatPoints(event)}</span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <OddsBadge choice={mapped.homeChoice} />
            <OddsBadge choice={mapped.awayChoice} />
          </div>
          <div className="text-[10px] text-gray-400 text-center">
            {event.tournament?.name ?? ''}{event.venue?.name ? ` • ${event.venue.name}` : ''}
          </div>
          {market && <div className="text-[10px] text-gray-500 text-center">
            {market.marketName} {market.marketPeriod ? `• ${market.marketPeriod}` : ''}
          </div>}
          <div className={`px-2 py-0.5 rounded-full text-[11px] font-bold text-white text-center ${statusColor}`}>
            {statusText}
          </div>
        </div>
      </div>

      {/* DESKTOP VERSION */}
      <div className="hidden sm:flex flex-col sm:flex-row items-center gap-3">
        {/* Original layout here */}
      </div>
    </div>
  );
}
