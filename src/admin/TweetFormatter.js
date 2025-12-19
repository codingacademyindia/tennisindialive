//
// ──────────────────────────────────────────────────────────────
//   HELPERS
// ──────────────────────────────────────────────────────────────
//
import CountryIcon from "../common/Country";
function extractScore(match) {
    const hs = match.homeScore || {};
    const as = match.awayScore || {};

    const sets = [
        [hs.period1, as.period1],
        [hs.period2, as.period2],
        [hs.period3, as.period3],
        [hs.period4, as.period4],
        [hs.period5, as.period5],
    ].filter(s => s[0] !== undefined && s[0] !== null);

    const scoreString = sets.length
        ? sets.map(([hS, aS]) => `${hS}-${aS}`).join(", ")
        : "-";

    let homeSets = 0;
    let awaySets = 0;

    sets.forEach(([hS, aS]) => {
        if (hS > aS) homeSets++;
        else if (aS > hS) awaySets++;
    });

    return { scoreString, homeSets, awaySets };
}

function getLink(match) {
    return "https://tennisindialive.com/live-scores";
    // return `https://tennisindialive.com/scores/${match.slug || ""}`.trim();
}
function getFlagEmoji(code) {
    if (!code) return "";
    code = code.trim().toUpperCase();

    if (code.length !== 2) return "";

    const first = code.codePointAt(0) - 65 + 0x1F1E6;
    const second = code.codePointAt(1) - 65 + 0x1F1E6;

    return String.fromCodePoint(first, second);
}

// function formatPlayer(player) {
//     const name = player?.name || ''

//     // FIXED → Extract alpha2 from the object
//     const countryCode =
//         player?.country?.alpha2 ||
//         player?.countryCode ||        // if API gives "IN"
//         "";

//     const flag = getFlagEmoji(countryCode);

//     return flag ? `${flag} ${name}` : name;
// }
function formatPlayer(team) {
    if (!team) return "Unknown";

    // Check if it's a doubles/team
    if (team.subTeams && team.subTeams.length) {
        // Map each player with flag
        const players = team.subTeams.map(p => {
            const name = p.name || "Unknown";
            const countryCode = p.country?.alpha2 || p.countryCode || "";
            const flag = getFlagEmoji(countryCode);
            return flag ? `${flag} ${name}` : name;
        });
        return players.join(" / "); // "Player1 / Player2"
    }

    // Single player
    const name = team.name || "Unknown";
    const countryCode = team.country?.alpha2 || team.countryCode || "";
    const flag = getFlagEmoji(countryCode);
    return flag ? `${flag} ${name}` : name;
}

// function getPlayers(match) {
//     return {
//         h: formatPlayer(match.homeTeam),
//         a: formatPlayer(match.awayTeam),
//         tournament: match.tournament?.name || "",
//     };
// }

function getPlayers(match) {
    const h = formatPlayer(match.homeTeam);
    const a = formatPlayer(match.awayTeam);

    // Tournament name + type
    const tournamentName = match.tournament?.name || "";
    const tournamentType = match.tournament?.uniqueTournament?.category?.name || "";
    const tournament = tournamentType
        ? `${tournamentName} (${tournamentType})`
        : tournamentName;

    // Round info (Final, Semifinal, Quarterfinal etc.)
    const round = match.roundInfo?.name || "";

    return { h, a, tournament, round };
}


//
// ──────────────────────────────────────────────────────────────
//   STATUS-SPECIFIC TWEET FUNCTIONS
// ──────────────────────────────────────────────────────────────
//

export function tweetNotStarted(match) {
    const { h, a, tournament, round } = getPlayers(match);
    const link = getLink(match);
    const icon = getStatusIcon("notstarted");
    const readableTime = match.startTimestamp
        ? new Date(match.startTimestamp * 1000).toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            day: "numeric",
            month: "short",
        })
        : "soon";

    return (
        `${icon} ${tournament} - ${round} Scheduled 🎾\n\n` +
        `${h} vs ${a}\n` +
        `Starts: ${readableTime}\n\n` +
        `Follow Schedule here- 👇\n${link}`
    );
}

function getStatusIcon(status) {
    switch (status) {
        case "notstarted":
            return "⏳";       // Scheduled
        case "inprogress":
            return "🔴";       // Live
        case "finished":
            return "✅";       // Final result
        case "interrupted":
            return "⏸️";       // Interrupted
        case "postponed":
            return "📅";       // Postponed
        case "cancelled":
        case "canceled":
        case "retired":
        case "walkover":
        case "wo":
            return "❌";       // Cancelled
        default:
            return "🎾";       // Generic tennis update
    }
}


export function tweetInProgress(match) {
    const { h, a, tournament, round } = getPlayers(match);
    const { scoreString, homeSets, awaySets } = extractScore(match);
    const link = getLink(match);
    const icon = getStatusIcon("inprogress");

    // Function to get last names for doubles
    const getLastNames = (teamName) => {
        // Split by " / " for doubles, then take last word from each
        return teamName.split(" / ").map(p => p.trim().split(" ").pop()).join(" / ");
    };

    let leadText;
    if (homeSets > awaySets) {
        leadText = match.homeTeam?.subTeams?.length ? `${getLastNames(h)} leading` : `${h} is leading`;
    } else if (awaySets > homeSets) {
        leadText = match.awayTeam?.subTeams?.length ? `${getLastNames(a)} leading` : `${a} is leading`;
    } else if (awaySets === 0 && homeSets === 0) {
        leadText = "";
    } else {
        leadText = "The match is evenly balanced";
    }

    return (
        `${icon} Live from ${tournament}${round ? " - " + round : ""} 🎾\n\n` +
        `${h} vs ${a}\n` +
        `${leadText} • Score: ${scoreString}\n\n` +
        `Follow live action 👇\n${link}`
    );
}


function tweetFinished(match) {
    const { h, a, tournament, round } = getPlayers(match);
    const icon = getStatusIcon("finished");
    const link = getLink(match);

    const hs = match.homeScore || {};
    const as = match.awayScore || {};

    const sets = [
        [hs.period1, as.period1],
        [hs.period2, as.period2],
        [hs.period3, as.period3],
        [hs.period4, as.period4],
        [hs.period5, as.period5],
    ].filter(s => s[0] !== undefined);

    const scoreString = sets.map(([hS, aS]) => `${hS}-${aS}`).join(", ");

    let homeSets = 0;
    let awaySets = 0;
    sets.forEach(([hS, aS]) => {
        if (hS > aS) homeSets++;
        else if (aS > hS) awaySets++;
    });

    const winner = homeSets > awaySets ? h : a;
    const loser = homeSets > awaySets ? a : h;

    // ----------------------------------------------
    // 3 Tweet Styles
    // ----------------------------------------------

    const styles = [
        // ✅ Style A — Clean & professional
        `${icon} ${tournament} - ${round} - Result 🎾

${winner} def. ${loser}
Score: ${scoreString}

More Details 👇
${link}
        `.trim(),

        // ⭐ Style B — Slightly more dramatic
        `
${icon} Match Update from ${tournament} - ${round} 🎾

${winner} powers past ${loser}
Score: ${scoreString}

More Details 👇
${link}
        `.trim(),

        // 🎾 Style C — ATP/WTA style short result
        `
${icon} ${tournament} - ${round} -  Result 🎾

${winner} def. ${loser}
${scoreString}

Details 👇
${link}
        `.trim()
    ];

    // Return random style
    return styles[Math.floor(Math.random() * styles.length)];
}


export function tweetInterrupted(match) {
    const { h, a, tournament, round } = getPlayers(match);
    const { scoreString } = extractScore(match);
    const link = getLink(match);
    const icon = getStatusIcon("interrupted");

    return (
        `${icon} ${tournament} - ${round} Match Interrupted ⏸️\n\n` +
        `${h} vs ${a}\n` +
        `Current score: ${scoreString}\n\n` +
        `Latest updates 👇\n${link}`
    );
}

export function tweetPostponed(match) {
    const { h, a, tournament, round } = getPlayers(match);
    const link = getLink(match);
    const icon = getStatusIcon("postponed");

    return (
        `${icon} ${tournament} - ${round} Match Postponed ⏸️\n\n` +
        `${h} vs ${a}\n\n` +
        `More info 👇\n${link}`
    );
}

export function tweetCancelled(match) {
    const { h, a, tournament, round } = getPlayers(match);
    const link = getLink(match);
    const icon = getStatusIcon("cancelled");

    return (
        `${icon} ${tournament} - ${round} Match Cancelled ❌\n\n` +
        `${h} vs ${a}\n\n` +
        `More info 👇\n${link}`
    );
}

//
// ──────────────────────────────────────────────────────────────
//   MAIN ROUTER
// ──────────────────────────────────────────────────────────────
//

export function getAllLiveMatches(matches, countryAlpha3 = null) {
    if (!Array.isArray(matches)) return [];
    return matches.filter((m) => {
        const isLive = m.status?.type === "inprogress";
        const byCountry =
            !countryAlpha3 ||
            m.homeTeam?.country?.alpha3 === countryAlpha3 ||
            m.awayTeam?.country?.alpha3 === countryAlpha3;
        return isLive && byCountry;
    });
}

export function buildGroupedLiveMatchesTweet(matches) {
    if (!matches || matches.length === 0) return null;

    const icon = getStatusIcon("inprogress");

    const grouped = {};
    let link = null;

    matches.forEach(match => {
        const { h, a, tournament } = getPlayers(match);

        if (!grouped[tournament]) {
            grouped[tournament] = [];
        }

        grouped[tournament].push(`• ${h} vs ${a}`);

        // use first match link (clean & safe)
        if (!link) {
            link = getLink(match);
        }
    });

    let tweet = `${icon} LIVE Tennis 🎾\n\n`;

    Object.entries(grouped).forEach(([tournament, lines]) => {
        tweet += `${tournament}\n`;
        tweet += lines.join("\n") + "\n\n";
    });

    tweet += `Follow live 👇\n${link}`;

    return tweet.trim();
}


export function buildLiveMatchesTweet(matches) {
    const lines = [];
    lines.push("🎾 LIVE TENNIS NOW\n");

    matches.forEach((match) => {
        const tournament = match.tournament?.uniqueTournament?.name
            || match.tournament?.name
            || "Tournament";

        const category = match.tournament?.category?.name || "";
        const home = match.homeTeam?.shortName || match.homeTeam?.name;
        const away = match.awayTeam?.shortName || match.awayTeam?.name;

        lines.push(
            `${tournament} (${category})\n` +
            `${home} vs ${away}\n`
        );
    });

    return lines.join("\n");
}

   function getCountryCondition(selectedCountryAlpha3) {
        return (selectedCountryAlpha3 === '' || selectedCountryAlpha3 === null || selectedCountryAlpha3 === 'all')
    }
    const hasCountry = (item, selectedCountry) => {
        const p1 = item.homeTeam;
        const p2 = item.awayTeam;
        // if (!item.tournament.name.includes(tournamentName)) return false;

        if (!item.tournament.name.toLowerCase().includes('double')) {
            return (getCountryCondition(selectedCountry) ||
                p1?.country?.alpha3?.toLowerCase() === selectedCountry?.toLowerCase() ||
                p2?.country?.alpha3?.toLowerCase() === selectedCountry?.toLowerCase())
                
        } else {
            const teams = [p1?.subTeams[0], p1?.subTeams[1], p2?.subTeams[0], p2?.subTeams[1]];
            const countries = teams.map(t => t?.country?.alpha3?.toLowerCase());
            return (getCountryCondition(selectedCountry) || countries.includes(selectedCountry?.toLowerCase()))
        }
    };

export function getAllLiveMatchesFromFiltered(rankingsData, filteredRankingsData, selectedCountry = null) {
    const liveMatches = [];
    filteredRankingsData.forEach(tournament => {
        const matches = rankingsData[tournament] || [];
        matches.forEach(match => {
            if (match.status?.type === "inprogress" && (hasCountry(match, selectedCountry)  )) {
                liveMatches.push(match);
            }
        });
    });
    return liveMatches;
}

export function formatLiveScoreTweet(match) {
    const status = match.status?.type?.toLowerCase() || "";

    switch (status) {
        case "notstarted":
            return tweetNotStarted(match);

        case "inprogress":
            return tweetInProgress(match);

        case "finished":
            return tweetFinished(match);

        case "interrupted":
            return tweetInterrupted(match);

        case "postponed":
            return tweetPostponed(match);

        case "cancelled":
        case "canceled":
        case "retired":
        case "walkover":
        case "wo":
            return tweetCancelled(match);

        default:
            const { h, a, tournament, round } = getPlayers(match);
            const link = getLink(match);
            return (
                `${tournament} - ${round} Match Update 🎾\n\n` +
                `${h} vs ${a}\nMore details 👇\n${link}`
            );
    }
}
