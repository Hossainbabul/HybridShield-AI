import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  Cpu,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  SendHorizontal
} from 'lucide-react';
import { BENCHMARK_SAMPLES } from '../data/benchmarks';
import { ModerationResult, SystemConfig, BenchmarkSample } from '../types/moderation';

interface LiveInferenceWorkbenchProps {
  language: 'en' | 'bn';
  onEvaluate: (text: string) => Promise<ModerationResult>;
  lastResult: ModerationResult | null;
  isEvaluating: boolean;
  onSendToHumanQueue?: (comment: string, result: ModerationResult) => void;
  config: SystemConfig;
}

export const LiveInferenceWorkbench: React.FC<LiveInferenceWorkbenchProps> = ({
  language,
  onEvaluate,
  lastResult,
  isEvaluating,
  onSendToHumanQueue,
  config
}) => {
  const isEn = language === 'en';
  const [commentText, setCommentText] = useState(
    'I am proud of my community and identity. Thank you for creating this welcoming space.'
  );
  const [activePresetId, setActivePresetId] = useState<string>('sample-3');
  const [copiedState, setCopiedState] = useState(false);

  const handleSelectPreset = (sample: BenchmarkSample) => {
    setCommentText(sample.text);
    setActivePresetId(sample.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isEvaluating) return;
    await onEvaluate(commentText.trim());
  };

  // Find active preset metadata if matches
  const activePreset = BENCHMARK_SAMPLES.find((s) => s.id === activePresetId);

  return (
    <div className="space-y-6">
      {/* Benchmark Presets Bar */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            {isEn ? 'Verification Test Matrix (Benchmark Presets):' : 'ভেরিফিকেশন টেস্ট মেট্রিক্স (প্রিসেট স্যাম্পল):'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            {isEn ? 'Click any preset to load' : 'ক্লিক করে যেকোনো স্যাম্পল লোড করুন'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {BENCHMARK_SAMPLES.map((sample) => {
            const isSelected = activePresetId === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectPreset(sample)}
                className={`text-left p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-[11px] truncate">
                  {isEn ? sample.name : sample.nameBn}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5 truncate">
                  {sample.expectedLayer.split(':')[0]}
                </div>
              </button>
            );
          })}
        </div>

        {activePreset && (
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-start gap-2 text-[11px] text-slate-400">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] shrink-0">
              {isEn ? 'Why this test:' : 'ইঞ্জিনিয়ারিং সিগনিফিকেন্স:'}
            </span>
            <span className="leading-snug">
              {isEn ? activePreset.engineeringRationale : activePreset.engineeringRationaleBn}
            </span>
          </div>
        )}
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="commentInput" className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <span>💬</span>
            {isEn ? 'Comment Under Review (Live Inference Test)' : 'পর্যালোচনাধীন মন্তব্য (লাইভ ইনফারেন্স টেস্ট)'}
          </label>
          <span className="text-[11px] font-mono text-slate-500">{commentText.length} chars</span>
        </div>

        <div className="relative">
          <textarea
            id="commentInput"
            value={commentText}
            onChange={(e) => {
              setCommentText(e.target.value);
              setActivePresetId('');
            }}
            rows={3}
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-600 font-sans transition-colors resize-y min-h-[80px]"
            placeholder={
              isEn
                ? "Enter comment, e.g. 'I am proud of my community' or 'Stop making videos you trash developer'..."
                : "কমেন্ট লিখুন, যেমন: 'I am proud of my community' অথবা 'Stop making videos you trash developer'..."
            }
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              L1 RegEx + L2 TF-IDF ML + L3 Gemini Fallback
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCommentText('');
                setActivePresetId('');
              }}
              className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              {isEn ? 'Clear' : 'মুছুন'}
            </button>
            <button
              type="submit"
              disabled={isEvaluating || !commentText.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>{isEn ? 'Evaluating...' : 'যাচাই হচ্ছে...'}</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>{isEn ? 'Evaluate Comment' : 'মন্তব্য পরীক্ষা করুন'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Results Section */}
      {lastResult && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Main Decision Banner */}
          <div
            className={`rounded-2xl border p-5 ${
              lastResult.decision === 'ALLOWED'
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-950/20'
                : lastResult.decision === 'BLOCKED'
                ? 'bg-rose-950/20 border-rose-500/40 text-rose-300 shadow-lg shadow-rose-950/20'
                : 'bg-amber-950/20 border-amber-500/40 text-amber-300 shadow-lg shadow-amber-950/20'
            }`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-xl border mt-0.5 ${
                    lastResult.decision === 'ALLOWED'
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                      : lastResult.decision === 'BLOCKED'
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                      : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  }`}
                >
                  {lastResult.decision === 'ALLOWED' ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : lastResult.decision === 'BLOCKED' ? (
                    <XCircle className="h-6 w-6" />
                  ) : (
                    <AlertTriangle className="h-6 w-6" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900/80 border border-current text-white font-bold">
                      {lastResult.decision === 'ALLOWED'
                        ? '✅ APPROVED / ALLOWED'
                        : lastResult.decision === 'BLOCKED'
                        ? '🚫 REJECTED / BLOCKED'
                        : '⚠️ ESCALATED TO HUMAN QUEUE'}
                    </span>
                    <span className="text-xs font-mono text-slate-300 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700/60">
                      {lastResult.resolvedBy}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-200 mt-2 leading-relaxed">
                    {lastResult.reason}
                  </p>

                  <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-400">
                    <span>
                      {isEn ? 'Confidence Score:' : 'কনফিডেন্স স্কোর:'}{' '}
                      <strong className="text-white font-mono">
                        {typeof lastResult.confidence === 'number'
                          ? `${(lastResult.confidence * 100).toFixed(1)}%`
                          : lastResult.confidence}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      {isEn ? 'Deciding Layer:' : 'নিষ্পত্তিকারী লেয়ার:'}{' '}
                      <strong className="text-cyan-400 font-mono">Layer {lastResult.layer}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons if escalated */}
              {lastResult.decision === 'SENT_TO_HUMAN_QUEUE' && onSendToHumanQueue && (
                <div className="shrink-0 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => onSendToHumanQueue(commentText, lastResult)}
                    className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <SendHorizontal className="h-3.5 w-3.5" />
                    <span>{isEn ? 'Add to Human Queue' : 'হিউম্যান রিভিউ কিউতে যোগ করুন'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Performance & Economics Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Metric 1: Real Latency */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">{isEn ? 'Execution Latency' : 'বাস্তব লেটেন্সি'}</span>
                <Clock className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="text-lg font-bold text-white font-mono">
                {lastResult.latencyMs} <span className="text-xs text-slate-400 font-normal">ms</span>
              </div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                <TrendingUp className="h-3 w-3" />
                {lastResult.latencyMs < 10
                  ? isEn
                    ? `~${Math.round(lastResult.allLlmLatencyMs / Math.max(0.1, lastResult.latencyMs))}x faster than LLM`
                    : `এলএলএম-এর চেয়ে ~${Math.round(lastResult.allLlmLatencyMs / Math.max(0.1, lastResult.latencyMs))} গুণ দ্রুত!`
                  : isEn
                  ? 'LLM Reasoning Latency'
                  : 'এলএলএম ডিপ অ্যানালাইসিস'}
              </div>
            </div>

            {/* Metric 2: Estimated Cost */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">{isEn ? 'Inference Cost' : 'ইনফারেন্স খরচ'}</span>
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                ${lastResult.costUsd.toFixed(5)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                {lastResult.costUsd === 0
                  ? isEn
                    ? '$0 Compute (100% Free on CPU)'
                    : '$০ খরচ (সিপিইউতে ১০০% ফ্রি)'
                  : isEn
                  ? 'Gemini Token Cost'
                  : 'জেমিনাই টোকেন চার্জ'}
              </div>
            </div>

            {/* Metric 3: LLM Baseline Comparison */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">{isEn ? 'All-LLM Alternative' : 'শুধু এলএলএম ব্যবহার করলে'}</span>
                <Cpu className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-lg font-bold text-slate-300 font-mono">
                ${lastResult.allLlmCostUsd.toFixed(5)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                {isEn ? `~${lastResult.allLlmLatencyMs}ms baseline` : `~${lastResult.allLlmLatencyMs}ms সাধারণ লেটেন্সি`}
              </div>
            </div>

            {/* Metric 4: Savings Calculation */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3.5">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">{isEn ? 'Cost Reduction' : 'খরচ সাশ্রয়'}</span>
                <Sparkles className="h-4 w-4 text-indigo-400" />
              </div>
              <div className="text-lg font-bold text-cyan-400 font-mono">
                {lastResult.costUsd === 0 ? '100% SAVED' : 'HYBRID ROUTED'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {lastResult.costUsd === 0
                  ? isEn
                    ? 'No API tokens burned'
                    : 'কোনো এপিআই খরচ হয়নি'
                  : isEn
                  ? 'Cost spent only on ambiguity'
                  : 'শুধু অস্পষ্টতার জন্য খরচ'}
              </div>
            </div>
          </div>

          {/* Deep Engineering Trace (Whitebox Audit) */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Search className="h-4 w-4 text-cyan-400" />
              {isEn ? 'Deep Whitebox Execution Trace' : 'ইঞ্জিনিয়ারিং এক্সিকিউশন ট্রেস ও ফিচার বিশ্লেষণ'}
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left Column: Layer 2 ML Probability & Feature Weights */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-200">
                    {isEn ? 'Classical ML (TF-IDF + LogReg) Breakdown:' : 'ক্লাসিক্যাল এমএল (TF-IDF) স্কোর:'}
                  </span>
                  <span className="text-xs font-mono font-bold text-cyan-400">
                    P(toxic) = {(lastResult.breakdown.layer2.toxicProb * 100).toFixed(1)}%
                  </span>
                </div>

                {/* Probability Bar with routing zones */}
                <div className="space-y-1 mb-3">
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full transition-all duration-500 ${
                        lastResult.breakdown.layer2.toxicProb >= config.mlHighToxicThreshold
                          ? 'bg-rose-500'
                          : lastResult.breakdown.layer2.toxicProb <= config.mlLowToxicThreshold
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(2, lastResult.breakdown.layer2.toxicProb * 100))}%` }}
                    />
                    {/* Markers */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-400"
                      style={{ left: `${config.mlLowToxicThreshold * 100}%` }}
                      title={`Low Safe Threshold (${config.mlLowToxicThreshold})`}
                    />
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-slate-400"
                      style={{ left: `${config.mlHighToxicThreshold * 100}%` }}
                      title={`High Toxic Threshold (${config.mlHighToxicThreshold})`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span className="text-emerald-400">Safe (&lt;{(config.mlLowToxicThreshold * 100).toFixed(0)}%)</span>
                    <span className="text-amber-400">Grey-Area (LLM Fallback)</span>
                    <span className="text-rose-400">Toxic (&gt;{(config.mlHighToxicThreshold * 100).toFixed(0)}%)</span>
                  </div>
                </div>

                {/* Extracted n-grams */}
                <div className="text-[11px]">
                  <span className="text-slate-400 font-medium">
                    {isEn ? 'Calibrated Features Matched:' : 'ম্যাচ হওয়া গুরুত্বপূর্ণ ফিচার:'}
                  </span>
                  {lastResult.breakdown.layer2.featuresMatched.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {lastResult.breakdown.layer2.featuresMatched.map((feat, i) => (
                        <span
                          key={i}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                            feat.weight > 0
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          "{feat.term}" ({feat.weight > 0 ? `+${feat.weight}` : feat.weight})
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-500 text-[11px] italic mt-1">
                      {isEn ? 'Neutral syntax, no toxic keywords detected.' : 'কোনো টক্সিক কিওয়ার্ড মেলেনি (স্বাভাবিক আলোচনা)।'}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Layer 1 RegEx & Layer 3 LLM Info */}
              <div className="space-y-3">
                {/* Layer 1 Info */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200">
                      {isEn ? 'Layer 1 (RegEx Rules)' : 'লেয়ার ১ (রেজেক্স রুলস)'}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {lastResult.breakdown.layer1.latencyMs} ms
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {lastResult.breakdown.layer1.hit ? (
                      <span className="text-rose-400 font-mono">
                        Violation: {lastResult.breakdown.layer1.ruleDescription} (Pattern:{' '}
                        {lastResult.breakdown.layer1.patternMatched})
                      </span>
                    ) : (
                      <span className="text-emerald-400/90">
                        {isEn ? 'Passed (No hard block patterns matched)' : 'পাস (কোনো হার্ড ব্লক রুল মেলেনি)'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Layer 3 LLM Info */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200">
                      {isEn ? 'Layer 3 (Gemini 3.8 Flash Reasoner)' : 'লেয়ার ৩ (জেমিনাই ৩.৮ ফ্ল্যাশ)'}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {lastResult.breakdown.layer3.executed
                        ? `${lastResult.breakdown.layer3.latencyMs} ms`
                        : isEn
                        ? 'Bypassed ($0 Saved)'
                        : 'কল করা হয়নি ($০ সাশ্রয়)'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {lastResult.breakdown.layer3.executed ? (
                      <div>
                        <div className="text-amber-400 font-mono mb-1">
                          Action: {lastResult.breakdown.layer3.llmAction}
                        </div>
                        <div className="italic text-slate-300">
                          "{lastResult.breakdown.layer3.llmReason}"
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500">
                        {isEn
                          ? 'Not needed: Resolved by upper layers, saving API quota & latency.'
                          : 'প্রয়োজন হয়নি: ওপরের স্তরে নিষ্পত্তি হওয়ায় এপিআই কল বেঁচে গেছে।'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
