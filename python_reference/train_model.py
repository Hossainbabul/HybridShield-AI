import joblib
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
    train_and_save()
