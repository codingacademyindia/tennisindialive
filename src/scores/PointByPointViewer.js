import React, { useEffect, useMemo, useState } from 'react';
import NotFound from '../common/stateHandlers/NotFoundDark';

const pointColors = {
    p1: 'bg-green-500',
    p2: 'bg-red-500',
    default: 'bg-gray-600'
};

function getPointWinner(pt) {
    if (pt.homePointType === 1 || pt.homePointType === 3 || pt.homePointType === 2) return 'p1';
    if (pt.awayPointType === 1 || pt.awayPointType === 3 || pt.awayPointType === 2) return 'p2';
    if (pt.homePointType === 5) return 'p2';
    if (pt.awayPointType === 5) return 'p1';
    return 'default';
}

function isGameOver(home, away) {
    const mapping = { '0': 0, '15': 1, '30': 2, '40': 3, 'A': 4 };
    const h = mapping[home] ?? 0;
    const a = mapping[away] ?? 0;
    if ((h >= 4 || a >= 4) && Math.abs(h - a) >= 2) return true;
    if (h === 3 && a < 3) return true;
    if (a === 3 && h < 3) return true;
    return false;
}

export default function PointByPointViewer({ pointByPoint }) {
    const [sets, setSets] = useState(pointByPoint || []);

    useEffect(() => setSets(pointByPoint || []), [pointByPoint]);

    const globalInProgress = useMemo(() => {
        const unfinished = [];
        sets.forEach((setObj) => {
            const s = Number(setObj.set ?? 0);
            (setObj.games || []).forEach((g) => {
                const gm = Number(g.game ?? 0);
                if (!g.isCompleted) unfinished.push({ s, gm, setKey: setObj.set, gameKey: g.game });
            });
        });
        if (!unfinished.length) return null;
        unfinished.sort((a, b) => b.s - a.s || b.gm - a.gm);
        const pick = unfinished[0];
        return { set: pick.setKey, game: pick.gameKey };
    }, [sets]);

    if (!sets?.length) return <NotFound msg="No point-by-point data" subMsg="" />;

    return (
        <div className="mb-1">
          
            {/* Compact responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sets.map((setObj) => (
                    <div key={setObj.set} className="bg-gray-800 rounded-md p-2 border border-gray-700">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-semibold text-blue-200">Set {setObj.set}</span>
                            <span className="text-[10px] text-gray-400">{setObj.games?.length} games</span>
                        </div>

                        {(setObj.games || []).map((game) => {
                            const inProg =
                                globalInProgress &&
                                `${setObj.set}` === globalInProgress.set &&
                                `${game.game}` === globalInProgress.game;

                            return (
                                <div key={game.game} className="bg-gray-900 p-1.5 flex flex-rowrounded border border-gray-700">
                                    <div className="flex items-center flex-row justify-between mr-2">
                                        <span className="text-[11px] font-bold text-cyan-300">
                                            G{game.game}
                                        </span>
                                        {inProg && (    
                                            <span className="text-[10px] text-yellow-300 font-semibold">
                                                LIVE
                                            </span>
                                        )}
                                    </div>

                                    <div className="overflow-x-auto">
                                        <div className="flex gap-1 items-center py-0.5">
                                            {(() => {
                                                let ended = false;
                                                return (game.points || []).map((pt, idx) => {
                                                    if (ended) return null;

                                                    const scoreStr = `${pt.homePoint}-${pt.awayPoint}`;
                                                    const winner = getPointWinner(pt);

                                                    // Bright + visible themed colors
                                                    const color =
                                                        winner === "p1"
                                                            ? "bg-[rgb(0,200,95)] text-black"
                                                            : winner === "p2"
                                                                ? "bg-[rgb(0,145,255)] text-black"
                                                                : "bg-gray-700 text-white";

                                                    if (isGameOver(pt.homePoint, pt.awayPoint)) ended = true;

                                                    return (
                                                        <div key={idx} className="flex flex-col items-center">
                                                            <span
                                                                className={`rounded-md px-1.5 py-[2px] text-[10px] font-semibold min-w-[26px] flex justify-center ${color}`}
                                                                title={`Score: ${scoreStr}`}
                                                            >
                                                                {scoreStr}
                                                            </span>

                                                            {/* Tiny break icon */}
                                                            {pt.breakOccurred && (
                                                                <span className="text-yellow-300 text-[9px] font-extrabold leading-[8px]">
                                                                    ⚡
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
