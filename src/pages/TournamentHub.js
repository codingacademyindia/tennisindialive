import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import Loader from '../common/stateHandlers/LoaderState';
import ErrorMessage from '../common/stateHandlers/ErrorState';
import {
  getTournamentDetails,
  getTournamentInfoMetadata,
  getTournamentSeasons,
  getTournamentRounds,
  getTournamentDraw,
  getTournamentStandings,
  getTournamentUpcomingMatches,
  getTournamentLastMatches,
  getTournamentWinners,
  getTournamentImageUrl,
} from '../services/tennisApiService';

function pickFirstArray(source, preferredKeys = []) {
  if (Array.isArray(source)) {
    return source;
  }

  if (!source || typeof source !== 'object') {
    return [];
  }

  for (const key of preferredKeys) {
    if (Array.isArray(source[key])) {
      return source[key];
    }
  }

  for (const value of Object.values(source)) {
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

function pickFirstObject(source, preferredKeys = []) {
  if (!source || typeof source !== 'object') {
    return null;
  }

  for (const key of preferredKeys) {
    const value = source[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value;
    }
  }

  return source;
}

function readName(entity) {
  if (!entity || typeof entity !== 'object') {
    return 'Unknown';
  }

  return (
    entity.name ||
    entity.shortName ||
    entity.fullName ||
    entity.slug ||
    entity.title ||
    `#${entity.id || '-'}`
  );
}

function readSeasonId(item) {
  if (!item || typeof item !== 'object') {
    return null;
  }

  return item.id || item.seasonId || item.season?.id || null;
}

function StatBlock({ label, value, hint }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-xl font-semibold text-white">{value}</div>
      <div className="mt-2 text-xs text-slate-500">{hint}</div>
    </div>
  );
}

function MatchRow({ item }) {
  const event = pickFirstObject(item, ['event']) || item;
  const home = event.homeTeam || event.home || event.homeCompetitor || {};
  const away = event.awayTeam || event.away || event.awayCompetitor || {};
  const score =
    event.displayScore ||
    event.score ||
    `${event.homeScore ?? '-'} : ${event.awayScore ?? '-'}`;

  return (
    <li className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span>{readName(home)} vs {readName(away)}</span>
        <span className="font-semibold text-slate-100">{score}</span>
      </div>
      <div className="mt-1 text-xs text-slate-400">
        {event.status?.description || event.status || event.startTimestamp || event.startTime || 'Match'}
      </div>
    </li>
  );
}

function normalizeErrorMessage(reason) {
  const raw = reason?.message || String(reason || 'failed');

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed?.message) return String(parsed.message);
      } catch (_err) {
        // ignore JSON parse failure and use raw message
      }
    }
    return raw;
  }

  return 'failed';
}

function isRateLimitMessage(message) {
  return /rate limit/i.test(String(message || ''));
}

export default function TournamentHub() {
  const { tournamentId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const querySeasonId = searchParams.get('seasonId') || '';

  const [loading, setLoading] = useState(true);
  const [loadingSeason, setLoadingSeason] = useState(false);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);
  const [loadingCompleted, setLoadingCompleted] = useState(false);
  const [error, setError] = useState('');

  const [details, setDetails] = useState(null);
  const [meta, setMeta] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [winners, setWinners] = useState([]);

  const [selectedSeasonId, setSelectedSeasonId] = useState('');
  const [rounds, setRounds] = useState([]);
  const [draw, setDraw] = useState(null);
  const [standings, setStandings] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [completed, setCompleted] = useState([]);

  const [upcomingPage, setUpcomingPage] = useState(0);
  const [completedPage, setCompletedPage] = useState(0);
  const [drawRateLimited, setDrawRateLimited] = useState(false);
  const [standingsRateLimited, setStandingsRateLimited] = useState(false);

  const tournamentName = useMemo(() => {
    const base = pickFirstObject(details, ['tournament', 'data']) || details;
    const info = pickFirstObject(meta, ['seo', 'info']) || meta;
    const baseName = readName(base);
    const infoName = readName(info);
    if (baseName !== 'Unknown') return baseName;
    if (infoName !== 'Unknown') return infoName;
    return `Tournament ${tournamentId}`;
  }, [details, meta]);

  useEffect(() => {
    let cancelled = false;

    const loadCore = async () => {
      setLoading(true);
      setError('');

      try {
        const [detailsResult, metaResult, seasonsResult, winnersResult] = await Promise.allSettled([
          getTournamentDetails(tournamentId),
          getTournamentInfoMetadata(tournamentId),
          getTournamentSeasons(tournamentId),
          getTournamentWinners(tournamentId),
        ]);

        if (cancelled) return;

        const coreErrors = [];

        const detailsPayload = detailsResult.status === 'fulfilled' ? detailsResult.value : null;
        if (detailsResult.status === 'rejected') coreErrors.push(`details: ${normalizeErrorMessage(detailsResult.reason)}`);

        const metaPayload = metaResult.status === 'fulfilled' ? metaResult.value : null;
        if (metaResult.status === 'rejected') coreErrors.push(`info: ${normalizeErrorMessage(metaResult.reason)}`);

        const seasonsPayload = seasonsResult.status === 'fulfilled' ? seasonsResult.value : null;
        if (seasonsResult.status === 'rejected') coreErrors.push(`seasons: ${normalizeErrorMessage(seasonsResult.reason)}`);

        const winnersPayload = winnersResult.status === 'fulfilled' ? winnersResult.value : null;
        if (winnersResult.status === 'rejected') coreErrors.push(`winners: ${normalizeErrorMessage(winnersResult.reason)}`);

        const seasonsList = pickFirstArray(seasonsPayload, ['seasons', 'items', 'data']);
        setDetails(detailsPayload || {});
        setMeta(metaPayload || {});
        setSeasons(seasonsList);
        setWinners(pickFirstArray(winnersPayload, ['winners', 'items', 'data']));

        if (coreErrors.length > 0) {
          setError(`Some data could not be loaded (${coreErrors.join(' | ')})`);
        }

        const hasQuerySeason = querySeasonId && seasonsList.some((season) => String(readSeasonId(season)) === querySeasonId);
        const fallbackSeason = seasonsList[0] ? readSeasonId(seasonsList[0]) : '';
        const preferredSeason = hasQuerySeason ? querySeasonId : fallbackSeason;

        setSelectedSeasonId(preferredSeason ? String(preferredSeason) : '');
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load tournament data.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCore();

    return () => {
      cancelled = true;
    };
  }, [tournamentId, querySeasonId]);

  useEffect(() => {
    if (!selectedSeasonId) return;

    let cancelled = false;

    const loadSeasonMeta = async () => {
      setLoadingSeason(true);
      setDrawRateLimited(false);
      setStandingsRateLimited(false);
      setError('');

      try {
        const [roundsResult, drawResult, standingsResult] = await Promise.allSettled([
          getTournamentRounds(tournamentId, selectedSeasonId),
          getTournamentDraw(tournamentId, selectedSeasonId),
          getTournamentStandings(tournamentId, selectedSeasonId),
        ]);

        if (cancelled) return;

        const seasonErrors = [];

        const roundsPayload = roundsResult.status === 'fulfilled' ? roundsResult.value : null;
        if (roundsResult.status === 'rejected') {
          seasonErrors.push(`rounds: ${normalizeErrorMessage(roundsResult.reason)}`);
        }

        const drawPayload = drawResult.status === 'fulfilled' ? drawResult.value : null;
        if (drawResult.status === 'rejected') {
          const message = normalizeErrorMessage(drawResult.reason);
          if (isRateLimitMessage(message)) {
            setDrawRateLimited(true);
          } else {
            seasonErrors.push(`draw: ${message}`);
          }
        }

        const standingsPayload = standingsResult.status === 'fulfilled' ? standingsResult.value : null;
        if (standingsResult.status === 'rejected') {
          const message = normalizeErrorMessage(standingsResult.reason);
          if (isRateLimitMessage(message)) {
            setStandingsRateLimited(true);
          } else {
            seasonErrors.push(`standings: ${message}`);
          }
        }

        setRounds(pickFirstArray(roundsPayload, ['rounds', 'items', 'data']));
        setDraw(drawPayload || null);
        setStandings(pickFirstArray(standingsPayload, ['standings', 'rows', 'table', 'data']));

        if (seasonErrors.length > 0) {
          setError(`Some season data could not be loaded (${seasonErrors.join(' | ')})`);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load selected season.');
        }
      } finally {
        if (!cancelled) {
          setLoadingSeason(false);
        }
      }
    };

    loadSeasonMeta();

    return () => {
      cancelled = true;
    };
  }, [tournamentId, selectedSeasonId]);

  useEffect(() => {
    if (!selectedSeasonId) return;

    let cancelled = false;

    const loadUpcoming = async () => {
      setLoadingUpcoming(true);
      try {
        const payload = await getTournamentUpcomingMatches(tournamentId, selectedSeasonId, upcomingPage);
        if (cancelled) return;
        setUpcoming(pickFirstArray(payload, ['events', 'matches', 'items', 'data']));
      } catch (err) {
        if (!cancelled) {
          setUpcoming([]);
          const message = normalizeErrorMessage(err);
          if (!isRateLimitMessage(message)) {
            setError(`Upcoming matches could not be loaded (${message})`);
          }
        }
      } finally {
        if (!cancelled) {
          setLoadingUpcoming(false);
        }
      }
    };

    loadUpcoming();

    return () => {
      cancelled = true;
    };
  }, [tournamentId, selectedSeasonId, upcomingPage]);

  useEffect(() => {
    if (!selectedSeasonId) return;

    let cancelled = false;

    const loadCompleted = async () => {
      setLoadingCompleted(true);
      try {
        const payload = await getTournamentLastMatches(tournamentId, selectedSeasonId, completedPage);
        if (cancelled) return;
        setCompleted(pickFirstArray(payload, ['events', 'matches', 'items', 'data']));
      } catch (err) {
        if (!cancelled) {
          setCompleted([]);
          const message = normalizeErrorMessage(err);
          if (!isRateLimitMessage(message)) {
            setError(`Completed matches could not be loaded (${message})`);
          }
        }
      } finally {
        if (!cancelled) {
          setLoadingCompleted(false);
        }
      }
    };

    loadCompleted();

    return () => {
      cancelled = true;
    };
  }, [tournamentId, selectedSeasonId, completedPage]);

  const handleSeasonChange = (event) => {
    const value = event.target.value;
    setSelectedSeasonId(value);
    setUpcomingPage(0);
    setCompletedPage(0);

    if (value) {
      const next = new URLSearchParams(searchParams);
      next.set('seasonId', value);
      setSearchParams(next, { replace: true });
    } else {
      const next = new URLSearchParams(searchParams);
      next.delete('seasonId');
      setSearchParams(next, { replace: true });
    }
  };

  if (loading) {
    return <Loader />;
  }

  const seasonOptions = seasons.map((season) => {
    const seasonId = readSeasonId(season);
    return {
      id: String(seasonId),
      label: season?.year || season?.name || season?.slug || `Season ${seasonId}`,
    };
  });

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{tournamentName}</h1>
            <p className="mt-2 text-sm text-slate-400">
              Tournament hub with season selector, rounds, draw, standings, upcoming matches, completed matches, and winners.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={getTournamentImageUrl(tournamentId)}
              alt={`${tournamentName} logo`}
              className="h-16 w-16 rounded-xl border border-slate-700 bg-slate-950 object-contain p-2"
              onError={(event) => {
                event.currentTarget.src = getTournamentImageUrl(tournamentId, true);
              }}
            />
          </div>
        </div>
      </div>

      {error ? <ErrorMessage message={error} /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatBlock label="Seasons" value={seasons.length} hint="Available seasons" />
        <StatBlock label="Rounds" value={rounds.length} hint="For selected season" />
        <StatBlock label="Upcoming Matches" value={upcoming.length} hint={`Page ${upcomingPage + 1}`} />
        <StatBlock label="Completed Matches" value={completed.length} hint={`Page ${completedPage + 1}`} />
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
        <label className="mb-2 block text-sm font-medium text-slate-300" htmlFor="season-select">
          Season
        </label>
        <select
          id="season-select"
          value={selectedSeasonId}
          onChange={handleSeasonChange}
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 outline-none ring-0"
        >
          {seasonOptions.length === 0 ? <option value="">No season available</option> : null}
          {seasonOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-700 bg-slate-900 p-4">
          <h2 className="text-lg font-semibold text-white">Rounds</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {rounds.length === 0 ? (
              <span className="text-sm text-slate-400">No rounds found for this season.</span>
            ) : (
              rounds.slice(0, 30).map((round, index) => (
                <span key={`${round?.id || index}`} className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-200">
                  {round?.name || round?.slug || `Round ${round?.round || index + 1}`}
                </span>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-700 bg-slate-900 p-4">
          <h2 className="text-lg font-semibold text-white">Draw</h2>
          <p className="mt-2 text-sm text-slate-400">
            Draw preview data from cup-trees endpoint.
          </p>
          {drawRateLimited ? (
            <p className="mt-2 text-xs text-amber-300">Draw data is temporarily unavailable due to provider rate limits.</p>
          ) : null}
          <pre className="mt-3 max-h-56 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-300">
            {draw ? JSON.stringify(draw, null, 2) : 'No draw data'}
          </pre>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-700 bg-slate-900 p-4">
          <h2 className="text-lg font-semibold text-white">Standings</h2>
          {standingsRateLimited ? (
            <p className="mt-2 text-xs text-amber-300">Standings are temporarily unavailable due to provider rate limits.</p>
          ) : null}
          <div className="mt-3 overflow-auto">
            <table className="min-w-full text-sm text-slate-200">
              <thead>
                <tr className="border-b border-slate-700 text-left text-xs uppercase text-slate-400">
                  <th className="py-2 pr-3">Rank</th>
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Points</th>
                </tr>
              </thead>
              <tbody>
                {standings.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-3 text-slate-400">No standings available.</td>
                  </tr>
                ) : (
                  standings.slice(0, 30).map((row, index) => (
                    <tr key={`stand-${row?.id || index}`} className="border-b border-slate-800/70">
                      <td className="py-2 pr-3">{row?.rank || row?.position || index + 1}</td>
                      <td className="py-2 pr-3">{readName(row?.team || row?.player || row)}</td>
                      <td className="py-2 pr-3">{row?.points || row?.value || row?.score || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-slate-700 bg-slate-900 p-4">
          <h2 className="text-lg font-semibold text-white">Winners</h2>
          <ul className="mt-3 space-y-2">
            {winners.length === 0 ? (
              <li className="text-sm text-slate-400">No winners data available.</li>
            ) : (
              winners.slice(0, 20).map((winner, index) => (
                <li key={`winner-${winner?.id || index}`} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200">
                  <div>{readName(winner?.team || winner?.player || winner)}</div>
                  <div className="mt-1 text-xs text-slate-400">
                    {winner?.season?.year || winner?.year || winner?.seasonName || 'Season'}
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-700 bg-slate-900 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Upcoming Matches</h2>
            <div className="flex gap-2">
              <button
                className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-200 disabled:opacity-40"
                disabled={upcomingPage === 0 || loadingUpcoming}
                onClick={() => setUpcomingPage((page) => Math.max(0, page - 1))}
              >
                Prev
              </button>
              <button
                className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-200 disabled:opacity-40"
                disabled={loadingUpcoming}
                onClick={() => setUpcomingPage((page) => page + 1)}
              >
                Next
              </button>
            </div>
          </div>

          <ul className="mt-3 space-y-2">
            {upcoming.length === 0 ? (
              <li className="text-sm text-slate-400">No upcoming matches for this page.</li>
            ) : (
              upcoming.map((item, idx) => <MatchRow key={`up-${item?.id || idx}`} item={item} />)
            )}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-700 bg-slate-900 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Completed Matches</h2>
            <div className="flex gap-2">
              <button
                className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-200 disabled:opacity-40"
                disabled={completedPage === 0 || loadingCompleted}
                onClick={() => setCompletedPage((page) => Math.max(0, page - 1))}
              >
                Prev
              </button>
              <button
                className="rounded border border-slate-600 px-2 py-1 text-xs text-slate-200 disabled:opacity-40"
                disabled={loadingCompleted}
                onClick={() => setCompletedPage((page) => page + 1)}
              >
                Next
              </button>
            </div>
          </div>

          <ul className="mt-3 space-y-2">
            {completed.length === 0 ? (
              <li className="text-sm text-slate-400">No completed matches for this page.</li>
            ) : (
              completed.map((item, idx) => <MatchRow key={`done-${item?.id || idx}`} item={item} />)
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
