import React, { useEffect, useMemo, useState } from 'react';

/**
 * Compact, responsive Odds panel for Match Dashboard.
 *
 * Usage:
 * - <OddsPanel oddsData={oddsResponse} />
 * OR
 * - <OddsPanel eventId={15190800} /> (requires REACT_APP_RAPIDAPI_KEY in env)
 *
 * The component accepts either an oddsData prop (preferred when parent already fetched)
 * or an eventId to fetch odds itself from the Tennis API.
 *
 * Visual decisions:
 * - Compact card per market (stacked on narrow screens, 2-up on sm+).
 * - Inline legend on the header explaining fractional/decimal/prob.
 * - Each choice shows fractional odds, decimal (rounded to 2dp) and implied probability %.
 * - Favorite (winning === true) is highlighted.
 * - Suspended markets are dimmed.
 *
 * Note: This component uses Tailwind classes. If you're not using Tailwind, convert styles to your CSS.
 */

// Helper: parse fractional string like "1/3" or "9/4" -> decimal
function fractionalToDecimal(frac) {
    if (!frac || typeof frac !== 'string') return null;
    const parts = frac.split('/');
    if (parts.length === 2) {
        const a = Number(parts[0]);
        const b = Number(parts[1]);
        if (!Number.isNaN(a) && !Number.isNaN(b) && b !== 0) {
            return 1 + a / b; // bookmaker fractional -> decimal conversion
        }
    }
    // try parse as decimal already
    const asNum = Number(frac);
    return Number.isFinite(asNum) ? asNum : null;
}

function decimalToPercent(dec) {
    if (!dec || !Number.isFinite(dec) || dec === 0) return null;
    return (1 / dec) * 100;
}

async function fetchWithRetry(url, options = {}, retries = 2, backoffMs = 400) {
    for (let i = 0; i <= retries; i++) {
        try {
            const resp = await fetch(url, options);
            if (!resp.ok) {
                const text = await resp.text().catch(() => resp.statusText);
                throw new Error(text || `HTTP ${resp.status}`);
            }
            return await resp.json();
        } catch (err) {
            if (i === retries) throw err;
            await new Promise((r) => setTimeout(r, backoffMs * Math.pow(2, i)));
        }
    }
    throw new Error('Failed to fetch');
}

export default function OddsPanel({ eventId, oddsData }) {
    const [data, setData] = useState(oddsData || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // If parent passes oddsData, prefer that. Otherwise, fetch if eventId provided.
    useEffect(() => {
        let cancelled = false;
        async function load() {
            if (oddsData) {
                setData(oddsData);
                setError('');
                setLoading(false);
                return;
            }
            if (!eventId) return;
            setLoading(true);
            setError('');
            const url = `https://tennisapi1.p.rapidapi.com/api/tennis/event/${eventId}/odds`;
            const headers = {
                'x-rapidapi-key': process.env.REACT_APP_RAPIDAPI_KEY || '',
                'x-rapidapi-host': 'tennisapi1.p.rapidapi.com',
                'Accept': 'application/json'
            };
            try {
                const resp = await fetchWithRetry(url, { headers }, 2, 400);
                if (!cancelled) setData(resp);
            } catch (err) {
                if (!cancelled) setError(err.message || 'Failed to load odds');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [eventId, oddsData]);

    // compute markets array
    const markets = useMemo(() => {
        if (!data || !Array.isArray(data.markets)) return [];
        return data.markets;
    }, [data]);

    // compute book margin per market (optional)
    function computeMargin(choices) {
        if (!choices || !choices.length) return null;
        let sum = 0;
        choices.forEach((c) => {
            const dec = fractionalToDecimal(c.fractionalValue) ?? fractionalToDecimal(c.initialFractionalValue) ?? null;
            if (dec && dec > 0) sum += 1 / dec;
        });
        if (sum === 0) return null;
        return (sum - 1) * 100; // percentage margin
    }

    if (!eventId && !oddsData) return null; // nothing to show

    return (
        <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-blue-300">Odds</h4>
                <div className="flex items-center gap-3 text-[11px] text-gray-300">
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-white/10 rounded-sm inline-block" />
                        <span>Fractional</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-3 h-3 bg-white/10 rounded-sm inline-block" />
                        <span>Decimal</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1">
                        <span className="text-[10px] text-gray-400">Prob %</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {loading && (
                    <div className="col-span-full bg-gray-800 rounded-md p-3 text-xs text-gray-400">
                        Loading odds...
                    </div>
                )}

                {error && (
                    <div className="col-span-full bg-red-900/40 rounded-md p-3 text-xs text-red-300">
                        {error}
                    </div>
                )}

                {!loading && markets.length === 0 && !error && (
                    <div className="col-span-full bg-gray-800 rounded-md p-3 text-xs text-gray-400">
                        No odds available
                    </div>
                )}

                {markets.map((m) => {
                    const suspended = !!m.suspended;
                    const margin = computeMargin(m.choices);

                    return (
                        <div
                            key={String(m.id ?? m.marketId ?? Math.random())}
                            className={`bg-gray-800 rounded-md border border-gray-700 p-2 ${suspended ? 'opacity-60' : ''}`}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className="text-xs font-semibold text-blue-200 truncate">{m.marketName}</div>
                                        {m.marketPeriod && (
                                            <div className="text-[10px] text-gray-400 px-1.5 py-0.5 rounded bg-gray-900/40">
                                                {m.marketPeriod}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-gray-400 mt-0.5">{m.marketGroup}</div>
                                </div>

                                <div className="flex flex-col items-end text-right">
                                    <div className={`text-[11px] ${m.isLive ? 'text-yellow-300' : 'text-gray-400'}`}>
                                        {m.isLive ? 'LIVE' : (suspended ? 'SUSPENDED' : 'PRE-MATCH')}
                                    </div>
                                    {margin != null && (
                                        <div className="text-[10px] text-gray-500 mt-1">{margin.toFixed(1)}% margin</div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-2">
                                {/* choices row: compact and responsive */}
                                <div className="flex flex-wrap gap-2">
                                    {m.choices && m.choices.map((c, idx) => {
                                        const frac = c.fractionalValue || c.initialFractionalValue || '';
                                        const dec = fractionalToDecimal(frac);
                                        const prob = dec ? decimalToPercent(dec) : null;
                                        const isFav = !!c.winning;
                                        return (
                                            <div
                                                key={idx}
                                                className={`flex items-center gap-2 rounded-md px-2 py-1 bg-gray-900 border border-gray-700 text-[12px] ${isFav ? 'ring-1 ring-blue-500 bg-gradient-to-br from-gray-900/70 to-gray-900' : ''}`}
                                                title={`${c.name} — ${frac} (${dec ? dec.toFixed(2) : '-'})`}
                                            >
                                                <div className={`w-2 h-2 rounded-full ${isFav ? 'bg-yellow-400' : 'bg-white/10'}`} />
                                                <div className="flex flex-col min-w-[56px]">
                                                    <div className="text-xs text-blue-200 font-semibold truncate">{c.name}</div>
                                                    <div className="text-[10px] text-gray-400 truncate">
                                                        {frac}
                                                        {dec ? ` • ${dec.toFixed(2)}` : ''}
                                                    </div>
                                                </div>

                                                <div className="hidden sm:block text-[10px] text-gray-400 ml-1 w-12 text-right">
                                                    {prob ? `${prob.toFixed(1)}%` : '-'}
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