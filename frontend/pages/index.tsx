import React, { useState, useEffect } from 'react';
import SnapshotCard from '../components/SnapshotCard';
import EarningsAnalysis from '../components/EarningsAnalysis';
import BuffettReview from '../components/BuffettReview';
import MungerReview from '../components/MungerReview';

type StockSummaryData = {
  name: string;
  price: number | string;
  marketCap: string;
  peRatio: number | string;
  sector: string;
} | null;

// Mock data for AAPL and MSFT (30 days)
const mockStockData: { [symbol: string]: { date: string; close: number }[] } = {
  AAPL: Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().slice(0, 10),
      close: 180 + Math.sin(i / 4) * 5 + Math.random() * 2, // Simulated close price
    };
  }),
  MSFT: Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().slice(0, 10),
      close: 330 + Math.cos(i / 5) * 4 + Math.random() * 2,
    };
  }),
};

const HomePage: React.FC = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [input, setInput] = useState('AAPL');
  const [summary, setSummary] = useState<StockSummaryData>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('snapshot');

  const fetchStockSummary = async (symbol: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/stock-summary?symbol=${symbol}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stock summary');
      }
      const data = await response.json();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSymbol = input.trim().toUpperCase();
    setSymbol(newSymbol);
    fetchStockSummary(newSymbol);
  };

  // Fetch summary when component mounts or symbol changes
  useEffect(() => {
    fetchStockSummary(symbol);
  }, [symbol]);

  const chartData = mockStockData[symbol] || [];

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Stock Insights
          </h1>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-center justify-center mb-4">
            <label htmlFor="symbol" className="block text-sm font-medium text-gray-700">
              Enter Stock Symbol
            </label>
            <input
              type="text"
              id="symbol"
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              className="w-full md:w-40 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., AAPL"
              maxLength={8}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className={`bg-blue-600 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${!input.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
              Get Insights
            </button>
          </form>
          {symbol && (
            <>
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('snapshot')}
                    className={`${activeTab === 'snapshot' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Snapshot
                  </button>
                  <button
                    onClick={() => setActiveTab('earnings')}
                    className={`${activeTab === 'earnings' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Earnings Analysis
                  </button>
                                    <button
                    onClick={() => setActiveTab('buffett')}
                    className={`${activeTab === 'buffett' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Buffett-Style Review
                  </button>
                  <button
                    onClick={() => setActiveTab('munger')}
                    className={`${activeTab === 'munger' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Munger Mgmt Review
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                {activeTab === 'snapshot' && <SnapshotCard symbol={symbol} />}
                {activeTab === 'earnings' && <EarningsAnalysis symbol={symbol} />}
                                {activeTab === 'buffett' && <BuffettReview symbol={symbol} />}
                {activeTab === 'munger' && <MungerReview symbol={symbol} />}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
