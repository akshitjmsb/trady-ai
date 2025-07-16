import React, { useState } from 'react';
import Image from 'next/image';

import SnapshotPro from '../components/SnapshotPro';
import EarningsAnalysis from '../components/EarningsAnalysis';
import BuffettReview from '../components/BuffettReview';
import MungerReview from '../components/MungerReview';
import ThemeToggle from '../components/ThemeToggle';

const HomePage: React.FC = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [input, setInput] = useState('AAPL');
  const [activeTab, setActiveTab] = useState('snapshot');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSymbol = input.trim().toUpperCase();
    if (newSymbol) {
      setSymbol(newSymbol);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'snapshot':
        return <SnapshotPro symbol={symbol} />;
      case 'earnings':
        return <EarningsAnalysis symbol={symbol} />;
      case 'buffett':
        return <BuffettReview symbol={symbol} />;
      case 'munger':
        return <MungerReview symbol={symbol} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Theme Toggle */}
        <div className="flex justify-end pt-4 pr-2">
          <ThemeToggle />
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 p-6 md:p-8 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-2 h-10">
              <Image src="/assets/logo/logo-dark.svg" alt="Trady Logo" width={110} height={28} className="dark:hidden" />
              <Image src="/assets/logo/logo-light.svg" alt="Trady Logo" width={110} height={28} className="hidden dark:block" />
            </div>
            <p className='text-base text-slate-500 dark:text-slate-400'>Your AI-Powered Stock Analysis Co-Pilot</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 items-center justify-center">
            <input
              type="text"
              id="symbol"
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              className="w-full md:w-48 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-md focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
              placeholder="e.g., AAPL, TSLA, INFY.NS"
              maxLength={12}
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className={`bg-blue-600 dark:bg-blue-500 text-white py-2 px-5 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-blue-400 dark:focus:ring-offset-slate-900 ${!input.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors'}`}
            >
              Analyze
            </button>
          </form>
        </div>

        {symbol && (
          <div className='mt-8 bg-slate-50 dark:bg-slate-800 p-6 md:p-8 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700'>
            <div className="border-b border-slate-200 dark:border-slate-700">
              <nav className="-mb-px flex space-x-2 justify-center" aria-label="Tabs">
                {['snapshot', 'earnings', 'buffett', 'munger'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`whitespace-nowrap py-3 px-4 rounded-t-md font-medium text-sm capitalize transition-all duration-200 ease-in-out focus:outline-none ${activeTab === tab ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 border-b-transparent text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}
                  >
                    {tab.replace('-', ' ')}
                  </button>
                ))}
              </nav>
            </div>

            <div className="mt-6">
              {renderTabContent()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
