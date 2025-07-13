import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface StockChartProps {
  symbol: string;
  data: { date: string; close: number }[];
}

const StockChart: React.FC<StockChartProps> = ({ symbol, data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        No data available for {symbol}.
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-semibold mb-4 text-center">
        {symbol} - Last 30 Days Closing Price
      </h2>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 20, right: 24, left: 0, bottom: 16 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => {
              // Format date as MM/DD or similar for readability
              const d = new Date(date);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
            minTickGap={12}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            domain={["auto", "auto"]}
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => `$${v.toFixed(2)}`}
          />
          <Tooltip
            labelFormatter={(label) => {
              const d = new Date(label);
              return d.toLocaleDateString();
            }}
            formatter={(value: any) => [`$${value.toFixed(2)}`, "Close"]}
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
