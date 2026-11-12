import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  Files,
  Sparkles,
  FolderTree,
  Copy,
  BarChart3,
  History,
  Settings,
  ShieldCheck,
  Terminal,
  BookOpen,
  Archive
} from 'lucide-react';
import { ViewTab } from '../types/index.ts';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onOpenDebug: () => void;
  onOpenDocs: () => void;
  fileCount: number;
  duplicateCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenDebug,
  onOpenDocs,
  fileCount,
  duplicateCount
}) => {
  const navItems: { id: ViewTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Files', icon: UploadCloud },
    { id: 'files', label: 'All Files', icon: Files, badge: fileCount },
    { id: 'categories', label: 'AI Categories', icon: Sparkles },
    { id: 'folders', label: 'Folders', icon: FolderTree },
    { id: 'duplicates', label: 'Duplicate Files', icon: Copy, badge: duplicateCount > 0 ? duplicateCount : undefined },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'history', label: 'Activity History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-slate-800 gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm tracking-tight shadow-sm">
            SF
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold tracking-tight text-slate-100 truncate">
              Smart File Organizer
            </h1>
            <p className="text-[11px] text-slate-400 truncate">
              AI Intelligent Ingest
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[11px] font-mono tabular-nums px-1.5 py-0.2 rounded ${
                    isActive ? 'text-indigo-300 bg-indigo-900/40' : 'text-slate-400 bg-slate-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Area: College SESD Docs + Diagnostics + User Profile */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenDocs}
            className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-800 transition-colors"
            title="View College SESD Architecture & SRS Specification"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>SESD Docs</span>
          </button>
          <button
            onClick={onOpenDebug}
            className="flex items-center justify-center p-1.5 rounded-md text-slate-400 bg-slate-800/80 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            title="System Diagnostics & AI Status"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>

        <a
          href="/api/project-zip"
          download="smart-file-organizer-college-project.zip"
          className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm"
          title="Download complete project source code ZIP for college submission"
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Download Project ZIP</span>
        </a>

        {/* User Card */}
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300">
            SJ
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-200 truncate">Siddhartha Jakku</p>
            <p className="text-[10px] text-slate-400 truncate">SESD Lead Architect</p>
          </div>
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        </div>
      </div>
    </aside>
  );
};
