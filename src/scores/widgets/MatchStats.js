import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import NotFound from "../../common/stateHandlers/NotFoundDark";

function getWinner(home, away, compareCode) {
    const h = Number(home), a = Number(away);
    if (isNaN(h) || isNaN(a)) return 0;

    // compareCode meanings:
    // 1 = Higher is better
    // 2 = Lower is better
    // 3 = Equal-only condition (rare but kept)
    if (compareCode === 1) return h > a ? 1 : a > h ? 2 : 0;
    if (compareCode === 2) return h < a ? 1 : a < h ? 2 : 0;
    if (compareCode === 3) return h === a ? 0 : 2;

    return 0;
}

export default function MatchStatsTable({ periods, tab, setTab, p1, p2 }) {
    if (!periods || periods.length === 0)
        return <NotFound msg="No Match Statistics" subMsg="" />;

    const currentPeriod = periods[tab];
    console.log(periods)
    return (
        <div className="mb-6 bg-zinc-900 rounded-xl shadow-lg p-3 md:w-[70%] mx-auto border border-zinc-800">



            {/* Period Tabs */}
            <div className="flex flex-wrap gap-2 mb-4 justify-center">
                {periods.map((period, idx) => (
                    <button
                        key={period.period}
                        onClick={() => setTab(idx)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all
                            ${tab === idx
                                ? "bg-cyan-600 text-white shadow-md"
                                : "bg-zinc-800 text-zinc-300 hover:bg-cyan-700/40 hover:text-white"
                            }`}
                    >
                        {period.period.toLowerCase() === "all"
                            ? "OVERALL"
                            : `${period.period} SET`}

                    </button>
                ))}
            </div>

            {/* Groups */}
            {currentPeriod?.groups?.length > 0 ? (
                currentPeriod.groups.map((group, idx) => (
                    <div key={group.groupName || idx} className="mb-3 bg-zinc-900 rounded-xl border border-zinc-800">

                        {/* Group header */}
                        <div className="px-3 py-2 bg-zinc-800 rounded-t-xl">
                            <span className="text-purple-300 font-semibold text-sm">
                                {group.groupName}
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-xs">
                                <thead>
                                    <tr className="bg-zinc-800 text-zinc-300 border-b border-zinc-700">
                                        <th className="py-2 px-2 text-left font-semibold">Stat</th>
                                        <th className="py-2 px-2 text-right font-semibold">{p1}</th>
                                        <th className="py-2 px-2 text-right font-semibold">{p2}</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {group.statisticsItems.map((item) => {
                                        const winner = getWinner(
                                            item.homeValue,
                                            item.awayValue,
                                            item.compareCode
                                        );

                                        const WinnerIcon = (
                                            <FaCheckCircle
                                                className="inline text-green-400 ml-1 text-[10px]"
                                                title="Winner"
                                            />
                                        );

                                        return (
                                            <tr
                                                key={item.key}
                                                className="border-b border-zinc-800 hover:bg-zinc-800/60 transition"
                                            >
                                                <td className="py-1.5 px-2 text-zinc-300">
                                                    {item.name}
                                                </td>

                                                {/* Home Value */}
                                                <td
                                                    className={`py-1.5 px-2 text-right ${winner === 1
                                                            ? "text-green-400 font-bold"
                                                            : "text-zinc-200"
                                                        }`}
                                                >
                                                    {item.home}
                                                    {winner === 1 && WinnerIcon}
                                                </td>

                                                {/* Away Value */}
                                                <td
                                                    className={`py-1.5 px-2 text-right ${winner === 2
                                                            ? "text-green-400 font-bold"
                                                            : "text-zinc-200"
                                                        }`}
                                                >
                                                    {item.away}
                                                    {winner === 2 && WinnerIcon}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-zinc-500 text-center py-6">
                    No data for this period.
                </div>
            )}
        </div>
    );
}
