# Next.js App Router Routes (`/frontend/src/app/`)

This directory contains all page routes, layout wrappers, and API handlers under Next.js 15 App Router.

---

## Route Breakdown

```
frontend/src/app/
├── page.tsx                        # Public landing page (Hero, Features, Age Picker, CTA)
├── layout.tsx                      # Root layout wrapper (Fonts, NextAuth SessionProvider)
├── globals.css                     # Global CSS & Tailwind design tokens
├── providers.tsx                   # React Context Providers wrapper
├── app/
│   ├── page.tsx                    # Main conversational AI workspace (/app)
│   └── search/[id]/page.tsx        # Deep-linkable search session route (/app/search/[uuid])
├── signin/                         # Dedicated Google Sign-in page (/signin)
├── profile/                        # User profile & session history page (/profile)
└── api/auth/[...nextauth]/route.ts# NextAuth.js Google OAuth API handler
```

---

## Detailed Page Specifications

### 1. `src/app/page.tsx` — Landing Page
* **Route**: `/`
* **Description**: Public landing page introducing NityaGeeta (*"LexisNexis for Vedic Scripture"*). Displays hero animations, age picker selection widget, feature grid, and Google OAuth call-to-action button.

### 2. `src/app/app/page.tsx` & `src/app/app/search/[id]/page.tsx` — AI Workspace
* **Routes**: `/app` and `/app/search/[uuid]`
* **Description**: The primary conversational AI search workspace.
* **Key Operations**:
  * Dispatches async HTTP POST requests to `http://localhost:8000/api/v1/chat`.
  * Dynamically updates the browser URL bar using `router.replace('/app/search/[uuid]', { scroll: false })` without forcing a full page reload.
  * Renders candidate model tabs with Judge evaluation scores (`Score: 92/100`).
  * Displays external web link cards under the `2. Live Web Resources (4)` tab.

### 3. `src/app/api/auth/[...nextauth]/route.ts` — OAuth Handler
* **Route**: `/api/auth/*`
* **Description**: Handles Google OAuth 2.0 sign-in, token exchange, and JWT session cookie encryption using `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### 4. `src/app/profile/page.tsx` — User Profile Workspace
* **Route**: `/profile`
* **Description**: Allows authenticated users to view their session history, active Google profile details, and account preferences.
