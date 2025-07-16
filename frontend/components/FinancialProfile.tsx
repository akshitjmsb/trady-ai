import React from 'react';

// Helper component for displaying a single metric
interface MetricItemProps {
  label: string;
  value: string | number;
}

const MetricItem: React.FC<MetricItemProps> = ({ label, value }) => (
  <div className="flex justify-between text-sm py-1 border-b border-gray-200">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-900">{value}</span>
  </div>
);

// Type definition for the metrics object
interface FinancialMetrics {
  prevClose: number | string;
  open: number | string;
  dayRange: string;
  fiftyTwoWeekRange: string;
  marketCap: number | string;
  peRatio: number | string;
  volume: number | string;
  dividendYield: number | string;
  eps: number | string;
}

interface FinancialProfileProps {
  metrics: FinancialMetrics;
}

// Utility to format numbers (e.g., Market Cap, Volume)
const formatLargeNumber = (num: any): string => {
  if (typeof num !== 'number') return 'N/A';
  if (num >= 1_000_000_000_000) {
    return `${(num / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }
  return num.toLocaleString();
};

const FinancialProfile: React.FC<FinancialProfileProps> = ({ metrics }) => {
  const formatMetric = (value: any, formatter?: (val: any) => string): string => {
    if (value === null || value === undefined || value === 'N/A') return 'N/A';
    return formatter ? formatter(value) : value;
  };

  const formattedMetrics = {
    prevClose: formatMetric(metrics.prevClose, (v) => `$${Number(v).toFixed(2)}`),
    open: formatMetric(metrics.open, (v) => `$${Number(v).toFixed(2)}`),
    dayRange: formatMetric(metrics.dayRange),
    '52wRange': formatMetric(metrics.fiftyTwoWeekRange),
    marketCap: formatMetric(metrics.marketCap, formatLargeNumber),
    peRatio: formatMetric(metrics.peRatio, (v) => Number(v).toFixed(2)),
    volume: formatMetric(metrics.volume, (v) => Number(v).toLocaleString()),
    dividendYield: formatMetric(metrics.dividendYield, (v) => `${(Number(v) * 100).toFixed(2)}%`),
    eps: formatMetric(metrics.eps, (v) => `$${Number(v).toFixed(2)}`),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 pt-4">
      <MetricItem label="Prev Close" value={formattedMetrics.prevClose} />
      <MetricItem label="Open" value={formattedMetrics.open} />
      <MetricItem label="Day Range" value={formattedMetrics.dayRange} />
      <MetricItem label="52W Range" value={formattedMetrics['52wRange']} />
      <MetricItem label="Market Cap" value={formattedMetrics.marketCap} />
      <MetricItem label="P/E Ratio" value={formattedMetrics.peRatio} />
      <MetricItem label="Volume" value={formattedMetrics.volume} />
      <MetricItem label="Dividend Yield" value={formattedMetrics.dividendYield} />
      <MetricItem label="EPS" value={formattedMetrics.eps} />
    </div>
  );
};

export default FinancialProfile;
