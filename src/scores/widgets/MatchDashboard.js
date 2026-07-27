import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaTrophy, FaChevronDown } from 'react-icons/fa';
import MatchHeader from './MatchHeader';
import MatchHeaderMobile from './MatchHeaderMobile';
import PointByPointViewer from './PointByPointViewer';
import PowerRankingChart from './PowerRankingChart';
import MatchStatsTable from './MatchStats';
import OddsPanel from './OddsPanel';
import FluidAd from '../../ads/FluidAd';
import FluidAdImage from '../../ads/FluidAdImage';
import InArticleAd from '../../ads/InArticleAd';
import SEO from '../../common/seo/SEO';

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
            if (response.status === 204) {
                return null;
            }
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
        <div className="mb-1">
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
                className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[9999px] mt-3 overflow-visible' : 'max-h-0 overflow-hidden'}`}

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
    const [openAccordion, setOpenAccordion] = useState(''); // 'point', 'power', 'stats'
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
                console.log("Loading match data...");
                const statsUrl = `/api/tennis/event/${eventId}/statistics`;
                const statsData = await fetchWithRetry(statsUrl, {}, 3, 300);
                if (!cancelled) setStats(statsData ?? null);

                await delay(delayMs);
                console.log("Loading event data...");
                const eventUrl = `/api/tennis/event/${eventId}`;
                const evtResp = await fetchWithRetry(eventUrl, {}, 3, 300);
                const evt = evtResp?.event ?? null;
                if (!cancelled) setEvent(evt);

                await delay(delayMs);

                console.log("Loading momentum data...");
                const graphUrl = `/api/tennis/event/${eventId}/graph`;
                const graphResp = await fetchWithRetry(graphUrl, {}, 3, 300);
                if (!cancelled) setPowerRankingData(graphResp?.tennisPowerRankings ?? []);

                await delay(delayMs);

                console.log("Loading point-by-point data...");
                const pbpUrl = `/api/tennis/event/${eventId}/point-by-point`;
                const pbpResp = await fetchWithRetry(pbpUrl, {}, 3, 300);
                if (!cancelled) setPointByPointData(pbpResp?.pointByPoint ?? []);

                await delay(delayMs);
                console.log("Loading odds data...");
                const oddsUrl = `/api/tennis/event/${eventId}/odds`;
                const oddsResp = await fetchWithRetry(oddsUrl, {}, 3, 300);
                if (!cancelled) setOddsData(oddsResp ?? []);
                if (evt?.status?.type === "finished") return stopPolling();

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

    if (stats && stats.error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
                <div className="text-red-400 text-lg mb-2">Error loading stats: {stats?.error || 'Unknown error'}</div>
            </div>
        );
    }

    const periods = stats && stats.statistics || [];
    const currentPeriod = periods[tab];
    const p1 = event?.homeTeam?.name || "Home";
    const p2 = event?.awayTeam?.name || "Away";
    return (
        <div className="min-h-screen bg-gray-900 py-4 px-1 sm:px-4 overflow-y-auto">
            <SEO
                title={`${p1} vs ${p2} - ${event?.tournament?.name} Live - Countrywise Tennis Scores & Live Updates`}
                description={`Live match stats, point by point data, Real-time tennis scores, rankings and updates. Follow ATP, WTA, and local tournaments.`}
                keywords={`tennis match stats, tennis scores, tennis, live scores, rankings, country wise ATP, WTA`}
                url={`${window.location.href}`}
            />
            <div className="w-full mx-auto bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-4 sm:p-8">
                <div className='flex flex-col w-full'>
                    <div className='w-full hidden md:flex'><MatchHeader event={event} oddsData={oddsData} /></div>
                    <div className='w-full md:hidden'><MatchHeaderMobile event={event} oddsData={oddsData} /></div>
                </div>
                {/* <OddsPanel eventId={eventId} /> */}
                {/* Accordion: Match Stats */}
                <AccordionItem
                    id="acc-match-stats"
                    title="Match Stats"
                    // subtitle={`${periods.length} periods`}
                    isOpen={openAccordion === 'stats'}
                    onToggle={() => setOpenAccordion(openAccordion === 'stats' ? '' : 'stats')}
                >
                    <MatchStatsTable periods={periods} tab={tab} setTab={setTab} p1={p1} p2={p2} />
                    <div className="my-4 p-4 border border-gray-700 bg-gray-800 text-center rounded-lg text-gray-300">
                        <InArticleAd />
                    </div>
                </AccordionItem>

                {/* Accordion: Point By Point */}
                <AccordionItem
                    id="acc-point-by-point"
                    title="Point By Point"
                    // subtitle={`${pointByPointData.length} events`}
                    isOpen={openAccordion === 'point'}
                    onToggle={() => setOpenAccordion(openAccordion === 'point' ? '' : 'point')}
                >
                    <PointByPointViewer pointByPoint={pointByPointData} p1={p1} p2={p2} />
                    <div className="my-4 p-4 border border-gray-700 bg-gray-800 text-center rounded-lg text-gray-300">
                        <FluidAdImage />
                    </div>

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
                    <div className="my-4 p-4 border border-gray-700 bg-gray-800 text-center rounded-lg text-gray-300">
                        <InArticleAd />
                    </div>
                </AccordionItem>


            </div>
        </div>
    );
}