import React from 'react';

export default function PowerRankingChart({ tennisPowerRankings }) {
    if (!tennisPowerRankings || tennisPowerRankings.length === 0) return null;

    // Group by set
    const sets = {};
    tennisPowerRankings.forEach(r => {
        if (!sets[r.set]) sets[r.set] = [];
        sets[r.set].push(r);
    });

    return (
        <div className="mb-6 bg-gray-700 rounded-xl shadow p-4">
            <h3 className="text-lg font-bold text-blue-300 mb-2">Momentum Chart</h3>
            {Object.entries(sets).map(([setNum, games]) => (
                <div key={setNum} className="mb-4">
                    <div className="font-semibold text-pink-300 mb-2">Set {setNum}</div>
                    <div className="flex items-end gap-2 h-32">
                        {games.map((g, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                                <div
                                    className={`w-6 rounded-t ${g.value >= 0 ? 'bg-green-400' : 'bg-red-400'}`}
                                    style={{ height: `${Math.abs(g.value) * 1.2}px` }}
                                    title={`Game ${g.game}: ${g.value}`}
                                ></div>
                                <span className="text-xs text-blue-200 mt-1">G{g.game}</span>
                                {g.breakOccurred && <span className="text-yellow-400 text-xs font-bold">Break</span>}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}