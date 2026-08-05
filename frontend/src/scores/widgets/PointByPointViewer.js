import React, { useEffect, useMemo, useState } from 'react';
import NotFound from '../../common/stateHandlers/NotFoundDark';

const legendStyles = {
    p1: "bg-[rgb(0,200,95)] text-black",
    p2: "bg-[rgb(0,145,255)] text-black",
    ace: "bg-yellow-400 text-black",
    default: "bg-gray-700 text-white"
};

function getPointWinner(pt) {
    if ([1, 2, 3].includes(pt.homePointType)) return 'p1';
    if ([1, 2, 3].includes(pt.awayPointType)) return 'p2';
    if (pt.homePointType === 5) return 'p2';
    if (pt.awayPointType === 5) return 'p1';
    return 'default';
}

function isAce(pt) {
    return pt.homePointType === 2 || pt.awayPointType === 2;
}

export default function PointByPointViewer({ pointByPoint, p1, p2 }) {
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
        return unfinished[0];
    }, [sets]);

    if (!sets?.length) return <NotFound msg="No point-by-point data" subMsg="" />;

    return (
        <div className="mb-2">

            {/* -------------------- LEGEND ---------------------- */}
            <div className="flex items-center gap-3 mb-3 text-[11px] text-gray-300">
                <div className="flex items-center gap-1">
                    <span className={`px-2 py-[2px] rounded-sm ${legendStyles.p1}`}>P1</span>
                    <span>- {p1} points</span>
                </div>

                <div className="flex items-center gap-1">
                    <span className={`px-2 py-[2px] rounded-sm ${legendStyles.p2}`}>P2</span>
                    <span>- {p2} points</span>
                </div>

                <div className="flex items-center gap-1">
                    <span className={`px-2 py-[2px] rounded-sm ${legendStyles.ace}`}>⭐ ACE</span>
                    <span>- Ace point</span>
                </div>
            </div>

            {/* -------------------- SET GRID ---------------------- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sets.map((setObj) => (
                    <div key={setObj.set} className="bg-gray-800 rounded-md p-2 border border-gray-700">

                        {/* Set Header */}
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-semibold text-blue-200">Set {setObj.set}</span>
                            <span className="text-[10px] text-gray-400">{setObj.games?.length} games</span>
                        </div>

                        {/* Games */}
                        {(setObj.games || []).map((game) => {
                            const inProg =
                                globalInProgress &&
                                `${setObj.set}` === `${globalInProgress.setKey}` &&
                                `${game.game}` === `${globalInProgress.gameKey}`;

                            return (
                                <div
                                    key={game.game}
                                    className="bg-gray-900 p-1.5 rounded border border-gray-700 mb-1"
                                >
                                    {/* Game header */}
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[11px] font-bold text-cyan-300">
                                            G{game.game}
                                        </span>
                                        {inProg && (
                                            <span className="text-[10px] text-yellow-300 font-semibold">
                                                LIVE
                                            </span>
                                        )}
                                    </div>

                                    {/* Points row */}
                                    <div className="overflow-x-auto">
                                        <div className="flex gap-1 items-center py-0.5">

                                            {game.points?.map((pt, idx) => {
                                                const scoreStr = `${pt.homePoint}-${pt.awayPoint}`;
                                                const winner = getPointWinner(pt);
                                                const ace = isAce(pt);

                                                const color =
                                                    winner === "p1"
                                                        ? legendStyles.p1
                                                        : winner === "p2"
                                                            ? legendStyles.p2
                                                            : legendStyles.default;

                                                return (
                                                    <div key={idx} className="flex flex-col items-center">
                                                        <span
                                                            className={`rounded px-1.5 py-[2px] min-w-[26px] text-[10px] font-semibold flex justify-center ${color}`}
                                                            title={`Score: ${scoreStr}`}
                                                        >
                                                            {scoreStr}
                                                        </span>

                                                        {/* ACE indicator */}
                                                        {ace && (
                                                            <span className="text-yellow-300 text-[8px] font-bold leading-[8px]">
                                                                ⭐
                                                            </span>
                                                        )}

                                                        {/* Break icon */}
                                                        {pt.breakOccurred && (
                                                            <span className="text-yellow-300 text-[9px] font-extrabold leading-[8px]">
                                                                ⚡
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}

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
