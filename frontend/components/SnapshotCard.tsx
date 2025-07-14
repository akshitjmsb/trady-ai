import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const RANGES = [
  { key: '1d', label: '1D' },
  { key: '5d', label: '5D' },
  { key: '1m', label: '1M' },
  { key: '6m', label: '6M' },
  { key: 'ytd', label: 'YTD' },
  { key: '1y', label: '1Y' },
  { key: '5y', label: '5Y' },
  { key: 'max', label: 'MAX' },
];

function formatNumber(val: number | string) {
  if (val === null || val === undefined || val === 'N/A') return 'N/A';
  if (typeof val === 'number') return val.toLocaleString();
  return val;
}

function formatPrice(val: number | string) {
  if (val === null || val === undefined || val === 'N/A') return 'N/A';
  if (typeof val === 'number') return `$${val.toFixed(2)}`;
  return val;
}

function formatChange(change: number | null) {
  if (change === null || change === undefined) return '';
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}`;
}

const metricLabels = [
  { key: 'open', label: 'Open' },
  { key: 'dayLow', label: 'Day Low' },
  { key: 'dayHigh', label: 'Day High' },
  { key: 'marketCap', label: 'Market Cap' },
  { key: 'peRatio', label: 'P/E' },
  { key: 'volume', label: 'Volume' },
  { key: 'yearLow', label: 'Year Low' },
  { key: 'yearHigh', label: 'Year High' },
  { key: 'eps', label: 'EPS (TTM)' },
];

export type SnapshotData = {
  header: {
    name: string;
    symbol: string;
    price: number | string;
    change: number | null;
    afterHours: number | null;
    timestamp: number | null;
  };
  chart: {
    dates: string[];
    close: (number | null)[];
  };
  metrics: Record<string, number | string>;
  insight?: string;
};

const SnapshotCard: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [range, setRange] = useState('5y');
  const [data, setData] = useState<SnapshotData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    setError(null);
    setData(null);
    fetch(`http://localhost:8000/api/price-history?symbol=${symbol}&range=${range}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Snapshot unavailable');
        return res.json();
      })
      .then(async (snapshot) => {
        // Try to fetch the insight
        try {
          const res = await fetch(`http://localhost:8000/api/generate-insights?symbol=${symbol}`);
          if (res.ok) {
            const { insight } = await res.json();
            setData({ ...snapshot, insight });
          } else {
            setData(snapshot);
          }
        } catch (e) {
          setData(snapshot);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [symbol, range]);

  const isUp = data && data.header && data.header.change !== null && data.header.change >= 0;
  const chartColor = isUp ? '#22c55e' : '#ef4444'; // Tailwind green/red
  const chartFill = isUp ? '#bbf7d0' : '#fecaca';

  return (
    <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mx-auto my-6">
      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading snapshot...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500 font-medium">Snapshot unavailable</div>
      ) : data ? (
        <>
          {/* Header */}
          <div className="flex flex-col items-center mb-4">
            <div className="text-lg font-bold">{data.header.name} <span className="text-gray-500 font-normal">({data.header.symbol})</span></div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold">{formatPrice(data.header.price)}</span>
              <span className={`ml-2 font-semibold ${isUp ? 'text-green-600' : 'text-red-600'}`}>{formatChange(data.header.change)}</span>
              {data.header.afterHours && (
                <span className="ml-2 text-xs text-gray-500">AH: {formatPrice(data.header.afterHours)}</span>
              )}
            </div>
            {data.header.timestamp && (
              <div className="text-xs text-gray-400 mt-1">{new Date(data.header.timestamp * 1000).toLocaleString()}</div>
            )}
          </div>

          {/* Range Tabs */}
          <div className="flex justify-center gap-1 mb-3 flex-wrap">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-2.5 py-1 rounded font-semibold border transition-all text-sm ${range === r.key ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-gray-100 border-gray-300 text-gray-500 hover:bg-blue-50'}`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="w-full h-56 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chart.dates.map((d, i) => ({ date: d, close: data.chart.close[i] }))}>
                <defs>
                  <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColor} stopOpacity={0.4}/>
                    <stop offset="100%" stopColor={chartFill} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" minTickGap={30} tick={{fontSize: 12}}/>
                <YAxis dataKey="close" tickFormatter={formatPrice} width={60} tick={{fontSize: 12}}/>
                <Tooltip formatter={formatPrice} labelFormatter={v => `Date: ${v}`}/>
                <Area type="monotone" dataKey="close" stroke={chartColor} fill="url(#colorClose)" strokeWidth={2} dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
            {metricLabels.map((m) => (
              <React.Fragment key={m.key}>
                <div className="text-gray-500 text-sm">{m.label}</div>
                <div className="text-right font-medium text-sm">{formatNumber(data.metrics[m.key])}</div>
              </React.Fragment>
            ))}
          </div>

          {/* Insight Paragraph (optional) */}
          {data.insight && (
            <div className="mt-2 text-sm text-gray-700 dark:text-gray-200 italic text-center">{data.insight}</div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default SnapshotCard;
