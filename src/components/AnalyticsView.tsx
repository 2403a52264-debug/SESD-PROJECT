import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import {
  BarChart3,
  HardDrive,
  FileCheck,
  Sparkles,
  Copy,
  TrendingUp,
  Percent
} from 'lucide-react';
import { AnalyticsData } from '../types/index.ts';

interface AnalyticsViewProps {
  analytics: AnalyticsData | null;
}

const COLORS = ['#6366F1', '#3B82F6', '#10B981', '#EC4899', '#F59E0B', '#8B5CF6', '#14B8A6'];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics }) => {
  if (!analytics) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading analytics records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-100">
          Repository Analytics & Telemetry
        </h2>
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
          <span>Real-time DB Aggregations</span>
          <span aria-hidden="true">·</span>
          <span>Zero Hardcoded Stats</span>
          <span aria-hidden="true">·</span>
          <span>Format & Confidence Profiles</span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Classification Success</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-100 font-mono tabular-nums">
            {analytics.classificationRate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {analytics.classifiedFiles} of {analytics.totalFiles} files recognized
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Avg AI Confidence</span>
            <Percent className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-100 font-mono tabular-nums">
            {(analytics.averageConfidence * 100).toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Evaluated by Gemini Flash & rule verification
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Storage Footprint</span>
            <HardDrive className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-100 font-mono tabular-nums">
            {analytics.totalStorageFormatted}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {analytics.totalStorageBytes.toLocaleString()} bytes allocated
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Duplicate Redundancy</span>
            <Copy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-100 font-mono tabular-nums">
            {analytics.duplicateCount} files
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Identified by SHA-256 fingerprinting
          </p>
        </div>
      </div>

      {/* Main Charts: 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category Distribution Bar Chart */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-slate-200">
                AI Category Distribution
              </h3>
              <p className="text-[11px] text-slate-400">Document counts per classified taxonomy bucket</p>
            </div>
            <BarChart3 className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.categoryDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="category" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Upload Trendline */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-slate-200">
                Monthly Ingestion Volume
              </h3>
              <p className="text-[11px] text-slate-400">Cumulative upload frequency over past 6 months</p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.monthlyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="uploads"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10B981' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Extension Breakdown Table */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <h3 className="text-xs font-semibold text-slate-200">
          File Format & Storage Distribution
        </h3>
        <p className="text-[11px] text-slate-400">Detailed representation of extensions and relative storage proportions</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
          {analytics.fileTypeDistribution.map((item, idx) => (
            <div key={item.name} className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="font-mono text-xs font-semibold text-indigo-400">
                .{item.name.toLowerCase()}
              </span>
              <div className="text-lg font-bold text-slate-100 font-mono tabular-nums mt-1">
                {item.count}
              </div>
              <p className="text-[10px] text-slate-500 font-mono tabular-nums">
                {item.percentage}% of catalog
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
