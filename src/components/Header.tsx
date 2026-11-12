import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  UploadCloud,
  FolderSync,
  X
} from 'lucide-react';
import { ActivityItem } from '../types/index.ts';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenUpload: () => void;
  onOpenOrganize: () => void;
  activities: ActivityItem[];
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenUpload,
  onOpenOrganize,
  activities,
  theme,
  onToggleTheme
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="h-16 px-6 border-b border-slate-800 bg-slate-900/90 backdrop-blur-sm flex items-center justify-between gap-6 shrink-0 relative z-30">
      {/* Search Input Zone */}
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search files by name, tags, or AI category..."
          className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-950/80 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 hover:text-slate-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Action Zone: Organize, Upload, Notifications, Theme, Profile */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenOrganize}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-200 bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-800/60 rounded-md transition-colors whitespace-nowrap"
        >
          <FolderSync className="w-3.5 h-3.5 text-indigo-400" />
          <span>Organize</span>
        </button>

        <button
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-sm transition-colors whitespace-nowrap"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload</span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-0.5" />

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-md transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-md transition-colors"
            title="Notifications & Activity"
          >
            <Bell className="w-4 h-4" />
            {activities.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-200">Recent System Events</span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {activities.slice(0, 6).map(act => (
                  <div key={act.id} className="text-xs p-1.5 rounded bg-slate-950/60 border border-slate-800/50">
                    <p className="font-medium text-slate-300">{act.action}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">{act.details}</p>
                    <span className="text-[10px] font-mono text-slate-500 mt-1 block">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
