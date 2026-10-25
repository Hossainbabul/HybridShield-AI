import React, { useState } from 'react';
import { Sliders, Shield, Plus, Trash2, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { SystemConfig } from '../types/moderation';
import { DEFAULT_CONFIG } from '../lib/moderator';

interface RulesConfigProps {
  language: 'en' | 'bn';
  config: SystemConfig;
  onChangeConfig: (newConfig: SystemConfig) => void;
}

export const RulesConfig: React.FC<RulesConfigProps> = ({ language, config, onChangeConfig }) => {
  const isEn = language === 'en';

  const [newPattern, setNewPattern] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleToggleRule = (id: string) => {
    const updated = config.hardBlockRegexes.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    onChangeConfig({ ...config, hardBlockRegexes: updated });
  };

  const handleDeleteRule = (id: string) => {
    const updated = config.hardBlockRegexes.filter((r) => r.id !== id);
    onChangeConfig({ ...config, hardBlockRegexes: updated });
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPattern.trim()) return;

    try {
      new RegExp(newPattern.trim(), 'i');
    } catch (err) {
      alert(isEn ? 'Invalid Regular Expression syntax' : 'ভুল রেগুলার এক্সপ্রেশন সিনট্যাক্স');
      return;
    }

    const newRule = {
      id: `rule-${Date.now()}`,
      pattern: newPattern.trim(),
      description: newDesc.trim() || 'Custom user rule',
      enabled: true
    };

    onChangeConfig({
      ...config,
      hardBlockRegexes: [...config.hardBlockRegexes, newRule]
    });

    setNewPattern('');
    setNewDesc('');
    setFeedback(isEn ? 'New regex rule successfully added!' : 'নতুন রেজেক্স রুল সফলভাবে যুক্ত হয়েছে!');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleResetToDefaults = () => {
    onChangeConfig({ ...DEFAULT_CONFIG });
    setFeedback(isEn ? 'Config reset to architectural defaults.' : 'ডিফল্ট কনফিগারেশন রিস্টোর করা হয়েছে।');
    setTimeout(() => setFeedback(null), 3000);
  };

  // Calculate grey-area width
  const greyAreaSpan = Math.round((config.mlHighToxicThreshold - config.mlLowToxicThreshold) * 100);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Sliders className="h-4 w-4 text-cyan-400" />
            {isEn ? 'Engine Tuning & Decision Boundaries' : 'ইঞ্জিন টিউনিং ও ডিসিশন বাউন্ডারি'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isEn
              ? 'Calibrate confidence thresholds and customize deterministic Layer 1 RegEx rules.'
              : 'ক্লাসিক্যাল এমএলের কনফিডেন্স থ্রেশহোল্ড নিয়ন্ত্রণ করুন এবং লেয়ার ১ রেজেক্স রুলস পরিচালনা করুন।'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetToDefaults}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>{isEn ? 'Reset to Defaults' : 'ডিফল্ট রিস্টোর'}</span>
        </button>
      </div>

      {feedback && (
        <div className="bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Section 1: ML Decision Boundaries (Sliders) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
          <span>🎯</span>
          {isEn ? 'Layer 2 Classical ML Confidence Thresholds' : 'লেয়ার ২ ক্লাসিক্যাল এমএল কনফিডেন্স থ্রেশহোল্ড'}
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          {isEn
            ? 'Adjust where the classical model cuts off. Expanding the grey-area increases LLM reasoning costs; shrinking it increases false-positives/negatives.'
            : 'থ্রেশহোল্ড ঠিক করুন। গ্রে-এরিয়া বাড়ালে নিখুঁতভাবে এলএলএম যুক্তি দেখাবে কিন্তু খরচ সামান্য বাড়বে; কমালে ১০০% ফ্রি থাকবে।'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lower Safe Threshold */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-400">
                {isEn ? 'Lower Safe Threshold (Instant Allow)' : 'লোয়ার সেফ থ্রেশহোল্ড (তাৎক্ষণিক অনুমোদন)'}
              </span>
              <span className="text-sm font-mono font-bold text-white">
                {(config.mlLowToxicThreshold * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.40"
              step="0.01"
              value={config.mlLowToxicThreshold}
              onChange={(e) =>
                onChangeConfig({
                  ...config,
                  mlLowToxicThreshold: parseFloat(e.target.value)
                })
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-2">
              {isEn
                ? `Comments with toxic probability <= ${(config.mlLowToxicThreshold * 100).toFixed(0)}% are published immediately with $0 cost in <1ms.`
                : `টক্সিক সম্ভাবনা ${(config.mlLowToxicThreshold * 100).toFixed(0)}%-এর কম হলে কোনো খরচ ছাড়াই সাথে সাথে পাবলিশ হবে।`}
            </p>
          </div>

          {/* Upper Toxic Threshold */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-rose-400">
                {isEn ? 'Upper Toxic Threshold (Instant Block)' : 'আপার টক্সিক থ্রেশহোল্ড (তাৎক্ষণিক ব্লক)'}
              </span>
              <span className="text-sm font-mono font-bold text-white">
                {(config.mlHighToxicThreshold * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.60"
              max="0.95"
              step="0.01"
              value={config.mlHighToxicThreshold}
              onChange={(e) =>
                onChangeConfig({
                  ...config,
                  mlHighToxicThreshold: parseFloat(e.target.value)
                })
              }
              className="w-full accent-rose-500 cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-2">
              {isEn
                ? `Comments with toxic probability >= ${(config.mlHighToxicThreshold * 100).toFixed(0)}% are rejected instantly with $0 cost in <1ms.`
                : `টক্সিক সম্ভাবনা ${(config.mlHighToxicThreshold * 100).toFixed(0)}%-এর বেশি হলে কোনো খরচ ছাড়াই সরাসরি ব্লক হবে।`}
            </p>
          </div>
        </div>

        {/* Visual Zone Gauge */}
        <div className="mt-5 p-3.5 bg-slate-950/90 border border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-medium">
              {isEn ? 'Resulting Traffic Routing Bands:' : 'রাউটিং জোনের বর্তমান বিস্তার:'}
            </span>
            <span className="font-mono text-cyan-400 text-xs">
              Grey-Area Band: {greyAreaSpan}% of probability range
            </span>
          </div>

          <div className="h-6 w-full rounded-lg overflow-hidden flex border border-slate-800 text-[10px] font-bold font-mono text-center text-slate-950">
            <div
              className="bg-emerald-500 flex items-center justify-center transition-all duration-200"
              style={{ width: `${config.mlLowToxicThreshold * 100}%` }}
            >
              SAFE ($0)
            </div>
            <div
              className="bg-amber-400 flex items-center justify-center transition-all duration-200 text-slate-900"
              style={{ width: `${greyAreaSpan}%` }}
            >
              LLM FALLBACK (~5-10% traffic)
            </div>
            <div
              className="bg-rose-500 flex items-center justify-center transition-all duration-200 text-white"
              style={{ width: `${(1 - config.mlHighToxicThreshold) * 100}%` }}
            >
              BLOCK ($0)
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Layer 1 Hard Block Rules (RegEx) */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
          <Shield className="h-4 w-4 text-rose-400" />
          {isEn ? 'Layer 1 Deterministic RegEx Filter Rules' : 'লেয়ার ১ ডিটারমিনিস্টিক রেজেক্স রুলস'}
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          {isEn
            ? 'Absolute rules evaluated in 0.05ms before any machine learning or LLM compute is engaged.'
            : 'যেকোনো কমেন্ট আসার সাথে সাথে ০.০৫ms-এ এই রেজেক্স রুলগুলো চেক হয়। মিলে গেলে তাৎক্ষণিক $০ খরচে ব্যবস্থা নেওয়া হয়।'}
        </p>

        {/* Existing Rules List */}
        <div className="space-y-2.5 mb-5">
          {config.hardBlockRegexes.map((rule) => (
            <div
              key={rule.id}
              className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors ${
                rule.enabled ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200">{rule.description}</span>
                  <span
                    className={`text-[10px] px-2 py-0.2 rounded-full font-mono ${
                      rule.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {rule.enabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <div className="text-xs font-mono text-cyan-400/90 break-all bg-slate-900/60 px-2 py-1 rounded">
                  /{rule.pattern}/i
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleRule(rule.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    rule.enabled
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {rule.enabled ? (isEn ? 'Disable' : 'নিষ্ক্রিয়') : (isEn ? 'Enable' : 'সক্রিয়')}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
                  title="Delete rule"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Rule Form */}
        <form onSubmit={handleAddRule} className="bg-slate-950/90 border border-slate-800 rounded-xl p-4">
          <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5 text-cyan-400" />
            {isEn ? 'Add Custom Regular Expression Rule' : 'নতুন রেজেক্স রুল যুক্ত করুন'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                {isEn ? 'RegEx Pattern (Case Insensitive):' : 'রেজেক্স প্যাটার্ন:'}
              </label>
              <input
                type="text"
                value={newPattern}
                onChange={(e) => setNewPattern(e.target.value)}
                placeholder="\\b(badword1|badword2)\\b"
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg p-2 text-xs font-mono text-slate-100 placeholder-slate-600"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                {isEn ? 'Rule Description / Policy Reason:' : 'নিয়মের বিবরণ / কারণ:'}
              </label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder={isEn ? 'Custom promotional spam pattern' : 'কাস্টম স্প্যাম প্যাটার্ন'}
                className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!newPattern.trim()}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{isEn ? 'Save RegEx Rule' : 'রুল সংরক্ষণ করুন'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
