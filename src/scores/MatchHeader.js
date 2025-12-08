import React from 'react';
import { FaTrophy, FaGolfBall } from 'react-icons/fa';

function MatchHeader({ event }) {
    if (!event) return null;
    const { homeTeam, awayTeam, homeScore, awayScore, status, winnerCode, firstToServe, tournament, venue } = event;

    // Build set scores
    const setCount = Math.max(
        ...[1,2,3,4,5].map(i => (homeScore?.[`period${i}`] || awayScore?.[`period${i}`]) ? i : 0)
    );
    const sets = [];
    for (let i = 1; i <= setCount; i++) {
        sets.push({
            home: homeScore?.[`period${i}`] ?? '',
            away: awayScore?.[`period${i}`] ?? ''
        });
    }

    // Status badge
    let statusColor = 'bg-green-600';
    let statusText = 'Live';
    if (status?.type === 'finished') { statusColor = 'bg-gray-600'; statusText = 'Finished'; }
    else if (status?.type === 'notstarted') { statusColor = 'bg-yellow-600'; statusText = 'Not Started'; }
    else if (status?.type === 'inprogress') { statusColor = 'bg-green-600'; statusText = 'Live'; }
    else { statusColor = 'bg-blue-600'; statusText = status?.description || 'Status'; }

    return (
        <div className="mb-6 bg-gray-700 rounded-xl shadow p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex-1 flex flex-col items-center sm:items-end">
                    <div className="flex items-center gap-2">
                        {homeTeam?.country?.alpha2 && (
                            <img src={`https://flagcdn.com/24x18/${homeTeam.country.alpha2.toLowerCase()}.png`} alt="" className="inline mr-1 rounded-sm" />
                        )}
                        <span className={`font-bold text-lg ${winnerCode === 1 ? 'text-green-400' : 'text-gray-100'}`}>
                            {homeTeam?.name}
                            {winnerCode === 1 && <FaTrophy className="inline text-yellow-400 ml-2" title="Winner" />}
                            {firstToServe === 1 && status?.type === 'inprogress' && <FaGolfBall className="inline text-green-300 ml-2" title="Serving" />}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold text-white mb-1 ${statusColor}`}>{statusText}</div>
                    <div className="flex gap-2 text-lg font-mono">
                        {sets.map((set, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-800 rounded text-blue-200">{set.home} - {set.away}</span>
                        ))}
                    </div>
                    <div className="text-xs text-blue-200 mt-1">
                        {tournament?.name} {venue?.name ? `| ${venue.name}` : ''}
                    </div>
                </div>
                <div className="flex-1 flex flex-col items-center sm:items-start">
                    <div className="flex items-center gap-2">
                        {awayTeam?.country?.alpha2 && (
                            <img src={`https://flagcdn.com/24x18/${awayTeam.country.alpha2.toLowerCase()}.png`} alt="" className="inline mr-1 rounded-sm" />
                        )}
                        <span className={`font-bold text-lg ${winnerCode === 2 ? 'text-green-400' : 'text-gray-100'}`}>
                            {awayTeam?.name}
                            {winnerCode === 2 && <FaTrophy className="inline text-yellow-400 ml-2" title="Winner" />}
                            {firstToServe === 2 && status?.type === 'inprogress' && <FaGolfBall className="inline text-green-300 ml-2" title="Serving" />}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MatchHeader;