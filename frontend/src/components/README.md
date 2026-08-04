# React UI Components & Motion Engine (`/frontend/src/components/`)

This directory contains all reusable React components, custom UI widgets, and Framer Motion animation wrappers.

---

## Subdirectory Structure

```
frontend/src/components/
├── Navbar.tsx                      # Top navigation bar with theme toggler & session menu
├── GoogleAuthModal.tsx             # Modal popover for 1-click Google Sign-in
├── SmoothCursor.tsx                # Custom spring-animated cursor tracker
├── ui/                             # Custom UI widgets & interactive components
└── motion/                         # GPU-accelerated Framer Motion animation wrappers
```

---

## Detailed Component Specifications

### 1. `ui/radial-context-menu.tsx` — SVG Radial Context Menu
* **Description**: Custom spring-animated circular context menu triggered on user right-click or long-press.
* **Supported Actions**:
  * **Copy**: Copies highlighted text or latest AI answer to clipboard.
  * **Paste**: Focuses and inserts clipboard content into prompt bar.
  * **Refresh Chat**: Retries the query in-place without creating duplicate user bubbles.
  * **New Dialogue**: Clears active workspace and opens a fresh search session.
  * **Theme Toggle**: Toggles between Light Parchment and Dark Saffron modes.
  * **Home**: Navigates to root landing page.

### 2. `ui/avatar-group.tsx` — Citation Drawer & Reader Modal
* **Description**: Renders the Perplexity-style `SourcesBubble` drawer button and the interactive Scripture Reader Modal.
* **Key Features**:
  * Displays page number badges (`Page 14`, `Page 88`) for BOSS OCR scripture cards.
  * `trimToCompleteSentence`: Ensures text previews end on full sentences (`. ! ?`).
  * `cleanScriptureText`: Unwraps artificial PDF single line breaks into continuous prose lines.
  * Scripture Reader Modal displays complete untruncated book pages with external translation links.

### 3. `ui/formatted-chat-message.tsx` — Message Renderer
* **Description**: Uses `react-markdown` 10.1 and custom DOM overrides to parse AI answers. Formats Devanagari Sanskrit Shloka callout cards and prevents React HTML hydration errors.

### 4. `ui/gita-term-hover-card.tsx` — Sanskrit Glossary Tooltips
* **Description**: Automatically matches Sanskrit terms (*Karma*, *Dharma*, *Atman*) and wraps them in hoverable popover cards.

### 5. `Navbar.tsx` — Navigation Bar
* **Description**: Renders top navigation bar with brand logo, quick links, theme toggler, and user profile avatar / Google Sign-in button.
