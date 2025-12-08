import React, { useMemo } from 'react';

export default function PowerRankingChart({ tennisPowerRankings }) {
    // Group by set (keep provided ordering numeric)
    const sets = useMemo(() => {
        const map = {};
        if (!tennisPowerRankings) return map;
        tennisPowerRankings.forEach(r => {
            const setKey = String(r.set ?? '1');
            if (!map[setKey]) map[setKey] = [];
            map[setKey].push(r);
        });
        // sort by numeric set key
        Object.keys(map).forEach(k => {
            map[k].sort((a, b) => (Number(a.game) || 0) - (Number(b.game) || 0));
        });
        return map;
    }, [tennisPowerRankings]);

    const setNumbers = Object.keys(sets).sort((a, b) => Number(a) - Number(b));

    if (!tennisPowerRankings || tennisPowerRankings.length === 0) return null;

    return (
        <div className="mb-4">
            <h3 className="text-sm font-semibold text-blue-300 mb-2">Momentum Chart</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {setNumbers.map(setNum => {
                    const items = sets[setNum] || [];
                    // per-set scaling: make largest magnitude about 72px tall in this compact view
                    const maxAbs = Math.max(...items.map(i => Math.abs(i.value || 0)), 1);
                    const scale = 72 / maxAbs;

                    return (
                        <div
                            key={setNum}
                            className="bg-gray-800 rounded-md border border-gray-700 p-2"
                        >
                            {/* Header row: Set title + compact legends */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="text-xs font-semibold text-blue-200 truncate">Set {setNum}</div>
                                    <div className="text-[10px] text-gray-400">{items.length} games</div>
                                </div>

                                <div className="flex items-center gap-3 ml-3">
                                    {/* Legends inline in header */}
                                    <div className="flex items-center gap-1">
                                        <span className="w-3 h-3 rounded-sm bg-green-400 inline-block" />
                                        <span className="text-[10px] text-gray-300">Server/Player A</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" />
                                        <span className="text-[10px] text-gray-300">Opponent/Player B</span>
                                    </div>
                                </div>
                            </div>

                            {/* Compact chart area */}
                            <div className="overflow-x-auto -mx-1 px-1">
                                <div className="flex items-end gap-2 py-1">
                                    {items.map((g, idx) => {
                                        const val = Number(g.value) || 0;
                                        const height = Math.max(6, Math.abs(val) * scale); // minimum visible
                                        const isPositive = val >= 0;
                                        return (
                                            <div key={idx} className="flex flex-col items-center min-w-[40px]">
                                                {/* bar */}
                                                <div
                                                    className={`w-5 rounded-t ${isPositive ? 'bg-green-400' : 'bg-red-400'}`}
                                                    style={{ height: `${height}px` }}
                                                    title={`Set ${setNum} — Game ${g.game}: ${val}`}
                                                />
                                                {/* game label and optional break badge */}
                                                <div className="text-[10px] text-blue-200 mt-1 flex items-center gap-1">
                                                    <span className="font-mono">G{g.game}</span>
                                                    {g.breakOccurred && (
                                                        <span className="text-yellow-300 text-[10px] font-semibold">B</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
}