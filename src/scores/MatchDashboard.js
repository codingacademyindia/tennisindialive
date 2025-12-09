import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaTrophy, FaChevronDown } from 'react-icons/fa';
import MatchHeader from './MatchHeader';
import PointByPointViewer from './PointByPointViewer';
import PowerRankingChart from './PowerRankingChart';
import MatchStatsTable from './MatchStats';
import OddsPanel from './OddsPanel';
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
            await sleep(backoffMs * Math.pow(2, attempt));
        }
    }
    throw new Error('Failed to fetch after retries');
}

/**
 * Small presentational AccordionItem to make each section look & behave like an accordion.
 * Uses Tailwind CSS classes (transition, rotate, max-h trick) so expansion has a smooth feel.
 */
function AccordionItem({ id, title, subtitle, isOpen, onToggle, children }) {
    return (
        <div className="mb-4">
            <button
                aria-controls={id}
                aria-expanded={isOpen}
                onClick={onToggle}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg
                    bg-gradient-to-r from-gray-800 to-gray-700
                    border border-gray-700
                    text-left text-blue-100 font-semibold text-lg
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
                    transition-shadow duration-150
                    ${isOpen ? 'shadow-lg' : 'hover:shadow-md'}`}
            >
                <div className="flex items-center gap-3">
                    {/* <FaTrophy className="text-yellow-400 w-5 h-5" /> */}
                    <div>
                        <div className="leading-tight">{title}</div>
                        {subtitle && <div className="text-xs text-gray-300 mt-0.5">{subtitle}</div>}
                    </div>
                </div>

                <span
                    className={`flex items-center transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                    aria-hidden="true"
                >
                    <FaChevronDown className="w-4 h-4" />
                </span>
            </button>

            <div
                id={id}
                className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[2000px] mt-3' : 'max-h-0'}`}
            // If you want to control accessibility more, consider adding role="region" and aria-labelledby
            >
                <div className="p-4 bg-gray-800 border border-t-0 border-gray-700 rounded-b-lg">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function MatchDashboard() {
    const { eventId } = useParams();
    const [stats, setStats] = useState(null);
    const [event, setEvent] = useState(null);
    const [powerRankingData, setPowerRankingData] = useState([]);
    const [pointByPointData, setPointByPointData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(0);
    const [oddsData, setOddsData] = useState(null);
    const [openAccordion, setOpenAccordion] = useState('point'); // 'point', 'power', 'stats'
    const isFirstLoad = React.useRef(true);

    useEffect(() => {
        if (!eventId) return;

        let cancelled = false;
        let pollingTimer = null;

        async function loadSequential() {
            if (cancelled) return;

            if (isFirstLoad.current) setLoading(true);

            const delay = (ms) => new Promise(res => setTimeout(res, ms));
            const delayMs = Number(process.env.REACT_APP_API_REQUEST_DELAY_MS) || 600;

            try {
                const statsUrl = `https://tennisapi1.p.rapidapi.com/api/tennis/event/${eventId}/statistics`;
                const statsData = await fetchWithRetry(statsUrl, { headers: HEADERS }, 3, 300);
                if (!cancelled) setStats(statsData ?? null);

                await delay(delayMs);

                const eventUrl = `https://tennisapi1.p.rapidapi.com/api/tennis/event/${eventId}`;
                const evtResp = await fetchWithRetry(eventUrl, { headers: HEADERS }, 3, 300);
                const evt = evtResp?.event ?? null;
                if (!cancelled) setEvent(evt);
                if (evt?.status?.type === "finished") return stopPolling();

                await delay(delayMs);

                const graphUrl = `https://tennisapi1.p.rapidapi.com/api/tennis/event/${eventId}/graph`;
                const graphResp = await fetchWithRetry(graphUrl, { headers: HEADERS }, 3, 300);
                if (!cancelled) setPowerRankingData(graphResp?.tennisPowerRankings ?? []);

                await delay(delayMs);

                const pbpUrl = `https://tennisapi1.p.rapidapi.com/api/tennis/event/${eventId}/point-by-point`;
                const pbpResp = await fetchWithRetry(pbpUrl, { headers: HEADERS }, 3, 300);
                if (!cancelled) setPointByPointData(pbpResp?.pointByPoint ?? []);

                await delay(delayMs);

                const oddsUrl = `https://tennisapi1.p.rapidapi.com/api/tennis/event/${eventId}/odds`;
                const oddsResp = await fetchWithRetry(oddsUrl, { headers: HEADERS }, 3, 300);
                if (!cancelled) setOddsData(oddsResp ?? []);

            } catch (err) {
                if (!cancelled) setStats({ error: err.message });
            } finally {
                if (!cancelled && isFirstLoad.current) {
                    setLoading(false);
                    isFirstLoad.current = false;
                }
            }
        }

        function stopPolling() {
            cancelled = true;
            setLoading(false)
            if (pollingTimer) clearInterval(pollingTimer);
        }

        loadSequential();
        pollingTimer = setInterval(loadSequential, 12000);

        return stopPolling;
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
            <div className="w-full mx-auto bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-4 sm:p-8">
                <MatchHeader event={event} oddsData={oddsData} />
                {/* <OddsPanel eventId={eventId} /> */}
                {/* Accordion: Match Stats */}
                <AccordionItem
                    id="acc-match-stats"
                    title="Match Stats"
                    // subtitle={`${periods.length} periods`}
                    isOpen={openAccordion === 'stats'}
                    onToggle={() => setOpenAccordion(openAccordion === 'stats' ? '' : 'stats')}
                >
                    <MatchStatsTable periods={periods} tab={tab} setTab={setTab} />
                </AccordionItem>
                {/* Accordion: Point By Point */}
                <AccordionItem
                    id="acc-point-by-point"
                    title="Point By Point"
                    // subtitle={`${pointByPointData.length} events`}
                    isOpen={openAccordion === 'point'}
                    onToggle={() => setOpenAccordion(openAccordion === 'point' ? '' : 'point')}
                >
                    <PointByPointViewer pointByPoint={pointByPointData} />
                </AccordionItem>

                {/* Accordion: Power Ranking */}
                <AccordionItem
                    id="acc-power-ranking"
                    title="Momentum"
                    // subtitle={`${powerRankingData.length} points`}
                    isOpen={openAccordion === 'power'}
                    onToggle={() => setOpenAccordion(openAccordion === 'power' ? '' : 'power')}
                >
                    <PowerRankingChart tennisPowerRankings={powerRankingData} />
                </AccordionItem>


            </div>
        </div>
    );
}