import { useState, FormEvent } from 'react';
import Head from 'next/head';
import ThemeToggle from '@/components/ThemeToggle';
import { Icons } from '@/components/icons';
import SnapshotPro from '@/components/SnapshotPro';
import BuffettReview from '@/components/BuffettReview';
import MungerReview from '@/components/MungerReview';
import EarningsAnalysis from '@/components/EarningsAnalysis';

const HomePage = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [input, setInput] = useState('AAPL');
  const [activeTab, setActiveTab] = useState('ai-reviews');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newSymbol = input.trim().toUpperCase();
    if (newSymbol) {
      setSymbol(newSymbol);
    }
  };

  const tabOptions = [
    { key: 'ai-reviews', label: 'AI Reviews' },
    { key: 'earnings', label: 'Earnings' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ai-reviews':
        return (
          <div className="space-y-4">
            <BuffettReview symbol={symbol} />
            <MungerReview symbol={symbol} />
          </div>
        );
      case 'earnings':
        return <EarningsAnalysis symbol={symbol} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      <Head>
        <title>Trady AI - Power Dashboard</title>
        <meta name="description" content="AI-powered stock analysis dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Icons.logo className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">Power Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter symbol..."
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md py-1.5 px-3 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="bg-blue-600 text-white py-1.5 px-4 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 hover:bg-blue-700 transition-colors"
              >
                Analyze
              </button>
            </form>
            <ThemeToggle />
          </div>
        </header>

        {symbol ? (
          <main className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <SnapshotPro symbol={symbol} />
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200 dark:border-slate-800">
                <div className="border-b border-slate-200 dark:border-slate-700">
                  <nav className="p-1.5 flex space-x-1">
                    {tabOptions.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                          activeTab === tab.key
                            ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>
                <div className="p-4 sm:p-6">{renderTabContent()}</div>
              </div>
            </div>
          </main>
        ) : (
          <div className="text-center py-20 text-slate-500">Please enter a stock symbol to begin analysis.</div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
