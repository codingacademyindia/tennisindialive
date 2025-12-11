import React, { useMemo } from 'react';
import NotFound from '../../common/stateHandlers/NotFoundDark';

export default function PowerRankingChart({ tennisPowerRankings }) {
    const sets = useMemo(() => {
        const map = {};
        if (!tennisPowerRankings) return map;

        tennisPowerRankings.forEach(r => {
            const setKey = String(r.set ?? '1');
            if (!map[setKey]) map[setKey] = [];
            map[setKey].push(r);
        });

        Object.keys(map).forEach(k => {
            map[k].sort((a, b) => (Number(a.game) || 0) - (Number(b.game) || 0));
        });

        return map;
    }, [tennisPowerRankings]);

    const setNumbers = Object.keys(sets).sort((a, b) => Number(a) - Number(b));

    if (!tennisPowerRankings?.length)
        return <NotFound msg="No Momentum Data" subMsg="" />;

    return (
        <div className="mb-1">
            <h3 className="text-sm font-semibold text-blue-300 mb-2">
                Momentum Chart
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {setNumbers.map(setNum => {
                    const items = sets[setNum];
                    const maxAbs = Math.max(...items.map(i => Math.abs(i.value || 0)), 1);
                    const scale = 68 / maxAbs;

                    return (
                        <div
                            key={setNum}
                            className="bg-gray-800 rounded-md p-2 border border-gray-700"
                        >
                            {/* Header + Legends */}
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-semibold text-blue-200">
                                    Set {setNum}
                                </span>

                                {/* ⭐ Legend with P1, P2 & Break ⚡ */}
                                <div className="flex items-center gap-2">

                                    {/* Player 1 */}
                                    <div className="flex items-center gap-1 bg-gray-900/60 px-2 py-0.5 rounded-full">
                                        <span className="w-2 h-2 rounded-full bg-[rgb(0,200,95)]"></span>
                                        <span className="text-[10px] text-gray-300 font-medium">P1</span>
                                    </div>

                                    {/* Player 2 */}
                                    <div className="flex items-center gap-1 bg-gray-900/60 px-2 py-0.5 rounded-full">
                                        <span className="w-2 h-2 rounded-full bg-[rgb(0,145,255)]"></span>
                                        <span className="text-[10px] text-gray-300 font-medium">P2</span>
                                    </div>

                                    {/* Break */}
                                    <div className="flex items-center gap-1 bg-gray-900/60 px-2 py-0.5 rounded-full">
                                        <span className="text-yellow-300 text-[10px] font-bold">⚡</span>
                                        <span className="text-[10px] text-gray-300 font-medium">Break</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bars */}
                            <div className="overflow-x-auto -mx-1 px-1">
                                <div className="flex items-end gap-1 py-0.5">
                                    {items.map((g, idx) => {
                                        const val = Number(g.value) || 0;
                                        const height = Math.max(5, Math.abs(val) * scale);
                                        const positive = val >= 0;

                                        const color = positive
                                            ? "bg-[rgb(0,200,95)]"
                                            : "bg-[rgb(0,145,255)]";

                                        return (
                                            <div key={idx} className="flex flex-col items-center min-w-[28px]">
                                                {/* Bar */}
                                                <div
                                                    className={`w-3 rounded-t ${color}`}
                                                    style={{ height: `${height}px` }}
                                                    title={`Set ${setNum} — Game ${g.game}: ${val}`}
                                                />

                                                {/* Game label + Break */}
                                                <div className="text-[9px] text-gray-300 mt-0.5 flex items-center gap-0.5">
                                                    <span>G{g.game}</span>

                                                    {g.breakOccurred && (
                                                        <span className="text-yellow-300 text-[8px] font-bold">
                                                            ⚡
                                                        </span>
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
