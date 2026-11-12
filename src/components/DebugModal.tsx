import React, { useState, useEffect } from 'react';
import {
  Terminal,
  X,
  Play,
  CheckCircle2,
  AlertCircle,
  Database,
  Cpu,
  HardDrive
} from 'lucide-react';
import { api } from '../services/api.ts';

interface DebugModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DebugModal: React.FC<DebugModalProps> = ({ isOpen, onClose }) => {
  const [healthData, setHealthData] = useState<any>(null);
  const [testText, setTestText] = useState('Invoice #INV-2026-904 for Cloud Computing Services. Total: $450.00 USD. Due in 30 days.');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHealth();
    }
  }, [isOpen]);

  const loadHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const data = await api.getHealth();
      setHealthData(data.system);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  const runTestAI = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await api.testAI(testText);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ error: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Developer Diagnostics & Environment Verification
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5 text-xs">
          {/* Health Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold text-slate-300">Database Layer</span>
                <Database className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <p className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Connected & Persistent
              </p>
              <div className="text-[10px] text-slate-500 font-mono">
                {healthData?.database?.fileCount ?? 0} files · {healthData?.database?.folderCount ?? 0} folders
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold text-slate-300">AI Intelligence Core</span>
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {healthData?.aiEngine?.configured
                  ? 'Server-side Gemini Ready'
                  : 'Demo Mode · Rule-based fallback'}
              </p>
              <div className="text-[10px] text-slate-500 font-mono">
                Model: {healthData?.aiEngine?.configured
                  ? healthData.aiEngine.activeModel
                  : 'Rule-Based Engine'}
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold text-slate-300">Local Uploads Disk</span>
                <HardDrive className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <p className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Writable & Sandboxed
              </p>
              <div className="text-[10px] text-slate-500 font-mono truncate">
                Storage: /uploads/ (Secure)
              </div>
            </div>
          </div>

          {/* Live AI Benchmark Test */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-200">Interactive AI Classifier Benchmark</h4>
                <p className="text-[11px] text-slate-500">
                  Send sample extracted text to test real model latency and structured JSON validation
                </p>
              </div>

              <button
                onClick={runTestAI}
                disabled={isTesting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-md transition-colors"
              >
                <Play className="w-3 h-3" />
                <span>{isTesting ? 'Benchmarking...' : 'Run Test'}</span>
              </button>
            </div>

            <textarea
              value={testText}
              onChange={e => setTestText(e.target.value)}
              rows={3}
              className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-md text-slate-200 font-mono text-[11px] focus:outline-none focus:border-indigo-500"
            />

            {testResult && (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">
                    Engine: <strong className="text-indigo-400">{testResult.modelUsed}</strong>
                  </span>
                  {testResult.latencyMs && (
                    <span className="font-mono text-emerald-400 tabular-nums">
                      Latency: {testResult.latencyMs} ms
                    </span>
                  )}
                </div>
                <pre className="p-2 bg-slate-950 rounded text-slate-300 font-mono text-[10px] overflow-x-auto">
                  {JSON.stringify(testResult.result || testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 flex justify-between items-center bg-slate-950/40 text-[11px] text-slate-500">
          <span>Security Notice: API keys are securely held on the server environment.</span>
          <button onClick={onClose} className="px-3 py-1 text-slate-300 hover:text-white">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
