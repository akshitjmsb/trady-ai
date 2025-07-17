import React, { useState, useEffect } from 'react';

interface Rating {
  criterion: string;
  explanation: string;
  rating: number; // 1-5 stars
}

interface MungerReviewData {
  ratings: Rating[];
  overallScore: string; // 'Exceptional', 'Good', etc.
  summary: string;
  verdict: 'BUY' | 'WATCH' | 'AVOID';
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const totalStars = 5;
  const solidStars = Math.round(rating);
  const emptyStars = totalStars - solidStars;
  return (
    <div className="flex items-center" aria-label={`${rating} out of 5 stars`}>
      <span className="text-yellow-400 text-xl">{'★'.repeat(solidStars)}</span>
      <span className="text-gray-300 dark:text-gray-500 text-xl">{'☆'.repeat(emptyStars)}</span>
    </div>
  );
};

const getVerdictBadgeColor = (verdict: 'BUY' | 'WATCH' | 'AVOID') => {
  switch (verdict) {
    case 'BUY': return 'bg-green-600 text-white';
    case 'WATCH': return 'bg-yellow-500 text-white';
    case 'AVOID': return 'bg-red-600 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const MungerReview: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [data, setData] = useState<MungerReviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;

    const fetchReview = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:8000/api/munger-review?symbol=${symbol}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Failed to fetch Munger review');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [symbol]);

  if (loading) {
    return (
      <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg shadow">
        <p className="text-red-600 dark:text-red-400 font-medium">⚠️ Munger Mgmt Review Unavailable</p>
        <p className="text-sm text-red-500 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Munger Management Review</h2>

      {/* Ratings Table */}
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Factor</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Explanation</th>
              <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rating</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.ratings.map((item) => (
              <tr key={item.criterion}>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.criterion}</td>
                <td className="px-4 py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-400">{item.explanation}</td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <StarRating rating={item.rating} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary & Verdict */}
      <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
        <div className="flex flex-wrap items-center gap-4 mb-3">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Overall Munger Score:</h3>
          <span className="px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {data.overallScore}
          </span>
        </div>
        <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4">
          <p className="text-gray-700 dark:text-gray-300 mb-3">{data.summary}</p>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-gray-800 dark:text-gray-200">Recommendation:</h4>
            <span className={`px-3 py-1 rounded-md text-sm font-bold ${getVerdictBadgeColor(data.verdict)}`}>
              {data.verdict}
            </span>
          </div>
        </blockquote>
      </div>
    </div>
  );
};

export default MungerReview;
