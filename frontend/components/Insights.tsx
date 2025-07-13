import React, { useEffect, useState } from 'react';

interface InsightsProps {
  symbol: string;
}

const Insights: React.FC<InsightsProps> = ({ symbol }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) {
      setInsight(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setInsight(null);
    setError(null);
    fetch(`/api/generate-insights?symbol=${encodeURIComponent(symbol)}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Unknown error');
        }
        return res.json();
      })
      .then((data) => {
        setInsight(data.insight);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch insight.');
      })
      .finally(() => setLoading(false));
  }, [symbol]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-blue-700 text-center">AI Investment Insight</h3>
        {!symbol && (
          <div className="text-gray-500 text-center py-8">
            Please enter a stock symbol to get AI-powered insights.
          </div>
        )}
        {loading && (
          <div className="flex justify-center items-center min-h-[64px]">
            <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span className="ml-2 text-blue-500">Loading insight...</span>
          </div>
        )}
        {error && (
          <div className="text-red-600 text-center font-medium min-h-[64px]">
            {error}
          </div>
        )}
        {!loading && !error && insight && (
          <div className="text-gray-800 text-center text-base min-h-[64px] whitespace-pre-line">
            {insight}
          </div>
        )}
      </div>
    </div>
  );
};

export default Insights;
