import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaTrophy } from 'react-icons/fa';
import MatchHeader from './MatchHeader';
import PointByPointViewer from './PointByPointViewer';
import PowerRankingChart from './PowerRankingChart';
const HEADERS = {
    'x-rapidapi-key': process.env.REACT_APP_RAPIDAPI_KEY,
    'x-rapidapi-host': 'tennisapi1.p.rapidapi.com'
};

function getWinner(home, away, compareCode) {
    const h = Number(home), a = Number(away);
    if (isNaN(h) || isNaN(a)) return 0;
    if (compareCode === 1) return h > a ? 1 : a > h ? 2 : 0;
    if (compareCode === 2) return h < a ? 1 : a < h ? 2 : 0;
    if (compareCode === 3) return h === a ? 1 : 2;
    return 0;
}

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function fetchWithRetry(url, options = {}, retries = 3, backoffMs = 500) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, options);
            if (response.status === 429) {
                if (attempt === retries) {
                    const text = await response.text().catch(() => '');
                    throw new Error(`Rate limit (429): ${text || 'Too Many Requests'}`);
                }
                // exponential backoff on 429
                await sleep(backoffMs * Math.pow(2, attempt));
                continue;
            }
            if (!response.ok) {
                const text = await response.text().catch(() => '');
                throw new Error(text || response.statusText || `HTTP ${response.status}`);
            }
            return await response.json();
        } catch (err) {
            if (attempt === retries) throw err;
            // backoff for network or other transient errors
            await sleep(backoffMs * Math.pow(2, attempt));
        }
    }
    throw new Error('Failed to fetch after retries');
}

export default function MatchDashboard() {
    const { eventId } = useParams();
    const [stats, setStats] = useState(null);
    const [event, setEvent] = useState(null);
    const [powerRankingData, setPowerRankingData] = useState([]);
    const [pointByPointData, setPointByPointData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(0);

    useEffect(() => {
        let cancelled = false;
        async function loadAll() {
            setLoading(true);
            // configurable delay between requests (ms)
            const delayMs = Number(process.env.REACT_APP_API_REQUEST_DELAY_MS) || 500;
            try {
                // 1) statistics
                const statsUrl = `https://tennisapi1.p.rapidapi.com/api/tennis/event/${eventId}/statistics`;
                const statsData = await fetchWithRetry(statsUrl, { headers: HEADERS }, 3, 500);
                if (cancelled) return;
                setStats(statsData || null);

                await sleep(delayMs);

                // 2) event
                const eventUrl = `https://tennisapi1.p.rapidapi.com/api/tennis/event/${eventId}`;
                try {
                    const eventResp = await fetchWithRetry(eventUrl, { headers: HEADERS }, 3, 500);
                    if (!cancelled) setEvent(eventResp?.event ?? null);
                } catch (err) {
                    if (!cancelled) setEvent(null);
                }

                await sleep(delayMs);

                // 3) power ranking graph
                const graphUrl = `https://tennisapi1.p.rapidapi.com/api/tennis/event/${eventId}/graph`;
                try {
                    const graphResp = await fetchWithRetry(graphUrl, { headers: HEADERS }, 3, 500);
                    if (!cancelled) setPowerRankingData(graphResp?.tennisPowerRankings ?? []);
                } catch (err) {
                    if (!cancelled) setPowerRankingData([]);
                }

                await sleep(delayMs);

                // 4) point-by-point
                const pbpUrl = `https://tennisapi1.p.rapidapi.com/api/tennis/event/${eventId}/point-by-point`;
                try {
                    const pbpResp = await fetchWithRetry(pbpUrl, { headers: HEADERS }, 3, 500);
                    if (!cancelled) setPointByPointData(pbpResp?.pointByPoint ?? []);
                } catch (err) {
                    if (!cancelled) setPointByPointData([]);
                }
            } catch (err) {
                if (!cancelled) {
                    setStats({ error: err.message });
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadAll();
        return () => {
            cancelled = true;
        };
    }, [eventId]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mb-4"></div>
                <div className="text-blue-200 text-lg">Loading match stats...</div>
            </div>
        );
    }

    if (!stats || stats.error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
                <div className="text-red-400 text-lg mb-2">Error loading stats: {stats?.error || 'Unknown error'}</div>
            </div>
        );
    }

    const periods = stats.statistics || [];
    const currentPeriod = periods[tab];

    return (
        <div className="min-h-screen bg-gray-900 py-4 px-1 sm:px-4">
            <div className="w-full mx-auto bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-blue-300 mb-4 tracking-wide text-center">Match Dashboard</h2>
                <MatchHeader event={event} />
                <PointByPointViewer pointByPoint={pointByPointData} />
                {/*<PowerRankingChart tennisPowerRankings={powerRankingData} /> */}
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
        </div>
    );
}