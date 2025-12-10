import React, { useEffect, useMemo, useState } from "react";
import NotFound from "../../common/stateHandlers/NotFoundDark";

const pointColors = {
  p1: "bg-green-400",
  p2: "bg-blue-400",
  default: "bg-gray-600",
};

const views = ["Timeline", "Rally Bars", "Momentum", "Dots"];

function getPointWinner(pt) {
  if (pt.homePointType === 1 || pt.homePointType === 3) return "p1";
  if (pt.awayPointType === 1 || pt.awayPointType === 3) return "p2";
  if (pt.homePointType === 2) return "p1";
  if (pt.awayPointType === 2) return "p2";
  if (pt.homePointType === 5) return "p2";
  if (pt.awayPointType === 5) return "p1";
  return "default";
}

function isGameOver(home, away) {
  const map = { "0": 0, "15": 1, "30": 2, "40": 3, A: 4 };
  const h = map[home];
  const a = map[away];
  return (h >= 4 || a >= 4) && Math.abs(h - a) >= 2;
}

export default function MultiViewPointViewer({ pointByPoint }) {
  const [sets, setSets] = useState(pointByPoint || []);
  const [activeView, setActiveView] = useState("Timeline");

  useEffect(() => setSets(pointByPoint || []), [pointByPoint]);

  const globalInProgress = useMemo(() => {
    let ongoing = [];
    sets.forEach((s) =>
      s.games.forEach((g) => {
        if (!g.isCompleted)
          ongoing.push({
            set: s.set,
            game: g.game,
          });
      })
    );
    if (!ongoing.length) return null;
    return ongoing.sort((a, b) =>
      b.set === a.set ? b.game - a.game : b.set - a.set
    )[0];
  }, [sets]);

  if (!sets.length)
    return (
      <NotFound msg="No point-by-point data available." subMsg="" />
    );

  const renderPoint = (pt, idx) => {
    const winner = getPointWinner(pt);
    const color = pointColors[winner];
    return (
      <div
        key={idx}
        className={`w-3 h-3 rounded-full ${color}`}
        title={`${pt.homePoint}-${pt.awayPoint}`}
      ></div>
    );
  };

  const renderGame = (setObj, game) => {
    const isLive =
      globalInProgress &&
      globalInProgress.set === setObj.set &&
      globalInProgress.game === game.game;

    const classes = `rounded-md p-1 text-xs border ${
      isLive ? "border-yellow-400" : "border-gray-700"
    }`;

    return (
      <div key={game.game} className={classes}>
        <span className="text-blue-300 font-bold mr-1">G{game.game}</span>

        {/* Views */}
        {activeView === "Timeline" && (
          <div className="flex gap-1 overflow-x-auto my-1">
            {(game.points || []).map(renderPoint)}
          </div>
        )}

        {activeView === "Rally Bars" && (
          <div className="h-2 bg-gray-700 rounded mt-1">
            <div
              className="h-full rounded bg-green-500"
              style={{ width: `${(game.points.filter((pt) => getPointWinner(pt) === "p1").length / game.points.length) * 100}%` }}
            ></div>
          </div>
        )}

        {activeView === "Momentum" && (
          <div className="flex gap-1 mt-1">
            {game.points.map((pt, i) => (
              <span
                key={i}
                className={`text-[10px] ${
                  getPointWinner(pt) === "p1"
                    ? "text-green-400"
                    : "text-blue-400"
                }`}
              >
                {getPointWinner(pt) === "p1" ? "⬆" : "⬇"}
              </span>
            ))}
          </div>
        )}

        {activeView === "Dots" && (
          <div className="flex gap-0.5 mt-1 flex-wrap">
            {game.points.map(renderPoint)}
          </div>
        )}

        {/* Score */}
        <div className="text-gray-400 text-[10px] mt-1">
          ({game.score?.homeScore}-{game.score?.awayScore})
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* View Switch */}
      <div className="flex gap-2 mb-3">
        {views.map((v) => (
          <button
            key={v}
            className={`px-2 py-1 text-[11px] rounded ${
              activeView === v
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
            onClick={() => setActiveView(v)}
          >
            {v}
          </button>
        ))}
      </div>

      {sets.map((setObj) => (
        <div key={setObj.set} className="mb-3 bg-gray-800 p-2 rounded-lg">
          <div className="text-sm text-blue-300 font-bold mb-2">
            Set {setObj.set}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {setObj.games.map((g) => renderGame(setObj, g))}
          </div>
        </div>
      ))}
    </div>
  );
}
