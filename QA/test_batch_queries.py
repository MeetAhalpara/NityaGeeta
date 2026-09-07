# Add tests for all queries
queries = [
    "burnout",
    "grief and losing a loved one",
    "imposter syndrome",
    "restless wandering mind",
    "2.47",
    "18.66",
    "anger and rage",
    "fear of death and soul",
]

for q in queries:
    res = search(q)
    print(f"\nQuery: '{q}' -> {len(res)} matches")
    for item, s in res[:3]:
        print(f"   [{s}] Ch {item['chapter']}.{item['verse']} - {item['title']}")
