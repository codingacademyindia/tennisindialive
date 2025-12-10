import React, { useEffect, useMemo, useState } from 'react';
import NotFound from '../../common/stateHandlers/NotFoundDark';

const pointColors = {
    p1: 'bg-green-400',
    p2: 'bg-blue-400',
    default: 'bg-blue-800'
};

function getPointWinner(pt) {
    if (pt.homePointType === 1 || pt.homePointType === 3) return 'p1';
    if (pt.awayPointType === 1 || pt.awayPointType === 3) return 'p2';
    if (pt.homePointType === 2) return 'p1';
    if (pt.awayPointType === 2) return 'p2';
    if (pt.homePointType === 5) return 'p2';
    if (pt.awayPointType === 5) return 'p1';
    return 'default';
}

// Helper to check if the current point ends the game
function isGameOver(home, away) {
    const points = { '0': 0, '15': 1, '30': 2, '40': 3, 'A': 4 };
    const h = points[home] ?? 0;
    const a = points[away] ?? 0;
    if (h === 4 && h - a >= 2) return true;
    if (a === 4 && a - h >= 2) return true;
    if (h === 3 && h > a && h - a >= 1 && a < 3) return true;
    if (a === 3 && a > h && a - h >= 1 && h < 3) return true;
    return false;
}

export default function PointByPointViewer({ pointByPoint }) {
    const [sets, setSets] = useState(pointByPoint || []);

    useEffect(() => {
        setSets(pointByPoint || []);
    }, [pointByPoint]);

    // Compute the single global "In Progress" game using numeric ordering of sets and games
    // This avoids depending on the array order returned by the API.
    const globalInProgress = useMemo(() => {
        const unfinished = [];

        sets.forEach((setObj) => {
            const setNum = Number(setObj.set ?? NaN);
            (setObj.games || []).forEach((g) => {
                const gameNum = Number(g.game ?? NaN);
                // Treat a game as unfinished if isCompleted is falsy
                if (!g.isCompleted) {
                    unfinished.push({
                        setNum: Number.isFinite(setNum) ? setNum : -Infinity,
                        gameNum: Number.isFinite(gameNum) ? gameNum : -Infinity,
                        setKey: String(setObj.set),
                        gameKey: String(g.game),
                    });
                }
            });
        });

        if (unfinished.length === 0) return null;

        // Sort by setNum desc, then gameNum desc to pick the latest game numerically
        unfinished.sort((a, b) => {
            if (b.setNum !== a.setNum) return b.setNum - a.setNum;
            return b.gameNum - a.gameNum;
        });

        const pick = unfinished[0];
        return { set: pick.setKey, game: pick.gameKey };
    }, [sets]);

    // Hooks above are unconditional; safe to early-return below
    if (!sets || sets.length === 0) return <NotFound msg="No point-by-point data available." subMsg="" />;

    return (
        <div className="mb-4">
            <h3 className="text-sm font-semibold text-blue-300 mb-2">Point Timeline</h3>

            {/* Compact grid: 1 col on xs, 2 cols on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sets.map((setObj) => {
                    const games = setObj.games || [];

                    return (
                        <div
                            key={String(setObj.set)}
                            className="bg-gray-800 rounded-md border border-gray-700 p-2"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="text-xs font-semibold text-blue-200">Set {setObj.set}</div>
                                    <div className="text-[10px] text-gray-400">{games.length} games</div>
                                </div>
                                <div className="text-[10px] text-gray-400">Points</div>
                            </div>

                            <div className="max-h-[220px] overflow-y-auto pr-1">
                                {games.map((game) => {
                                    const isGlobalInProgress =
                                        globalInProgress &&
                                        String(setObj.set) === globalInProgress.set &&
                                        String(game.game) === globalInProgress.game;

                                    const statusText = game.isCompleted
                                        ? 'Completed'
                                        : isGlobalInProgress
                                            ? 'In Progress'
                                            : '';

                                    return (
                                        <div
                                            key={String(game.game)}
                                            className="bg-gray-900 rounded-sm p-1 border border-gray-800"
                                        >
                                            {/* Single-row layout: Game + score + points (scrollable) on left, status on right */}
                                            <div className="flex items-center">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <span className="text-pink-300 font-semibold text-[11px]">G{game.game}</span>
                                                        <span className="text-[11px] text-blue-200">({game.score?.homeScore ?? 0}-{game.score?.awayScore ?? 0})</span>
                                                    </div>

                                                    <div className="overflow-x-auto min-w-0">
                                                        <div className="flex gap-1 items-center py-1">
                                                            {(() => {
                                                                let ended = false;
                                                                return (game.points || []).map((pt, idx) => {
                                                                    if (ended) return null;
                                                                    const scoreStr = `${pt.homePoint}-${pt.awayPoint}`;
                                                                    const winner = getPointWinner(pt);
                                                                    const color = pointColors[winner] || pointColors.default;
                                                                    if (isGameOver(pt.homePoint, pt.awayPoint)) ended = true;
                                                                    return (
                                                                        <div key={idx} className="flex flex-col items-center min-w-[36px]">
                                                                            <span
                                                                                className={`rounded-full px-1 py-0.5 text-[10px] font-mono text-white ${color}`}
                                                                                title={`Score: ${scoreStr}`}
                                                                            >
                                                                                {scoreStr}
                                                                            </span>
                                                                            {pt.breakOccurred && (
                                                                                <span className="text-yellow-400 text-[10px] font-bold mt-1">B</span>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                });
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* status on right */}
                                                <div className="ml-2 flex-shrink-0">
                                                    {statusText ? (
                                                        <div className={`text-[10px] ${statusText === 'In Progress' ? 'text-yellow-300' : 'text-gray-400'}`}>
                                                            {statusText}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                           
                        </div>
                    );
                })}
            </div>
        </div>
    );
}