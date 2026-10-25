import React from 'react';
import { ShieldAlert, Zap, Sparkles, UserCheck, ArrowRight, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { ModerationResult } from '../types/moderation';

interface ArchitecturePipelineProps {
  currentResult?: ModerationResult | null;
  language: 'en' | 'bn';
}

export const ArchitecturePipeline: React.FC<ArchitecturePipelineProps> = ({ currentResult, language }) => {
  const isEn = language === 'en';
  const activeLayer = currentResult?.layer;

  const tiers = [
    {
      id: 1,
      title: isEn ? 'Layer 1: Rules Engine' : 'লেয়ার ১: রুলস ইঞ্জিন',
      subtitle: isEn ? 'Deterministic RegEx' : 'ডিটারমিনিস্টিক রেজেক্স',
      description: isEn
        ? 'Instant regex filter for clear threats, crypto scams & hate patterns'
        : '০ms-এ স্পষ্ট হুমকি, ক্রিপ্টো স্প্যাম ও নিষিদ্ধ শব্দ ফিল্টার',
      latency: '< 0.1 ms',
      cost: '$0.00',
      icon: ShieldAlert,
      color: 'from-rose-500/20 to-red-600/10 border-rose-500/40 text-rose-400',
      activeColor: 'ring-2 ring-rose-500 bg-rose-950/40 border-rose-400 shadow-lg shadow-rose-500/20',
      badge: isEn ? '0ms • $0' : '০ms • $০'
    },
    {
      id: 2,
      title: isEn ? 'Layer 2: Fast Classical ML' : 'লেয়ার ২: ক্লাসিক্যাল এমএল',
      subtitle: isEn ? 'TF-IDF + Logistic Regression' : 'TF-IDF + লজিস্টিক রিগ্রেশন',
      description: isEn
        ? 'Handles >80% traffic with calibrated confidence thresholds & bias safe-guards'
        : '>৮০% কমেন্ট <১ms-এ হাই কনফিডেন্সে ক্লাসিফাই করে',
      latency: '~0.5 ms',
      cost: '$0.00',
      icon: Zap,
      color: 'from-cyan-500/20 to-blue-600/10 border-cyan-500/40 text-cyan-400',
      activeColor: 'ring-2 ring-cyan-500 bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-500/20',
      badge: isEn ? '0.5ms • $0' : '০.৫ms • $০'
    },
    {
      id: 3,
      title: isEn ? 'Layer 3: LLM Reasoner' : 'লেয়ার ৩: এলএলএম রিজনার',
      subtitle: isEn ? 'Gemini 3.8 Flash Fallback' : 'জেমিনাই ৩.৮ ফ্ল্যাশ ফলব্যাক',
      description: isEn
        ? 'Invoked ONLY for nuanced sarcasm & grey-area ambiguities (5-10% traffic)'
        : 'শুধুমাত্র অস্পষ্ট ব্যঙ্গ ও জটিল মন্তব্যের জন্য এলএলএম কল (৯৫% সাশ্রয়ী)',
      latency: '~450 ms',
      cost: '$0.00015',
      icon: Sparkles,
      color: 'from-amber-500/20 to-yellow-600/10 border-amber-500/40 text-amber-400',
      activeColor: 'ring-2 ring-amber-500 bg-amber-950/40 border-amber-400 shadow-lg shadow-amber-500/20',
      badge: isEn ? '~450ms • $0.00015' : '~৪৫০ms • $০.০০০১৫'
    },
    {
      id: 4,
      title: isEn ? 'Layer 4: Human-in-the-Loop' : 'লেয়ার ৪: হিউম্যান ইন দ্য লুপ',
      subtitle: isEn ? 'Moderator Review Queue' : 'মডারেটর রিভিউ কিউ',
      description: isEn
        ? 'Escalation for account bans, physical safety hazards and policy appeals'
        : 'আইনি ঝুঁকি, অ্যাকাউন্ট ব্যান ও চরম সিদ্ধান্তের জন্য মানুষ রিভিউ করে',
      latency: 'Async Review',
      cost: 'T&S Ops',
      icon: UserCheck,
      color: 'from-purple-500/20 to-violet-600/10 border-purple-500/40 text-purple-400',
      activeColor: 'ring-2 ring-purple-500 bg-purple-950/40 border-purple-400 shadow-lg shadow-purple-500/20',
      badge: isEn ? 'Manual Safety Queue' : 'ম্যানুয়াল সেফটি কিউ'
    }
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 sm:p-5 mb-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span>🛡️</span>
            {isEn ? '4-Tier Hybrid Decision Pipeline Architecture' : '৪-স্তরের হাইব্রিড ডিসিশন পাইপলাইন আর্কিটেকচার'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {isEn
              ? 'Incoming comments flow sequentially through cost-optimized filters before touching expensive LLM compute.'
              : 'ইনকামিং কমেন্টগুলো ক্রমান্বয়ে সবচেয়ে কম খরচের ফিল্টারে যাচাই হয়, ফলে ৯৫% খরচ বাঁচে।'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-950/70 border border-slate-800 px-2.5 py-1 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>{isEn ? 'Pipeline Status: Operational' : 'পাইপলাইন স্ট্যাটাস: সচল'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {tiers.map((tier, idx) => {
          const Icon = tier.icon;
          const isWinningTier = activeLayer === tier.id;
          const hasPassed = activeLayer !== undefined && (activeLayer as number) > tier.id;

          return (
            <div
              key={tier.id}
              className={`relative rounded-xl border p-3.5 transition-all duration-300 flex flex-col justify-between ${
                isWinningTier
                  ? tier.activeColor
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700/80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-1.5 rounded-lg border ${tier.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                    {tier.badge}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-white tracking-wide">{tier.title}</h3>
                <p className="text-[11px] font-medium text-cyan-400/90 mb-1.5">{tier.subtitle}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">{tier.description}</p>
              </div>

              {/* Status footer for this layer */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/70 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-mono text-[10px]">
                  {isEn ? 'Latency:' : 'লেটেন্সি:'} <strong className="text-slate-300">{tier.latency}</strong>
                </span>

                {isWinningTier && (
                  <span className="flex items-center gap-1 font-semibold text-emerald-400 text-[10px] uppercase tracking-wider animate-pulse">
                    <CheckCircle2 className="h-3 w-3" />
                    {isEn ? 'Resolved Here' : 'এখানে নিষ্পত্তি'}
                  </span>
                )}
                {hasPassed && (
                  <span className="text-slate-500 text-[10px] font-mono">
                    {isEn ? 'Filtered & Passed' : 'পাস হয়েছে'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
