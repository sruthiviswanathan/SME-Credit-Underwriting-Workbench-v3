import React, { useState } from 'react';
import {
  Activity,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Layers,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  Check,
} from 'lucide-react';
import { GoldenScenario, PolicyStatus } from '../types';

interface GoldenScenariosRunnerProps {
  scenarios: GoldenScenario[];
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: GoldenScenario) => void;
  activeScenarioId?: string;
}

export const GoldenScenariosRunner: React.FC<GoldenScenariosRunnerProps> = ({
  scenarios,
  isOpen,
  onClose,
  onSelectScenario,
  activeScenarioId,
}) => {
  const [suiteResults, setSuiteResults] = useState<{
    summary?: { total: number; passed: number; failed: number; pass_rate: string };
    results?: { scenario_id: string; code: string; title: string; passed: boolean; details: string }[];
  } | null>(null);
  const [isRunningSuite, setIsRunningSuite] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleRunSuite = async () => {
    setIsRunningSuite(true);
    try {
      const res = await fetch('/api/verify-suite', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSuiteResults(data);
      }
    } catch (err) {
      console.error('Failed to run verification suite', err);
    } finally {
      setIsRunningSuite(false);
    }
  };

  const categories = ['ALL', ...Array.from(new Set(scenarios.map((s) => s.category)))];

  const filteredScenarios = scenarios.filter((s) => {
    const matchesCat = selectedCategory === 'ALL' || s.category === selectedCategory;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.stress_condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.key_assertion.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">15 Golden Scenarios Evaluation Suite (GS-01 to GS-15)</h3>
              <p className="text-xs text-slate-400 font-mono">
                PRD Verification Matrix: Deterministic Primacy, Semantic Segregation, Prompt Injection & Multi-Tenancy
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm cursor-pointer p-1">
            ✕
          </button>
        </div>

        {/* Action & Filter Toolbar */}
        <div className="bg-slate-950/70 px-6 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center flex-wrap gap-3">
            {/* Run Suite Button */}
            <button
              onClick={handleRunSuite}
              disabled={isRunningSuite}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-950/40 transition-all disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isRunningSuite ? 'animate-spin' : ''}`} />
              <span>{isRunningSuite ? 'Evaluating 15 Scenarios...' : 'Run Automated Test Suite'}</span>
            </button>

            {suiteResults?.summary && (
              <div className="flex items-center gap-2 font-mono text-[11px] bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Suite Results:</span>
                <span className="text-emerald-400 font-bold">
                  {suiteResults.summary.passed}/{suiteResults.summary.total} Passed ({suiteResults.summary.pass_rate})
                </span>
              </div>
            )}
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search scenarios or rules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 text-xs outline-none w-48 focus:w-60 transition-all"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 text-xs outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scenarios Grid */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredScenarios.map((sc) => {
              const isActive = activeScenarioId === sc.id;
              const testResult = suiteResults?.results?.find((r) => r.scenario_id === sc.id);

              return (
                <div
                  key={sc.id}
                  className={`p-4 rounded-xl border transition-all space-y-3 flex flex-col justify-between ${
                    isActive
                      ? 'bg-slate-850 border-cyan-500 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/30'
                      : 'bg-slate-950 hover:bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-slate-900 text-cyan-300 border border-slate-800">
                          {sc.id}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">({sc.code})</span>
                      </div>

                      {testResult && (
                        <span
                          className={`text-[11px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 font-bold ${
                            testResult.passed
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : 'bg-rose-950 text-rose-300 border border-rose-700'
                          }`}
                        >
                          {testResult.passed ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-400" />
                          )}
                          {testResult.passed ? 'ASSERTION PASS' : 'FAIL'}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-white text-sm">{sc.title}</h4>
                    <span className="text-[10px] font-medium text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/60 inline-block">
                      {sc.category}
                    </span>

                    <p className="text-slate-300 text-xs leading-relaxed">{sc.stress_condition}</p>

                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-400">
                      <span className="text-cyan-400 font-bold block mb-0.5 font-sans uppercase text-[10px]">
                        Key Evaluation Assertion:
                      </span>
                      {sc.key_assertion}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {sc.tags.map((t) => (
                        <span key={t} className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                          {t}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        onSelectScenario(sc);
                        onClose();
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
                        isActive
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      <span>{isActive ? 'Active in Workbench' : 'Load Scenario'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
