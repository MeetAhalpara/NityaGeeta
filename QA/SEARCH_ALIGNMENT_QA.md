# NityaGeeta Search Alignment & Contextual Evaluation Framework

**Module:** Global Sources Search Engine (`/sources`)  
**Cognitive Framework:** Multi-Perspective Thinking Styles (Synthetic, Lateral, High-Context, Systemic Risk-Mitigation, Classical Sanskrit)  
**Evaluation Mechanism:** Continuous Iterative Semantic Alignment Loop with Error Backlog  

---

## 1. Philosophical Overview & Architecture

When a user searches a sacred scripture platform like NityaGeeta, the query rarely conforms to sterile, single-keyword Anglo-Western lookups. Instead, searches reflect rich contextual states, dialectical synthesis (such as harmonizing modern astrophysics with Vedic cosmology), pragmatic troubleshooting (*Adaptive*), or deep karmic risk-mitigation.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│               CONTEXTUAL SEARCH ALIGNMENT ENGINE                       │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
                         [Input: Seeker's Query]
                                      │
                                      ▼
               ┌──────────────────────────────────────────────┐
               │    COGNITIVE QUERY PROFILES (5 CATEGORIES)   │
               ├──────────────────────────────────────────────┤
               │ 1. Synthetic (Both-And): Science + Atman     │
               │ 2. Lateral (Adaptive): Actionable Distress Sol.│
               │ 3. High-Context: Relational & Social Duty    │
               │ 4. Systemic Risk: Karmic Security & Rebirth  │
               │ 5. Classical Sanskrit: Transliterated Shlokas│
               └──────────────────────┬───────────────────────┘
                                      │
                                      ▼
                     [Execute Search Filtering Algorithm]
                                      │
                                      ▼
                   [Inspect Retrieved Chapters & Books]
                                      │
                                      ▼
                 ┌──────────────────────────────────────────┐
                 │       SEMANTIC ALIGNMENT EVALUATION      │
                 ├────────────────────┬─────────────────────┤
                 │ Matches Intent?    │ Fails to Match?     │
                 │      (Score >= 70) │        (Score < 70) │
                 └─────────┬──────────┴──────────┬──────────┘
                           │                     │
                           ▼                     ▼
                 [ALIGNED — GREAT!]     [MISALIGNED — ERROR]
                                                 │
                                                 ▼
                                        [Log to Error Backlog]
                                                 │
                                                 ▼
                                        [Iterative Loop Continues]
```

---

## 2. The 5 Contextual Query Query Profiles

### 1. Synthetic (Both-And) Thinking
* **Cognitive Model:** Comfortably holds two seemingly opposing paradigms simultaneously. Bridges empirical modern science with sacred transcendental truths without internal conflict.
* **Representative Query:** `"cosmic time and physics"`, `"science and spirituality"`, `"quantum observer and atman"`.
* **Expected Ground Truth:**
  * *Akshara Brahma Yoga* (Chapter 8: Cosmic time, Kalpas, Brahma's day/night).
  * *Vishwaroopa Darshana Yoga* (Chapter 11: Universal form, Time as the destroyer).
  * *B.O.S.S : Basics of Sanatan Sanskriti* (Chapter 9: Calculations of Kaal and Yugas).

### 2. Lateral (Adaptive) Thinking
* **Cognitive Model:** Highly adaptive, resourceful problem-solving. Seeks immediate, out-of-the-box spiritual remedies for real-world paralysis or acute anxiety without requiring monastic renunciation.
* **Representative Query:** `"overcoming panic and paralysis"`, `"workplace stress shortcut"`, `"restless mind focus"`.
* **Expected Ground Truth:**
  * *Arjuna Vishada Yoga* (Chapter 1: Battlefield panic, physical collapse).
  * *Sankhya Yoga* (Chapter 2: Equanimity, Sthitaprajna state).
  * *Dhyana Yoga* (Chapter 6: Restless mind mastery through Abhyasa and Vairagya).
  * *Brahmacharya : The Ultimate Action Book* (Mental focus and discipline).

### 3. High-Context Thinking
* **Cognitive Model:** Deeply attuned to social relationships, moral conflict, family expectations, and unstated emotional weight. Decisions depend on situational duty (*Swadharma*) rather than rigid universal rules.
* **Representative Query:** `"family duty vs personal career"`, `"moral conflict in battlefield"`, `"householder ethical action"`.
* **Expected Ground Truth:**
  * *Karma Yoga* (Chapter 3: Selfless action, social responsibility, Lokasangraha).
  * *Karma Sanyasa Yoga* (Chapter 5: True inner detachment while fulfilling duties).
  * *Moksha Sanyasa Yoga* (Chapter 18: Swadharma and surrender of attachment).

### 4. Systemic Risk-Mitigation Thinking
* **Cognitive Model:** Hyper-aware of long-term existential risk, karmic repercussions, self-preservation, and escaping perpetual cycles of suffering and rebirth (*Samsara*).
* **Representative Query:** `"escaping cycle of rebirth"`, `"fear of death and immortality"`, `"demonic vice destruction"`.
* **Expected Ground Truth:**
  * *Sankhya Yoga* (Chapter 2: Immortality of the Atman, imperishable soul).
  * *Gunatraya Vibhaga Yoga* (Chapter 14: Three Gunas binding human nature).
  * *Daivasura Sampad Vibhaga Yoga* (Chapter 16: Divine virtues vs destructive vices).

### 5. Classical Sanskrit & Transliteration Thinking
* **Cognitive Model:** Rooted in phonetic shastric memory and traditional terminology, utilizing Roman transliteration or colloquial phonetic approximations.
* **Representative Query:** `"sadhak sanjeevani"`, `"sthitaprajna"`, `"nishkama karma"`, `"om tat sat"`.
* **Expected Ground Truth:**
  * *Srimad Bhagavad Gita (Sadhaka-Sanjivani)* by Swami Ramsukhdas.
  * *Shraddhatraya Vibhaga Yoga* (Chapter 17: OM TAT SAT).
  * *Karma Yoga* (Chapter 3: Nishkama Karma).

---

## 3. The Search Alignment & Error Logging Loop

```python
# Conceptual Loop Lifecycle:
while unaligned_queries_exist:
    for query_case in query_test_suite:
        retrieved_output = search_engine.execute(query_case.query)
        alignment_score = evaluate_semantic_alignment(query_case, retrieved_output)
        
        if alignment_score >= ALIGNMENT_THRESHOLD:
            log_success(query_case, retrieved_output) # ALIGNED — GREAT!
        else:
            error_entry = create_error_entry(query_case, retrieved_output)
            error_backlog.append(error_entry) # Log error to be solved
            
    if error_backlog.is_empty():
        break # 100% Convergence Achieved
    else:
        refine_synonym_dictionaries_or_keyword_indexes()
```

---

## 4. Search Alignment Test Cases

| Test ID | Thinking Profile | Search Query | Expected Target Match | Acceptance Criteria | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-SRH-CONV-001** | Conversational | `I am looking for a book which has Infomration content contain knowledge provide information about Consmic time` | Book 1 (*Sadhaka-Sanjivani*) / Ch 8 (*Akshara Brahma*) / B.O.S.S | Typo-normalized `consmic` -> `cosmic`; strips conversational intent fillers | **VERIFIED** |
| **TC-SRH-CONV-002** | Conversational | `I want to learn more about Cosmic time. How does universe time work?` | Ch 8 (*Akshara Brahma*) / Ch 11 (*Vishwaroopa*) | Surfaces universal time dynamics & cosmic kalpas | **VERIFIED** |
| **TC-SRH-CONV-003** | Conversational | `How does universe time work?` | Ch 8 (*Akshara Brahma*) / Ch 11 (*Vishwaroopa*) | Matches universe time & cosmic dissolution | **VERIFIED** |
| **TC-SRH-CONV-004** | Conversational | `Which book contains knowledge or provides information about cosmic time?` | Book 1 / Book 5 (*B.O.S.S*) | Direct match for cosmic time knowledge | **VERIFIED** |
| **TC-SRH-IND-001** | Synthetic | `cosmic time and physics` | Chapter 8 (Akshara Brahma) / Chapter 11 (Vishwaroopa) | Surfaces Kala / cosmic cycles | **VERIFIED** |
| **TC-SRH-IND-002** | Synthetic | `science and soul atman` | Chapter 2 (Sankhya Yoga) / B.O.S.S Book | Surfaces Atman & immortality | **VERIFIED** |
| **TC-SRH-IND-003** | Lateral (*Adaptive*) | `restless mind focus` | Chapter 6 (Dhyana Yoga) / Brahmacharya | Surfaces mind control & focus | **VERIFIED** |
| **TC-SRH-IND-004** | Lateral (*Adaptive*) | `panic attack symptoms` | Chapter 1 (Arjuna Vishada Yoga) | Surfaces Arjuna's collapse | **VERIFIED** |
| **TC-SRH-IND-005** | High-Context | `family duty vs career` | Chapter 3 (Karma Yoga) / Chapter 18 (Swadharma) | Surfaces selfless duty & action | **VERIFIED** |
| **TC-SRH-IND-006** | High-Context | `inner detachment in work` | Chapter 5 (Karma Sanyasa) | Surfaces lotus leaf equanimity | **VERIFIED** |
| **TC-SRH-IND-007** | Systemic Risk | `fear of death immortality` | Chapter 2 (Sankhya Yoga) | Surfaces deathless nature of Atman | **VERIFIED** |
| **TC-SRH-IND-008** | Systemic Risk | `binding nature of gunas` | Chapter 14 (Gunatraya Vibhaga) | Surfaces Sattva, Rajas, Tamas | **VERIFIED** |
| **TC-SRH-IND-009** | Classical Sanskrit | `sadhak sanjeevani` | Book 1 (Sadhaka-Sanjivani) | Surfaces Swami Ramsukhdas | **VERIFIED** |
| **TC-SRH-IND-010** | Classical Sanskrit | `nishkama karma` | Chapter 3 (Karma Yoga) / Chapter 2 (2.47) | Surfaces duty without fruits | **VERIFIED** |
| **TC-SRH-IND-011** | Classical Sanskrit | `sthitaprajna` | Chapter 2 (Sankhya Yoga) | Surfaces stable wisdom | **VERIFIED** |
| **TC-SRH-IND-012** | Classical Sanskrit | `om tat sat` | Chapter 17 (Shraddhatraya Vibhaga) | Surfaces threefold syllables | **VERIFIED** |

---

## 5. Error Backlog Structure

When a search query fails to retrieve an expected text, it is recorded in `qa/reports/search_misalignment_errors.json` and summarized in `qa/SEARCH_MISALIGNMENT_ERRORS.md`:

```json
{
  "query": "workplace burnout shortcut",
  "thinking_type": "Lateral (Adaptive)",
  "retrieved_count": 0,
  "expected_targets": ["Karma Yoga", "Dhyana Yoga", "Brahmacharya"],
  "root_cause": "Missing token synonym 'burnout' in book keywords",
  "remediation": "Add 'burnout' and 'exhaustion' to Chapter 1, Chapter 2, and Brahmacharya keyword arrays",
  "status": "QUEUED_FOR_REPAIR"
}
```

---

## 6. Execution Command

One can run the automated search alignment evaluation loop via:

```powershell
# Execute the search alignment loop
py qa/test_search_alignment_loop.py
```
