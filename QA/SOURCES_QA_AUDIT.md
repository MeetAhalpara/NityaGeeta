# NityaGeeta Sources & Manuscripts Comprehensive QA Audit

**Target URL:** `http://localhost:1870/sources`  
**System Under Test:** Manuscript Ground Truth, Interlinear Concordance & Digital Library  
**Evaluation Philosophy:** Multi-Scenario Resilience Framework & Multi-Scenario Resilience  

---

## 1. Executive Overview & Cognitive Foundation

Quality assurance for sacred scriptural intelligence requires more than conventional binary unit testing. Because NityaGeeta bridges millennia-old Sanskrit wisdom with modern neural architectures, evaluation must reflect a holistic cognitive framework.

This audit utilizes the **Multi-Scenario Resilience Framework**, a four-dimensional cognitive model combining synthesis, adaptability, situational context, and systemic resilience. Through this lens, every component of `http://localhost:1870/sources` is scrutinized across four distinct operational environments: **Happy**, **Bad**, **Raining**, and **Worse**.

```
                           MULTI-SCENARIO RESILIENCE FRAMEWORK
                                      │
       ┌──────────────────┬───────────┴───────────┬──────────────────┐
       ▼                  ▼                       ▼                  ▼
1. SYNTHETIC       2. LATERAL             3. HIGH-CONTEXT    4. SYSTEMIC RISK-
   (BOTH-AND)         (ADAPTIVE)               THINKING           MITIGATION
       │                  │                       │                  │
Ancient Scripture  Creative Workarounds    Seeker Empathy     Redundant Datasets
  meets Modern AI    & Resilient Cache       & Nuanced Tone     & Multi-Tier Failover
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

## 2. Core Pillars of the Resilience Testing Framework

### Pillar 1: Synthetic (Both-And) Thinking
Conventional testing often relies on mutually exclusive binaries: either a system is an empirical scientific tool or a reflective artifact. Contextual philosophy synthesizes both paradigms without internal contradiction. A professional can write algorithmic retrieval code by day and engage in mindful evening reflection without cognitive dissonance. 

* **Application to `/sources`:** The platform refuses to choose between rigorous academic philology (such as Winthrop Sargeant's SUNY Press morphological grammar) and practical spiritual application (such as Swami Ramsukhdas's commentary). Both coexist harmoniously as complementary layers of truth.

### Pillar 2: Lateral (Adaptive) Thinking
Lateral thinking values inventive improvisation and immediate solutions when standard pathways encounter roadblocks. Rather than terminating in a rigid failure state when an external dependency falters, the system implements creative, low-cost detours.

* **Application to `/sources`:** If a high-resolution cloud storage PDF encounters a latency spike or CORS boundary, the interface does not present a blank dead-end. Instead, it activates client-side fallbacks, alternative reading links, cached chapter summaries, and offline-accessible Sanskrit shlokas.

### Pillar 3: High-Context Thinking
Decisions within high-context systems are never isolated from the human context of the interaction. The tone, authority, and presentation must adapt to who is asking, what stage of inquiry one is in, and the cultural reverence demanded by sacred texts.

* **Application to `/sources`:** The presentation of sources respects the diverse seekers visiting the portal. A scholar inspecting root grammatical cases (`Dhatu`) receives precise morphological notations, while a householder seeking emotional stability receives clear, compassionate guidance without intimidating academic elitism.

### Pillar 4: Systemic Risk-Mitigation Thinking
Formed through navigation of competitive and unpredictable environments, systemic risk-mitigation thinking constantly computes survival margins. It designs multiple fallback layers (Plan B and Plan C) to protect the user from misinformation, cognitive fatigue, and unexpected system failure.

* **Application to `/sources`:** To protect against AI hallucinations, NityaGeeta enforces a multi-tier ground truth hierarchy. If a modern generative model drifts, the system anchors back to immutable Devanagari Sanskrit manuscripts and peer-verified commentary datasets.

---

## 3. Cognitive Comparative Matrix

| Thinking Dimension | Multi-Scenario Approach | Conventional Segmented Approach | Application in NityaGeeta `/sources` |
| :--- | :--- | :--- | :--- |
| **Holistic vs. Analytical** | **Connective:** Evaluates the complete ecosystem, relationships between commentators, and cultural context. | **Segmented:** Isolates code blocks or individual texts into separate silos. | Commentaries are cross-referenced so one sees how Advaita, Vishishtadvaita, and practical Karma Yoga interlock. |
| **Contextual vs. Universal** | **Relative:** Respects timing, the seeker's background, and situational appropriateness. | **Absolute:** Enforces identical rigid presentations across every user profile. | Text presentations balance grammatical dissection with accessible everyday application. |
| **Adaptive (Adaptive) vs. Structured** | **Flexible:** Thrives on intelligent fallbacks, resilient micro-caching, and graceful degradation. | **Linear:** Fails immediately when strict network or infrastructure preconditions break. | If cloud storage times out, the system offers direct archive mirrors and embedded reading summaries. |
| **Co-Existent vs. Binary** | **Inclusive:** Holds modern data science and sacred ancient tradition simultaneously. | **Exclusive:** Demands that modern technology replace or disprove traditional heritage. | Neural vector embeddings directly ground themselves in centuries-old Gita Press archives. |
| **Socio-Centric vs. Egocentric** | **Collective:** Focuses on community trust, intergenerational knowledge transfer, and collective peace. | **Individualistic:** Focuses strictly on individual transactional consumption. | Sources emphasize family duty (`Swadharma`), public welfare (`Lokasangraha`), and ethical balance. |

---

## 4. Four-State Operational Testing Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       4-STATE TESTING SCENARIOS                             │
├──────────────────────┬──────────────────────┬───────────────────────────────┤
│ State                │ Environmental Context│ Focus Area                    │
├──────────────────────┼──────────────────────┼───────────────────────────────┤
│ 1. HAPPY (Optimal)    │ Optimal conditions   │ Seamless rendering & fidelity │
│ 2. BAD (Erroneous)       │ Erroneous inputs     │ Graceful input sanitation     │
│ 3. RAINING (Constrained)  │ Flaky & low-bandwidth│ Adaptive fallbacks & mirrors  │
│ 4. WORSE (Catastrophic Outage)   │ Complete server drop │ Zero-hallucination resilience │
└──────────────────────┴──────────────────────┴───────────────────────────────┘
```

---

### Environment 1: The Happy Path (Optimal / Optimal State)
*Context: High-speed fiber broadband (100+ Mbps), modern browser, active backend API on port 8000, WebGL enabled.*

#### Test Case TC-HP-001: Initial Page Atmosphere & Brand Voice Integrity
* **Cognitive Pillar:** High-Context Thinking & Aesthetic Poise.
* **Execution:**
  1. Open `http://localhost:1870/sources` in a fresh browser session.
  2. Verify that the hero heading reads *"Verifiable Sources & Manuscripts"*.
  3. Verify that the hero description states that NityaGeeta is built on complete transparency and allows one to explore authentic Gita Press commentaries, SUNY Press word-for-word grammatical breakdowns, and classical texts.
  4. Confirm that the sentence structure is continuous, complete, and contains no awkward em-dash breaks.
  5. Verify that the copy strictly refrains from first-person plurals (`we`, `our`) and uses the objective third-person pronoun (`one`).
* **Expected Result:** Page renders with calm editorial elegance, warm stone tones, and dignified third-person perspective.
* **Pass Criteria:** 100% typography harmony, zero broken words, zero instances of first-person pronouns.

#### Test Case TC-HP-002: Default Collapsed State of Primary Canonical Editions
* **Cognitive Pillar:** Holistic Cognitive Economy.
* **Execution:**
  1. Observe the primary commentary section upon page load.
  2. Inspect the first four canonical editions:
     * *Srimad Bhagavad Gita (Sadhaka-Sanjivani)* by Swami Ramsukhdas
     * *The Bhagavad Gita: Interlinear Translation & Grammar* by Winthrop Sargeant
     * *Srimad Bhagavad Gita Shankara Bhashya* by Adi Shankaracharya
     * *Srimad Bhagavad Gita (Gita Press Original)* Centenary Heritage Edition
  3. Verify that all four editions start collapsed to prevent cognitive overload.
  4. Click on any commentary card to expand it and verify smooth accordion motion.
* **Expected Result:** Cards begin collapsed, allowing one to scan the library without clutter, expanding smoothly upon selection.
* **Pass Criteria:** Zero layout jumps, smooth height animation, clear visual hierarchy.

#### Test Case TC-HP-003: In-App PDF Manuscript Reader Integration
* **Cognitive Pillar:** Synthetic (Both-And) Digital Architecture.
* **Execution:**
  1. Locate *Srimad Bhagavad Gita (Sadhaka-Sanjivani)*.
  2. Click the *"Read in-app viewer"* action button.
  3. Verify that the embedded PDF modal launches smoothly over the interface.
  4. Confirm that background body scrolling is locked (`overflow: hidden`).
  5. Test zoom-in, zoom-out, and page navigation controls.
  6. Click the close button or press the Escape key to exit.
* **Expected Result:** The authentic manuscript displays cleanly within the application without forcing a third-party redirect.
* **Pass Criteria:** Modal opens within 800ms, background scroll is locked, reader dismisses cleanly.

#### Test Case TC-HP-004: Peer-Verified Audit Scoring Modal Inspection
* **Cognitive Pillar:** Systemic Risk-Mitigation & Total Transparency.
* **Execution:**
  1. Click the audit badge or `(i)` button on *Sadhaka-Sanjivani*.
  2. Verify the modal headline: *Srimad Bhagavad Gita (Sadhaka-Sanjivani)* with score `100 / 100`.
  3. Verify that the text in *Why Does This Edition Receive This Exact Score?* explains that the edition provides an exhaustive, verse-by-verse grammatical and practical spiritual analysis directly from the Gita Press Gorakhpur archive.
  4. Verify that the text strictly omits any mention of page count numbers.
  5. Check *Context Rigor (30% Weight)*: confirms complete word-by-word practical synthesis addressing everyday human challenges.
  6. Click external validation links (Economic Times, IIT Kanpur Sacred Sanskrit SuperSite).
* **Expected Result:** Modal provides comprehensive academic justification and verified institutional backing.
* **Pass Criteria:** Zero page-count references, valid external links opening in separate tabs with `rel="noopener noreferrer"`.

#### Test Case TC-HP-005: 18-Chapter Thematic Exploration and Deep-Link Navigation
* **Cognitive Pillar:** Holistic Systematic Indexing.
* **Execution:**
  1. Scroll down to the *18 Chapters Canonical Directory* table.
  2. Verify all 18 chapters with Sanskrit titles, Devanagari script, themes, and exact verse totals.
  3. Click on Chapter 2 (*Sankhya Yoga*).
  4. Click the deep-link button *"Explore Chapter 2 Verses & Dilemmas"*.
  5. Confirm redirection to `http://localhost:1870/dilemmas?chapter=2`.
* **Expected Result:** Seamless transition to the dilemmas page with Chapter 2 pre-filtered.
* **Pass Criteria:** URL query parameter preserved, correct chapter pre-selected, zero state desynchronization.

---

### Environment 2: The Bad Path (Erroneous / Erroneous & Extreme Inputs)
*Context: Seekers entering mangled Sanskrit, non-existent chapters, extreme payloads, or unsupported filters.*

#### Test Case TC-BP-001: Malformed Search Queries & Random Character Strings
* **Cognitive Pillar:** Lateral (Adaptive) Error Handling & Graceful Recovery.
* **Execution:**
  1. In the global sources search bar, enter random non-text characters: `~!@#$%^&*()_+|}{":?><`.
  2. Enter a 500-character nonsensical payload.
  3. Observe UI reaction.
* **Expected Result:** The search bar handles special characters safely without regex errors or application crashes. An informative empty state renders stating that no matching manuscripts were found.
* **Pass Criteria:** Zero JavaScript console errors, responsive empty state with immediate clear option.

#### Test Case TC-BP-002: Out-of-Range Chapter Number Query Injection
* **Cognitive Pillar:** Systemic Risk-Mitigation & Parameter Validation.
* **Execution:**
  1. Manually append invalid query parameters to the URL: `http://localhost:1870/sources?chapter=99`.
  2. Test with negative parameters: `http://localhost:1870/sources?chapter=-5`.
  3. Test with string parameters: `http://localhost:1870/sources?chapter=unknown`.
* **Expected Result:** The application sanitizes parameters, ignores values outside the canonical range (1 to 18), and safely defaults to *"All Chapters"*.
* **Pass Criteria:** Application never crashes, never shows an unhandled Next.js error overlay.

#### Test Case TC-BP-003: Mangled Sanskrit Transliteration & Phonetic Resiliency
* **Cognitive Pillar:** High-Context Linguistic Understanding.
* **Execution:**
  1. Search using imprecise phonetic transliterations:
     * Type `sthitaprjna` (missing 'a')
     * Type `bhagvat geeta` (colloquial spelling)
     * Type `arjun vishad` (Hindi variant)
  2. Check whether relevant commentaries and chapters are surfaced.
* **Expected Result:** Multi-token keyword mapping captures common transliteration variants and surfaces the corresponding texts.
* **Pass Criteria:** Key chapters surface despite minor spelling variations.

#### Test Case TC-BP-004: Rapid Multi-Tab Switching & State Concurrency
* **Cognitive Pillar:** Lateral State Poise.
* **Execution:**
  1. Rapidly click between filter tabs: *All Sources*, *Gita Commentaries*, *Veducation Books*, *18 Chapters*, *Vetting Criteria*.
  2. Click ten times in under two seconds.
* **Expected Result:** The React state stabilizes cleanly without animation flickering, duplicate elements, or DOM memory leaks.
* **Pass Criteria:** Frame rate remains above 55 FPS, correct tab active at the conclusion of clicks.

---

### Environment 3: The Raining Path (Constrained / Constrained & Low-Resource State)
*Context: Monsoon weather conditions, unstable 3G connection (500 Kbps, 2500ms latency, 35% packet drops), mobile browser in battery saver mode, low RAM.*

#### Test Case TC-RP-001: PDF Storage Timeout & Lateral Fallback Resilience
* **Cognitive Pillar:** Lateral (Adaptive) Adaptive Workaround.
* **Execution:**
  1. Simulate network throttling (Slow 3G) in browser developer tools.
  2. Attempt to open the in-app PDF reader for *The Bhagavad Gita: Interlinear Translation & Grammar*.
  3. Block or delay Google Cloud Storage response.
* **Expected Result:**
  * The PDF reader displays a clean loading state with clear progress indications.
  * If the cloud storage stream exceeds the timeout threshold, a helpful lateral fallback displays providing:
    * A direct link to access the verified archive mirror.
    * An option to download for offline reading.
    * In-page text summaries and chapter outlines so the seeker is not blocked.
* **Pass Criteria:** No indefinite blank screen, clear fallback action presented within 5 seconds.

#### Test Case TC-RP-002: Responsive Integrity on Low-End Mobile Devices (320px Viewport)
* **Cognitive Pillar:** Socio-Centric Accessibility Across All Economic Strata.
* **Execution:**
  1. Set viewport dimensions to 320px width (older entry-level smartphone).
  2. Inspect the navigation bar, search input, filter pills, and commentary cards.
  3. Open the audit modal on a 320px screen.
* **Expected Result:** All components adapt smoothly to a single-column layout. Buttons maintain touch targets of at least 44x44px. Text wraps cleanly without horizontal scrollbars.
* **Pass Criteria:** Horizontal scrollbar does not appear on `body`, modal content remains fully accessible.

#### Test Case TC-RP-003: Extreme CPU Throttling & Animation Degradation
* **Cognitive Pillar:** Adaptive Structural Resilience.
* **Execution:**
  1. Enable 6x CPU slowdown in Chrome DevTools.
  2. Expand and collapse accordion cards across all eight library items.
  3. Scroll through the page while animations trigger.
* **Expected Result:** Framer Motion animations degrade gracefully without thread locking or unresponsive touch handlers.
* **Pass Criteria:** Input latency remains under 150ms despite 6x CPU constraint.

#### Test Case TC-RP-004: In-Transit Data Interruption Mid-Session
* **Cognitive Pillar:** Systemic Memory Preservation.
* **Execution:**
  1. Type a query into the search bar.
  2. Expand *Adi Shankaracharya Bhashya*.
  3. Toggle browser offline mode for ten seconds, then restore connectivity.
* **Expected Result:** Client-side state retains the expanded card and search query without resetting to the top of the page.
* **Pass Criteria:** User context is completely preserved through intermittent network drops.

---

### Environment 4: The Worse Path (Catastrophic / Catastrophic & Hostile State)
*Context: Backend API offline (Port 8000 socket error), CORS failure, local storage disabled, hostile network environment.*

#### Test Case TC-WP-001: Complete Backend Disconnection Resilience
* **Cognitive Pillar:** Systemic Risk-Mitigation (Self-Contained Client Resilience).
* **Execution:**
  1. Stop the FastAPI backend service (`uvicorn api.main:app`).
  2. Reload `http://localhost:1870/sources`.
  3. Navigate between library tabs and search for verses.
* **Expected Result:**
  * The `/sources` page remains fully functional because canonical library metadata, chapter indices, and scoring rubrics are compiled into the client architecture.
  * If one clicks to initiate an AI dialogue, the application displays a serene notification explaining that the scriptural knowledge engine is reconnecting.
* **Pass Criteria:** Zero crash screens, library navigation operates 100% offline.

#### Test Case TC-WP-002: Scriptural Incorruptibility & Anti-Hallucination Gate
* **Cognitive Pillar:** Sacred Trust & Canonical Incorruptibility.
* **Execution:**
  1. Audit the underlying data files (`gitaDilemmas.ts`, `sources/page.tsx`).
  2. Verify that every Sanskrit verse matches traditional Devanagari orthography.
  3. Verify that under zero-network conditions, no fallback algorithm fabricates synthetic verses or inaccurate citations.
* **Expected Result:** When traditional data is unavailable, the system transparently indicates that verification is required rather than synthesizing speculative content.
* **Pass Criteria:** Zero synthetic or unverified Sanskrit verses surfaced anywhere on the platform.

#### Test Case TC-WP-003: Third-Party Storage Outage & Direct Purchase Fallback
* **Cognitive Pillar:** Lateral Commercial & Scholarly Redundancy.
* **Execution:**
  1. Simulate an outage of third-party PDF hosting repositories.
  2. Verify that every commentary card provides direct verified links to authentic institutional publishers:
     * Gita Press Gorakhpur official distribution
     * SUNY Press academic catalog
     * Veducation foundation repository
* **Expected Result:** One is provided with direct, authentic avenues to obtain physical or digital editions directly from institutional custodians.
* **Pass Criteria:** Every source card provides at least two distinct operational resource pathways.

#### Test Case TC-WP-004: Local Storage Failure / Incognito Security Sandbox
* **Cognitive Pillar:** High-Context Privacy Respect.
* **Execution:**
  1. Open the browser in strict private incognito mode with third-party storage blocked.
  2. Block `window.localStorage` and `window.sessionStorage`.
  3. Navigate `/sources`, toggle themes, expand cards, and open modals.
* **Expected Result:** The application uses in-memory fallbacks without throwing security exceptions (`DOMException: Access is denied`).
* **Pass Criteria:** Zero unhandled storage exceptions in browser console.

---

## 5. Verification Checklist & Compliance Log

| Verification Item | Multi-Scenario Resilience Principle | Target Standard | Status |
| :--- | :--- | :--- | :--- |
| **No Dangling Dashes (`—` / `--`)** | High-Context Elegance | Complete, unbroken sentences without split line breaks | **VERIFIED** |
| **Strict Brand Voice** | High-Context Reverence | Never uses *"we"* or *"our"*; consistently uses *"NityaGeeta"* | **VERIFIED** |
| **Objective 3rd Person** | High-Context Poise | Uses *"one"* instead of *"you/user"* across all descriptions | **VERIFIED** |
| **Zero Page-Count Mentions** | Systemic Risk-Mitigation | Completely purged all occurrences of page count numbers | **VERIFIED** |
| **Apple-Grade Polish** | Synthetic Both-And | Clean, dignified, uncluttered layout with harmonious contrast | **VERIFIED** |
| **Beta Notices on Hindi Works** | Truthfulness (`Satya`) | Amber notices on *Vedic Dincharya* and *Brahmacharya* | **VERIFIED** |
| **5-in-1 Master Bundle** | Lateral Adaptive Clarity | Displays *1. B.O.S.S*, *2. Routine*, *3. Mind*, *+ 2 Gifts* | **VERIFIED** |
| **Interactive PDF Viewer** | Synthetic Architecture | Built-in viewer with zoom, scroll lock, and fallback links | **VERIFIED** |
| **Deep-Linking to Dilemmas** | Holistic Interconnection | 18 Chapter buttons link directly to `/dilemmas?chapter=X` | **VERIFIED** |

---

## 6. Execution Command Reference

One can execute the automated test suite to verify structural and epistemological integrity at any time using the following terminal commands:

```powershell
# Run the automated QA test suite across sources, dilemmas, and corpus
py qa/automated_tests.py

# Verify TypeScript type safety and compilation
cd frontend
npx tsc --noEmit
```
