import os
import sys
import json
import time
import urllib.request
import urllib.error

def translate_page(page_num):
    sys.stdout.reconfigure(encoding='utf-8')

    target_dir = r'C:\Users\Meeta\OneDrive - Algonquin College\Subjects\6\Entrepreneurship\NityaGeeta\scripts\data_fixes'
    os.makedirs(target_dir, exist_ok=True)

    src_path = r'c:\Users\Meeta\OneDrive - Algonquin College\Subjects\6\Entrepreneurship\NityaGeeta\data\output\gita_editions\Srimad Bhagavad Gita Press Gorakhpur.json'
    with open(src_path, 'r', encoding='utf-8') as f:
        src_data = json.load(f)

    page_original = ''
    for item in src_data:
        if item.get('page') == page_num:
            page_original = item.get('text', '')
            break

    if not page_original:
        print(f"Error: Could not find Page {page_num} in source dataset.")
        return None

    env_path = r'c:\Users\Meeta\OneDrive - Algonquin College\Subjects\6\Entrepreneurship\NityaGeeta\.env'
    keys = []
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line.startswith('GROQ_API_KEY'):
                    k = line.split('=', 1)[1].strip('"\'')
                    if k and k not in keys:
                        keys.append(k)

    if not keys:
        print("Error: No Groq API Keys found in .env file.")
        return None

    prompt = (
        "You are an expert translator of sacred Hindu texts, specifically Srimad Bhagavad Gita with Gita Press commentary.\n"
        f"Translate the following Hindi text from Page {page_num} into clear, accurate, fluent English.\n\n"
        "STRICT INSTRUCTIONS:\n"
        "1. DO NOT add title headers like '### Translation of Page...' or metadata headers at the top. Start directly with the translated page content.\n"
        "2. Translate ALL Devanagari/Hindi commentary into English.\n"
        "3. Keep Sanskrit Shlokas in standard Roman Transliteration / IAST alongside word-by-word breakdown.\n"
        "4. Preserve the exact structure, verse numbers, bullet points, line breaks, and formatting.\n"
        "5. DO NOT output any reasoning, chain of thought, or <think> tags. Output ONLY the clean translation.\n"
        "6. DO NOT use placeholder text or generic summaries.\n\n"
        f"PAGE TEXT TO TRANSLATE:\n{page_original}"
    )

    translated_text = None
    models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant']

    for model in models:
        if translated_text:
            break
        for i, api_key in enumerate(keys):
            print(f"Trying Groq Model '{model}' with API Key #{i+1} for Page {page_num}...")
            req_data = json.dumps({
                'model': model,
                'messages': [
                    {'role': 'system', 'content': 'You are a meticulous translator of Gita Press Bhagavad Gita commentary into English.'},
                    {'role': 'user', 'content': prompt}
                ],
                'temperature': 0.1,
                'max_tokens': 2048
            }).encode('utf-8')

            req = urllib.request.Request(
                'https://api.groq.com/openai/v1/chat/completions',
                data=req_data,
                headers={
                    'Authorization': f'Bearer {api_key}',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                }
            )

            try:
                with urllib.request.urlopen(req, timeout=45) as resp:
                    res_json = json.loads(resp.read().decode('utf-8'))
                    translated_text = res_json['choices'][0]['message']['content'].strip()
                    
                    # Strip leading title headers if any generated
                    lines = translated_text.splitlines()
                    if lines and lines[0].startswith('### Translation of Page'):
                        lines = lines[1:]
                        while lines and (lines[0].startswith('####') or not lines[0].strip()):
                            lines = lines[1:]
                        translated_text = '\n'.join(lines).strip()

                    print(f"SUCCESS: Model '{model}' with Key #{i+1} succeeded for Page {page_num}!")
                    break
            except urllib.error.HTTPError as e:
                if e.code == 429:
                    print(f"  [{model}] Key #{i+1} rate limited (429). Waiting 5s for rate-limit reset...")
                    time.sleep(5)
                else:
                    print(f"  [{model}] Key #{i+1} HTTP Error: {e.code} - {e.reason}")
                    time.sleep(2)
            except Exception as e:
                print(f"  [{model}] Key #{i+1} Error: {e}")
                time.sleep(2)


    if not translated_text:
        print(f"Error: All API attempts failed for Page {page_num}.")
        return None

    output_item = {
        'page': page_num,
        'original': page_original,
        'english': translated_text
    }

    json_path = os.path.join(target_dir, f'page_{page_num}.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(output_item, f, ensure_ascii=False, indent=2)

    print(f"SUCCESSFULLY CREATED PAGE {page_num} TRANSLATION JSON AT: {json_path}")
    return output_item

if __name__ == '__main__':
    # --- CHANGE THE PAGE NUMBER(S) HERE ---
    # Single page:
    pages_to_translate = [63]
    
    # Or multiple pages:
    # pages_to_translate = [530, 531, 532]

    for p in pages_to_translate:
        translate_page(p)