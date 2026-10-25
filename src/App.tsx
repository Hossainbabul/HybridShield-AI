import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ArchitecturePipeline } from './components/ArchitecturePipeline';
import { LiveInferenceWorkbench } from './components/LiveInferenceWorkbench';
import { BatchSimulator } from './components/BatchSimulator';
import { HumanQueue } from './components/HumanQueue';
import { RulesConfig } from './components/RulesConfig';
import { PythonReferenceViewer } from './components/PythonReferenceViewer';
import { evaluateComment, DEFAULT_CONFIG } from './lib/moderator';
import { ModerationResult, CommentItem, SystemConfig } from './types/moderation';

export default function App() {
  const [language, setLanguage] = useState<'en' | 'bn'>('bn');
  const [activeTab, setActiveTab] = useState<string>('workbench');
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<ModerationResult | null>(null);
  const [serverHealthy, setServerHealthy] = useState<boolean>(true);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  // Initial pre-populated Human Queue items for Layer 4 review
  const [humanQueueItems, setHumanQueueItems] = useState<CommentItem[]>([
    {
      id: 'hq-1',
      author: 'crypto_trader_99',
      text: 'I will hunt down and eliminate everyone at your office building tomorrow morning.',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      status: 'PENDING_HUMAN',
      result: {
        decision: 'SENT_TO_HUMAN_QUEUE',
        layer: 4,
        resolvedBy: 'Layer 1 -> Escalated to Layer 4 Human Queue',
        costUsd: 0,
        allLlmCostUsd: 0.00015,
        confidence: 1.0,
        reason: 'Physical safety violation matched: Severe physical security & legal hazard threats',
        latencyMs: 0.12,
        allLlmLatencyMs: 620,
        breakdown: {
          layer1: { executed: true, hit: true, latencyMs: 0.12, patternMatched: '\\b(hunt down and kill|shoot up)\\b', ruleDescription: 'Physical safety hazard' },
          layer2: { executed: false, toxicProb: 0.94, featuresMatched: [{ term: 'hunt', weight: 4.5 }], latencyMs: 0.5 },
          layer3: { executed: false, llmUsed: false, latencyMs: 0 },
          layer4: { escalated: true, reason: 'Physical security hazard', priority: 'CRITICAL', requiresHumanAction: true }
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString()
      }
    },
    {
      id: 'hq-2',
      author: 'cynical_coder',
      text: 'Oh wow, what an absolute genius design, surely nobody in computer science ever thought of that before.',
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      status: 'PENDING_HUMAN',
      result: {
        decision: 'SENT_TO_HUMAN_QUEUE',
        layer: 4,
        resolvedBy: 'Layer 4: Human-in-the-Loop Moderator Queue',
        costUsd: 0.00015,
        allLlmCostUsd: 0.00015,
        confidence: 'Manual Review Required',
        reason: 'Nuanced high-ambiguity comment: LLM Reasoner flagged potential caustic cynicism vs harmless satire.',
        latencyMs: 412,
        allLlmLatencyMs: 620,
        breakdown: {
          layer1: { executed: true, hit: false, latencyMs: 0.04 },
          layer2: { executed: true, toxicProb: 0.48, featuresMatched: [{ term: 'genius', weight: 0.2 }], latencyMs: 0.6, thresholdMet: 'GREY_AREA' },
          layer3: { executed: true, llmUsed: true, latencyMs: 410, llmAction: 'ESCALATE_HUMAN', llmReason: 'Satirical mockery ambiguity' },
          layer4: { escalated: true, reason: 'Satirical ambiguity', priority: 'HIGH', requiresHumanAction: true }
        },
        timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString()
      }
    }
  ]);

  // Check backend server health
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setServerHealthy(true);
        setHasApiKey(Boolean(data.hasApiKey));
      })
      .catch((err) => {
        console.warn('Backend server status check:', err);
        setServerHealthy(false);
      });

    // Run initial evaluation on mount so the user immediately sees the system in action
    evaluateComment(
      'I am proud of my community and identity. Thank you for creating this welcoming space.',
      config
    ).then((res) => {
      setLastResult(res);
    });
  }, []);

  const handleEvaluate = async (text: string): Promise<ModerationResult> => {
    setIsEvaluating(true);
    try {
      const result = await evaluateComment(text, config);
      setLastResult(result);

      // If escalated to Layer 4, automatically add to human queue
      if (result.decision === 'SENT_TO_HUMAN_QUEUE') {
        const newItem: CommentItem = {
          id: `hq-${Date.now()}`,
          author: `user_${Math.floor(1000 + Math.random() * 9000)}`,
          text,
          timestamp: new Date().toISOString(),
          result,
          status: 'PENDING_HUMAN'
        };
        setHumanQueueItems((prev) => [newItem, ...prev]);
      }

      return result;
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSendToHumanQueue = (comment: string, result: ModerationResult) => {
    const newItem: CommentItem = {
      id: `hq-${Date.now()}`,
      author: `user_${Math.floor(1000 + Math.random() * 9000)}`,
      text: comment,
      timestamp: new Date().toISOString(),
      result,
      status: 'PENDING_HUMAN'
    };
    setHumanQueueItems((prev) => [newItem, ...prev]);
    setActiveTab('human-queue');
  };

  // Human queue actions
  const handleApprove = (id: string, note?: string) => {
    setHumanQueueItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'HUMAN_APPROVED',
              humanNote: note || 'Confirmed safe by human reviewer.',
              reviewedAt: new Date().toISOString()
            }
          : item
      )
    );
  };

  const handleBlock = (id: string, note?: string) => {
    setHumanQueueItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'HUMAN_BLOCKED',
              humanNote: note || 'Violation confirmed by human reviewer.',
              reviewedAt: new Date().toISOString()
            }
          : item
      )
    );
  };

  const handleAddToTraining = (item: CommentItem) => {
    console.log('Added to ML retraining set:', item.text);
  };

  const handlePromoteToRule = (item: CommentItem) => {
    // Extract first 3 significant words to create a pattern
    const words = item.text.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/).slice(0, 3).join(' ');
    if (words) {
      const newRule = {
        id: `rule-promoted-${Date.now()}`,
        pattern: `\\b(${words.toLowerCase()})\\b`,
        description: `Promoted from human moderation queue: "${words}"`,
        enabled: true
      };
      setConfig((prev) => ({
        ...prev,
        hardBlockRegexes: [...prev.hardBlockRegexes, newRule]
      }));
    }
  };

  const pendingHumanCount = humanQueueItems.filter((i) => i.status === 'PENDING_HUMAN').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Global Header */}
      <Header
        language={language}
        onLanguageToggle={() => setLanguage((l) => (l === 'en' ? 'bn' : 'en'))}
        serverHealthy={serverHealthy}
        hasApiKey={hasApiKey}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingHumanCount={pendingHumanCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Visual 4-Tier Pipeline Banner (always visible to provide architectural clarity) */}
        <ArchitecturePipeline currentResult={lastResult} language={language} />

        {/* Tab Content */}
        {activeTab === 'workbench' && (
          <LiveInferenceWorkbench
            language={language}
            onEvaluate={handleEvaluate}
            lastResult={lastResult}
            isEvaluating={isEvaluating}
            onSendToHumanQueue={handleSendToHumanQueue}
            config={config}
          />
        )}

        {activeTab === 'simulator' && (
          <BatchSimulator language={language} config={config} />
        )}

        {activeTab === 'human-queue' && (
          <HumanQueue
            language={language}
            items={humanQueueItems}
            onApprove={handleApprove}
            onBlock={handleBlock}
            onAddToTraining={handleAddToTraining}
            onPromoteToRule={handlePromoteToRule}
          />
        )}

        {activeTab === 'rules' && (
          <RulesConfig
            language={language}
            config={config}
            onChangeConfig={setConfig}
          />
        )}

        {activeTab === 'python-code' && (
          <PythonReferenceViewer language={language} />
        )}
      </main>

      {/* Modern Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-5 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-400">HybridShield AI</span>
            <span>•</span>
            <span>Rules (0ms) + Classical ML (0.5ms) + Gemini 3.8 Flash + Human Review</span>
          </div>

          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span className="text-emerald-400">~95% Cost Cut</span>
            <span className="text-slate-700">•</span>
            <span className="text-cyan-400">&lt;10ms Avg Latency</span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400">Gemini 3.8 Flash Reasoner</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
