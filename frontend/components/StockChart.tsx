import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface StockData {
  date: string;
  close: number;
}

interface StockChartProps {
  symbol: string;
  data: StockData[];
}



const StockChart: React.FC<StockChartProps> = ({ symbol, data }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-blue-700 text-center">{symbol} Stock Chart</h2>
      {data.length ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} />
            <YAxis tickFormatter={(v) => `$${v.toFixed(0)}`} />
            <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Close']} />
            <Line type="monotone" dataKey="close" stroke="#2563eb" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-gray-500 text-center py-8">No data available for this symbol.</div>
      )}
    </div>
  );
};

export default StockChart;
