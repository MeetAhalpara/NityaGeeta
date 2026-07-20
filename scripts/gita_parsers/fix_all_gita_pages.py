import json
import os
import sys
import re
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from groq import Groq

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Manually read .env file
env_path = Path(r"C:\Users\Meeta\OneDrive - Algonquin College\Subjects\6\Entrepreneurship\NityaGeeta\.env")
if env_path.exists():
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ[k.strip()] = v.strip().strip("'\"")

GROQ_KEYS = []
for k, v in os.environ.items():
    if k.startswith("GROQ_API_KEY") and v.strip():
        if v.strip() not in GROQ_KEYS:
            GROQ_KEYS.append(v.strip())

if not GROQ_KEYS:
    raise ValueError("No GROQ_API_KEY environment variables found in .env!")

MODELS = [
    "llama-3.3-70b-versatile",
    "deepseek-r1-distill-llama-70b",
    "mixtral-8x7b-32768",
    "llama-3.1-8b-instant"
]

ORIGINAL_PATH = Path(r"C:\Users\Meeta\OneDrive - Algonquin College\Subjects\6\Entrepreneurship\NityaGeeta\data\output\gita_editions\Srimad Bhagavad Gita Press Gorakhpur.json")
TRANSLATED_PATH = Path(r"C:\Users\Meeta\OneDrive - Algonquin College\Subjects\6\Entrepreneurship\NityaGeeta\data\output\gita_editions\gita_press_translated.json")

with open(ORIGINAL_PATH, "r", encoding="utf-8") as f:
    orig_data = json.load(f)

orig_map = {item["page"]: item.get("text", "") for item in orig_data if "page" in item}

trans_map = {}
if TRANSLATED_PATH.exists():
    with open(TRANSLATED_PATH, "r", encoding="utf-8") as f:
        trans_data = json.load(f)
        for item in trans_data:
            if "page" in item:
                trans_map[item["page"]] = item.get("english", "")

def is_defective(page_num, text_eng):
    if not text_eng or not text_eng.strip():
        return True, "Empty text"
    
    lines = [l.strip() for l in text_eng.strip().split("\n") if l.strip()]
    if not lines:
        return True, "No non-empty lines"
    
    # 1. Check header line mismatch
    m = re.match(r"^(\d+)", lines[0])
    if m:
        hdr_page = int(m.group(1))
        if hdr_page != page_num:
            return True, f"Header line mismatch ({hdr_page} vs {page_num})"
    else:
        return True, f"Header line does not start with page number"
    
    # 2. Check for bad verse patterns like "531/53" or "564/56"
    bad_pattern = re.search(r"\b\d{3}/\d{2}\b", text_eng)
    if bad_pattern:
        return True, f"Bad verse pattern ({bad_pattern.group(0)})"
    
    return False, "OK"

# Audit duplicates
seen_norm = {}
duplicate_pages = set()
for p in sorted(trans_map.keys()):
    eng = trans_map[p]
    ok, reason = is_defective(p, eng)
    if not ok:
        continue
    norm = re.sub(r"\s+", " ", eng.lower().strip())
    if norm in seen_norm:
        duplicate_pages.add(p)
    else:
        seen_norm[norm] = p

def get_defective_pages():
    defective = []
    all_orig_pages = sorted(list(orig_map.keys()))
    for p in all_orig_pages:
        if p not in trans_map:
            defective.append((p, "Missing page"))
        elif p in duplicate_pages:
            defective.append((p, "Duplicate content"))
        else:
            def_flag, reason = is_defective(p, trans_map[p])
            if def_flag:
                defective.append((p, reason))
    return defective

lock = threading.Lock()
save_counter = 0

def save_translated_dataset():
    with lock:
        sorted_data = []
        for p in sorted(orig_map.keys()):
            if p in trans_map:
                sorted_data.append({"page": p, "english": trans_map[p]})
        with open(TRANSLATED_PATH, "w", encoding="utf-8") as f:
            json.dump(sorted_data, f, ensure_ascii=False, indent=2)
        print(f"  [Saved dataset with {len(sorted_data)} pages]")

def process_single_page(page_info, worker_id):
    global save_counter
    p, reason = page_info
    orig_text = orig_map.get(p, "")
    if not orig_text.strip():
        print(f"Skipping page {p} because original text is empty.")
        return

    prompt = f"""You are a master translator of sacred Hindu texts (Sanskrit and Hindi to English).
Translate the following page from the Gita Press edition of Srimad Bhagavad Gita into clear, precise English.

CRITICAL TRANSLATION RULES:
1. The VERY FIRST line of your response MUST be the page number: {p}
2. DO NOT invent or hallucinate verse numbers, page numbers, or shloka references (e.g. do NOT write 531/53 or 3-digit verse numbers unless present in original).
3. DO NOT repeat sentences or paragraphs. Write distinct, fluent English for each part of the commentary.
4. Keep all verse numbers, shloka numbers, and chapter headings EXACTLY matched to the original text.
5. If Sanskrit shlokas are present, include their English transliteration and verse translation.
6. Keep all commentary faithful to the original Hindi text.

Original Hindi/Sanskrit Text (Page {p}):
{orig_text}
"""

    last_error = None
    for model in MODELS:
        for attempt in range(len(GROQ_KEYS)):
            k = GROQ_KEYS[(worker_id + attempt) % len(GROQ_KEYS)]
            try:
                client = Groq(api_key=k, timeout=60.0)
                res = client.chat.completions.create(
                    model=model,
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.2,
                    max_tokens=4096
                )
                txt = res.choices[0].message.content.strip()
                if txt:
                    lines = [l.strip() for l in txt.split("\n") if l.strip()]
                    if lines and not lines[0].startswith(str(p)):
                        txt = f"{p}\n\n" + txt
                    
                    with lock:
                        trans_map[p] = txt
                        save_counter += 1
                        current_saves = save_counter
                    
                    print(f"[Worker {worker_id}] Page {p:4d} ({reason}) -> SUCCESS ({len(txt)} chars)")
                    
                    if current_saves % 5 == 0:
                        save_translated_dataset()
                    return
            except Exception as e:
                last_error = e
                time.sleep(1.5)
    
    print(f"[Worker {worker_id}] Page {p:4d} ({reason}) -> FAILED: {last_error}")

def main():
    defective = get_defective_pages()
    print(f"Loaded {len(GROQ_KEYS)} Groq API keys.")
    print(f"Total defective/missing/duplicate pages to fix: {len(defective)}")
    print(f"Launching 8 parallel workers...")
    
    num_workers = min(len(GROQ_KEYS), 8)
    with ThreadPoolExecutor(max_workers=num_workers) as executor:
        futures = []
        for i, item in enumerate(defective):
            worker_id = i % num_workers
            futures.append(executor.submit(process_single_page, item, worker_id))
        
        for future in as_completed(futures):
            future.result()
            
    save_translated_dataset()
    print(f"\nAll tasks finished!")

if __name__ == "__main__":
    main()
