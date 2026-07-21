import os
import sys
import json
import time
import urllib.request
import urllib.error

def translate_pages(page_list):
    sys.stdout.reconfigure(encoding='utf-8')

    target_dir = r'C:\Users\Meeta\OneDrive - Algonquin College\Subjects\6\Entrepreneurship\NityaGeeta\scripts\data_fixes'
    os.makedirs(target_dir, exist_ok=True)

    src_path = r'c:\Users\Meeta\OneDrive - Algonquin College\Subjects\6\Entrepreneurship\NityaGeeta\data\output\gita_editions\Srimad Bhagavad Gita Press Gorakhpur.json'
    with open(src_path, 'r', encoding='utf-8') as f:
        src_data = json.load(f)

    src_dict = {item.get('page'): item.get('text', '') for item in src_data}

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
        return

    for page_num in page_list:
        page_original = src_dict.get(page_num, '')
        if not page_original:
            print(f"Error: Could not find Page {page_num} in source dataset.")
            continue

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

        for i, api_key in enumerate(keys):
            print(f"Translating Page {page_num} using Groq API Key #{i+1}...")
            req_data = json.dumps({
                'model': 'llama-3.3-70b-versatile',
                'messages': [
                    {'role': 'system', 'content': 'You are a meticulous translator of Gita Press Bhagavad Gita commentary into English.'},
                    {'role': 'user', 'content': prompt}
                ],
                'temperature': 0.1,
                'max_tokens': 4000
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
                with urllib.request.urlopen(req) as resp:
                    res_json = json.loads(resp.read().decode('utf-8'))
                    translated_text = res_json['choices'][0]['message']['content'].strip()

                    # Clean off title headers if any
                    lines = translated_text.splitlines()
                    if lines and lines[0].startswith('### Translation of Page'):
                        lines = lines[1:]
                        while lines and (lines[0].startswith('####') or not lines[0].strip()):
                            lines = lines[1:]
                        translated_text = '\n'.join(lines).strip()

                    print(f"Successfully translated Page {page_num} with Key #{i+1}!")
                    break
            except urllib.error.HTTPError as e:
                print(f"Key #{i+1} HTTP Error: {e.code} - {e.reason}")
                time.sleep(2)
            except Exception as e:
                print(f"Key #{i+1} Error: {e}")
                time.sleep(2)

        if translated_text:
            output_item = {
                'page': page_num,
                'original': page_original,
                'english': translated_text
            }

            json_path = os.path.join(target_dir, f'page_{page_num}.json')
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(output_item, f, ensure_ascii=False, indent=2)

            print(f"SAVED: {json_path}")
        else:
            print(f"FAILED to translate Page {page_num}")

        time.sleep(3)  # Rate limit protection

if __name__ == '__main__':
    translate_pages([247, 276])
