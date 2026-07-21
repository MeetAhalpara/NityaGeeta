import os
import json
import re
import time
import urllib.request
import urllib.error
import sys

# Ensure unbuffered stdout
sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

# Manually parse .env file
env_path = r'c:\Users\Meeta\OneDrive - Algonquin College\Subjects\6\Entrepreneurship\NityaGeeta\.env'
groq_keys = []

if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if '=' in line and not line.startswith('#'):
                k, v = line.split('=', 1)
                v = v.strip("'\"")
                if 'GROQ' in k.upper() and v.startswith('gsk_'):
                    if v not in groq_keys:
                        groq_keys.append(v)

print(f"Loaded {len(groq_keys)} unique Groq API keys.", flush=True)

if not groq_keys:
    raise RuntimeError("No Groq API keys found in .env")

# Active valid Groq models
MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "qwen/qwen3.6-27b",
    "groq/compound"
]

current_key_idx = 0
current_model_idx = 0

def call_groq_api(prompt_text):
    global current_key_idx, current_model_idx
    
    attempts = 0
    max_attempts = len(groq_keys) * len(MODELS) * 2
    
    while attempts < max_attempts:
        key = groq_keys[current_key_idx % len(groq_keys)]
        model = MODELS[current_model_idx % len(MODELS)]
        
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }
        
        payload = {
            "model": model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a master translator of sacred Hindu texts (Srimad Bhagavad Gita & Sadhak-Sanjivani commentary). Translate the given Hindi text into clear, fluent, complete English without truncating any paragraph or sentence. Retain all shloka numbers (e.g. ॥ १ ॥, (16.1), [Verse 12]), chapter headings, and formatting."
                },
                {
                    "role": "user",
                    "content": f"Translate the following page completely into English without omitting any sentences, commentary, or footnotes:\n\n{prompt_text}"
                }
            ],
            "temperature": 0.2,
            "max_tokens": 4096
        }
        
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers=headers, method='POST')
        
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                res = json.loads(response.read().decode('utf-8'))
                text = res['choices'][0]['message']['content'].strip()
                return text
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8', errors='ignore')
            if e.code == 429: # Rate limit
                print(f"Rate limit on key {current_key_idx+1}/{len(groq_keys)} model {model}. Rotating key...", flush=True)
                current_key_idx += 1
                if current_key_idx % len(groq_keys) == 0:
                    current_model_idx += 1
            else:
                print(f"HTTP {e.code} on key {current_key_idx+1} model {model}: {err_body[:60]}. Rotating...", flush=True)
                current_key_idx += 1
                if current_key_idx % len(groq_keys) == 0:
                    current_model_idx += 1
        except Exception as ex:
            print(f"Error: {ex}. Rotating...", flush=True)
            current_key_idx += 1
            
        attempts += 1
        time.sleep(1)
        
    raise RuntimeError("All Groq API keys and models exhausted.")

# Load JSON
json_path = r'c:\Users\Meeta\OneDrive - Algonquin College\Subjects\6\Entrepreneurship\NityaGeeta\data\output\gita_editions\gita_press_translated.json'
with open(json_path, 'r', encoding='utf-8') as f:
    gita_data = json.load(f)

page_map = {x['page']: x for x in gita_data}

pages_to_fix = []
for item in gita_data:
    page = item['page']
    orig = item.get('original', '').strip()
    eng = item.get('english', '').strip()
    if not eng or '[Decorative' in eng:
        continue
    last_char = eng[-1]
    is_index_page = (page >= 1264 and page <= 1296)
    abrupt = False
    if last_char not in '.!?)"\'*—\u0964' and not eng.endswith('etc.') and not eng.endswith('||') and not eng.endswith('॥'):
        if not (is_index_page and (last_char.isdigit() or last_char in ['-', ';', ','])):
            abrupt = True
    ratio = len(eng) / max(len(orig), 1)
    too_short = (len(orig) > 1500 and ratio < 0.35)
    has_glitch = bool(re.search(r'(?:=\s*\w+\n){3,}', eng))
    if abrupt or too_short or has_glitch:
        pages_to_fix.append(page)

print(f"Starting background fix for {len(pages_to_fix)} pages...", flush=True)

fixed_count = 0
for idx, p_num in enumerate(pages_to_fix, 1):
    item = page_map[p_num]
    orig_text = item.get('original', '')
    
    print(f"[{idx}/{len(pages_to_fix)}] Translating Page {p_num} (orig len: {len(orig_text)})...", flush=True)
    try:
        new_eng = call_groq_api(orig_text)
        item['english'] = new_eng
        fixed_count += 1
        
        # Save progress every 5 pages
        if fixed_count % 5 == 0 or idx == len(pages_to_fix):
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(gita_data, f, ensure_ascii=False, indent=2)
            print(f"--> Saved progress to JSON (Fixed {fixed_count}/{len(pages_to_fix)}).", flush=True)
    except Exception as e:
        print(f"FAILED Page {p_num}: {e}", flush=True)

print(f"\nCompleted re-translation! Total pages updated: {fixed_count}", flush=True)
