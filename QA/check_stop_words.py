import re

with open("frontend/src/app/dilemmas/page.tsx", "r", encoding="utf-8") as f:
    page_code = f.read()

# Let's extract SEMANTIC_SYNONYMS from page_code
# and test how query scoring behaves
synonyms = {
    "burnout": ["exhaustion", "fatigue", "overworked", "stress", "tired", "corporate", "pressure", "overwhelmed", "workaholic", "breakdown", "hustle", "workload", "burn", "burnt", "burned"],
    "grief": ["loss", "death", "mourning", "bereavement", "sorrow", "crying", "heartbreak", "tragedy", "dying", "passed", "funeral"],
}

stop_words = set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with", "about",
    "of", "is", "am", "are", "was", "were", "be", "been", "being", "have", "has", "had",
    "do", "does", "did", "i", "me", "my", "myself", "we", "our", "you", "your", "he", "him",
    "she", "her", "it", "its", "they", "them", "what", "which", "who", "whom", "this", "that",
    "these", "those", "from", "as", "by", "into", "through", "during", "before", "after",
    "above", "below", "up", "down", "out", "off", "over", "under", "again", "further",
    "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both",
    "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only",
    "own", "same", "so", "than", "too", "very", "can", "will", "just", "should", "now",
    "tell", "show", "find", "looking", "look", "want", "would", "like", "give", "please",
    "help", "helps", "need", "needs", "feel", "feeling", "dilemma", "dilemmas", "situation",
    "shloka", "verse", "verses", "chapter", "content", "contents", "contain", "contains",
    "knowledge", "provide", "provides", "learn", "learning", "understand",
    "understands", "understanding", "explain", "explains", "guidance", "guide", "infomration"
])

print("Is 'one' in stop_words?", "one" in stop_words)
print("Is 'loved' in stop_words?", "loved" in stop_words)
print("Is 'losing' in stop_words?", "losing" in stop_words)
