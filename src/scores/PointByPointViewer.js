import React, { useState, useEffect } from 'react';

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
    // Tab state
    const setNumbers = pointByPoint ? pointByPoint.map(setObj => setObj.set) : [];
    const [activeSet, setActiveSet] = useState(setNumbers[0] || null);

    useEffect(() => {
        if (pointByPoint && pointByPoint.length) {
            setActiveSet(pointByPoint[0].set);
        } else {
            setActiveSet(null);
        }
    }, [pointByPoint]);

    if (!pointByPoint || pointByPoint.length === 0) return null;

    const activeSetObj = pointByPoint.find(setObj => setObj.set === activeSet);

    return (
        <div className="mb-6 bg-gray-700 rounded-xl shadow p-4">
            <h3 className="text-lg font-bold text-blue-300 mb-2">Point Timeline</h3>
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
                {setNumbers.map(setNum => (
                    <button
                        key={setNum}
                        className={`px-3 py-1 rounded font-semibold text-xs ${
                            activeSet === setNum
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-800 text-blue-200'
                        }`}
                        onClick={() => setActiveSet(setNum)}
                    >
                        Set {setNum}
                    </button>
                ))}
            </div>
            {/* Points for active set */}
            {activeSetObj && (
                <div>
                    {activeSetObj.games.map(game => (
                        <div key={game.game} className="mb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-pink-300 font-semibold text-xs">G{game.game}</span>
                                <span className="text-xs text-blue-200">({game.score.homeScore}-{game.score.awayScore})</span>
                                <div className="flex gap-1 flex-wrap">
                                    {(() => {
                                        let ended = false;
                                        return game.points.map((pt, idx) => {
                                            if (ended) return null;
                                            const scoreStr = `${pt.homePoint}-${pt.awayPoint}`;
                                            const winner = getPointWinner(pt);
                                            const color = pointColors[winner] || pointColors.default;
                                            if (isGameOver(pt.homePoint, pt.awayPoint)) ended = true;
                                            return (
                                                <span
                                                    key={idx}
                                                    className={`rounded-full px-2 py-0.5 text-xs font-mono text-white ${color}`}
                                                    title={`Score: ${scoreStr}`}
                                                >
                                                    {scoreStr}
                                                </span>
                                            );
                                        });
                                    })()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}