import React, { useState, useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { useStockData } from '../hooks/useStockData';
import type { SnapshotData } from '../lib/types';
import { Skeleton } from './ui/skeleton';
import FinancialProfile from './FinancialProfile';

const SnapshotPro: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [range, setRange] = useState('1y');
  const [mode, setMode] = useState<'price' | 'percent'>('price');
  const { data, loading, error } = useStockData<SnapshotData>(`/price-history?symbol=${symbol}&range=${range.toLowerCase()}&mode=${mode}`);

  const rangeOptions = ['1D', '5D', '1M', '6M', '1Y', '5Y', 'MAX'];

  const periodChange = useMemo(() => {
    if (!data || !data.chart.series || data.chart.series.length === 0) {
      return { change: data?.header.change || 0, percent: data?.header.changePercent || 0 };
    }
    const firstValidPoint = data.chart.series.find(p => p.value !== null);
    const startPrice = firstValidPoint ? firstValidPoint.value : null;
    const currentPrice = data.header.price;

    if (startPrice === null || currentPrice === null) {
       return { change: data.header.change, percent: data.header.changePercent };
    }
    
    const change = currentPrice - startPrice;
    const percent = (change / startPrice) * 100;
    
    return { change, percent };
  }, [data, range]);

  if (loading) return <div className="w-full bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 p-6 h-[600px]"><Skeleton className="h-full w-full" /></div>;
  if (error) return <div className="w-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-xl">Error: {error}</div>;
  if (!data) return <div className="w-full bg-white dark:bg-slate-900 p-6 rounded-xl text-slate-500">No data available.</div>;

  const { header, chart, metrics } = data;
  const isPositive = periodChange.change >= 0;

  const formatXAxisTick = (tick: string) => {
    try {
        const date = new Date(tick);
        if (isNaN(date.getTime())) return '';
        switch (range) {
            case '1D': return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            case '5D': case '1M': return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            default: return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }
    } catch { return ''; }
  };

  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return '...';
    try {
        const date = new Date(timestamp * 1000);
        return `As of ${format(date, 'MMM d, yyyy, h:mm a')}`;
    } catch {
        return '...';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{header.name} ({header.symbol})</h2>
        <div className="flex items-baseline gap-3 mt-1">
          <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">${header.price?.toFixed(2)}</p>
          <div className={`text-lg font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            <span>{isPositive ? '▲' : '▼'} {periodChange.change?.toFixed(2)}</span>
            <span className="ml-2">({periodChange.percent?.toFixed(2)}%)</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatTimestamp(header.timestamp)}</p>
      </div>
      
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
            {rangeOptions.map(r => (
                <button key={r} onClick={() => setRange(r)} className={cn('px-3 py-1 text-xs font-semibold rounded-full transition-colors', range === r ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100' : 'text-slate-500 hover:bg-white/60 dark:text-slate-400 dark:hover:bg-slate-700/60')}>
                    {r}
                </button>
            ))}
        </div>
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full">
            <button onClick={() => setMode('price')} className={cn('px-3 py-1 text-xs font-semibold rounded-full transition-colors', mode === 'price' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100' : 'text-slate-500 hover:bg-white/60 dark:text-slate-400 dark:hover:bg-slate-700/60')}>$</button>
            <button onClick={() => setMode('percent')} className={cn('px-3 py-1 text-xs font-semibold rounded-full transition-colors', mode === 'percent' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100' : 'text-slate-500 hover:bg-white/60 dark:text-slate-400 dark:hover:bg-slate-700/60')}>%</button>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chart.series} margin={{ left: -20, right: 10, top: 5, bottom: 0 }}>
             <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.15}/>
                  <stop offset="95%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0}/>
                </linearGradient>
              </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
            <XAxis dataKey="timestamp" tickFormatter={formatXAxisTick} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} interval="preserveStartEnd" minTickGap={80} />
            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v:number) => mode === 'price' ? `$${Math.round(v)}` : `${v.toFixed(1)}%`} />
            <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(4px)', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} labelStyle={{ color: '#1e293b' }} formatter={(v: number) => [mode === 'price' ? `$${v.toFixed(2)}` : `${v.toFixed(2)}%`, 'Value']} />
            <Area type="monotone" dataKey="value" stroke={isPositive ? '#22c55e' : '#ef4444'} strokeWidth={2} fill="url(#chartGradient)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Financial Profile</h3>
        <FinancialProfile metrics={metrics} />
      </div>
    </div>
  );
};

export default SnapshotPro;
