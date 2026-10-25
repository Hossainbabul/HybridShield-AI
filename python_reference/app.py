import streamlit as st
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
    st.info("টার্মিনালে `python train_model.py` রান করে মডেল ফাইল তৈরি করুন।")
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
            st.write(f"**কনফিডেন্স স্কোর:** `{result['confidence']}`")

        with col2:
            st.subheader("⚡ ইঞ্জিনিয়ারিং অডিট")
            st.info(f"**সিদ্ধান্তকারী লেয়ার:**\n\n`{result['resolved_by']}`")
            st.metric("Latency (লেটেন্সি)", f"{latency_ms} ms")
            st.metric("Estimated Cost", f"${result['cost_usd']}")

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
    st.info("Oh wow, what a genius idea, surely nobody ever thought of that before.")
