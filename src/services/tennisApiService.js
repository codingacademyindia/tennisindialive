function buildUrl(path, params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

const responseCache = new Map();
const inflightRequests = new Map();

async function getJson(url, cacheMs = 0) {
  const now = Date.now();

  if (cacheMs > 0) {
    const cached = responseCache.get(url);
    if (cached && cached.expiresAt > now) {
      return cached.data;
    }
    responseCache.delete(url);
  }

  if (inflightRequests.has(url)) {
    return inflightRequests.get(url);
  }

  const requestPromise = (async () => {
  const response = await fetch(url);
  const text = await response.text().catch(() => '');

  if (!response.ok) {
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  // Some proxy endpoints legitimately return 204/empty payloads.
  if (!text || !text.trim()) {
    const emptyPayload = {};
    if (cacheMs > 0) {
      responseCache.set(url, { data: emptyPayload, expiresAt: Date.now() + cacheMs });
    }
    return emptyPayload;
  }

  try {
    const payload = JSON.parse(text);
    if (cacheMs > 0) {
      responseCache.set(url, { data: payload, expiresAt: Date.now() + cacheMs });
    }
    return payload;
  } catch (_error) {
    throw new Error(`Invalid JSON response from ${url}`);
  }
  })();

  inflightRequests.set(url, requestPromise);
  try {
    return await requestPromise;
  } finally {
    inflightRequests.delete(url);
  }
}

export async function proxyGet(path, params = {}, options = {}) {
  const { cacheMs = 0 } = options;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return getJson(buildUrl(normalizedPath, params), cacheMs);
}

export async function getDailyCategories(day, month, year) {
  return proxyGet(`/api/tennis/calendar/${day}/${month}/${year}/categories`);
}

export async function getCalendarForMonth(month, year) {
  return proxyGet(`/api/tennis/calendar/${month}/${year}`, {}, { cacheMs: 30000 });
}

export async function getLiveMatches() {
  return proxyGet('/api/tennis/events/live');
}

export async function getMatchDetails(eventId) {
  return proxyGet(`/api/tennis/event/${eventId}`);
}

export async function getMatchStatistics(eventId) {
  return proxyGet(`/api/tennis/event/${eventId}/statistics`);
}

export async function getMatchDuel(eventId) {
  return proxyGet(`/api/tennis/event/${eventId}/duel`);
}

export async function getMatchOdds(eventId) {
  return proxyGet(`/api/tennis/event/${eventId}/odds`);
}

export async function searchTennis(term, page = 0) {
  return proxyGet(`/api/tennis/search/${encodeURIComponent(term)}`, { page });
}

export async function getPlayerDetails(playerId) {
  return proxyGet(`/api/tennis/player/${playerId}`);
}

export async function getPlayerRankings(playerId) {
  return proxyGet(`/api/tennis/player/${playerId}/rankings`);
}

export async function getPlayerEventsNear(playerId) {
  return proxyGet(`/api/tennis/player/${playerId}/events/near`);
}

export async function getTournamentDetails(tournamentId) {
  return proxyGet(`/api/tennis/tournament/${tournamentId}`, {}, { cacheMs: 10 * 60 * 1000 });
}

export async function getTournamentCategories() {
  return proxyGet('/api/tennis/tournament/categories', {}, { cacheMs: 30 * 60 * 1000 });
}

export async function getTournamentsByCategory(categoryId) {
  return proxyGet(`/api/tennis/tournament/all/category/${categoryId}`, {}, { cacheMs: 30 * 60 * 1000 });
}

export async function getTournamentInfoMetadata(tournamentId) {
  return proxyGet(`/api/tennis/tournament/${tournamentId}/info`, {}, { cacheMs: 5 * 60 * 1000 });
}

export async function getTournamentWinners(tournamentId) {
  return proxyGet(`/api/tennis/tournament/${tournamentId}/winners`, {}, { cacheMs: 2 * 60 * 1000 });
}

export async function getTournamentSeasons(tournamentId) {
  return proxyGet(`/api/tennis/tournament/${tournamentId}/seasons`, {}, { cacheMs: 5 * 60 * 1000 });
}

export async function getTournamentRounds(tournamentId, seasonId) {
  return proxyGet(`/api/tennis/tournament/${tournamentId}/season/${seasonId}/rounds`);
}

export async function getTournamentDraw(tournamentId, seasonId) {
  return proxyGet(`/api/tennis/tournament/${tournamentId}/season/${seasonId}/cup-trees`);
}

export async function getTournamentStandings(tournamentId, seasonId) {
  return proxyGet(`/api/tennis/tournament/${tournamentId}/season/${seasonId}/standings/total`);
}

export async function getTournamentUpcomingMatches(tournamentId, seasonId, page = 0) {
  return proxyGet(`/api/tennis/tournament/${tournamentId}/season/${seasonId}/events/next/${page}`);
}

export async function getTournamentLastMatches(tournamentId, seasonId, page = 0) {
  return proxyGet(`/api/tennis/tournament/${tournamentId}/season/${seasonId}/events/last/${page}`);
}

export function getTournamentImageUrl(tournamentId, dark = false) {
  return dark
    ? `/api/tennis/tournament/${tournamentId}/image/dark`
    : `/api/tennis/tournament/${tournamentId}/image`;
}

export async function getTournamentEventsOnDate(tournamentId, date) {
  return proxyGet(`/api/tennis/tournament/${tournamentId}/scheduled-events/${date}`);
}

export async function getATPRankings() {
  return proxyGet('/api/tennis/rankings/atp');
}

export async function getLiveATPRankings() {
  return proxyGet('/api/tennis/rankings/atp/live');
}

export async function getWTARankings() {
  return proxyGet('/api/tennis/rankings/wta');
}

export async function getLiveWTARankings() {
  return proxyGet('/api/tennis/rankings/wta/live');
}

export async function getAtpTournaments({ limit = 200, offset = 0, year, month, search, tourType = 'atp' } = {}) {
  return proxyGet('/api/atp-tournaments', { limit, offset, year, month, search, tour_type: tourType }, { cacheMs: 60 * 1000 });
}

export async function getLiveRankingsLatest({ sourceSlug, tour, category, limit = 1000 } = {}) {
  if (!tour || !category) {
    throw new Error('tour and category are required');
  }
  return proxyGet(`/api/rankings/live/${tour}/${category}`, { limit, source_slug: sourceSlug });
}

export async function getCategoryEvents(categoryId, day, month, year) {
  return proxyGet(`/api/tennis/category/${categoryId}/events/${day}/${month}/${year}`);
}

export async function getTeamDetails(teamId) {
  return proxyGet(`/api/tennis/team/${teamId}`);
}

export async function getTeamRankings(teamId) {
  return proxyGet(`/api/tennis/team/${teamId}/rankings`);
}

export function getTeamImageUrl(teamId) {
  return `/api/tennis/team/${teamId}/image`;
}

export async function getEventGraph(eventId) {
  return proxyGet(`/api/tennis/event/${eventId}/graph`);
}

export async function getEventPointByPoint(eventId) {
  return proxyGet(`/api/tennis/event/${eventId}/point-by-point`);
}
