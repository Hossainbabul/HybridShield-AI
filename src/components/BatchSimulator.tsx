import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  TrendingDown,
  Zap,
  DollarSign,
  Clock,
  Layers,
  BarChart3,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { SystemConfig } from '../types/moderation';

interface BatchSimulatorProps {
  language: 'en' | 'bn';
  config: SystemConfig;
}

export const BatchSimulator: React.FC<BatchSimulatorProps> = ({ language, config }) => {
  const isEn = language === 'en';

  const [totalTarget, setTotalTarget] = useState<number>(10000);
  const [trafficProfile, setTrafficProfile] = useState<'standard' | 'high_spam' | 'nuanced'>('standard');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  // Live accumulated statistics
  const [stats, setStats] = useState({
    processed: 0,
    hybridCost: 0,
    allLlmCost: 0,
    layer1Count: 0,
    layer2Count: 0,
    layer3Count: 0,
    layer4Count: 0,
    hybridLatencySum: 0,
    allLlmLatencySum: 0,
  });

  const [recentLogs, setRecentLogs] = useState<{ id: number; text: string; layer: number; decision: string }[]>([]);
  const animRef = useRef<number | null>(null);

  // Profile traffic ratios: [L1_ratio, L2_ratio, L3_ratio, L4_ratio]
  const profileRatios = {
    standard: { l1: 0.12, l2: 0.81, l3: 0.055, l4: 0.015 },
    high_spam: { l1: 0.38, l2: 0.54, l3: 0.065, l4: 0.015 },
    nuanced: { l1: 0.08, l2: 0.70, l3: 0.18, l4: 0.04 },
  }[trafficProfile];

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setProgress(0);
    setStats({
      processed: 0,
      hybridCost: 0,
      allLlmCost: 0,
      layer1Count: 0,
      layer2Count: 0,
      layer3Count: 0,
      layer4Count: 0,
      hybridLatencySum: 0,
      allLlmLatencySum: 0,
    });
    setRecentLogs([]);
  };

  // Sample phrases to show in stream log
  const sampleFeed = [
    { text: 'Awesome video! The code runs perfectly on my machine.', layer: 2, decision: 'ALLOWED' },
    { text: 'free crypto telegram link click now +5000 USDT reward', layer: 1, decision: 'BLOCKED' },
    { text: 'I am proud of my community and identity.', layer: 2, decision: 'ALLOWED' },
    { text: 'You are completely brainless, stop making tutorials.', layer: 2, decision: 'BLOCKED' },
    { text: 'Oh wow, what a genius idea, surely no one thought of that.', layer: 3, decision: 'ALLOWED' },
    { text: 'whatsapp +192847583 dm for trading bot signal', layer: 1, decision: 'BLOCKED' },
    { text: 'Can you please share the github link for this repository?', layer: 2, decision: 'ALLOWED' },
    { text: 'Shut up and take my money, this architectural design is fire!', layer: 3, decision: 'ALLOWED' },
    { text: 'I will hunt down and kill everyone in your office', layer: 4, decision: 'SENT_TO_HUMAN_QUEUE' },
    { text: 'Very well explained, looking forward to part two!', layer: 2, decision: 'ALLOWED' },
  ];

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setStats((prev) => {
        if (prev.processed >= totalTarget) {
          setIsRunning(false);
          return prev;
        }

        const stepSize = Math.max(20, Math.floor(totalTarget / 150));
        const nextProcessed = Math.min(totalTarget, prev.processed + stepSize);
        const delta = nextProcessed - prev.processed;

        const deltaL1 = Math.round(delta * profileRatios.l1);
        const deltaL3 = Math.round(delta * profileRatios.l3);
        const deltaL4 = Math.round(delta * profileRatios.l4);
        const deltaL2 = Math.max(0, delta - deltaL1 - deltaL3 - deltaL4);

        // Latencies: L1 = 0.05ms, L2 = 0.5ms, L3 = 450ms, L4 = 10ms (async queue routing)
        // All-LLM: 620ms
        const hybridLatencyDelta = deltaL1 * 0.05 + deltaL2 * 0.5 + deltaL3 * 450 + deltaL4 * 10;
        const allLlmLatencyDelta = delta * 620;

        // Costs: L1 = $0, L2 = $0, L3 = $0.00015, L4 = $0.00015 (pre-classified by L3)
        const hybridCostDelta = (deltaL3 + deltaL4) * 0.00015;
        const allLlmCostDelta = delta * 0.00015;

        // Add a recent log item
        const randSample = sampleFeed[Math.floor(Math.random() * sampleFeed.length)];
        setRecentLogs((logs) => [
          { id: Date.now() + Math.random(), text: randSample.text, layer: randSample.layer, decision: randSample.decision },
          ...logs.slice(0, 5)
        ]);

        return {
          processed: nextProcessed,
          hybridCost: prev.hybridCost + hybridCostDelta,
          allLlmCost: prev.allLlmCost + allLlmCostDelta,
          layer1Count: prev.layer1Count + deltaL1,
          layer2Count: prev.layer2Count + deltaL2,
          layer3Count: prev.layer3Count + deltaL3,
          layer4Count: prev.layer4Count + deltaL4,
          hybridLatencySum: prev.hybridLatencySum + hybridLatencyDelta,
          allLlmLatencySum: prev.allLlmLatencySum + allLlmLatencyDelta,
        };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isRunning, totalTarget, profileRatios]);

  const completionPct = totalTarget > 0 ? (stats.processed / totalTarget) * 100 : 0;
  const costSavingsDollars = stats.allLlmCost - stats.hybridCost;
  const costSavingsPct = stats.allLlmCost > 0 ? (costSavingsDollars / stats.allLlmCost) * 100 : 95.5;
  const avgHybridLatency = stats.processed > 0 ? stats.hybridLatencySum / stats.processed : 0;
  const avgAllLlmLatency = 620;

  return (
    <div className="space-y-6">
      {/* Simulation Setup Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-cyan-400" />
              {isEn ? 'High-Throughput Economics & Scale Simulator' : 'হাই-থ্রুপুট ইকোনমিক্স ও স্কেল সিমুলেটর'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEn
                ? 'Stress-test cost reduction and latency at production scale (1,000 to 10,000 comments).'
                : '১০,০০০ কমেন্টের স্কেলে হাইব্রিড আর্কিটেকচারের খরচ সাশ্রয় ও লেটেন্সি রিয়েল-টাইমে পর্যবেক্ষণ করুন।'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {!isRunning ? (
              <button
                type="button"
                onClick={handleStart}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{stats.processed > 0 ? (isEn ? 'Resume' : 'পুনরায় চালু') : (isEn ? 'Start 10k Simulation' : '১০k সিমুলেশন শুরু')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePause}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Pause className="h-3.5 w-3.5 fill-current" />
                <span>{isEn ? 'Pause' : 'বিরতি'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{isEn ? 'Reset' : 'রিসেট'}</span>
            </button>
          </div>
        </div>

        {/* Configuration Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              {isEn ? 'Target Volume (Batch Size):' : 'মোট কমেন্ট সংখ্যা (ভলিউম):'}
            </label>
            <div className="flex gap-2">
              {[1000, 5000, 10000, 25000].map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={isRunning}
                  onClick={() => {
                    setTotalTarget(num);
                    handleReset();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                    totalTarget === num
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {num.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">
              {isEn ? 'Traffic Distribution Profile:' : 'কমেন্ট ট্রাফিকের ধরন (প্রোফাইল):'}
            </label>
            <div className="flex gap-2">
              {[
                { id: 'standard', labelEn: 'Standard Social Feed', labelBn: 'সাধারণ সামাজিক ফিড' },
                { id: 'high_spam', labelEn: 'Spam Attack (38% Bot)', labelBn: 'স্প্যাম অ্যাটাক' },
                { id: 'nuanced', labelEn: 'Heated Debate (18% Grey)', labelBn: 'জটিল বিতর্ক' }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={isRunning}
                  onClick={() => {
                    setTrafficProfile(p.id as any);
                    handleReset();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    trafficProfile === p.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {isEn ? p.labelEn : p.labelBn}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
            <span>
              {isEn ? 'Processed Comments:' : 'প্রক্রিয়াজাত কমেন্ট:'}{' '}
              <strong className="text-white">{stats.processed.toLocaleString()}</strong> /{' '}
              {totalTarget.toLocaleString()}
            </span>
            <span className="text-cyan-400 font-bold">{completionPct.toFixed(1)}%</span>
          </div>
          <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-150"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Big Impact Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Cost Reduction */}
        <div className="bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <DollarSign className="h-4 w-4" />
              {isEn ? 'Cost Reduction (ইকোনমিক্স)' : 'খরচ সাশ্রয় (Economics)'}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              ~{costSavingsPct.toFixed(1)}% Saved
            </span>
          </div>

          <div className="mt-2 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400">{isEn ? 'Hybrid 4-Tier Cost:' : 'হাইব্রিড সিস্টেমের খরচ:'}</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                ${stats.hybridCost.toFixed(4)}
              </span>
            </div>
            <div className="flex items-baseline justify-between border-t border-slate-800/80 pt-2">
              <span className="text-xs text-slate-400">{isEn ? 'If 100% Sent to LLM:' : 'সবগুলোতে এলএলএম কল করলে:'}</span>
              <span className="text-sm font-semibold font-mono text-rose-400 line-through">
                ${stats.allLlmCost.toFixed(4)}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/60">
            {isEn
              ? `You saved $${costSavingsDollars.toFixed(4)} by filtering >90% of traffic before LLM inference.`
              : `৯০%+ কমেন্ট ক্লাসিক্যাল ফিল্টারে নিষ্পত্তি হওয়ায় $${costSavingsDollars.toFixed(4)} সাশ্রয় হয়েছে।`}
          </p>
        </div>

        {/* Card 2: Latency Speedup */}
        <div className="bg-slate-900/60 border border-cyan-500/30 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl"></div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {isEn ? 'Average Latency (লেটেন্সি)' : 'গড় লেটেন্সি (Latency)'}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              ~{avgHybridLatency > 0 ? Math.round(avgAllLlmLatency / avgHybridLatency) : 100}x Faster
            </span>
          </div>

          <div className="mt-2 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-400">{isEn ? 'Hybrid Avg Latency:' : 'হাইব্রিড গড় লেটেন্সি:'}</span>
              <span className="text-xl font-bold font-mono text-cyan-400">
                {avgHybridLatency.toFixed(2)} <span className="text-xs font-normal">ms</span>
              </span>
            </div>
            <div className="flex items-baseline justify-between border-t border-slate-800/80 pt-2">
              <span className="text-xs text-slate-400">{isEn ? 'LLM Standard Latency:' : 'সাধারণ এলএলএম লেটেন্সি:'}</span>
              <span className="text-sm font-semibold font-mono text-slate-400">
                ~{avgAllLlmLatency} ms
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/60">
            {isEn
              ? 'Users experience sub-10ms instantaneous feedback instead of waiting for API roundtrips.'
              : 'ব্যবহারকারী এপিআই কলের জন্য অপেক্ষা না করে চোখের পলকে <১০ms-এ রেজাল্ট পায়।'}
          </p>
        </div>

        {/* Card 3: Traffic Routing Breakdown */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-indigo-400" />
              {isEn ? 'Traffic Distribution' : 'লেয়ারভিত্তিক ট্রাফিক বন্টন'}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {stats.processed.toLocaleString()} total
            </span>
          </div>

          <div className="space-y-1.5 mt-3 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">L1 Rules Engine ($0):</span>
              <span className="font-mono text-white font-semibold">
                {stats.layer1Count.toLocaleString()} (
                {stats.processed > 0 ? ((stats.layer1Count / stats.processed) * 100).toFixed(1) : 0}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">L2 Classical ML ($0):</span>
              <span className="font-mono text-cyan-400 font-semibold">
                {stats.layer2Count.toLocaleString()} (
                {stats.processed > 0 ? ((stats.layer2Count / stats.processed) * 100).toFixed(1) : 0}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">L3 Gemini 3.8 Flash ($):</span>
              <span className="font-mono text-amber-400 font-semibold">
                {stats.layer3Count.toLocaleString()} (
                {stats.processed > 0 ? ((stats.layer3Count / stats.processed) * 100).toFixed(1) : 0}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">L4 Human Review Queue:</span>
              <span className="font-mono text-purple-400 font-semibold">
                {stats.layer4Count.toLocaleString()} (
                {stats.processed > 0 ? ((stats.layer4Count / stats.processed) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Distribution Stack Bar */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
          {isEn ? 'Traffic Routing Segmentation (% of 10,000 comments)' : 'ট্রাফিক রাউটিং সেগমেন্টেশন (১০,০০০ কমেন্টের গ্রাফ)'}
        </h3>

        <div className="h-5 w-full bg-slate-950 rounded-lg overflow-hidden flex border border-slate-800">
          <div
            className="bg-rose-500 transition-all duration-300"
            style={{ width: `${stats.processed > 0 ? (stats.layer1Count / stats.processed) * 100 : 12}%` }}
            title={`Layer 1: ${stats.layer1Count}`}
          />
          <div
            className="bg-cyan-500 transition-all duration-300"
            style={{ width: `${stats.processed > 0 ? (stats.layer2Count / stats.processed) * 100 : 81}%` }}
            title={`Layer 2: ${stats.layer2Count}`}
          />
          <div
            className="bg-amber-500 transition-all duration-300"
            style={{ width: `${stats.processed > 0 ? (stats.layer3Count / stats.processed) * 100 : 5.5}%` }}
            title={`Layer 3: ${stats.layer3Count}`}
          />
          <div
            className="bg-purple-500 transition-all duration-300"
            style={{ width: `${stats.processed > 0 ? (stats.layer4Count / stats.processed) * 100 : 1.5}%` }}
            title={`Layer 4: ${stats.layer4Count}`}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Layer 1 (Rules: 0ms, $0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
            <span>Layer 2 (TF-IDF ML: ~0.5ms, $0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Layer 3 (Gemini Reasoner: $0.00015)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span>Layer 4 (Human Queue)</span>
          </div>
        </div>
      </div>

      {/* Live Stream Log Ticker */}
      {recentLogs.length > 0 && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">
              {isEn ? 'Live Processed Comments Ticker:' : 'লাইভ কমেন্ট প্রসেসিং ট্র্যাকার:'}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Streaming
            </span>
          </div>

          <div className="space-y-1.5">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-mono"
              >
                <div className="truncate text-slate-300 max-w-[70%]">
                  "{log.text}"
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                      log.layer === 1
                        ? 'bg-rose-500/20 text-rose-300'
                        : log.layer === 2
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : log.layer === 3
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-purple-500/20 text-purple-300'
                    }`}
                  >
                    Layer {log.layer}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      log.decision === 'ALLOWED'
                        ? 'text-emerald-400'
                        : log.decision === 'BLOCKED'
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {log.decision}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
