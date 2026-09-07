# QA Test Cases Matrix
## Platform: NityaGeeta — Sources, Dilemmas & Canonical Engine

---

### Module 1: Sources & Manuscripts (`/sources`)

| Test ID | Test Scenario | Execution Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-SRC-001** | Initial Default Collapsed State | Load `/sources` in fresh browser window. | All commentary and Veducation cards start collapsed. Book 1 does not expand by default. | **PASS** |
| **TC-SRC-002** | 4 Canonical Commentaries Presence | Inspect Primary Dataset Layer. | Displays Sadhaka-Sanjivani (95/100), Winthrop Sargeant SUNY (98/100), Adi Shankara (96/100), Gita Press Original (95/100). | **PASS** |
| **TC-SRC-003** | 18 Chapters Index per Commentary | Click each commentary card to expand. | All 4 canonical editions list all 18 chapters with exact page bounds. | **PASS** |
| **TC-SRC-004** | Veducation Beta Translation Notice | Expand `02 Vedic Dincharya` and `03 Brahmacharya`. | Chapters are omitted; displays amber `Beta Version • Translation in Progress` disclaimer. | **PASS** |
| **TC-SRC-005** | Veducation 5-in-1 Master Bundle | Expand `04 5 in 1 Pack`. | Displays 4 bundle cards: `1. B.O.S.S`, `2. Vedic Dincharya`, `3. Brahmacharya`, `+ 2 Free Surprise Gift Books`. No prices shown; only `FREE Bonus` tag on gifts. | **PASS** |
| **TC-SRC-006** | 5-in-1 Redundancy Elimination | Inspect expanded `04 5 in 1 Pack`. | `Comprehensive Edition Overview` and `Why Included` boxes are hidden to avoid duplicate text. | **PASS** |
| **TC-SRC-007** | Subtitle Text Cleaning | Check subtitles of all Veducation cards. | Text `(Veducation.world)` is completely removed from all card headers. | **PASS** |
| **TC-SRC-008** | In-App PDF Reader Modal | Click "Read in-app viewer" button on any edition with PDF. | Reader modal opens smoothly with zoom, page navigation, and background scroll lock. | **PASS** |
| **TC-SRC-009** | 18 Chapters Thematic Index Depth | Hover over any of the 18 chapter cards. | Card elevates with `hover:-translate-y-0.5`, subtle shadow, and terracotta highlight. | **PASS** |
| **TC-SRC-010** | Chapter Dilemma Deep-Link | Click on "Explore Chapter X Verses & Dilemmas". | Navigates to `/dilemmas?chapter=X` with Chapter X pre-selected. | **PASS** |

---

### Module 2: Life Dilemmas Engine (`/dilemmas`)

| Test ID | Test Scenario | Execution Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-DIL-001** | Real-Time Search Match Count Pill | Type any query (e.g. `karma`) in dilemmas search. | Displays rounded pill with `{count} matches \| ✕`. Symmetrical padding, no text overlap. | **PASS** |
| **TC-DIL-002** | Search Pill Clear Functionality | Click `✕` icon in dilemmas search pill. | Clears query instantly, resets view, and dismisses the pill. | **PASS** |
| **TC-DIL-003** | 18-Chapter Canonical Directory Table | Expand "18 Chapters Canonical Directory". | Table shows clean numbers `1`, `2`, `3` ... `18` under the `Chapter` column (not "Chapter 01"). | **PASS** |
| **TC-DIL-004** | Category Pill Filtering | Click category pills (Work, Ethics, Mental, etc.). | Dilemmas list updates instantly without page reload. | **PASS** |
| **TC-DIL-005** | URL Deep-Linking (`?chapter=X`) | Open `/dilemmas?chapter=2`. | Chapter 2 button is active, showing only Chapter 2 dilemmas. | **PASS** |
| **TC-DIL-006** | Total Canonical Count | Check total verse tally in table footer. | Confirms exact canonical count: 18 Chapters and 700 Verses. | **PASS** |

---

### Module 3: Universal Search & Discovery

| Test ID | Test Scenario | Execution Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-SRH-001** | Multi-Token & Sanskrit Search | Type Sanskrit terms like `Sthitaprajna` or `Karma`. | Accurately returns matched commentaries and dilemmas. | **PASS** |
| **TC-SRH-002** | Search Empty State Trigger | Type non-existent query (e.g. `xyzunmatched`). | Displays "No matching manuscripts found" with polite inline suggestions and chips. | **PASS** |
| **TC-SRH-003** | Interactive Suggestion Clicks | Click inline suggestion `'karma'` or `'Chapter 2'`. | Immediately fills search input, clears empty state, and renders results. | **PASS** |
| **TC-SRH-004** | Suggested Keyword Chips | Click any keyword chip (e.g. `Cosmic Time`). | Search query updates and filters relevant sources. | **PASS** |

---

### Module 4: UI, Visual Aesthetics & Accessibility

| Test ID | Test Scenario | Execution Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-UI-001** | Dark Mode Theme Contrast | Toggle to dark mode on `/sources` and `/dilemmas`. | Background renders `#1C1917` warm stone charcoal; terracotta borders have AAA contrast. | **PASS** |
| **TC-UI-002** | Typography & Heading Hierarchy | Inspect page headings. | Single `<h1>` per page with editorial serif display and clear section hierarchy. | **PASS** |
| **TC-UI-003** | Symmetrical Pill Radii | Inspect search pills and category filters. | Symmetrical `rounded-full` or `rounded-xl` borders without visual distortions. | **PASS** |
| **TC-UI-004** | Mobile Viewport Responsiveness | Resize browser down to 360px width. | All cards stack cleanly into single-column layout without horizontal scroll overflow. | **PASS** |

---

### Module 5: Scriptural Integrity & Epistemology

| Test ID | Test Scenario | Execution Steps | Expected Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-EPI-001** | Living Tradition Epistemology | Inspect Chapter 10 of B.O.S.S and FAQ citations. | Explicitly affirms living tradition (*Itihasa*) with real historical roots; denies "pure fiction/mythology". | **PASS** |
| **TC-EPI-002** | Non-Sectarian Commentary Synthesis | Check citations across Gita commentaries. | Impartially cites Gita Press, SUNY Press, and Shankaracharya without sectarian bias. | **PASS** |
