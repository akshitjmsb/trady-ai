// frontend/lib/types.ts

// This file centralizes all TypeScript type definitions for our application,
// ensuring consistency and making the code easier to maintain.

export interface SnapshotHeader {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

export interface SnapshotChart {
  series: { timestamp: string; value: number | null }[];
}

export interface SnapshotMetrics {
  prevClose: number;
  open: number;
  dayRange: string;
  fiftyTwoWeekRange: string;
  marketCap: number;
  peRatio: number;
  volume: number;
  dividendYield: number;
  eps: number;
}

export interface SnapshotData {
  header: SnapshotHeader;
  chart: SnapshotChart;
  metrics: SnapshotMetrics;
}

export interface MungerRating {
  criterion: string;
  explanation: string;
  rating: number;
}

export interface MungerReviewData {
  ratings: MungerRating[];
  overallScore: string;
  summary: string;
  verdict: 'BUY' | 'WATCH' | 'AVOID';
}

export interface BuffettReviewData {
  sections: Record<string, string>;
}

export interface EarningsData {
  earningsDate: string;
  actualEPS: number | null;
  expectedEPS: number | null;
  prices: { date: string; cumPctChange: number }[];
}
