import React, { useState } from 'react';

const HomePage: React.FC = () => {
  const [symbol, setSymbol] = useState('');

  const fetchStockData = async () => {
    // TODO: Implement backend API call
    console.log('Fetching data for:', symbol);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Stock Insights
          </h1>
          <div className="space-y-4">
            <div>
              <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-1">
                Enter Stock Symbol
              </label>
              <input
                type="text"
                id="symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., AAPL"
              />
            </div>
            <button
              onClick={fetchStockData}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Get Insights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
