import React, { useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Database,
  ShieldPlus,
  Clock,
  Search,
  Filter,
  Check,
  Ban,
  Tag
} from 'lucide-react';
import { CommentItem } from '../types/moderation';

interface HumanQueueProps {
  language: 'en' | 'bn';
  items: CommentItem[];
  onApprove: (id: string, note?: string) => void;
  onBlock: (id: string, note?: string) => void;
  onAddToTraining: (item: CommentItem) => void;
  onPromoteToRule: (item: CommentItem) => void;
}

export const HumanQueue: React.FC<HumanQueueProps> = ({
  language,
  items,
  onApprove,
  onBlock,
  onAddToTraining,
  onPromoteToRule
}) => {
  const isEn = language === 'en';
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('PENDING');
  const [selectedNote, setSelectedNote] = useState<Record<string, string>>({});
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    if (filter === 'PENDING') return item.status === 'PENDING_HUMAN';
    if (filter === 'RESOLVED') return item.status === 'HUMAN_APPROVED' || item.status === 'HUMAN_BLOCKED';
    return true;
  });

  const pendingCount = items.filter((i) => i.status === 'PENDING_HUMAN').length;
  const approvedCount = items.filter((i) => i.status === 'HUMAN_APPROVED').length;
  const blockedCount = items.filter((i) => i.status === 'HUMAN_BLOCKED').length;

  const showToast = (msg: string) => {
    setActiveNotification(msg);
    setTimeout(() => setActiveNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {activeNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/50 text-cyan-300 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{activeNotification}</span>
        </div>
      )}

      {/* Header & Stats Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-purple-400" />
              {isEn ? 'Layer 4: Human-in-the-Loop Moderator Workbench' : 'লেয়ার ৪: হিউম্যান-ইন-দ্য-লুপ মডারেটর ড্যাশবোর্ড'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEn
                ? 'High-stakes moderation queue: Account bans, physical threats, legal hazard, and continuous ML active learning loop.'
                : 'আইনি ঝুঁকি, অ্যাকাউন্ট ব্যান এবং জটিল ক্ষেত্রে মানুষের সিদ্ধান্তের রিভিউ কিউ। এখান থেকে ক্লাসিক্যাল মডেলে ডেটা ফিড করা যায়।'}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'PENDING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isEn ? 'Pending' : 'অপেক্ষমান'} ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('RESOLVED')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isEn ? 'Resolved' : 'নিষ্পন্ন'} ({approvedCount + blockedCount})
            </button>
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                filter === 'ALL' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isEn ? 'All' : 'সব'} ({items.length})
            </button>
          </div>
        </div>
      </div>

      {/* Queue Items List */}
      {filteredItems.length === 0 ? (
        <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-10 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-80" />
          <h3 className="text-sm font-semibold text-slate-300">
            {isEn ? 'No pending comments in the queue' : 'বর্তমানে কোনো অপেক্ষমান মন্তব্য নেই'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {isEn
              ? 'Great job! Ambiguous cases escalated by Layer 3 or severe threats will appear here for human moderator review.'
              : 'সবগুলো কেস মীমাংসা হয়েছে। নতুন কোনো জটিল কমেন্ট বা হুমকি এলে এখানে রিভিউয়ের জন্য জমা হবে।'}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredItems.map((item) => {
            const isPending = item.status === 'PENDING_HUMAN';
            const priority = item.result.breakdown.layer4.priority || 'MEDIUM';

            return (
              <div
                key={item.id}
                className={`bg-slate-900/60 border rounded-2xl p-4 sm:p-5 transition-all ${
                  item.status === 'HUMAN_APPROVED'
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : item.status === 'HUMAN_BLOCKED'
                    ? 'border-rose-500/30 bg-rose-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-slate-300">@{item.author}</span>
                    <span className="text-slate-600 text-xs">•</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                        priority === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                          : priority === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                      }`}
                    >
                      {priority} Priority
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {item.status === 'PENDING_HUMAN' && (
                      <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {isEn ? 'Awaiting Human Verdict' : 'সিদ্ধান্ত অপেক্ষমান'}
                      </span>
                    )}
                    {item.status === 'HUMAN_APPROVED' && (
                      <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {isEn ? 'Human Approved' : 'অনুমোদিত'}
                      </span>
                    )}
                    {item.status === 'HUMAN_BLOCKED' && (
                      <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {isEn ? 'Human Banned / Blocked' : 'বাতিল ও ব্লকড'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Comment Content */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 font-sans leading-relaxed mb-3">
                  "{item.text}"
                </div>

                {/* AI Reason for Escalation */}
                <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 text-xs mb-3 flex items-start gap-2 text-slate-300">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">
                      {isEn ? 'AI Escalation Justification:' : 'এআই রিজনারের মূল কারণ:'}{' '}
                    </span>
                    <span className="text-slate-300">{item.result.reason}</span>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      Origin: {item.result.resolvedBy} • ML Toxic Prob:{' '}
                      {(item.result.breakdown.layer2.toxicProb * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Moderator Decision & Actions */}
                {isPending ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onApprove(item.id, selectedNote[item.id]);
                          showToast(isEn ? 'Comment marked safe and published' : 'কমেন্ট নিরাপদ হিসেবে প্রকাশিত');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>{isEn ? 'Approve & Publish' : 'অনুমোদন দিন'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onBlock(item.id, selectedNote[item.id]);
                          showToast(isEn ? 'Comment blocked & user penalized' : 'কমেন্ট ব্লক ও ব্যবহারকারী দণ্ডিত');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        <span>{isEn ? 'Block & Penalize' : 'ব্লক করুন'}</span>
                      </button>
                    </div>

                    {/* Continuous Learning Loop Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onAddToTraining(item);
                          showToast(isEn ? 'Added to ML Retraining Corpus (Active Learning)' : 'এমএল ট্রেইনিং ডেটাসেটে যোগ করা হয়েছে');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 cursor-pointer"
                        title="Add to dataset so Layer 2 ML improves on future runs"
                      >
                        <Database className="h-3.5 w-3.5 text-cyan-400" />
                        <span>{isEn ? 'Add to ML Dataset' : 'এমএল ট্রেইনিংয়ে দিন'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onPromoteToRule(item);
                          showToast(isEn ? 'Promoted pattern to Layer 1 RegEx' : 'লেয়ার ১ রেজেক্সে অন্তর্ভুক্ত');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 cursor-pointer"
                        title="Add as Layer 1 regex rule for 0ms block in the future"
                      >
                        <ShieldPlus className="h-3.5 w-3.5 text-indigo-400" />
                        <span>{isEn ? 'Create Hard Rule' : 'হার্ড রুল বানান'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>
                      {isEn ? 'Resolution note:' : 'মডারেটর নোট:'}{' '}
                      <em className="text-slate-300">{item.humanNote || 'Standard policy adherence confirmed.'}</em>
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      Reviewed: {new Date(item.reviewedAt || item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
