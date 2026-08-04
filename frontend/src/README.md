# Frontend Source Codebase (`/frontend/src/`)

The `src/` directory is the main application source tree for NityaGeeta's Next.js 15 / React 19 frontend. It contains all App Router routes, UI components, motion animation wrappers, authentication configurations, and global styles.

---

## Directory Architecture

```
frontend/src/
├── app/            # Next.js 15 App Router pages, layout, and OAuth API routes
├── components/     # Reusable React components (UI widgets, motion wrappers, navbar)
└── lib/            # NextAuth configuration and utility functions
```

1. [**`src/app/`**](file:///c:/Users/Meeta/OneDrive%20-%20Algonquin%20College/Subjects/6/Entrepreneurship/NityaGeeta/frontend/src/app/README.md):
   * Contains the root landing page (`page.tsx`), main chat workspace (`app/page.tsx`), deep-link search route (`app/search/[id]/page.tsx`), NextAuth Google OAuth handler (`api/auth/[...nextauth]/route.ts`), and global CSS (`globals.css`).

2. [**`src/components/`**](file:///c:/Users/Meeta/OneDrive%20-%20Algonquin%20College/Subjects/6/Entrepreneurship/NityaGeeta/frontend/src/components/README.md):
   * Contains reusable UI components (`ui/`), GPU-accelerated animation wrappers (`motion/`), main navigation bar (`Navbar.tsx`), smooth spring cursor tracker (`SmoothCursor.tsx`), and auth modal (`GoogleAuthModal.tsx`).

3. **`src/lib/`**:
   * Contains `auth.ts` (NextAuth.js session configuration & JWT token callbacks) and utility helpers.
