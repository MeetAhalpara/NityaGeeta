import json, os, sys, time
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

ORIGINAL_JSON = "./data/output/gita_editions/Srimad Bhagavad Gita Press Gorakhpur.json"
TRANS_OUTPUT  = "./data/output/gita_editions/gita_press_translated.json"

DEFECTIVE_PAGES = [
    63, 201, 531, 533, 535, 537, 539, 541, 543, 545, 551, 553, 564, 649,
    765, 851, 902, 974, 1012, 1020, 1044, 1136, 1157, 1203, 1283, 1284, 1285
]

GROQ_KEYS = []
for k, v in os.environ.items():
    if k.startswith("GROQ_API_KEY") and v.strip():
        if v.strip() not in GROQ_KEYS:
            GROQ_KEYS.append(v.strip())

if not GROQ_KEYS:
    raise ValueError("No GROQ_API_KEY environment variables found!")

MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"]

def get_groq_client(key_idx):
    return Groq(api_key=GROQ_KEYS[key_idx % len(GROQ_KEYS)], timeout=60.0)

def translate_page_strict(page_num, original_text):
    sanitized_original = original_text.replace('"', '\\"').replace('\n', '\\n')
    prompt = f"""You are a master translator of sacred Hindu texts (Sanskrit and Hindi to English).
Translate the following page from the Gita Press edition of Srimad Bhagavad Gita into clear, precise English.

CRITICAL TRANSLATION RULES:
1. DO NOT invent or hallucinate verse numbers, page numbers, or shloka references (e.g. do NOT write 531/53 or 3-digit verse numbers unless present in original).
2. DO NOT repeat sentences or paragraphs. Write distinct, fluent English for each part of the commentary.
3. If Sanskrit shlokas are present, include their English transliteration and verse translation.
4. Keep all commentary faithful to the original Hindi text.

Original Hindi/Sanskrit Text (Page {page_num}):
{original_text}

JSON Format Output:
```json
{{
  "page": {page_num},
  "original": "{sanitized_original}",
  "english": "YOUR_ENGLISH_TRANSLATION_HERE"
}}
```
"""
    global_attempt = 0
    for model in MODELS:
        for attempt in range(len(GROQ_KEYS)):
            current_key_idx = (global_attempt) % len(GROQ_KEYS)
            client = get_groq_client(current_key_idx)
            global_attempt += 1
            try:
                kwargs = {
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.2
                }
                if model == "llama-3.3-70b-versatile":
                    kwargs["response_format"] = {"type": "json_object"}
                resp = client.chat.completions.create(**kwargs)
                raw_out = resp.choices[0].message.content
                if "```json" in raw_out:
                    raw_out = raw_out.split("```json")[1].split("```")[0].strip()
                elif "```" in raw_out:
                    raw_out = raw_out.split("```")[1].strip()

                parsed = json.loads(raw_out)
                eng_text = parsed.get("english", "")
                if eng_text and len(eng_text) > 30:
                    return eng_text
            except Exception as e:
                time.sleep(0.5)
    return None

def get_target_pages(o_map, t_map):
    missing_pages = [p for p in o_map if p not in t_map]
    defective_pages = []
    for p, item in t_map.items():
        eng = item.get("english", "").strip()
        if not eng:
            defective_pages.append(p)
        elif "Maharshi Vedavyasa had a lot of affection" in eng and p not in [25, 26]:
            defective_pages.append(p)

    all_targets = sorted(list(set(missing_pages + defective_pages)))
    return all_targets

def retranslate_all():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    with open(ORIGINAL_JSON, "r", encoding="utf-8") as f:
        orig_data = json.load(f)
    o_map = {d["page"]: d for d in orig_data}

    with open(TRANS_OUTPUT, "r", encoding="utf-8") as f:
        trans_list = json.load(f)
    t_map = {d["page"]: d for d in trans_list}

    target_pages = get_target_pages(o_map, t_map)

    print(f"Loaded {len(GROQ_KEYS)} Groq API keys.")
    print(f"Detected {len(target_pages)} target pages needing translation/retranslation...")
    print(f"Target Pages Queue: {target_pages[:15]}...")

    for i, p in enumerate(target_pages, start=1):
        if p not in o_map:
            continue
        orig_t = o_map[p].get("text", "").strip()
        if not orig_t:
            print(f"Page {p:4d}: Blank original in source — skipping")
            t_map[p] = {"page": p, "original": "", "english": ""}
            continue

        print(f"[{i}/{len(target_pages)}] Page {p:4d}: translating... ({len(orig_t)} chars)", end=" ", flush=True)
        new_eng = translate_page_strict(p, orig_t)
        if new_eng:
            t_map[p] = {
                "page": p,
                "original": orig_t,
                "english": new_eng
            }
            print(f"✓ Success ({len(new_eng)} chars)")
        else:
            print("❌ Failed — keeping existing or retrying later")

        # Save progress after every page to prevent loss
        sorted_out = [t_map[page_num] for page_num in sorted(t_map.keys())]
        with open(TRANS_OUTPUT, "w", encoding="utf-8") as f:
            json.dump(sorted_out, f, ensure_ascii=False, indent=2)

    print(f"\n✅ All {len(target_pages)} target pages processed and saved back to {TRANS_OUTPUT}")

if __name__ == "__main__":
    retranslate_all()
