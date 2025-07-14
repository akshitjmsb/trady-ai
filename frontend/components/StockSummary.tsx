import React from 'react';
import { Skeleton } from './ui/skeleton';

type StockSummaryProps = {
  data: {
    name: string;
    price: number | string;
    marketCap: string;
    peRatio: number | string;
    sector: string;
  } | null;
  isLoading: boolean;
  error: string | null;
};

const StockSummary: React.FC<StockSummaryProps> = ({ data, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Stock Summary</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Stock Summary</h2>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { name, price, marketCap, peRatio, sector } = data;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 transition-all duration-200">
      <h2 className="text-xl font-semibold mb-4">Stock Summary</h2>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Company</span>
          <span className="font-medium">{name || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Price</span>
          <span className="font-medium">
            {typeof price === 'number' ? `$${price.toFixed(2)}` : price}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Market Cap</span>
          <span className="font-medium">{marketCap || 'N/A'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">P/E Ratio</span>
          <span className="font-medium">
            {typeof peRatio === 'number' ? peRatio.toFixed(2) : peRatio}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-300">Sector</span>
          <span className="font-medium">{sector || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default StockSummary;
