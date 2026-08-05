import React, { useEffect, useMemo, useState } from 'react';
import Loader from '../common/stateHandlers/LoaderState';
import {
  getDailyCategories,
  getLiveATPRankings,
  getLiveMatches,
  getLiveWTARankings,
} from '../services/tennisApiService';

function safeArray(payload, candidateKeys = []) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  for (const key of candidateKeys) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  for (const value of Object.values(payload)) {
    if (Array.isArray(value)) return value;
  }

  return [];
}

function StatCard({ title, value, subtitle }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
      <div className="text-slate-400 text-sm">{title}</div>
      <div className="text-2xl font-bold text-white mt-1">{value}</div>
      <div className="text-xs text-slate-500 mt-2">{subtitle}</div>
    </div>
  );
}

export default function ApiOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liveEvents, setLiveEvents] = useState([]);
  const [dailyCategories, setDailyCategories] = useState([]);
  const [atpLive, setAtpLive] = useState([]);
  const [wtaLive, setWtaLive] = useState([]);

  const today = useMemo(() => {
    const date = new Date();
    return {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    };
  }, []);

  useEffect(() => {
    const fetchOverview = async () => {
      setLoading(true);
      setError('');

      try {
        const [eventsPayload, categoriesPayload, atpPayload, wtaPayload] = await Promise.all([
          getLiveMatches(),
          getDailyCategories(today.day, today.month, today.year),
          getLiveATPRankings(),
          getLiveWTARankings(),
        ]);

        setLiveEvents(safeArray(eventsPayload, ['events', 'matches']));
        setDailyCategories(safeArray(categoriesPayload, ['categories']));
        setAtpLive(safeArray(atpPayload, ['rows', 'rankings', 'standings']));
        setWtaLive(safeArray(wtaPayload, ['rows', 'rankings', 'standings']));
      } catch (err) {
        setError(err.message || 'Failed to load API overview');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [today.day, today.month, today.year]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Tennis API Overview</h1>
        <p className="text-slate-400 mt-2">
          Live snapshot from relevant APIs connected through your proxy layer.
        </p>
      </div>

      {error ? <div className="p-3 rounded border border-red-800 bg-red-950/40 text-red-200">{error}</div> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Live Events"
          value={liveEvents.length}
          subtitle="From /api/tennis/events/live"
        />
        <StatCard
          title="Today's Categories"
          value={dailyCategories.length}
          subtitle="From /api/tennis/calendar/{day}/{month}/{year}/categories"
        />
        <StatCard
          title="ATP Live Rows"
          value={atpLive.length}
          subtitle="From /api/tennis/rankings/atp/live"
        />
        <StatCard
          title="WTA Live Rows"
          value={wtaLive.length}
          subtitle="From /api/tennis/rankings/wta/live"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
          <h2 className="text-white font-semibold">ATP Live Top 10</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {atpLive.slice(0, 10).map((row, idx) => (
              <li key={`atp-${idx}`} className="text-slate-300 flex justify-between">
                <span>{row.player || row.name || 'Unknown'}</span>
                <span>{row.rank || row.ranking || '-'}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
          <h2 className="text-white font-semibold">WTA Live Top 10</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {wtaLive.slice(0, 10).map((row, idx) => (
              <li key={`wta-${idx}`} className="text-slate-300 flex justify-between">
                <span>{row.player || row.name || 'Unknown'}</span>
                <span>{row.rank || row.ranking || '-'}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
