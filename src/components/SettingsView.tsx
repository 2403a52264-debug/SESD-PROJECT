import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Plus,
  Trash2,
  Check,
  RotateCcw,
  Bot
} from 'lucide-react';
import { CustomRuleItem, UserSettingsData } from '../types/index.ts';

interface SettingsViewProps {
  settings: UserSettingsData;
  rules: CustomRuleItem[];
  onUpdateSettings: (updates: Partial<UserSettingsData>) => void;
  onCreateRule: (rule: Partial<CustomRuleItem>) => void;
  onUpdateRule: (id: string, rule: Partial<CustomRuleItem>) => void;
  onDeleteRule: (id: string) => void;
  onReseedData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  rules,
  onUpdateSettings,
  onCreateRule,
  onUpdateRule,
  onDeleteRule,
  onReseedData
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'ai' | 'ingest'>('rules');

  // Rule Form State
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [conditionField, setConditionField] = useState<'extension' | 'filename' | 'category' | 'size'>('filename');
  const [conditionOperator, setConditionOperator] = useState<'equals' | 'contains' | 'greater_than' | 'ends_with'>('contains');
  const [conditionValue, setConditionValue] = useState('');
  const [destinationFolder, setDestinationFolder] = useState('Organized Files/Documents');
  const [priority, setPriority] = useState<number>(rules.length + 1);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim() || !conditionValue.trim() || !destinationFolder.trim()) return;

    onCreateRule({
      name: ruleName.trim(),
      conditionField,
      conditionOperator,
      conditionValue: conditionValue.trim(),
      destinationFolder: destinationFolder.trim(),
      priority: Number(priority),
      enabled: true
    });

    setRuleName('');
    setConditionValue('');
    setShowRuleModal(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-100">
          Preferences & Custom Rule Engine
        </h2>
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
          <span>Priority Rule Evaluation</span>
          <span aria-hidden="true">·</span>
          <span>AI Model Routing</span>
          <span aria-hidden="true">·</span>
          <span>Intake Criteria</span>
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
            activeTab === 'rules' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Custom Routing Rules ({rules.length})
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
            activeTab === 'ai' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          AI Classifier Engine
        </button>
        <button
          onClick={() => setActiveTab('ingest')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
            activeTab === 'ingest' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Intake Limits & Storage
        </button>
      </div>

      {/* Tab 1: Custom Rules Engine */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-slate-200">Defined Routing Rules</h3>
              <p className="text-[11px] text-slate-400">Rules are evaluated sequentially by priority order before AI defaults</p>
            </div>
            <button
              onClick={() => setShowRuleModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Rule</span>
            </button>
          </div>

          <div className="rounded-xl bg-slate-900 border border-slate-800 divide-y divide-slate-800 overflow-hidden">
            {rules.map((rule, idx) => (
              <div key={rule.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded bg-slate-950 border border-slate-800 flex items-center justify-center font-mono text-[11px] text-slate-400 shrink-0">
                    #{rule.priority || idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{rule.name}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        rule.enabled ? 'text-emerald-400 bg-emerald-950/60' : 'text-slate-500 bg-slate-800'
                      }`}>
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 mt-1 font-mono">
                      <span className="text-indigo-400 font-medium">IF</span>
                      <span className="text-slate-300">{rule.conditionField}</span>
                      <span className="text-indigo-300">{rule.conditionOperator.replace('_', ' ')}</span>
                      <span className="text-amber-300">"{rule.conditionValue}"</span>
                      <span className="text-indigo-400 font-medium">THEN MOVE TO</span>
                      <span className="text-emerald-300">{rule.destinationFolder}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onUpdateRule(rule.id, { enabled: !rule.enabled })}
                    className={`p-1.5 rounded transition-colors ${
                      rule.enabled ? 'text-emerald-400 hover:bg-emerald-950/40' : 'text-slate-500 hover:bg-slate-800'
                    }`}
                    title={rule.enabled ? 'Disable rule' : 'Enable rule'}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteRule(rule.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                    title="Delete rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: AI Settings */}
      {activeTab === 'ai' && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-semibold text-slate-200">AI Classification Engine</h3>
              <p className="text-[11px] text-slate-400">Configure multimodal document parsing and vision processing</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Enable AI Engine</span>
              <input
                type="checkbox"
                checked={settings.aiEnabled}
                onChange={e => onUpdateSettings({ aiEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Active AI Provider</label>
              <select
                value={settings.aiProvider}
                onChange={e => onUpdateSettings({ aiProvider: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 text-xs focus:outline-none"
              >
                <option value="gemini">Google Gemini (Server-side)</option>
                <option value="openai">OpenAI API (Configurable)</option>
                <option value="rule_based">Deterministic Rule Engine (Local Offline)</option>
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Gemini 3.8 Flash handles high-throughput document extraction and multimodal vision analysis.
              </p>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Gemini Model ID</label>
              <input
                type="text"
                value={settings.geminiModel}
                onChange={e => onUpdateSettings({ geminiModel: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 text-xs font-mono focus:outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Pre-configured to <code className="text-indigo-400">gemini-3.8-flash</code> per system instructions.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Offline Rule Fallback: <strong>Active & Verified</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Ingest Limits & Storage */}
      {activeTab === 'ingest' && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-xs font-semibold text-slate-200">Storage & Upload Constraints</h3>
            <p className="text-[11px] text-slate-400">Safety rules and automated organization upon file ingest</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Max Upload File Size (MB)</label>
              <input
                type="number"
                value={settings.maxUploadSizeMb}
                onChange={e => onUpdateSettings({ maxUploadSizeMb: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 text-xs font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Default Organization Strategy</label>
              <select
                value={settings.defaultOrganizeBy}
                onChange={e => onUpdateSettings({ defaultOrganizeBy: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 text-xs focus:outline-none"
              >
                <option value="ai_category">AI Suggested Category</option>
                <option value="custom_rules">Custom Rule Engine</option>
                <option value="extension">File Extension</option>
                <option value="date">Date Hierarchy (Year / Month)</option>
                <option value="size">File Size Tier</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoOrganizeOnUpload}
                onChange={e => onUpdateSettings({ autoOrganizeOnUpload: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700"
              />
              <span>Automatically organize newly uploaded files immediately upon ingestion</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-slate-300">College Demo Reseed</h4>
              <p className="text-[11px] text-slate-500">Restore factory demonstration files, invoices, resumes, and receipts</p>
            </div>
            <button
              onClick={() => {
                if (confirm('Reset database with sample realistic SESD college test files?')) {
                  onReseedData();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Reset Sample Data</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md space-y-4 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-200">Create Custom Organization Rule</h3>
            <form onSubmit={handleCreateRule} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Rule Name</label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={e => setRuleName(e.target.value)}
                  placeholder="e.g. Route Engineering Contracts"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">If Field</label>
                  <select
                    value={conditionField}
                    onChange={e => setConditionField(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none"
                  >
                    <option value="filename">Filename</option>
                    <option value="extension">Extension</option>
                    <option value="category">AI Category</option>
                    <option value="size">Size (MB)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Condition</label>
                  <select
                    value={conditionOperator}
                    onChange={e => setConditionOperator(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none"
                  >
                    <option value="contains">Contains</option>
                    <option value="equals">Equals</option>
                    <option value="ends_with">Ends with</option>
                    <option value="greater_than">Greater than</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Match Value</label>
                <input
                  type="text"
                  value={conditionValue}
                  onChange={e => setConditionValue(e.target.value)}
                  placeholder="e.g. contract or .pdf or 5"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Destination Folder</label>
                <input
                  type="text"
                  value={destinationFolder}
                  onChange={e => setDestinationFolder(e.target.value)}
                  placeholder="e.g. Organized Files/Documents/Contracts"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRuleModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-sm"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
