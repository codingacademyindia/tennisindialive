import React, { useState, useEffect } from 'react';

const pointColors = {
    win: 'bg-green-400',
    lose: 'bg-red-400',
    ace: 'bg-yellow-300',
    default: 'bg-blue-800'
};

function getPointType(type) {
    if (type === 1) return 'win';
    if (type === 2) return 'ace';
    if (type === 3) return 'win';
    if (type === 5) return 'lose';
    return 'default';
}

export default function PointByPointViewer({ pointByPoint }) {
    const [openSet, setOpenSet] = useState(null);

    useEffect(() => {
        if (pointByPoint && pointByPoint.length) {
            setOpenSet(pointByPoint[0].set);
        } else {
            setOpenSet(null);
        }
    }, [pointByPoint]);

    if (!pointByPoint || pointByPoint.length === 0) return null;

    return (
        <div className="mb-6 bg-gray-700 rounded-xl shadow p-4">
            <h3 className="text-lg font-bold text-blue-300 mb-2">Point Timeline</h3>
            {pointByPoint.map(setObj => (
                <div key={setObj.set} className="mb-2">
                    <button
                        className={`w-full text-left px-3 py-2 rounded bg-gray-800 text-blue-200 font-semibold mb-1 ${openSet === setObj.set ? 'bg-blue-900' : ''}`}
                        onClick={() => setOpenSet(openSet === setObj.set ? null : setObj.set)}
                    >
                        Set {setObj.set}
                    </button>
                    {openSet === setObj.set && (
                        <div className="pl-2">
                            {setObj.games.map(game => (
                                <div key={game.game} className="mb-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-pink-300 font-semibold text-xs">G{game.game}</span>
                                        <span className="text-xs text-blue-200">({game.score.homeScore}-{game.score.awayScore})</span>
                                        <div className="flex gap-1 flex-wrap">
                                            {game.points.map((pt, idx) => {
                                                const scoreStr = `${pt.homePoint}-${pt.awayPoint}`;
                                                const color = pointColors[getPointType(pt.homePointType)];
                                                return (
                                                    <span
                                                        key={idx}
                                                        className={`rounded-full px-2 py-0.5 text-xs font-mono text-white ${color}`}
                                                        title={`Score: ${scoreStr}`}
                                                    >
                                                        {scoreStr}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}