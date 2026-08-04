# Public Web Assets (`/frontend/public/`)

The `public/` directory contains static assets served directly at the root URL path of the Next.js application (`http://localhost:1870/`).

---

## Directory Contents

```
frontend/public/
├── assets/         # Static web assets & icons
└── images/         # Public images, favicons, & brand graphics
```

### Usage:
Files inside `public/` can be referenced directly in code using root-relative URL paths:
```tsx
// Example image reference
<img src="/images/logo.png" alt="NityaGeeta Logo" />
```
