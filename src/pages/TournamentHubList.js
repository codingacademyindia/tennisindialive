import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Loader from '../common/stateHandlers/LoaderState';
import ErrorMessage from '../common/stateHandlers/ErrorState';
import {
  getAtpTournaments,
  getCalendarForMonth,
  getTournamentCategories,
  getTournamentsByCategory,
  getTournamentDetails,
} from '../services/tennisApiService';

const PAGE_SIZE = 20;
const DETAIL_LOOKUP_DELAY_MS = 220;

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

function pickArray(payload, preferredKeys = []) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  for (const key of preferredKeys) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  for (const value of Object.values(payload)) {
    if (Array.isArray(value)) return value;
  }

  return [];
}

function extractTournaments(payload) {
  const daily = pickArray(payload, ['dailyUniqueTournaments']);
  const byId = new Map();

  daily.forEach((dayItem) => {
    const date = dayItem?.date || '';
    const ids = Array.isArray(dayItem?.uniqueTournamentIds) ? dayItem.uniqueTournamentIds : [];

    ids.forEach((id) => {
      if (!byId.has(id)) {
        byId.set(id, {
          id,
          days: 0,
          firstDate: date,
          lastDate: date,
        });
      }

      const row = byId.get(id);
      row.days += 1;
      row.lastDate = date || row.lastDate;
    });
  });

  return Array.from(byId.values()).sort((a, b) => {
    if (b.days !== a.days) return b.days - a.days;
    return a.id - b.id;
  });
}

function extractCatalogMap(payload, fallbackCategoryName = '') {
  const rows = pickArray(payload, ['uniqueTournaments', 'tournaments', 'items', 'data']);
  const map = {};

  rows.forEach((row) => {
    const id = row?.id || row?.uniqueTournament?.id;
    if (!id) return;

    const name =
      row?.name ||
      row?.uniqueTournament?.name ||
      row?.shortName ||
      row?.slug ||
      `Tournament ${id}`;

    const categoryName =
      row?.category?.name ||
      row?.uniqueTournament?.category?.name ||
      fallbackCategoryName ||
      '-';

    if (!map[id]) {
      map[id] = { name, categoryName };
    }
  });

  return map;
}

function extractDetailMeta(payload, fallbackId) {
  const row =
    payload?.tournament ||
    payload?.uniqueTournament ||
    payload?.meta?.uniqueTournament ||
    payload?.meta?.tournament ||
    payload?.data?.tournament ||
    payload?.data?.uniqueTournament ||
    payload?.data ||
    payload ||
    {};
  const id = row?.id || fallbackId;
  const name =
    row?.name ||
    row?.shortName ||
    row?.slug ||
    `Tournament ${fallbackId}`;
  const categoryName =
    row?.category?.name ||
    payload?.meta?.category ||
    payload?.category?.name ||
    '-';
  const startDateTimestamp = row?.startDateTimestamp || payload?.meta?.startDateTimestamp || null;
  const endDateTimestamp = row?.endDateTimestamp || payload?.meta?.endDateTimestamp || null;
  const startDate =
    typeof startDateTimestamp === 'number'
      ? new Date(startDateTimestamp * 1000).toISOString().slice(0, 10)
      : (row?.startDate || payload?.meta?.startDate || '');
  const endDate =
    typeof endDateTimestamp === 'number'
      ? new Date(endDateTimestamp * 1000).toISOString().slice(0, 10)
      : (row?.endDate || payload?.meta?.endDate || '');

  return {
    id,
    name,
    categoryName,
    startDate,
    endDate,
  };
}

const MONTH_FULL_NAMES = {
  jan: 'January', january: 'January',
  feb: 'February', february: 'February',
  mar: 'March', march: 'March',
  apr: 'April', april: 'April',
  may: 'May',
  jun: 'June', june: 'June',
  jul: 'July', july: 'July',
  aug: 'August', august: 'August',
  sep: 'September', sept: 'September', september: 'September',
  oct: 'October', october: 'October',
  nov: 'November', november: 'November',
  dec: 'December', december: 'December',
};

function parseDatePart(text = '') {
  const match = String(text).trim().match(/^(\d{1,2})(?:\s+([A-Za-z]+))?(?:,?\s*(\d{4}))?$/);
  if (!match) return null;

  const [, day, monthRaw, year] = match;
  const month = monthRaw ? (MONTH_FULL_NAMES[monthRaw.toLowerCase()] || null) : null;

  return { day, month, year: year || null };
}

function formatDatePart(part, fallbackMonth, fallbackYear) {
  if (!part) return '';
  const month = part.month || fallbackMonth || '';
  const year = part.year || fallbackYear || '';
  return [part.day, month, year].filter(Boolean).join(' ');
}

function parseDateRangeText(dateText = '') {
  if (!dateText) {
    return { startDate: '', endDate: '' };
  }

  const normalized = String(dateText).replace(/[–—]/g, '-');
  const segments = normalized
    .split(/\s+-\s+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (segments.length === 0) {
    return { startDate: '', endDate: '' };
  }

  const startRaw = segments[0];
  const endRaw = segments[segments.length - 1];

  const startPart = parseDatePart(startRaw);
  const endPart = parseDatePart(endRaw);

  const startDate = formatDatePart(startPart, endPart?.month, endPart?.year) || startRaw;
  const endDate = formatDatePart(endPart, startPart?.month, startPart?.year) || endRaw;

  return { startDate, endDate };
}

const CATEGORY_STYLES = {
  'Grand Slam': 'bg-amber-500/15 text-amber-300 border border-amber-500/40',
  'ATP Finals': 'bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/40',
  'WTA Finals': 'bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/40',
  'Masters 1000': 'bg-violet-500/15 text-violet-300 border border-violet-500/40',
  'WTA 1000': 'bg-violet-500/15 text-violet-300 border border-violet-500/40',
  'ATP 500': 'bg-sky-500/15 text-sky-300 border border-sky-500/40',
  'WTA 500': 'bg-sky-500/15 text-sky-300 border border-sky-500/40',
  'ATP 250': 'bg-slate-500/15 text-slate-300 border border-slate-500/40',
  'WTA 250': 'bg-slate-500/15 text-slate-300 border border-slate-500/40',
  'WTA 125': 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/40',
  'WTA Tour': 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40',
  'United Cup': 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40',
  'Davis Cup': 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40',
  'Laver Cup': 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40',
};

function CategoryBadge({ category }) {
  if (!category) return <span className="text-slate-500">-</span>;
  const style = CATEGORY_STYLES[category] || 'bg-slate-500/15 text-slate-300 border border-slate-500/40';
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}>
      {category}
    </span>
  );
}

function normalizeAtpRows(payload, fallbackTourType = 'atp') {
  const rows = Array.isArray(payload?.rows) ? payload.rows : [];
  const tournaments = [];
  const metaMap = {};

  rows.forEach((row) => {
    const eventIdText = String(row?.event_id || '').trim();
    const eventIdNum = Number.parseInt(eventIdText, 10);
    const fallbackId = row?.id;
    const tournamentId = Number.isFinite(eventIdNum) ? eventIdNum : fallbackId;

    if (!tournamentId) return;

    const { startDate, endDate } = parseDateRangeText(row?.date_text || '');
    const categoryName = row?.category || String(row?.tour_type || fallbackTourType).toUpperCase();

    tournaments.push({
      id: tournamentId,
      days: 0,
      firstDate: startDate,
      lastDate: endDate,
      dbRowId: row?.id,
      isLinkable: Number.isFinite(eventIdNum),
      categoryName,
    });

    metaMap[tournamentId] = {
      name: row?.title_text || row?.event_slug || `Tournament ${tournamentId}`,
      categoryName,
      startDate,
      endDate,
      overviewUrl: row?.overview_url || '',
      sourceUrl: row?.source_url || '',
    };
  });

  return { tournaments, metaMap };
}

export default function TournamentHubList({ tourType = 'atp' }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const today = useMemo(() => new Date(), []);
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const queryMonth = Number(searchParams.get('month'));
  const queryYear = Number(searchParams.get('year'));

  const selectedMonth = Number.isFinite(queryMonth) && queryMonth >= 1 && queryMonth <= 12 ? queryMonth : currentMonth;
  const selectedYear = Number.isFinite(queryYear) && queryYear >= 2020 && queryYear <= currentYear + 1 ? queryYear : currentYear;

  const [loading, setLoading] = useState(true);
  const [loadingNames, setLoadingNames] = useState(false);
  const [error, setError] = useState('');
  const [tournaments, setTournaments] = useState([]);
  const [tournamentMetaMap, setTournamentMetaMap] = useState({});
  const [page, setPage] = useState(1);
  const [catalogRetryToken, setCatalogRetryToken] = useState(0);
  const [detailLoadingMap, setDetailLoadingMap] = useState({});
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const attemptedDetailIdsRef = useRef(new Set());
  const sourceMode = 'atp-db';
  const tourTypeLabel = String(tourType || 'atp').toUpperCase();
  const tourTypeName = tourTypeLabel === 'WTA' ? 'WTA' : 'ATP';

  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = currentYear + 1; y >= 2020; y -= 1) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    tournaments.forEach((item) => {
      const category = tournamentMetaMap[item.id]?.categoryName || item.categoryName || (tourTypeName === 'WTA' ? 'WTA' : 'ATP 250');
      counts[category] = (counts[category] || 0) + 1;
    });
    return counts;
  }, [tournaments, tournamentMetaMap]);

  const categoryFilterOptions = useMemo(() => {
    return Object.keys(categoryCounts).sort((a, b) => a.localeCompare(b));
  }, [categoryCounts]);

  const filteredTournaments = useMemo(() => {
    const search = searchInput.trim().toLowerCase();

    return tournaments.filter((item) => {
      const meta = tournamentMetaMap[item.id] || {};
      const category = meta.categoryName || item.categoryName || (tourTypeName === 'WTA' ? 'WTA' : 'ATP 250');

      if (categoryFilter !== 'all' && category !== categoryFilter) {
        return false;
      }

      if (search) {
        const name = (meta.name || `Tournament ${item.id}`).toLowerCase();
        if (!name.includes(search)) return false;
      }

      return true;
    });
  }, [tournaments, tournamentMetaMap, categoryFilter, searchInput]);

  const totalPages = Math.max(1, Math.ceil(filteredTournaments.length / PAGE_SIZE));
  const visibleTournaments = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredTournaments.slice(start, start + PAGE_SIZE);
  }, [filteredTournaments, page]);

  const unresolvedOnPageCount = useMemo(() => {
    return visibleTournaments.filter((item) => !tournamentMetaMap[item.id]).length;
  }, [visibleTournaments, tournamentMetaMap]);

  const unresolvedTotalCount = useMemo(() => {
    return tournaments.filter((item) => !tournamentMetaMap[item.id]).length;
  }, [tournaments, tournamentMetaMap]);

  useEffect(() => {
    setPage(1);
  }, [categoryFilter, searchInput]);

  useEffect(() => {
    let cancelled = false;

    const loadMonth = async () => {
      setLoading(true);
      setError('');

      try {
        if (sourceMode === 'atp-db') {
          const payload = await getAtpTournaments({
            limit: 500,
            offset: 0,
            month: selectedMonth,
            year: selectedYear,
            tourType,
          });

          if (cancelled) return;

          const normalized = normalizeAtpRows(payload, tourType);
          setTournaments(normalized.tournaments);
          setTournamentMetaMap(normalized.metaMap);
          setPage(1);
          return;
        }

        const payload = await getCalendarForMonth(selectedMonth, selectedYear);
        if (cancelled) return;
        setTournaments(extractTournaments(payload));
        setPage(1);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load tournaments for selected month.');
          setTournaments([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadMonth();
    return () => {
      cancelled = true;
    };
  }, [selectedMonth, selectedYear, sourceMode]);

  useEffect(() => {
    if (sourceMode === 'atp-db') {
      setLoadingNames(false);
      return;
    }

    let cancelled = false;

    const loadCatalog = async () => {
      setLoadingNames(true);

      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const merged = {};

      try {
        const categoriesPayload = await getTournamentCategories();
        const categories = pickArray(categoriesPayload, ['categories', 'items', 'data']);

        for (const category of categories) {
          if (cancelled) return;

          const categoryId = category?.id;
          if (categoryId === undefined || categoryId === null) continue;

          try {
            const payload = await getTournamentsByCategory(categoryId);
            if (cancelled) return;

            const map = extractCatalogMap(payload, category?.name || '-');
            Object.assign(merged, map);
          } catch (_err) {
            // Continue resolving from other categories even if this one is throttled.
          }

          // Keep request rate gentle for upstream provider.
          await sleep(120);
        }
      } finally {
        if (!cancelled) {
          if (Object.keys(merged).length > 0) {
            setTournamentMetaMap((prev) => ({ ...merged, ...prev }));
          }
          setLoadingNames(false);
        }
      }
    };

    loadCatalog();

    return () => {
      cancelled = true;
    };
  }, [catalogRetryToken, sourceMode]);

  useEffect(() => {
    if (sourceMode === 'atp-db') return;

    const unresolvedVisibleIds = visibleTournaments
      .map((item) => item.id)
      .filter((id) => !tournamentMetaMap[id] && !attemptedDetailIdsRef.current.has(id));

    if (unresolvedVisibleIds.length === 0) return;

    let cancelled = false;

    const loadVisibleDetails = async () => {
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const merged = {};

      for (const id of unresolvedVisibleIds) {
        attemptedDetailIdsRef.current.add(id);
        if (!cancelled) {
          setDetailLoadingMap((prev) => ({ ...prev, [id]: true }));
        }

        try {
          const payload = await getTournamentDetails(id);
          if (cancelled) return;
          const meta = extractDetailMeta(payload, id);
          merged[id] = {
            name: meta.name,
            categoryName: meta.categoryName,
            startDate: meta.startDate,
            endDate: meta.endDate,
          };
        } catch (_err) {
          // Keep fallback value if throttled.
        } finally {
          if (!cancelled) {
            setDetailLoadingMap((prev) => ({ ...prev, [id]: false }));
          }
        }

        await sleep(DETAIL_LOOKUP_DELAY_MS);
      }

      if (!cancelled && Object.keys(merged).length > 0) {
        setTournamentMetaMap((prev) => ({ ...prev, ...merged }));
      }
    };

    loadVisibleDetails();

    return () => {
      cancelled = true;
    };
  }, [visibleTournaments, tournamentMetaMap, sourceMode]);

  const handleMonthChange = (event) => {
    const month = event.target.value;
    const next = new URLSearchParams(searchParams);
    next.set('month', month);
    next.set('year', String(selectedYear));
    setSearchParams(next, { replace: true });
  };

  const handleYearChange = (event) => {
    const year = event.target.value;
    const next = new URLSearchParams(searchParams);
    next.set('month', String(selectedMonth));
    next.set('year', year);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{tourTypeLabel} Tournaments</h1>
            <p className="mt-1 text-sm text-slate-400">Browse monthly {tourTypeName} tournaments and open detailed tournament pages.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div>
              <label htmlFor="month-filter" className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Month</label>
              <select
                id="month-filter"
                value={selectedMonth}
                onChange={handleMonthChange}
                className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
              >
                {MONTHS.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="year-filter" className="mb-1 block text-xs uppercase tracking-wide text-slate-400">Year</label>
              <select
                id="year-filter"
                value={selectedYear}
                onChange={handleYearChange}
                className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {!loading && tournaments.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                categoryFilter === 'all'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'border border-slate-600 text-slate-300 hover:bg-slate-800'
              }`}
            >
              All ({tournaments.length})
            </button>
            {categoryFilterOptions.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setCategoryFilter(category)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  categoryFilter === category
                    ? 'bg-cyan-500 text-slate-950'
                    : 'border border-slate-600 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {category} ({categoryCounts[category]})
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {error ? <ErrorMessage message={error} /> : null}

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-white">Tournament List</h2>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search tournament name..."
              className="w-56 rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500"
            />
            <span className="whitespace-nowrap text-sm text-slate-400">{filteredTournaments.length} of {tournaments.length}</span>
          </div>
        </div>

        {loading ? (
          <div>
            <Loader />
            <p className="mt-2 text-xs text-slate-500">Loading {tourTypeName} tournaments...</p>
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm text-slate-200">
              <thead>
                <tr className="border-b border-slate-700 text-left text-xs uppercase text-slate-400">
                  <th className="py-2 pr-3">Tournament</th>
                  <th className="py-2 pr-3">Category</th>
                  <th className="py-2 pr-3">Start Date</th>
                  <th className="py-2 pr-3">End Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTournaments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-3 text-slate-400">
                      {tournaments.length === 0
                        ? 'No tournaments found for selected month/year.'
                        : 'No tournaments match the current filter/search.'}
                    </td>
                  </tr>
                ) : (
                  visibleTournaments.map((item) => {
                    const meta = tournamentMetaMap[item.id] || {};
                    const isRowLoading = !!detailLoadingMap[item.id] || (loadingNames && !meta.name);
                    const displayName = meta.name || `Tournament ${item.id}`;
                    const displayCategory = meta.categoryName || item.categoryName || '-';
                    const displayStartDate = meta.startDate || item.firstDate || '-';
                    const displayEndDate = meta.endDate || item.lastDate || '-';
                    const linkUrl = meta.overviewUrl || meta.sourceUrl || '';

                    return (
                    <tr key={item.id} className="border-b border-slate-800/70 hover:bg-slate-800/40">
                      <td className="py-2 pr-3 font-medium text-slate-100">
                        {isRowLoading ? (
                          <span className="inline-flex items-center gap-2 text-slate-400">
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-300" aria-hidden="true" />
                            <span>Loading name...</span>
                          </span>
                        ) : linkUrl ? (
                          <a
                            href={linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-300 hover:text-cyan-200 hover:underline"
                          >
                            {displayName}
                          </a>
                        ) : (
                          displayName
                        )}
                      </td>
                      <td className="py-2 pr-3">
                        {isRowLoading ? (
                          <span className="text-slate-500">Loading...</span>
                        ) : (
                          <CategoryBadge category={displayCategory} />
                        )}
                      </td>
                      <td className="py-2 pr-3 whitespace-nowrap">{displayStartDate}</td>
                      <td className="py-2 pr-3 whitespace-nowrap">{displayEndDate}</td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {filteredTournaments.length > 0 ? (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                className="rounded border border-slate-600 px-3 py-1 text-xs text-slate-200 disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Prev
              </button>
              <button
                className="rounded border border-slate-600 px-3 py-1 text-xs text-slate-200 disabled:opacity-40"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              >
                Next
              </button>
            </div>
          </div>
        ) : null}

        {loadingNames ? <p className="mt-2 text-xs text-slate-500">Loading tournament catalog...</p> : null}

        {!loadingNames && unresolvedOnPageCount > 0 ? (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-slate-500">{unresolvedOnPageCount} names on this page are still unresolved.</p>
            <button
              className="rounded border border-slate-600 px-3 py-1 text-xs text-slate-200 hover:bg-slate-800"
              onClick={() => setCatalogRetryToken((token) => token + 1)}
            >
              Retry names
            </button>
          </div>
        ) : null}

        {!loadingNames && unresolvedTotalCount > 0 ? (
          <p className="mt-2 text-xs text-slate-500">Unresolved across month: {unresolvedTotalCount} tournaments (provider throttling).</p>
        ) : null}
      </div>
    </div>
  );
}
