import os
import re
import joblib
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# নিষিদ্ধ শব্দ বা হুমকি রুলস (Layer 1)
HARD_BLOCK_REGEX = [
    r"\b(die already|kill yourself|scam artist)\b",
    r"\b(free crypto|telegram link|whatsapp \+\d+)\b"  # স্প্যাম প্রোটেকশন
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
        }
