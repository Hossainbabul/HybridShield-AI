import React from 'react';
import { ShieldCheck, Cpu, Zap, DollarSign, Globe, Sparkles, AlertCircle } from 'lucide-react';

interface HeaderProps {
  language: 'en' | 'bn';
  onLanguageToggle: () => void;
  serverHealthy: boolean;
  hasApiKey: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingHumanCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageToggle,
  serverHealthy,
  hasApiKey,
  activeTab,
  onTabChange,
  pendingHumanCount
}) => {
  const isEn = language === 'en';

  const navItems = [
    { id: 'workbench', labelEn: 'Live Inference', labelBn: 'লাইভ ইনফারেন্স' },
    { id: 'simulator', labelEn: 'Batch Simulator (10k)', labelBn: '১০,০০০ সিমুলেশন' },
    { id: 'human-queue', labelEn: 'Human Review Queue', labelBn: 'হিউম্যান কিউ (L4)', badge: pendingHumanCount > 0 ? pendingHumanCount : undefined },
    { id: 'rules', labelEn: 'Rules & Thresholds', labelBn: 'রুলস ও থ্রেশহোল্ড' },
    { id: 'python-code', labelEn: 'Python Code & Architecture', labelBn: 'পাইথন কোড ও আর্কিটেকচার' }
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 border-b border-slate-800/60">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  HybridShield AI
                </h1>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  4-Tier Engine
                </span>
                <span className="hidden md:inline-flex items-center text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
                  ~95% Cost Cut • &lt;10ms Latency
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isEn
                  ? 'High-Performance Hybrid AI Comment Moderation (Rules + ML + Gemini 3.8 Flash + Human Queue)'
                  : 'হাই-পারফর্মেন্স হাইব্রিড এআই কমেন্ট মডারেশন সিস্টেম (রুলস + ক্লাসিক্যাল এমএল + জেমিনাই + হিউম্যান কিউ)'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Status indicators */}
            <div className="hidden sm:flex items-center space-x-2 text-xs bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-slate-300 font-mono text-[11px]">TF-IDF + LogReg: Active</span>
              <span className="text-slate-600">|</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-slate-300 font-mono text-[11px]">
                Gemini 3.8 Flash: {hasApiKey ? 'Ready' : 'Simulated'}
              </span>
            </div>

            {/* Language Toggle */}
            <button
              onClick={onLanguageToggle}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-colors cursor-pointer shadow-sm"
              title="Toggle Language"
            >
              <Globe className="h-3.5 w-3.5 text-cyan-400" />
              <span className="font-semibold text-[11px]">{language === 'en' ? 'বাংলা' : 'English'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <span>{isEn ? item.labelEn : item.labelBn}</span>
                {item.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
