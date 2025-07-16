import React, { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import FinancialProfile from './FinancialProfile';

// Type definitions for the API response
interface SnapshotHeader {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: string;
}

interface ChartSeriesPoint {
  timestamp: string;
  value: number | null;
}

interface SnapshotChart {
  mode: 'price' | 'percent';
  series: ChartSeriesPoint[];
}

interface SnapshotMetrics {
  prevClose: number;
  open: number;
  dayRange: string;
  fiftyTwoWeekRange: string;
  marketCap: number;
  peRatio: number;
  volume: number;
  dividendYield: number;
  eps: number;
}

interface SnapshotData {
  header: SnapshotHeader;
  chart: SnapshotChart;
  metrics: SnapshotMetrics;
}

interface SnapshotProProps {
  symbol: string;
}

const rangeTabs = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', 'MAX'];

const SnapshotPro: React.FC<SnapshotProProps> = ({ symbol }) => {
  const [data, setData] = useState<SnapshotData | null>(null);
  const [range, setRange] = useState('1D');
  const [mode, setMode] = useState<'price' | 'percent'>('price');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/price-history?symbol=${symbol}&range=${range.toLowerCase()}&mode=${mode}`);
        if (!res.ok) {
          throw new Error('Failed to fetch snapshot data');
        }
        const result: SnapshotData = await res.json();
        setData(result);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 30000); // Poll every 30 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [symbol, range, mode]);

  if (loading) {
    return <div className="w-full max-w-4xl p-4 mx-auto bg-white rounded-lg shadow-md animate-pulse h-96"></div>;
  }

  if (error) {
    return <div className="w-full max-w-4xl p-4 mx-auto bg-white rounded-lg shadow-md text-red-600">Error: {error}</div>;
  }

  if (!data) {
    return <div className="w-full max-w-4xl p-4 mx-auto bg-white rounded-lg shadow-md text-gray-600">No data available.</div>;
  }

  const { header, chart, metrics } = data;
  const isPositive = header.change >= 0;

  const formatTooltipLabel = (label: string) => {
    const date = new Date(label);
    return date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const formatTooltipValue = (value: number) => {
    if (mode === 'price') {
      return `$${value.toFixed(2)}`;
    }
    return `${value.toFixed(2)}%`;
  };

  const formatXAxisTick = (tick: string) => {
    const date = new Date(tick);
    switch (range) {
      case '1D':
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      case '5D':
      case '1M':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '6M':
      case 'YTD':
      case '1Y':
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      case '5Y':
      case 'MAX':
        return date.toLocaleDateString('en-US', { year: 'numeric' });
      default:
        return date.toLocaleDateString();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '...';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' });
  };

  return (
    <section className="w-full max-w-5xl mx-auto pt-4 pb-8">
      {/* Main Price Header */}
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{header.name} ({header.symbol})</h2>
        <div className="flex items-center justify-center gap-3 mt-2">
          <p className="text-4xl font-bold text-slate-800 dark:text-slate-100">${header.price.toFixed(2)}</p>
          <div className={`text-xl font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            <span>{isPositive ? '▲' : '▼'} {header.change.toFixed(2)}</span>
            <span className="ml-2">({header.changePercent.toFixed(2)}%)</span>
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Last updated: {formatTimestamp(header.timestamp)}</p>
      </div>

      {/* Chart Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 px-4 py-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          {/* Left side: Range Tabs */}
          <div className="flex items-center space-x-1">
            {rangeTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setRange(tab)}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors duration-200 ${range === tab ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Right side: Mode Toggle and Change */}
          <div className="flex items-center space-x-4 mt-3 sm:mt-0">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
              <button onClick={() => setMode('price')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${mode === 'price' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100' : 'text-slate-500 hover:bg-white/60 dark:text-slate-400 dark:hover:bg-slate-700/60'}`}>$</button>
              <button onClick={() => setMode('percent')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${mode === 'percent' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100' : 'text-slate-500 hover:bg-white/60 dark:text-slate-400 dark:hover:bg-slate-700/60'}`}>%</button>
            </div>
            <div className="text-sm text-slate-800 dark:text-slate-100">
              <span className={`font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {header.change > 0 ? '+' : ''}{header.change.toFixed(2)} ({header.changePercent > 0 ? '+' : ''}{header.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart.series} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? '#2563EB' : '#DC2626'} stopOpacity={0.18}/>
                  <stop offset="95%" stopColor={isPositive ? '#2563EB' : '#DC2626'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="timestamp" tickFormatter={formatXAxisTick} stroke="#475569" axisLine={false} tickLine={false} fontSize={14} padding={{ left: 10, right: 10 }} />
              <YAxis stroke="#475569" domain={['dataMin', 'dataMax']} tickFormatter={(tick) => mode === 'price' ? `$${Math.round(tick)}` : `${tick.toFixed(2)}%`} axisLine={false} tickLine={false} fontSize={14} width={60} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#1E293B' }}
                itemStyle={{ color: '#1E293B' }}
                labelFormatter={formatTooltipLabel}
                formatter={(value: number) => [formatTooltipValue(value), mode === 'price' ? 'Price' : 'Percent']}
              />
              <Area type="monotone" dataKey="value" stroke={isPositive ? '#2563EB' : '#DC2626'} strokeWidth={2.5} fillOpacity={1} fill="url(#chartGradient)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Financial Profile */}
      <div className="pt-8">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Financial Profile</h3>
        <FinancialProfile metrics={metrics} />
      </div>
    </section>
  );
};

export default SnapshotPro;
