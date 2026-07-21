import json

TRANS_OUTPUT = "./data/output/gita_editions/gita_press_translated.json"

# Load current translated data
with open(TRANS_OUTPUT, "r", encoding="utf-8") as f:
    data = json.load(f)

# Filter out pages 84 and 85
filtered_data = [item for item in data if item["page"] not in (84, 85)]

# Save it back
with open(TRANS_OUTPUT, "w", encoding="utf-8") as f:
    json.dump(filtered_data, f, ensure_ascii=False, indent=2)

print("Successfully removed pages 84 and 85 from output. Ready for clean translation.")
