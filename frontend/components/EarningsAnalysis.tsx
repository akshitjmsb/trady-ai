import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts';
import { format, parseISO } from 'date-fns';

// Define interfaces for our data structures
interface PriceData {
  date: string;
  close: number;
  pctChange: number;
  cumPctChange: number;
}

interface EarningsAnalysisData {
  earningsDate: string;
  actualEPS: number | null;
  expectedEPS: number | null;
  prices: PriceData[];
  surprise: number | null;
  insight?: string; // Optional insight from Gemini
}

const EarningsAnalysis: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [data, setData] = useState<EarningsAnalysisData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState('light');

  // Client-side effect to determine and watch for theme changes
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    };

    checkTheme(); // Check on mount

    // Use a MutationObserver to detect future changes to the class attribute on the <html> element
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!symbol) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:8000/api/earnings-analysis?symbol=${symbol}`
        );
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to fetch earnings data');
        }
        const result = await response.json();
        if (result.error) {
          throw new Error(result.error);
        }
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  // Loading state with skeleton UI
  if (loading) {
    return (
      <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg shadow">
        <p className="text-red-600 dark:text-red-400 font-medium">⚠️ Earnings Analysis Unavailable</p>
        <p className="text-sm text-red-500 dark:text-red-300">{error}</p>
      </div>
    );
  }

  // No data state
  if (!data) {
    return null; // Don't render anything if there's no data and no error
  }

  const formattedEarningsDate = data.earningsDate
    ? format(parseISO(data.earningsDate), 'MMM d, yyyy')
    : 'N/A';

  const surprisePercent = data.actualEPS !== null && data.expectedEPS !== null && data.expectedEPS !== 0
    ? ((data.actualEPS - data.expectedEPS) / Math.abs(data.expectedEPS)) * 100
    : null;

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Earnings Analysis
      </h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Earnings Date</p>
          <p className="text-xl font-semibold text-gray-800 dark:text-white">{formattedEarningsDate}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">EPS Surprise</p>
          <p className={`text-xl font-semibold ${
            surprisePercent === null 
              ? 'text-gray-800 dark:text-white'
              : surprisePercent >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
          }`}>
            {surprisePercent !== null 
              ? `${surprisePercent > 0 ? '+' : ''}${surprisePercent.toFixed(2)}%` 
              : 'N/A'}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Actual / Expected EPS</p>
          <p className="text-xl font-semibold text-gray-800 dark:text-white">
            {data.actualEPS?.toFixed(2) ?? 'N/A'} / {data.expectedEPS?.toFixed(2) ?? 'N/A'}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-96 w-full mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
          Price Movement Around Earnings
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data.prices}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorChange" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4a4a4a' : '#e0e0e0'} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(parseISO(date), 'MMM d')}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis 
              tickFormatter={(value) => `${value.toFixed(0)}%`}
              tick={{ fill: '#6b7280' }}
              domain={['auto', 'auto']}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
              labelStyle={{ color: '#f3f4f6' }}
              itemStyle={{ color: '#d1d5db' }}
              labelFormatter={(date) => format(parseISO(date), 'MMM d, yyyy')}
              formatter={(value: number) => [`${value.toFixed(2)}%`, 'Cumulative % Change']}
            />
            <Legend wrapperStyle={{ color: '#4b5563' }} />
            <ReferenceLine x={data.earningsDate} stroke="#ff7300" strokeDasharray="3 3" label={{ value: 'Earnings', position: 'insideTop', fill: '#ff7300' }} />
            <Area
              type="monotone"
              dataKey="cumPctChange"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorChange)"
              name="Cumulative % Change"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Insights Card */}
      {data.insight && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 dark:border-blue-500">
            <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-300">
              Automated Insight
            </h3>
            <p className="text-gray-700 dark:text-gray-300 italic">
              {data.insight}
            </p>
          </div>
      )}
    </div>
  );
};

export default EarningsAnalysis;
