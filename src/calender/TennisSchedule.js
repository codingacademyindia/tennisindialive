import React, { useEffect, useState } from "react";

const TOUR_COLORS = {
    atp: "border-emerald-500 text-emerald-400 bg-emerald-500/10",
    wta: "border-rose-500 text-rose-400 bg-rose-500/10",
    challenger: "border-amber-500 text-amber-400 bg-amber-500/10",
    "itf-men": "border-sky-500 text-sky-400 bg-sky-500/10",
    "itf-women": "border-violet-500 text-violet-400 bg-violet-500/10",
    "wta-125": "border-pink-500 text-pink-400 bg-pink-500/10",
};

function Stat({ label, value }) {
    return (
        <div className="rounded-lg bg-black/30 p-3 text-center">
            <div className="text-xl font-bold text-gray-100">{value}</div>
            <div className="text-xs uppercase tracking-wide text-gray-400">
                {label}
            </div>
        </div>
    );
}

function CategoryCard({ item }) {
    const { category, totalEvents, uniqueTournamentIds } = item;
    const color =
        TOUR_COLORS[category.flag] ??
        "border-gray-600 text-gray-300 bg-gray-800";

    return (
        <div
            className={`
                relative rounded-xl border p-4
                bg-[#0f141a] hover:bg-[#121922]
                transition-all duration-300
                ${color}
            `}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold tracking-wide">
                    {category.name}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-black/40">
                    {category.sport.name}
                </span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 text-sm">
                <Stat label="Events" value={totalEvents} />
                <Stat label="Tournaments" value={uniqueTournamentIds.length} />
            </div>

            {/* Footer */}
            <div className="mt-4 text-xs text-gray-400">
                Tap to explore matches →
            </div>
        </div>
    );
}

function getApiUrl(dateStr) {
    // dateStr: "YYYY-MM-DD"
    const [year, month, day] = dateStr.split("-");
    return `https://tennisapi1.p.rapidapi.com/api/tennis/calendar/${day}/${month}/${year}/categories`;
}

const API_HEADERS = {
    "x-rapidapi-key": process.env.REACT_APP_RAPIDAPI_KEY,
    "x-rapidapi-host": "tennisapi1.p.rapidapi.com",
};

export default function TennisSchedule() {
    const today = new Date();
    const defaultDate = today.toISOString().slice(0, 10); // "YYYY-MM-DD"
    const [selectedDate, setSelectedDate] = useState(defaultDate);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch data when selectedDate changes
    useEffect(() => {
        setLoading(true);
        setError("");
        setData(null);

        fetch(getApiUrl(selectedDate), { headers: API_HEADERS })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch calendar data");
                return res.json();
            })
            .then((data) => {
                setData(data);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message || "Unknown error");
                setLoading(false);
            });
    }, [selectedDate]);

    return (
        <div className="space-y-10">
            {/* Date Filter */}
            <div className="flex items-center justify-center mb-6">
                <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="bg-gray-800 text-blue-200 px-3 py-2 rounded border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    max={defaultDate}
                />
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                    <span className="ml-3 text-blue-200">Loading schedule...</span>
                </div>
            ) : error ? (
                <div className="bg-red-900 text-red-200 p-4 rounded border border-red-700 text-center">
                    Error: {error}
                </div>
            ) : !data || !Array.isArray(data.categories) ? (
                <div className="text-gray-400 text-center p-4">No data available.</div>
            ) : (
                <section>
                    {/* Date Header */}
                    <div className="mb-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-gray-800" />
                        <span className="text-sm tracking-widest text-gray-400">
                            {new Date(selectedDate).toLocaleDateString(undefined, {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}
                        </span>
                        <div className="h-px flex-1 bg-gray-800" />
                    </div>

                    {/* Categories */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {data.categories.length > 0 ? (
                            data.categories.map((item) => (
                                <CategoryCard key={item.category.id} item={item} />
                            ))
                        ) : (
                            <div className="text-gray-400 text-center col-span-3">No categories available.</div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}