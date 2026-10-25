import { BenchmarkSample } from '../types/moderation';

export const BENCHMARK_SAMPLES: BenchmarkSample[] = [
  {
    id: 'sample-1',
    name: 'Clear Toxic Abuse',
    nameBn: 'স্পষ্ট বিষাক্ত গালি (Clear Toxic)',
    text: 'You are an absolute idiot and know nothing. Stop making videos you trash developer.',
    expectedLayer: 'Layer 2: Fast Classical ML',
    expectedDecision: 'BLOCKED',
    category: 'CLEAR_TOXIC',
    engineeringRationale: 'High confidence toxic features ("absolute idiot", "trash developer") trigger immediate ML block in <1ms without spending LLM tokens.',
    engineeringRationaleBn: 'উচ্চ কনফিডেন্সযুক্ত টক্সিক শব্দ ("absolute idiot", "trash developer") <১ মিলিসেকেন্ডে কোনো এলএলএম খরচ ছাড়াই ক্লাসিক্যাল এমএল দিয়ে ব্লক হয়।'
  },
  {
    id: 'sample-2',
    name: 'Deterministic Spam / Scam Rule',
    nameBn: 'হার্ড স্প্যাম/স্ক্যাম রুল (Hard Rule)',
    text: 'free crypto telegram link click now to claim 5000 USDT reward guaranteed',
    expectedLayer: 'Layer 1: Deterministic Rules & RegEx',
    expectedDecision: 'BLOCKED',
    category: 'HARD_RULE',
    engineeringRationale: 'Matches deterministic RegEx rule for crypto scam bots. Resolved in 0.05ms at $0 cost before any ML or LLM is even instantiated.',
    engineeringRationaleBn: 'ক্রিপ্টো স্প্যামের রেজেক্স নিয়মের সাথে মিলে যাওয়ায় কোনো এমএল বা এলএলএম ছাড়াই ০.০৫ms ও $০ খরচে তাৎক্ষণিক আটকে যায়।'
  },
  {
    id: 'sample-3',
    name: 'Identity Term Safe Test (Bias Check)',
    nameBn: 'আইডেন্টিটি টার্ম সেফ টেস্ট (False-Positive Check)',
    text: 'I am proud of my community and identity. Thank you for creating this welcoming space.',
    expectedLayer: 'Layer 2: Fast Classical ML',
    expectedDecision: 'ALLOWED',
    category: 'IDENTITY_SAFE',
    engineeringRationale: 'Crucial bias safeguard: Identity terms ("community", "identity") are balanced with negative/neutral weights, preventing naive false-positive censorship.',
    engineeringRationaleBn: 'বায়াস সেফগার্ড টেস্ট: অনেক দুর্বল ফিল্টার "identity" বা "community" শব্দ দেখলে ভুলবশত ব্যান করে দেয়; আমাদের ব্যালান্সড মডেলে এটি সেফ প্রমাণিত হয়।'
  },
  {
    id: 'sample-4',
    name: 'Sarcasm / Cynical Nuance',
    nameBn: 'ব্যঙ্গাত্মক মন্তব্য (Sarcasm / Ambiguous)',
    text: 'Oh wow, what a genius idea, surely nobody ever thought of that before in human history.',
    expectedLayer: 'Layer 3: Gemini 3.8 Flash Reasoner',
    expectedDecision: 'ALLOWED',
    category: 'AMBIGUOUS_SARCASM',
    engineeringRationale: 'Classical ML produces a grey-area probability (0.45). System routes only this 5-10% ambiguous traffic to Gemini for semantic discernment.',
    engineeringRationaleBn: 'ক্লাসিক্যাল এমএলের কনফিডেন্স মাঝামাঝি (০.৪৫) হওয়ায় সিস্টেম এটি নিখুঁতভাবে এলএলএম-এ পাঠায় ব্যঙ্গ বনাম ক্ষতির পার্থক্য বোঝার জন্য।'
  },
  {
    id: 'sample-5',
    name: 'Critical Physical Threat / Legal Risk',
    nameBn: 'মারাত্মক হুমকি ও আইনি ঝুঁকি (Severe Threat)',
    text: 'I will hunt down and kill everyone at your company building tomorrow.',
    expectedLayer: 'Layer 1 -> Escalated to Layer 4 Human Queue',
    expectedDecision: 'SENT_TO_HUMAN_QUEUE',
    category: 'SEVERE_THREAT',
    engineeringRationale: 'Safety-critical threat pattern detected. Automatically frozen and routed to human law enforcement/trust-and-safety queue.',
    engineeringRationaleBn: 'শারীরিক নিরাপত্তার চরম হুমকি ধরা পড়ায় তাৎক্ষণিক ব্লক করে ট্রাস্ট অ্যান্ড সেফটি হিউম্যান টিমের রিভিউ কিউতে পাঠানো হয়।'
  },
  {
    id: 'sample-6',
    name: 'Constructive Positive Feedback',
    nameBn: 'ইতিবাচক ও গঠনমূলক মন্তব্য (Safe Feedback)',
    text: 'This tutorial was super helpful, thank you so much! Very well explained, looking forward to part two.',
    expectedLayer: 'Layer 2: Fast Classical ML',
    expectedDecision: 'ALLOWED',
    category: 'NORMAL_SAFE',
    engineeringRationale: 'Positive n-grams ("super helpful", "thank you", "well explained") push P(toxic) to <0.05, immediately publishing in <1ms.',
    engineeringRationaleBn: 'ইতিবাচক ফিচারের কারণে টক্সিক সম্ভাবনা <০.০৫ থাকে, ফলে <১ms-এ সাথে সাথে পাবলিশ হয়।'
  },
  {
    id: 'sample-7',
    name: 'Positive Informal Slang Idiom',
    nameBn: 'অনানুষ্ঠানিক স্ল্যাং (Benign Slang)',
    text: 'Shut up and take my money, this architectural design is absolute fire!',
    expectedLayer: 'Layer 3: Gemini 3.8 Flash Reasoner',
    expectedDecision: 'ALLOWED',
    category: 'AMBIGUOUS_SARCASM',
    engineeringRationale: 'Contains literal "shut up", but colloquial idiom means excitement. Gemini LLM understands context and correctly passes it.',
    engineeringRationaleBn: '"Shut up" শব্দ থাকলেও এটি আসলে একটি প্রশংসাসূচক স্ল্যাং ("take my money"); এলএলএম সঠিক প্রেক্ষাপট বুঝে অনুমোদন দেয়।'
  }
];
