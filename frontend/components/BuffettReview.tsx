import React, { useState, useEffect } from 'react';

interface BuffettReviewData {
  sections: Record<string, string>;
}

const SectionContent: React.FC<{ content: string }> = ({ content }) => {
    // A simple parser to handle markdown-like text into JSX
    const formatContent = (text: string) => {
        return text.split('\n').map((line, index) => {
            // Bold text **text**
            line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // Headers
            if (line.startsWith('#### ')) {
                return <h4 key={index} className="text-md font-semibold mt-3 mb-1" dangerouslySetInnerHTML={{ __html: line.substring(5) }} />; 
            }
            if (line.startsWith('### ')) {
                return <h3 key={index} className="text-lg font-semibold mt-4 mb-2" dangerouslySetInnerHTML={{ __html: line.substring(4) }} />;
            }
            // List items
            if (line.trim().startsWith('- ')) {
                return <li key={index} className="ml-5 list-disc" dangerouslySetInnerHTML={{ __html: line.substring(2) }} />;
            }
            return <p key={index} className="text-gray-700 dark:text-gray-300 mb-2" dangerouslySetInnerHTML={{ __html: line }} />;
        });
    };

    return <div>{formatContent(content)}</div>;
};


const BuffettReview: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [data, setData] = useState<BuffettReviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;

    const fetchReview = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:8000/api/buffett-review?symbol=${symbol}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.detail || 'Failed to fetch review');
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
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
        <div className="mt-8 space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg shadow">
        <p className="text-red-600 dark:text-red-400 font-medium">⚠️ Buffett-Style Review Unavailable</p>
        <p className="text-sm text-red-500 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (!data || !data.sections) {
    return null;
  }

  const { recommendation, ...otherSections } = data.sections;

  const getBadgeClass = (rec: string) => {
    switch (rec.toUpperCase()) {
      case 'BUY':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'SELL':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'HOLD':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };

  return (
    <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Buffett-Style Review</h2>
      {recommendation && (
        <div className="mb-6">
          <span className={`px-4 py-2 rounded-full text-lg font-bold ${getBadgeClass(recommendation)}`}>
            {recommendation.toUpperCase()}
          </span>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(otherSections).map(([title, content]) => (
          <div key={title}>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-600 pb-2">{title}</h3>
            <div className="prose prose-sm dark:prose-invert max-w-none">
                <SectionContent content={content} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuffettReview;
