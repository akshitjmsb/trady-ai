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

  if (!symbol) {
    return (
      <div className="flex flex-col items-center justify-center mt-6 text-gray-500">
        Please enter a stock symbol to get AI-powered insights.
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <h3 className="text-lg font-semibold mb-2 text-blue-700 text-center">AI Investment Insight</h3>
        {loading && (
          <div className="flex justify-center items-center min-h-[64px]">
            <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          </div>
        )}
        {error && (
          <div className="text-red-600 text-center font-medium min-h-[64px]">{error}</div>
        )}
        {!loading && !error && insight && (
          <div className="text-gray-800 text-center min-h-[64px]">{insight}</div>
        )}
      </div>
    </div>
  );
};

export default Insights;
