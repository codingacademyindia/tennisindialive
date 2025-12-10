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

    if (!tennisPowerRankings?.length) return <NotFound msg="No Momentum Data" subMsg="" />;

    return (
        <div className="mb-1">
            <h3 className="text-sm font-semibold text-blue-300 mb-2">Momentum Chart</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {setNumbers.map(setNum => {
                    const items = sets[setNum];
                    const maxAbs = Math.max(...items.map(i => Math.abs(i.value || 0)), 1);
                    const scale = 68 / maxAbs;

                    return (
                        <div key={setNum} className="bg-gray-800 rounded-md p-2 border border-gray-700">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-semibold text-blue-200">Set {setNum}</span>

                                {/* Compact Legend */}
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        <span className="w-2.5 h-2.5 rounded-sm bg-[rgb(0,200,95)]" />
                                        <span className="text-[9px] text-gray-300">P1</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="w-2.5 h-2.5 rounded-sm bg-[rgb(0,145,255)]" />
                                        <span className="text-[9px] text-gray-300">P2</span>
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto -mx-1 px-1">
                                <div className="flex items-end gap-1 py-0.5">
                                    {items.map((g, idx) => {
                                        const val = Number(g.value) || 0;
                                        const height = Math.max(5, Math.abs(val) * scale);
                                        const isPositive = val >= 0;
                                        const color = isPositive
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

                                                {/* Game label with break */}
                                                <div className="text-[9px] text-gray-300 mt-0.5 flex items-center gap-0.5">
                                                    <span>G{g.game}</span>
                                                    {g.breakOccurred && (
                                                        <span className="text-yellow-300 text-[8px] font-bold">⚡</span>
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
