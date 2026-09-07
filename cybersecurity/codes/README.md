# NityaGeeta Defensive Cybersecurity Code Vault

This directory provides self-contained reference implementations and architectural maps of all cybersecurity defenses implemented across NityaGeeta.

---

## Active Code Locations in Production

| Security Defense | Production File | Key Security Function / Logic |
| :--- | :--- | :--- |
| **1. Edge Rate Limiting & DoS Guard** | [`frontend/src/middleware.ts`](file:///c:/Users/Meeta/OneDrive%20-%20Algonquin%20College/Subjects/6/Entrepreneurship/NityaGeeta/frontend/src/middleware.ts) | In-memory sliding-window token bucket (20 req/min auth, 180 req/min PDF), 1MB payload ceiling. |
| **2. SSRF Protection in PDF Proxy** | [`frontend/src/app/api/pdf-proxy/route.ts`](file:///c:/Users/Meeta/OneDrive%20-%20Algonquin%20College/Subjects/6/Entrepreneurship/NityaGeeta/frontend/src/app/api/pdf-proxy/route.ts) | `validateSafePdfUrl()`: HTTPS only, exact hostname regex whitelist, blocks `169.254.169.254` and private IPs. |
| **3. HTTP Security Headers** | [`frontend/next.config.mjs`](file:///c:/Users/Meeta/OneDrive%20-%20Algonquin%20College/Subjects/6/Entrepreneurship/NityaGeeta/frontend/next.config.mjs) | CSP, 2-Year HSTS Preload (`max-age=63072000`), `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`. |
| **4. Input Bounds & Bcrypt CPU DoS Defense** | [`api/main.py`](file:///c:/Users/Meeta/OneDrive%20-%20Algonquin%20College/Subjects/6/Entrepreneurship/NityaGeeta/api/main.py) | Pydantic length bounds (`question <= 2000`, `password <= 128`), `is_valid_uuid()` format validator. |
| **5. AI Prompt Injection Defense** | [`api/services/prompt_builder.py`](file:///c:/Users/Meeta/OneDrive%20-%20Algonquin%20College/Subjects/6/Entrepreneurship/NityaGeeta/api/services/prompt_builder.py) | `sanitize_user_input()`: Strips DAN/override phrases, neutralizes XML escape tags, seals inputs in `<user_query>`. |
| **6. Automated Penetration Suite** | [`cybersecurity/codes/test_cybersecurity_defenses.py`](file:///c:/Users/Meeta/OneDrive%20-%20Algonquin%20College/Subjects/6/Entrepreneurship/NityaGeeta/cybersecurity/codes/test_cybersecurity_defenses.py) | 17-point automated penetration testing suite verifying all layers. |

---

## File Contents in this Directory
- `test_cybersecurity_defenses.py`: Complete 17-point automated penetration testing suite (SQLi, SSRF, Buffer Overflow, Prompt Injection, Headers, Rate Limiting, Crypto).
- `middleware_ratelimit.ts`: Reference implementation of Next.js edge rate limiting.
- `pdf_proxy_ssrf_guard.ts`: Reference implementation of the SSRF domain and IP filter.
- `prompt_injection_sanitizer.py`: Reference implementation of AI input sanitization and XML tagging.
- `input_bounds_schemas.py`: Reference implementation of bounded Pydantic models.
- `next_security_headers.mjs`: Reference implementation of OWASP HTTP security headers.
