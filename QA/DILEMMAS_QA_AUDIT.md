# NityaGeeta Life Dilemmas Engine Comprehensive QA Audit

**Target URL:** `http://localhost:1870/dilemmas`  
**System Under Test:** 49+ Life Dilemmas, 18-Chapter Directory & 1-Click AI Guidance  
**Evaluation Philosophy:** Multi-Scenario Resilience Framework & Multi-Scenario Resilience  

---

## 1. Executive Overview & Dilemma Resolution Philosophy

Life dilemmas are rarely binary logic problems. In classical wisdom traditions, moral conflict (*Dharma-Sankata*) is situational, psychological, and relational. Just as Arjuna experienced acute somatic panic and paralysis on the battlefield of Kurukshetra, modern individuals experience burnout, corporate politics, imposter syndrome, family conflicts, and existential anxiety.

This audit evaluates `http://localhost:1870/dilemmas` through the **Multi-Scenario Resilience Framework**, validating how the system bridges ancient shastric wisdom with contemporary psychological dilemmas across four operational environments: **Happy**, **Bad**, **Raining**, and **Worse**.

```
                         MULTI-DIMENSIONAL DILEMMA FRAMEWORK
                                        │
         ┌──────────────────┬───────────┴───────────┬──────────────────┐
         ▼                  ▼                       ▼                  ▼
  1. SYNTHETIC       2. LATERAL             3. HIGH-CONTEXT    4. SYSTEMIC RISK-
     (BOTH-AND)         (ADAPTIVE)               THINKING           MITIGATION
         │                  │                       │                  │
  Career Ambition    Instant Relief for     Family Duty &      Karmic Security
  + Meditative Peace   Panic & Overwhelm     Office Politics    & Gunas Balance
         └──────────────────┴───────────┬───────────┴──────────────────┘
                                        │
                     EVALUATED ACROSS 4 REAL-WORLD ENVIRONMENTS
                                        │
            ┌───────────────┬───────────┴───────────┬───────────────┐
            ▼               ▼                       ▼               ▼
          HAPPY            BAD                   RAINING          WORSE
      (Ideal State)  (Erroneous Input)     (Constrained Network) (Total Outage)
```

---

## 2. Core Pillars of the Resilience Testing Framework Applied to Dilemmas

### Pillar 1: Synthetic (Both-And) Thinking
Conventional secular frameworks often force a false dilemma between worldly ambition and inner spiritual peace: either one pursues aggressive career growth or one retreats into passive mindfulness. Classical philosophy synthesizes both into *Nishkama Karma Yoga*:
* **Application to `/dilemmas`:** The platform offers practical solutions where a professional can pursue intense startup execution while maintaining psychological detachment from outcomes (Chapter 2, Verse 47). Both ambition and serenity coexist without contradiction.

### Pillar 2: Lateral (Adaptive) Thinking
When an individual faces severe distress or acute moral paralysis, complex theological essays are unhelpful. Lateral thinking looks for an immediate, pragmatic, and out-of-the-box spiritual workaround:
* **Application to `/dilemmas`:** Each dilemma card provides a direct *GITA'S GUIDANCE* synthesis and a single-click *Ask AI for Guidance →* action that pre-fills the dilemma context directly into the AI consultation engine. One receives instantaneous, actionable clarity without navigating complex search filters.

### Pillar 3: High-Context Thinking
Decisions are never made in an ethical vacuum. A choice depends heavily on relationship history, familial duty, social expectations, and unstated emotional stakes:
* **Application to `/dilemmas`:** Dilemmas are organized into nuanced situational categories: *Work & Ambition*, *Ethics & Duty*, *Mental Peace & Anxiety*, *Relationships & Harmony*, and *Life Purpose & Meaning*. Each situation describes real human contexts with compassionate dignity.

### Pillar 4: Systemic Risk-Mitigation Thinking
Navigating intense workplace politics, family disputes, and existential choices requires long-term protection against ethical erosion, karmic backlash, and emotional exhaustion:
* **Application to `/dilemmas`:** The guidance analyzes root psychological causes by deconstructing the three Gunas (Sattva, Rajas, Tamas), equipping one to avoid self-destructive traps and maintain sustained ethical equilibrium.

---

## 3. Four-State Operational Testing Matrix for `/dilemmas`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       4-STATE DILEMMAS TEST SCENARIOS                       │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│ State                │ Environmental Context│ Focus Area                    │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ 1. HAPPY (Optimal)    │ Optimal conditions   │ Card fidelity & 1-click AI    │
│ 2. BAD (Erroneous)       │ Erroneous inputs     │ Boundary checks & typo safety │
│ 3. RAINING (Constrained)  │ Flaky & mobile 320px │ Text clamping & responsiveness│
│ 4. WORSE (Catastrophic Outage)   │ Backend offline      │ 100% client dataset autonomy  │
└──────────────────────┴──────────────────────┴───────────────────────────────┘
```

---

### Environment 1: The Happy Path (Optimal / Optimal State)
*Context: High-speed connection, modern browser, active local server, WebGL enabled.*

#### Test Case TC-DIL-HP-001: Dilemmas Hero Atmosphere & Brand Voice Integrity
* **Cognitive Pillar:** High-Context Elegance.
* **Execution:**
  1. Open `http://localhost:1870/dilemmas`.
  2. Verify that the hero heading reads *"Timeless Wisdom for Modern Life Dilemmas"*.
  3. Verify that the subtitle is a single continuous sentence without any em-dash (`—` or `--`) line splits:
     > *"Clear answers and timeless wisdom from the Bhagavad Gita for everyday life challenges with one-click AI guidance."*
  4. Inspect the chapter popover (`(i)` button): confirm it uses *"NityaGeeta"* and *"one"* with zero first-person pronouns (*"we"*, *"our"*).
* **Expected Result:** Dignified, continuous typography adhering to editorial guidelines.
* **Pass Criteria:** 100% typography harmony, zero broken words, zero first-person plurals.

#### Test Case TC-DIL-HP-002: Symmetrical Search Match Pill with Clear Action
* **Cognitive Pillar:** Lateral Interaction Design.
* **Execution:**
  1. Enter `burnout` in the dilemmas search bar.
  2. Verify that the match count pill appears on the right: `{count} matches | ✕`.
  3. Click the `✕` clear button.
* **Expected Result:** Pill clears search immediately, resets input, and restores the full list of dilemmas.
* **Pass Criteria:** Symmetrical rounded pill, clean icon alignment, instantaneous reset.

#### Test Case TC-DIL-HP-003: 18-Chapter Directory Table Numbering Integrity
* **Cognitive Pillar:** Holistic Structural Simplicity.
* **Execution:**
  1. Expand the *"18 Chapters Canonical Directory"* table.
  2. Inspect the `Chapter` column.
  3. Confirm that chapter numbers display as clean single digits (`1`, `2`, `3`... `18`) without redundant prefix words (*"Chapter 01"*).
* **Expected Result:** Clean numeric presentation matching Apple-grade minimalism.
* **Pass Criteria:** Numbers formatted as `1` to `18`.

#### Test Case TC-DIL-HP-004: Authentic Devanagari Sanskrit & IAST Transliteration
* **Cognitive Pillar:** Synthetic Sacred Ground Truth.
* **Execution:**
  1. Inspect any dilemma card (e.g. Chapter 1, Verse 28–29).
  2. Verify that authentic Devanagari Sanskrit verses render with high contrast and proper line height.
  3. Verify that Roman IAST transliteration appears in clean italic font.
  4. Confirm that the verse citation badge displays clearly at the top right of the card.
* **Expected Result:** Scriptural authenticity paired with modern card elegance.
* **Pass Criteria:** Devanagari renders correctly with zero missing glyphs.

#### Test Case TC-DIL-HP-005: 1-Click AI Guidance Action Trigger
* **Cognitive Pillar:** Lateral (Adaptive) Immediate Help.
* **Execution:**
  1. Locate the dilemma card *Moral Paralysis, Burnout & Dropping One's Tools*.
  2. Verify that the action button reads *Ask AI for Guidance →*.
  3. Click the button and verify that it initiates navigation with pre-filled dilemma context.
* **Expected Result:** Smooth transition to AI guidance without forcing the seeker to re-type their problem.
* **Pass Criteria:** Button click routes correctly with dilemma prompt intact.

---

### Environment 2: The Bad Path (Erroneous / Erroneous & Malformed Inputs)
*Context: Seekers searching with special characters, out-of-range chapters, or extreme payloads.*

#### Test Case TC-DIL-BP-001: Malformed Search Input Handling
* **Cognitive Pillar:** Lateral Error Resilience.
* **Execution:**
  1. In the dilemmas search bar, enter special character clusters: `!@#$%^&*()_+{}[]:;?/\|`.
  2. Enter a 500-character nonsensical payload.
* **Expected Result:** Search handles inputs safely without regex exceptions or application crashes, rendering a clean empty state with suggestion chips.
* **Pass Criteria:** Zero console exceptions, prompt recovery chips displayed.

#### Test Case TC-DIL-BP-002: URL Chapter Parameter Boundary Sanitization
* **Cognitive Pillar:** Systemic Risk-Mitigation.
* **Execution:**
  1. Test out-of-bounds URL queries: `http://localhost:1870/dilemmas?chapter=99`.
  2. Test negative queries: `http://localhost:1870/dilemmas?chapter=-10`.
  3. Test string parameters: `http://localhost:1870/dilemmas?chapter=invalid`.
* **Expected Result:** Application boundary logic enforces `parsed >= 1 && parsed <= 18`, safely falling back to *"All Dilemmas"* without crashing.
* **Pass Criteria:** Zero unhandled errors, page loads normally.

#### Test Case TC-DIL-BP-003: Conversational NLP & Typo Normalization
* **Cognitive Pillar:** High-Context Empathy.
* **Execution:**
  1. Search with conversational natural language:
     > *"I am feeling burnt out and overwhelmed at work, which shloka guides my mind?"*
  2. Search with typos: `"consmic time and yugas"`, `"burn out and exaustion"`.
* **Expected Result:** Engine strips intent filler words (*"feeling"*, *"work"*, *"which"*, *"shloka"*, *"guides"*), maps typos (`exaustion` -> `exhaustion`), and surfaces relevant dilemmas.
* **Pass Criteria:** Burnout and exhaustion dilemmas surface accurately.

#### Test Case TC-DIL-BP-004: Rapid Category Switching Without Memory Leaks
* **Cognitive Pillar:** Lateral State Poise.
* **Execution:**
  1. Rapidly click between category pills: *All Dilemmas*, *Work & Ambition*, *Ethics & Duty*, *Mental Peace*, *Relationships*, *Life Purpose*.
  2. Click ten times in under two seconds.
* **Expected Result:** Smooth Framer Motion transitions with zero animation stutter or memory leaks.
* **Pass Criteria:** UI updates immediately, frame rate remains smooth.

---

### Environment 3: The Raining Path (Constrained / Constrained & Low-Resource State)
*Context: Unstable 3G mobile connections, battery saver mode, small 320px screens.*

#### Test Case TC-DIL-RP-001: Mobile Layout Integrity on 320px Viewports
* **Cognitive Pillar:** Socio-Centric Universal Accessibility.
* **Execution:**
  1. Set viewport width to 320px in DevTools.
  2. Verify that category pills, search bar, and dilemma cards stack cleanly into a single-column layout.
  3. Check Sanskrit text containers and transliteration blocks.
* **Expected Result:** Text wraps gracefully without overflowing horizontally or generating a horizontal scrollbar.
* **Pass Criteria:** Zero horizontal overflow on `body`.

#### Test Case TC-DIL-RP-002: Transliteration Text Clamping & Readability
* **Cognitive Pillar:** High-Context Dignity.
* **Execution:**
  1. Inspect multi-line Roman transliterations across cards.
  2. Verify that lines clamp uniformly with clean typography.
* **Expected Result:** Cards maintain consistent visual rhythm and legibility across all screen sizes.
* **Pass Criteria:** Symmetrical card height and balanced margins.

#### Test Case TC-DIL-RP-003: Graceful Animation Degradation Under CPU Throttling
* **Cognitive Pillar:** Adaptive Structural Resilience.
* **Execution:**
  1. Enable 6x CPU throttling in Chrome DevTools.
  2. Filter by category and expand chapter drawer.
* **Expected Result:** Card transitions degrade to lightweight CSS fades without freezing the main thread.
* **Pass Criteria:** Input responsiveness remains under 150ms.

#### Test Case TC-DIL-RP-004: In-Transit State Retention During Network Drops
* **Cognitive Pillar:** Systemic Memory Preservation.
* **Execution:**
  1. Filter by *Work & Ambition* and type a search term.
  2. Toggle browser offline mode for ten seconds, then reconnect.
* **Expected Result:** Active category and search query are retained in component memory without resetting.
* **Pass Criteria:** Zero state loss during network drops.

---

### Environment 4: The Worse Path (Catastrophic / Catastrophic Outage)
*Context: Backend API offline on port 8000, socket locks, CDN failure.*

#### Test Case TC-DIL-WP-001: 100% Client-Side Autonomy When Backend Is Down
* **Cognitive Pillar:** Systemic Risk-Mitigation (Self-Contained Client Architecture).
* **Execution:**
  1. Terminate the backend server.
  2. Reload `http://localhost:1870/dilemmas`.
  3. Search for dilemmas, filter by category, and explore all 18 chapters.
* **Expected Result:** All 49+ dilemmas, Sanskrit verses, and guidance purports are compiled directly in `gitaDilemmas.ts`, allowing complete offline operation.
* **Pass Criteria:** Zero crash screens, 100% client-side functionality.

#### Test Case TC-DIL-WP-002: Zero Scriptural Hallucination Gate
* **Cognitive Pillar:** Sacred Trust & Canonical Incorruptibility.
* **Execution:**
  1. Scan all 49+ entries in `gitaDilemmas.ts`.
  2. Verify that every single entry has authentic `verseSanskrit` and `verseTransliteration`.
  3. Confirm zero dummy text (*"Lorem ipsum"*, *"TODO"*).
* **Expected Result:** Every dilemma is anchored in verified Devanagari Sanskrit verses.
* **Pass Criteria:** Zero unverified or synthetic verses.

#### Test Case TC-DIL-WP-003: Live HTTP Server Endpoint Verification
* **Cognitive Pillar:** Operational Reliability.
* **Execution:**
  1. Perform live HTTP GET request to `http://localhost:1870/dilemmas`.
* **Expected Result:** Returns valid HTTP 200 OK with complete HTML payload.
* **Pass Criteria:** HTTP 200 status.

---

## 4. Execution Command Reference

One can run the automated Dilemmas QA test suite anytime using:

```powershell
# Run the automated dilemmas QA test suite
py qa/test_dilemmas_suite.py
```
