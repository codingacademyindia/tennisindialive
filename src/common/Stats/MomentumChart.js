import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceDot,
} from "recharts";

const TennisMomentumChart = ({ data }) => {
  // Flatten set+game into a single label like "S1-G2"
  const formatted = data.tennisPowerRankings.map((item) => ({
    ...item,
    label: `S${item.set}-G${item.game}`,
  }));

  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Tennis Momentum Chart
      </h2>

      <LineChart width={700} height={350} data={formatted}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip />
        <Legend />

        <Line
          type="monotone"
          dataKey="value"
          stroke="#0088FE"
          strokeWidth={2}
          dot={{ r: 4 }}
        />

        {/* highlight break points */}
        {formatted.map((item, index) =>
          item.breakOccurred ? (
            <ReferenceDot
              key={index}
              x={item.label}
              y={item.value}
              r={6}
              fill="red"
              stroke="none"
            />
          ) : null
        )}
      </LineChart>
    </div>
  );
};

export default TennisMomentumChart;
