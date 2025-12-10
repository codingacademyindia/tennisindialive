import React, { useState, useEffect } from 'react';

const homeColor = 'bg-indigo-400 text-gray-900';
const awayColor = 'bg-cyan-400 text-gray-900';
const aceColor = 'bg-yellow-300 text-gray-900';

function getPointColor(type, isAce, isHome) {
    if (isAce) return aceColor;
    return isHome ? homeColor : awayColor;
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

    // Helper to check if the current point ends the game
    function isGameOver(home, away) {
        // Standard tennis scoring logic for game over
        const points = { '0': 0, '15': 1, '30': 2, '40': 3, 'A': 4 };
        // If both are below 3, not possible
        if (home < 3 && away < 3) return false;
        // Advantage logic
        if (home === 4 && home - away >= 2) return true;
        if (away === 4 && away - home >= 2) return true;
        // Normal win
        if (home === 3 && home > away && home - away >= 1 && away < 3) return true;
        if (away === 3 && away > home && away - home >= 1 && home < 3) return true;
        return false;
    }

    // Convert score string to numeric for easier comparison
    function scoreToNum(score) {
        if (score === '0') return 0;
        if (score === '15') return 1;
        if (score === '30') return 2;
        if (score === '40') return 3;
        if (score === 'A') return 4;
        return 0;
    }

    return (
        <div className="mb-6 bg-gray-700 rounded-xl shadow p-4">
            <h3 className="text-lg font-bold text-blue-300 mb-2">Point Timeline</h3>
            {/* Legends */}
            <div className="flex gap-4 mb-3 text-xs items-center">
                <span className={`px-2 py-1 rounded-full ${homeColor}`}>Player 1</span>
                <span className={`px-2 py-1 rounded-full ${awayColor}`}>Player 2</span>
                <span className={`px-2 py-1 rounded-full ${aceColor}`}>Ace</span>
            </div>
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
                                            {game.points.map((pt, idx, arr) => {
                                                // Determine which player won the point
                                                let winner = null;
                                                if (pt.homePointType === 1 || pt.homePointType === 2) winner = 'home';
                                                if (pt.awayPointType === 1 || pt.awayPointType === 2) winner = 'away';

                                                // Highlight ace for either player
                                                const isAce = pt.homePointType === 2 || pt.awayPointType === 2;

                                                // Color logic: ace gets aceColor, otherwise by winner
                                                let colorClass = '';
                                                if (isAce) {
                                                    colorClass = aceColor;
                                                } else if (winner === 'home') {
                                                    colorClass = homeColor;
                                                } else if (winner === 'away') {
                                                    colorClass = awayColor;
                                                } else {
                                                    colorClass = homeColor; // fallback
                                                }

                                                // Show score progression as "15-0", "15-15", etc.
                                                const scoreStr = `${pt.homePoint}-${pt.awayPoint}`;

                                                // Check if this point ends the game
                                                const homeNum = scoreToNum(pt.homePoint);
                                                const awayNum = scoreToNum(pt.awayPoint);
                                                let showGameBadge = false;
                                                if (idx === arr.length - 1 || isGameOver(homeNum, awayNum)) {
                                                    // If this is the last point or game is over after this point
                                                    // Only show "Game" if the game is won at this point
                                                    if (isGameOver(homeNum, awayNum)) showGameBadge = true;
                                                }

                                                return (
                                                    <React.Fragment key={idx}>
                                                        <span
                                                            className={`rounded-full px-2 py-0.5 text-xs font-mono ${colorClass}`}
                                                            title={`Score: ${scoreStr}${isAce ? ' (Ace)' : ''}`}
                                                        >
                                                            {scoreStr}
                                                        </span>
                                                        {showGameBadge && (
                                                            <span
                                                                className={`rounded-full px-2 py-0.5 text-xs font-bold bg-green-300 text-gray-900`}
                                                                title="Game won"
                                                            >
                                                                Game
                                                            </span>
                                                        )}
                                                    </React.Fragment>
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