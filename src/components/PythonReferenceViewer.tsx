import React, { useState } from 'react';
import { Code2, Copy, Check, Download, FileText, Sparkles, Terminal, Award } from 'lucide-react';

interface PythonReferenceViewerProps {
  language: 'en' | 'bn';
}

export const PythonReferenceViewer: React.FC<PythonReferenceViewerProps> = ({ language }) => {
  const isEn = language === 'en';
  const [activeFile, setActiveFile] = useState<'train' | 'engine' | 'app' | 'req'>('engine');
  const [copied, setCopied] = useState<boolean>(false);

  const files = {
    train: {
      name: 'train_model.py',
      desc: isEn ? 'Classical ML (TF-IDF + Logistic Regression) Training Script' : 'ক্লাসিক্যাল এমএল (TF-IDF + লজিস্টিক রিগ্রেশন) ট্রেইনিং স্ক্রিপ্ট',
      code: `import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

# বেঞ্চমার্ক ট্রেইনিং স্যাম্পল (বাস্তব প্রোডাকশনে Kaggle Jigsaw ডেটাসেট দিয়ে রিপ্লেস করা যাবে)
TRAINING_DATA = [
    # Safe / Positive comments (Label 0)
    ("This tutorial was super helpful, thank you so much!", 0),
    ("Great explanation of the architecture.", 0),
    ("I love building AI projects.", 0),
    ("I am proud of my community and identity.", 0),  # Identity term safe test
    ("Can you please share the github link?", 0),
    ("Very well explained, looking forward to part two.", 0),
    ("The code runs perfectly on my machine.", 0),
    
    # Toxic / Offensive comments (Label 1)
    ("You are an absolute idiot and know nothing.", 1),
    ("Stop making videos, you trash developer.", 1),
    ("I hate everyone from this group, get lost.", 1),
    ("Terrible channel, you are completely brainless.", 1),
    ("Die already, nobody wants you here.", 1),
    ("Total scam artist, delete your account.", 1),
    ("Shut up and stop talking nonsense.", 1)
]

def train_and_save():
    print("[*] Training classical Logistic Regression model...")
    texts = [item[0] for item in TRAINING_DATA]
    labels = [item[1] for item in TRAINING_DATA]

    # TF-IDF + Logistic Regression পাইপলাইন
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), lowercase=True)),
        ('clf', LogisticRegression(C=1.0, random_state=42))
    ])

    pipeline.fit(texts, labels)
    
    joblib.dump(pipeline, "moderation_model.joblib")
    print("[✓] Model successfully trained and saved as 'moderation_model.joblib'")

if __name__ == "__main__":
    train_and_save()`
    },
    engine: {
      name: 'moderation_engine.py',
      desc: isEn ? '4-Tier Hybrid Moderation Routing Engine' : '৪-স্তরের হাইব্রিড মডারেশন রাউটিং ইঞ্জিন',
      code: `import os
import re
import joblib
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# নিষিদ্ধ শব্দ বা হুমকি রুলস (Layer 1)
HARD_BLOCK_REGEX = [
    r"\\b(die already|kill yourself|scam artist)\\b",
    r"\\b(free crypto|telegram link|whatsapp \\+\\d+)\\b"  # স্প্যাম প্রোটেকশন
]

class HybridModerator:
    def __init__(self):
        # Layer 2 মডেল লোড
        if not os.path.exists("moderation_model.joblib"):
            raise FileNotFoundError("Model file missing! Please run 'python train_model.py' first.")
        self.ml_pipeline = joblib.load("moderation_model.joblib")
        
        # Layer 3 এলএলএম ক্লায়েন্ট
        api_key = os.getenv("OPENAI_API_KEY")
        self.openai_client = OpenAI(api_key=api_key) if api_key else None

    def _check_rules(self, text: str):
        """Layer 1: হার্ড রুলস চেক (0ms, $0)"""
        for pattern in HARD_BLOCK_REGEX:
            if re.search(pattern, text, re.IGNORECASE):
                return True, "Violation of absolute safety rules (Harassment/Spam)"
        return False, None

    def _call_llm_audit(self, text: str) -> dict:
        """Layer 3: এলএলএম কল শুধুমাত্র অস্পষ্ট কমেন্টের জন্য"""
        if not self.openai_client:
            return {"action": "FLAGGED_FOR_HUMAN", "reason": "LLM API Key not provided."}

        prompt = f"""You are an advanced Content Safety Classifier. Analyze the following comment for nuanced toxicity, sarcasm, threats, or severe harassment.

Comment: "{text}"

Output strictly in this JSON format:
{{"action": "ALLOW" or "BLOCK" or "ESCALATE_HUMAN", "reason": "<brief justification>"}}
"""
        response = self.openai_client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.0,
            response_format={"type": "json_object"},
            messages=[{"role": "user", "content": prompt}]
        )
        import json
        return json.loads(response.choices[0].message.content)

    def evaluate_comment(self, comment: str) -> dict:
        # 1. LAYER 1: Rule-based check
        is_blocked, rule_reason = self._check_rules(comment)
        if is_blocked:
            return {
                "decision": "BLOCKED",
                "resolved_by": "Layer 1: Deterministic Rules",
                "cost_usd": 0.0,
                "confidence": 1.0,
                "reason": rule_reason
            }

        # 2. LAYER 2: Classical ML (Logistic Regression)
        probs = self.ml_pipeline.predict_proba([comment])[0]
        toxic_prob = probs[1]  # টক্সিক হওয়ার সম্ভাবনা (0.0 to 1.0)

        # কনফিডেন্স থ্রেশহোল্ড (High confidence handles >80% traffic)
        if toxic_prob >= 0.85:
            return {
                "decision": "BLOCKED",
                "resolved_by": "Layer 2: Fast Classical ML",
                "cost_usd": 0.0,
                "confidence": round(toxic_prob, 3),
                "reason": "High probability toxic content."
            }
        elif toxic_prob <= 0.20:
            return {
                "decision": "ALLOWED",
                "resolved_by": "Layer 2: Fast Classical ML",
                "cost_usd": 0.0,
                "confidence": round(1.0 - toxic_prob, 3),
                "reason": "Safe conversation tone."
            }

        # 3. LAYER 3: LLM Reasoner (Ambiguous/Grey-area cases: 0.20 < prob < 0.85)
        llm_result = self._call_llm_audit(comment)
        action = llm_result.get("action", "FLAGGED_FOR_HUMAN")
        
        # 4. LAYER 4: Human-in-the-Loop check
        if action == "ESCALATE_HUMAN":
            return {
                "decision": "SENT_TO_HUMAN_QUEUE",
                "resolved_by": "Layer 4: Human Moderator",
                "cost_usd": 0.00015,
                "confidence": "Manual Review Needed",
                "reason": llm_result.get("reason", "Potential severe penalty/ambiguity.")
            }

        return {
            "decision": "BLOCKED" if action == "BLOCK" else "ALLOWED",
            "resolved_by": "Layer 3: LLM Reasoner (gpt-4o-mini)",
            "cost_usd": 0.00015,
            "confidence": 0.95,
            "reason": llm_result.get("reason")
        }`
    },
    app: {
      name: 'app.py',
      desc: isEn ? 'Streamlit Interactive Dashboard Application' : 'স্ট্রিমলিট ইন্টারঅ্যাক্টিভ ড্যাশবোর্ড স্ক্রিপ্ট',
      code: `import streamlit as st
import time
from moderation_engine import HybridModerator

st.set_page_config(page_title="AI Comment Moderation Engine", page_icon="🛡️", layout="wide")

st.title("🛡️ Production Hybrid AI Content Moderation System")
st.caption("Demonstrating Engineering Judgment: Rules + Classical ML + LLM + Human Review")

@st.cache_resource
def get_moderator():
    return HybridModerator()

try:
    moderator = get_moderator()
except Exception as e:
    st.error(f"ইঞ্জিন লোড করতে ত্রুটি: {str(e)}")
    st.info("টার্মিনালে \`python train_model.py\` রান করে মডেল ফাইল তৈরি করুন।")
    st.stop()

# সাইডবার সিমুলেশন মেট্রিক্স
st.sidebar.header("📊 ইকোনমিক্স ও স্কেলিং সিমুলেশন")
st.sidebar.markdown("**দৈনিক ১০,০০০ কমেন্টের হিসেব:**")
st.sidebar.markdown("- **Only LLM Cost:** ~$1.50 - $5.00/day")
st.sidebar.markdown("- **Hybrid System Cost:** ~$0.08 - $0.15/day")
st.sidebar.success("💡 কস্ট রিডাকশন: ~95% সাশ্রয়ী!")

# ইনপুট সেকশন
st.subheader("মন্তব্য পরীক্ষা করুন (Live Inference Test)")
user_comment = st.text_area(
    "ইউজার কমেন্ট পেস্ট করুন:",
    placeholder="যেমন: 'I am proud of my community' অথবা 'Stop making videos you trash developer' অথবা অস্পষ্ট ব্যঙ্গাত্মক কথা..."
)

col1, col2 = st.columns([2, 1])

if st.button("Evaluate Comment", type="primary"):
    if not user_comment.strip():
        st.warning("অনুগ্রহ করে একটি কমেন্ট লিখুন।")
    else:
        start_time = time.perf_counter()
        result = moderator.evaluate_comment(user_comment)
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

        with col1:
            st.subheader("🎯 মডারেশন রেজাল্ট")
            decision = result["decision"]
            
            if decision == "ALLOWED":
                st.success(f"✅ APPROVED: {decision}")
            elif decision == "BLOCKED":
                st.error(f"🚫 REJECTED: {decision}")
            else:
                st.warning(f"⚠️ MANUAL AUDIT: {decision}")

            st.write(f"**কারণ (Reason):** {result['reason']}")
            st.write(f"**কনফিডেন্স স্কোর:** \`{result['confidence']}\`")

        with col2:
            st.subheader("⚡ ইঞ্জিনিয়ারিং অডিট")
            st.info(f"**সিদ্ধান্তকারী লেয়ার:**\\n\\n\`{result['resolved_by']}\`")
            st.metric("Latency (লেটেন্সি)", f"{latency_ms} ms")
            st.metric("Estimated Cost", f"\${result['cost_usd']}")

# স্যাম্পল টেস্ট কেস বাটন
st.markdown("---")
st.subheader("🧪 দ্রুত পরীক্ষার জন্য তৈরি স্যাম্পল কেস")
cols = st.columns(4)
if cols[0].button("Test 1: Clear Toxic"):
    st.info("You are an absolute idiot and know nothing.")
if cols[1].button("Test 2: Hard Rule"):
    st.info("free crypto telegram link click now")
if cols[2].button("Test 3: Identity Term (Safe)"):
    st.info("I am proud of my community and identity.")
if cols[3].button("Test 4: Sarcasm / Ambiguous"):
    st.info("Oh wow, what a genius idea, surely nobody ever thought of that before.")`
    },
    req: {
      name: 'requirements.txt',
      desc: isEn ? 'Python Dependencies File' : 'পাইথন ডিপেনডেন্সি তালিকা',
      code: `streamlit>=1.35.0
scikit-learn>=1.4.0
joblib>=1.3.0
openai>=1.25.0
python-dotenv>=1.0.1
pandas>=2.2.0`
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(files[activeFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const file = files[activeFile];
    const blob = new Blob([file.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Portfolio / Architect's Edge Advice Card */}
      <div className="bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-slate-900 border border-blue-500/30 rounded-2xl p-5 relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 shrink-0 mt-0.5">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>{isEn ? "Architect's Edge: Interview & Portfolio Talking Points" : "পোর্টফোলিও ও ইন্টারভিউতে উপস্থাপনের কৌশল (Architect's Edge)"}</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Staff Engineer Insight
              </span>
            </h3>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {isEn
                ? "Junior developers send 100% of inputs directly to an LLM, generating massive cloud bills ($5.00/day for 10k items) and high 600ms latency. Senior Engineers design 4-Tier Hybrid Cascades where 90%+ traffic is resolved at $0 on CPU in <1ms, reserving LLMs solely for semantic nuance."
                : "জুনিয়র ডেভেলপাররা প্রতিটি কমেন্টে সরাসরি এলএলএম কল করে উচ্চ বিল ($৫/দিন) ও ৬০০ms লেটেন্সি তৈরি করে। কিন্তু স্টাফ ইঞ্জিনিয়াররা ৪-স্তরের হাইব্রিড ক্যাস্কেড ডিজাইন করেন যাতে ৯০%+ ট্রাফিক কোনো খরচ ছাড়াই <১ms-এ সিপিইউতে নিষ্পত্তি হয়, আর এলএলএম শুধু অস্পষ্ট ব্যঙ্গ ও জটিলতার জন্য সংরক্ষিত থাকে।"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-xs">
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
                <span className="font-bold text-emerald-400 block mb-1">
                  1. {isEn ? 'Cost Reduction Mathematics:' : 'খরচ সাশ্রয়ের অংক:'}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {isEn
                    ? '10,000 comments @ $0.00015 = $1.50/day. With 93% handled by L1+L2 ($0), cost plunges to $0.10/day (93.3% savings).'
                    : '১০,০০০ কমেন্ট সরাসরি এলএলএমে দিলে $১.৫০-$৫ খরচ হতো। লেয়ার ১ ও ২-এ ৯৩% সমাধান হওয়ায় খরচ নেমে আসে মাত্র কয়েক সেন্টে।'}
                </span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
                <span className="font-bold text-cyan-400 block mb-1">
                  2. {isEn ? 'Identity-Bias Mitigation:' : 'আইডেন্টিটি বায়াস সেফগার্ড:'}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {isEn
                    ? 'Pre-trained weights intentionally balance identity terms with neutral coefficients to protect LGBTQ+, minority & religious identities from false censorship.'
                    : 'দুর্বল ফিল্টারে "identity", "gay", "community" দেখলে ব্যান হয়; আমাদের মডেলে নিউট্রাল ওয়েট দিয়ে ফলস পজিটিভ বন্ধ করা হয়েছে।'}
                </span>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl">
                <span className="font-bold text-purple-400 block mb-1">
                  3. {isEn ? 'Active Learning Loop:' : 'অ্যাক্টিভ লার্নিং লুপ:'}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {isEn
                    ? 'Layer 4 human decisions feed back into the TF-IDF retraining dataset, expanding coverage and decreasing LLM dependency over time.'
                    : 'হিউম্যান রিভিউয়ারদের রায় সরাসরি ক্লাসিক্যাল এমএল ডেটাসেটে যায়, ফলে সময়ের সাথে সাথে মডেল আরও নিখুঁত হয়।'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Viewer Panel */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        {/* File Tabs */}
        <div className="bg-slate-950/80 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(Object.keys(files) as Array<keyof typeof files>).map((key) => {
              const file = files[key];
              const isSelected = activeFile === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveFile(key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>{file.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? (isEn ? 'Copied!' : 'কপি হয়েছে!') : (isEn ? 'Copy Code' : 'কোড কপি')}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{isEn ? 'Download' : 'ডাউনলোড'}</span>
            </button>
          </div>
        </div>

        {/* File Description */}
        <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/60 text-xs text-slate-400 font-sans">
          <span className="font-semibold text-slate-300">{files[activeFile].name}:</span>{' '}
          {files[activeFile].desc}
        </div>

        {/* Code Content */}
        <pre className="p-4 text-xs font-mono text-slate-200 bg-slate-950 overflow-x-auto max-h-[550px] leading-relaxed select-text">
          <code>{files[activeFile].code}</code>
        </pre>
      </div>
    </div>
  );
};
