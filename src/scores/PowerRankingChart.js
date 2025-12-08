import React, { useState } from 'react';

export default function PowerRankingChart({ tennisPowerRankings }) {
    // Group by set
    const sets = {};
    if (tennisPowerRankings && tennisPowerRankings.length > 0) {
        tennisPowerRankings.forEach(r => {
            if (!sets[r.set]) sets[r.set] = [];
            sets[r.set].push(r);
        });
    }
    const setNumbers = Object.keys(sets);
    const [activeSet, setActiveSet] = useState(setNumbers[0] || '');

    if (!tennisPowerRankings || tennisPowerRankings.length === 0) return null;

    return (
        <div className="mb-6 bg-gray-700 rounded-xl shadow p-4 ">
            <h3 className="text-lg font-bold text-blue-300 mb-2">Momentum Chart</h3>
            {/* Tabs */}
            <div className="flex gap-2 mb-4 ">
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
            {/* Chart for active set */}
            <div className="mb-4">
                <div className="flex items-end gap-2">
                    {sets[activeSet]?.map((g, idx) => (
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
        </div>
    );
}