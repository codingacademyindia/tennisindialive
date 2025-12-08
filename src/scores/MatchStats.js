import React from 'react';
import { FaTrophy } from 'react-icons/fa';

function getWinner(home, away, compareCode) {
    const h = Number(home), a = Number(away);
    if (isNaN(h) || isNaN(a)) return 0;
    if (compareCode === 1) return h > a ? 1 : a > h ? 2 : 0;
    if (compareCode === 2) return h < a ? 1 : a < h ? 2 : 0;
    if (compareCode === 3) return h === a ? 1 : 2;
    return 0;
}

export default function MatchStatsTable({ periods, tab, setTab }) {
    const currentPeriod = periods[tab];

    if (!periods || periods.length === 0) return null;

    return (
        <div className="mb-6 bg-gray-700 rounded-xl shadow p-4">
            {/* Period Tabs */}
            <h2 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-4 tracking-wide text-center">Match Stats</h2>
            <div className="flex flex-wrap gap-2 mb-4 justify-center">
                {periods.map((period, idx) => (
                    <button
                        key={period.period}
                        className={`px-3 py-1 rounded-full text-sm font-semibold transition-all
                            ${tab === idx
                                ? 'bg-blue-500 text-white shadow'
                                : 'bg-gray-700 text-blue-200 hover:bg-blue-600 hover:text-white'}`}
                        onClick={() => setTab(idx)}
                    >
                        {period.period}
                    </button>
                ))}
            </div>
            
            {currentPeriod && currentPeriod.groups && currentPeriod.groups.length > 0 ? (
                currentPeriod.groups.map((group, idx) => (
                    <div key={group.groupName || idx} className="mb-4 bg-gray-700 rounded-xl shadow">
                        <div className="px-4 py-2 bg-gray-800 rounded-t-xl flex items-center">
                            <span className="text-pink-300 font-semibold text-base">{group.groupName}</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-800 text-blue-200">
                                        <th className="py-2 px-2 text-left font-bold">Stat</th>
                                        <th className="py-2 px-2 text-right font-bold">Home</th>
                                        <th className="py-2 px-2 text-right font-bold">Away</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {group.statisticsItems.map((item) => {
                                        const winner = getWinner(item.homeValue, item.awayValue, item.compareCode);
                                        return (
                                            <tr key={item.key} className="border-b border-gray-600 hover:bg-gray-800 transition">
                                                <td className="py-1 px-2 text-gray-100">{item.name}</td>
                                                <td className={`py-1 px-2 text-right ${winner === 1 ? 'text-green-400 font-bold' : 'text-gray-200'}`}>
                                                    {item.home}
                                                    {winner === 1 && <FaTrophy className="inline text-yellow-400 ml-1" title="Winner" />}
                                                </td>
                                                <td className={`py-1 px-2 text-right ${winner === 2 ? 'text-green-400 font-bold' : 'text-gray-200'}`}>
                                                    {item.away}
                                                    {winner === 2 && <FaTrophy className="inline text-yellow-400 ml-1" title="Winner" />}
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
                <div className="text-gray-400 text-center py-8">No data for this period.</div>
            )}
        </div>
    );
}