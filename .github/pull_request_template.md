## Description
Provide a concise summary of the changes introduced in this pull request and the rationale behind them.

Fixes #(issue)

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation / Governance update
- [ ] Infrastructure / CI / Docker update

## Verification & Quality Pillars
Please confirm which pillars were run in accordance with repository guidelines:

- [ ] **Pillar 1: QA & QT (Automated Testing)** — `.venv\Scripts\python.exe -m unittest tests/test_qa_suite.py` passed (Frontend edits).
- [ ] **Pillar 2: UI Checking** — Framer Motion animations, dark/light theme tokens (`#FAF7F2`, `#1E1B18`, `#C25E38`), responsive layouts, and accessibility IDs verified (Frontend edits).
- [ ] **Pillar 3: CyberSecurity Check** — Input sanitization, rate limiting, defensive bounds, secret leakage prevention, and dependency integrity confirmed (**All edits**).
- [ ] **Pillar 4: FrontEnd Analyser** — `npm run build` completed with 0 errors across all routes (Frontend edits).

## Screenshots / Verification Output (if applicable)
Add screenshots or test suite terminal outputs here.

## Checklist
- [ ] My code adheres to the project's coding style guidelines.
- [ ] I have performed a self-review of my own code.
- [ ] I have commented my code, particularly in hard-to-understand areas.
- [ ] No secrets, credentials, or private notes have been committed.
