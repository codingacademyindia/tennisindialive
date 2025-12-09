import React, { useMemo } from 'react';
import { FaTrophy } from 'react-icons/fa';

/**
 * Fixed MatchHeader: ensures React hooks (useMemo) are called unconditionally.
 *
 * Props:
 * - event: the match event object (may be null while loading)
 * - oddsData (optional): odds API response (or event.odds)
 *
 * Note: this file intentionally calls useMemo before any early return so hooks
 * are always invoked in the same order, avoiding the "hooks called conditionally" lint error.
 */

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

function findHomeAwayMarket(markets = []) {
  if (!Array.isArray(markets)) return null;
  // prefer explicit Home/Away marketGroup or Full time / Match markets
  let m = markets.find(x =>
    (x.marketGroup || '').toLowerCase().includes('home/away') ||
    (x.marketName || '').toLowerCase().includes('full time') ||
    (x.marketPeriod || '').toLowerCase() === 'match'
  );
  if (!m) m = markets[0] || null;
  return m;
}

export default function MatchHeader({ event, oddsData }) {
  // allow odds to be passed either as oddsData prop or attached to event.odds
  const rawOdds = oddsData ?? (event ? event.odds : null) ?? null;

  // Hooks (useMemo) are called unconditionally here — safe even if `event` is null.
  const market = useMemo(() => {
    if (!rawOdds) return null;
    return findHomeAwayMarket(Array.isArray(rawOdds.markets) ? rawOdds.markets : (rawOdds.markets ?? []));
  }, [rawOdds]);

  const mapped = useMemo(() => {
    const home = event?.homeTeam;
    const away = event?.awayTeam;
    const result = { homeChoice: null, awayChoice: null, otherChoices: [] };
    if (!market || !Array.isArray(market.choices)) return result;

    // first pass: numeric mapping "1" => home, "2" => away
    market.choices.forEach(c => {
      const name = String(c.name ?? '').trim();
      if (name === '1') result.homeChoice = c;
      else if (name === '2') result.awayChoice = c;
      else result.otherChoices.push(c);
    });

    // second pass: try to match by team names if mapping incomplete
    if ((!result.homeChoice || !result.awayChoice) && result.otherChoices.length) {
      const remaining = [];
      result.otherChoices.forEach(c => {
        const nm = String(c.name ?? '').toLowerCase();
        const homeName = String(home?.name ?? '').toLowerCase();
        const awayName = String(away?.name ?? '').toLowerCase();
        if (!result.homeChoice && homeName && nm && (nm === homeName || homeName.includes(nm) || nm.includes(homeName))) {
          result.homeChoice = c;
        } else if (!result.awayChoice && awayName && nm && (nm === awayName || awayName.includes(nm) || nm.includes(awayName))) {
          result.awayChoice = c;
        } else {
          remaining.push(c);
        }
      });
      result.otherChoices = remaining;
    }

    return result;
  }, [market, event]);

  const margin = useMemo(() => {
    if (!market || !Array.isArray(market.choices)) return null;
    let sum = 0;
    market.choices.forEach(c => {
      const dec = fractionalToDecimal(c.fractionalValue || c.initialFractionalValue);
      if (dec && dec > 0) sum += 1 / dec;
    });
    if (sum === 0) return null;
    return (sum - 1) * 100;
  }, [market]);

  // Early return after hooks (safe)
  if (!event) return null;

  // build set scores
  const { homeScore, awayScore } = event;
  const setCount = Math.max(
    ...([1, 2, 3, 4, 5].map(i => (homeScore?.[`period${i}`] || awayScore?.[`period${i}`]) ? i : 0))
  );
  const sets = [];
  for (let i = 1; i <= setCount; i++) {
    sets.push({
      home: homeScore?.[`period${i}`] ?? '',
      away: awayScore?.[`period${i}`] ?? ''
    });
  }

  // status badge
  const { status } = event;
  let statusColor = 'bg-green-600';
  let statusText = 'Live';
  if (status?.type === 'finished') { statusColor = 'bg-gray-600'; statusText = 'Finished'; }
  else if (status?.type === 'notstarted') { statusColor = 'bg-yellow-600'; statusText = 'Not Started'; }
  else if (status?.type === 'inprogress') { statusColor = 'bg-green-600'; statusText = `Live - ${status.description}`; }
  else { statusColor = 'bg-blue-600'; statusText = status?.description || 'Status'; }
  function formatTennisPoint(p) {
    return p || '0';
  }


  function OddsBadge({ choice }) {
    if (!choice) return (
      <div className="text-[11px] text-gray-400">-</div>
    );
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

  const homeShort = event.homeTeam?.shortName ?? event.homeTeam?.name;
  const awayShort = event.awayTeam?.shortName ?? event.awayTeam?.name;

  return (
    <div className="mb-4 bg-gray-800 rounded-2xl shadow p-3">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* HOME */}
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            {event.homeTeam?.country?.alpha2 && (
              <img
                src={`https://flagcdn.com/24x18/${event.homeTeam.country.alpha2.toLowerCase()}.png`}
                alt={event.homeTeam.country.name || ''}
                className="w-6 h-4 object-cover rounded-sm"
              />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className={`font-bold text-sm truncate ${event.winnerCode === 1 ? 'text-green-300' : 'text-white'}`}>
                  {homeShort}
                </div>
                {event.winnerCode === 1 && <FaTrophy className="text-yellow-400" />}
              </div>
              <div className="text-[11px] text-gray-400 truncate">{event.homeTeam?.country?.name || ''}</div>


            </div>
            <div className="ml-auto">
              <OddsBadge choice={mapped.homeChoice} />
            </div>
          </div>


        </div>

        {/* CENTER: status, sets, live points */}
        <div className="flex flex-col items-center gap-1">
          <div className={`px-3 py-0.5 rounded-full text-[11px] font-bold text-white ${statusColor}`}>
            {statusText}
          </div>

          {/* SET SCORES */}
          <div className="flex gap-1 text-[13px] font-mono text-blue-200">
            {sets.length ? sets.map((s, i) => (
              <span key={i} className="px-2 py-[1px] bg-gray-900 rounded">
                {s.home}-{s.away}
              </span>
            )) : <span className="text-[11px] text-gray-400">—</span>}
          </div>
          {/* LIVE POINTS */}
          {status?.type === "inprogress" && (
            <div className="flex gap-1 text-xs font-bold text-white">
              <div className={`px-2 py-0.5 rounded ${event.homeScore?.point > event.awayScore?.point
                ? 'bg-green-700 text-white'
                : 'bg-gray-700 text-gray-200'
                }`}>
                {formatTennisPoint(event.homeScore?.point)}
              </div>

              <div className="text-gray-400">-</div>

              <div className={`px-2 py-0.5 rounded ${event.awayScore?.point > event.homeScore?.point
                ? 'bg-green-700 text-white'
                : 'bg-gray-700 text-gray-200'
                }`}>
                {formatTennisPoint(event.awayScore?.point)}
              </div>
            </div>
          )}



          <div className="text-[10px] text-gray-400">
            {event.tournament?.name ?? ''}{event.venue?.name ? ` • ${event.venue.name}` : ''}
          </div>

          {market && (
            <div className="text-[10px] text-gray-500">
              {market.marketName} {market.marketPeriod ? `• ${market.marketPeriod}` : ''} {margin ? `• ${margin.toFixed(1)}% book` : ''}
            </div>
          )}
        </div>


        {/* AWAY */}
        <div className="flex-1 flex items-center gap-3 justify-end min-w-0">
          <div className="mr-2">
            <OddsBadge choice={mapped.awayChoice} />
          </div>

          <div className="flex items-center gap-2 min-w-0">
            {event.awayTeam?.country?.alpha2 && (
              <img
                src={`https://flagcdn.com/24x18/${event.awayTeam.country.alpha2.toLowerCase()}.png`}
                alt={event.awayTeam.country.name || ''}
                className="w-6 h-4 object-cover rounded-sm"
              />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className={`font-bold text-sm truncate ${event.winnerCode === 2 ? 'text-green-300' : 'text-white'}`}>
                  {awayShort}
                </div>
                {event.winnerCode === 2 && <FaTrophy className="text-yellow-400" />}
              </div>
              <div className="text-[11px] text-gray-400 truncate">{event.awayTeam?.country?.name || ''}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}