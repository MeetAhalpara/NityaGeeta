# Frontend Web Application (`/frontend`)

The `frontend/` directory contains the client web application for NityaGeeta, built with **Next.js 15 (App Router)**, **React 19**, **TypeScript 5.7**, **Tailwind CSS 3.4**, and **Framer Motion**. Running on **Port 1870**, it handles user authentication via Google OAuth 2.0, interactive chat interfaces, dynamic routing, and rich animations.

---

## Directory Structure & Component Breakdown

```
frontend/
├── src/
│   ├── app/                                    # Next.js App Router pages
│   │   ├── page.tsx                            # Landing page & hero presentation
│   │   ├── app/
│   │   │   ├── page.tsx                        # Main conversational AI chat interface
│   │   │   └── search/[id]/page.tsx            # Deep-linkable search session route
│   │   ├── signin/                             # NextAuth Google Sign-in page
│   │   ├── profile/                            # User profile & session management page
│   │   ├── api/auth/[...nextauth]/route.ts     # NextAuth.js Google OAuth API handler
│   │   └── globals.css                         # Global CSS & Tailwind design tokens
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── radial-context-menu.tsx         # Custom SVG circular context menu
│   │   │   ├── avatar-group.tsx                # Citation drawer & Scripture Reader Modal
│   │   │   ├── formatted-chat-message.tsx      # Markdown & Devanagari Sanskrit card parser
│   │   │   ├── gita-term-hover-card.tsx        # Popover tooltips for Sanskrit terms
│   │   │   ├── animated-theme-toggler.tsx      # GPU-accelerated theme toggler
│   │   │   ├── age-picker.tsx                  # Interactive age selection widget
│   │   │   └── google-button.tsx               # 1-Click Google OAuth login button
│   │   │
│   │   └── motion/                             # Framer Motion GPU animation wrappers
│   │
│   └── lib/
│       └── auth.ts                             # NextAuth session configuration
├── package.json
└── tailwind.config.ts
```

---

## Detailed File Specifications

### 1. `src/app/page.tsx` — Public Landing Page
* **Role**: The main landing page presenting NityaGeeta's unique value proposition (*"LexisNexis for Vedic Scripture"*).
* **Key Features**: Hero text animations, age picker selection widget, interactive features showcase grid, and Google Sign-in CTA.

### 2. `src/app/app/page.tsx` — Conversational AI Workspace
* **Role**: The primary application workspace for querying the 5-model AI ensemble and RAG pipeline.
* **Key Features**:
  * **API Dispatch**: Dispatches HTTP POST requests to `http://localhost:8000/api/v1/chat`.
  * **Dynamic URL Routing**: Uses `router.replace('/app/search/[uuid]', { scroll: false })` to update the browser URL bar instantly without full page reloads.
  * **Multi-Model Candidate Tabs**: Renders tabs for all 5 AI model perspectives along with their automated Judge evaluation scores (`Score: 92/100`).
  * **Live Web Resources Tab**: Dedicated tab displaying external live web resource links (`cit.type === "web" || cit.url`) matching the badge count.

### 3. `src/components/ui/radial-context-menu.tsx` — SVG Radial Context Menu
* **Role**: Custom spring-animated circular context menu triggered on user right-click or long-press.
* **Supported Actions**:
  * **Copy**: Copies highlighted text or latest AI response to clipboard.
  * **Paste**: Automatically focuses and inserts clipboard text into the prompt bar.
  * **Refresh Chat**: Retries the latest query in-place without creating duplicate user message bubbles.
  * **New Dialogue**: Clears current workspace state and opens a fresh search session.
  * **Theme Toggle**: Toggles between Light Parchment and Dark Saffron modes.
  * **Home**: Navigates back to the root landing page.

### 4. `src/components/ui/avatar-group.tsx` — Citation Drawer & Reader Modal
* **Role**: Renders the Perplexity-style compact sources button (`SourcesBubble`) and the interactive Scripture Reader Modal.
* **Key Features**:
  * Displays page number badges (`Page 14`, `Page 88`) for BOSS OCR scripture cards.
  * `trimToCompleteSentence`: Trims text previews cleanly at sentence boundaries (`. ! ?`).
  * `cleanScriptureText`: Unwraps artificial PDF single line breaks while preserving double line breaks (`\n\n`) as paragraph separators.
  * Reader Modal provides complete, untruncated book pages with external Sanskrit/Hindi translation reference links.

### 5. `src/components/ui/formatted-chat-message.tsx` — Message Parser
* **Role**: Uses `react-markdown` 10.1 and custom DOM overrides to parse AI answers into structured HTML.
* **Key Features**: Detects Sanskrit Devanagari Unicode (`[\u0900-\u097F]`), formats Devanagari Shloka callout cards, and prevents React HTML hydration errors.

### 6. `src/components/ui/gita-term-hover-card.tsx` — Sanskrit Glossary Tooltips
* **Role**: Automatically matches key Sanskrit terms (*Karma*, *Dharma*, *Atman*, *Guna*) and wraps them in hoverable popover cards.

---

## Authentication & Persistence Strategy

1. **Google OAuth 2.0 (NextAuth.js)**:
   * Google handles user authentication via `src/app/api/auth/[...nextauth]/route.ts`.
   * Passes user profile metadata (`name`, `email`, `image` avatar) into the client session JWT.

2. **Dual-Layer Persistence**:
   * **Client Local Storage**: Saves active chats under `nityageeta_chat_history` for **0ms offline session switching**.
   * **Background PostgreSQL Sync**: Fires a non-blocking background POST request to `http://localhost:8000/api/v1/sessions/save` to persist session logs to **Neon Cloud PostgreSQL**.

---

## Running & Building the Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Start Next.js development server (Port 1870)
npm run dev

# Run TypeScript type checking
npx tsc --noEmit

# Build production bundle
npm run build
```
