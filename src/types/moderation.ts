export type ModerationDecision = 'ALLOWED' | 'BLOCKED' | 'SENT_TO_HUMAN_QUEUE';

export type ModerationLayerId = 1 | 2 | 3 | 4;

export interface LayerBreakdown {
  layer1: {
    executed: boolean;
    hit: boolean;
    patternMatched?: string;
    latencyMs: number;
    ruleDescription?: string;
  };
  layer2: {
    executed: boolean;
    toxicProb: number;
    featuresMatched: { term: string; weight: number }[];
    latencyMs: number;
    thresholdMet?: 'HIGH_TOXIC' | 'LOW_SAFE' | 'GREY_AREA';
  };
  layer3: {
    executed: boolean;
    llmUsed: boolean;
    modelName?: string;
    promptTokens?: number;
    responseTokens?: number;
    latencyMs: number;
    llmAction?: 'ALLOW' | 'BLOCK' | 'ESCALATE_HUMAN';
    llmReason?: string;
  };
  layer4: {
    escalated: boolean;
    reason?: string;
    priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM';
    requiresHumanAction: boolean;
  };
}

export interface ModerationResult {
  decision: ModerationDecision;
  layer: ModerationLayerId;
  resolvedBy: string;
  costUsd: number;
  allLlmCostUsd: number;
  confidence: number | string;
  reason: string;
  latencyMs: number;
  allLlmLatencyMs: number;
  breakdown: LayerBreakdown;
  timestamp: string;
}

export interface CommentItem {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  result: ModerationResult;
  status: 'AUTO_RESOLVED' | 'PENDING_HUMAN' | 'HUMAN_APPROVED' | 'HUMAN_BLOCKED';
  humanNote?: string;
  reviewedAt?: string;
}

export interface BenchmarkSample {
  id: string;
  name: string;
  nameBn: string;
  text: string;
  expectedLayer: string;
  expectedDecision: ModerationDecision;
  category: 'CLEAR_TOXIC' | 'HARD_RULE' | 'IDENTITY_SAFE' | 'AMBIGUOUS_SARCASM' | 'SEVERE_THREAT' | 'NORMAL_SAFE';
  engineeringRationale: string;
  engineeringRationaleBn: string;
}

export interface SystemConfig {
  mlHighToxicThreshold: number; // e.g. 0.85 -> Instant Block
  mlLowToxicThreshold: number;  // e.g. 0.20 -> Instant Allow
  hardBlockRegexes: { id: string; pattern: string; description: string; enabled: boolean }[];
  identityTermsWhitelist: string[];
}
