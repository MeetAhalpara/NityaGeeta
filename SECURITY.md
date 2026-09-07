# Security Policy

At **NityaGeeta**, maintaining the integrity, confidentiality, and resilience of our platform and user dialogues is paramount. We take all security vulnerabilities seriously and appreciate responsible disclosure.

---

## Supported Versions

Security patches and vulnerability updates are actively maintained on the following branches:

| Version / Branch | Status        |
| ---------------- | ------------- |
| `main`           | Supported     |
| Latest Release   | Supported     |
| Legacy Branches  | Not Supported |

---

## Reporting a Vulnerability

If you discover a security vulnerability or weakness within NityaGeeta, please **DO NOT open a public GitHub issue**. Instead, follow our responsible disclosure procedure:

1. **Private Email**: Send an email directly to the maintainers at **[security@nityageeta.org](mailto:security@nityageeta.org)** (or **[contact@nityageeta.org](mailto:contact@nityageeta.org)**).
2. **GitHub Security Advisory**: Alternatively, submit a private advisory through the [GitHub Advisory Tab](https://github.com/MeetAhalpara/NityaGeeta/security/advisories/new).

### What to Include in Your Report
Please provide as much detail as possible to help us triage and reproduce the issue:
* Type of vulnerability (e.g. SSRF, Prompt Injection, XSS, Authentication Bypass, Information Disclosure).
* Exact steps to reproduce, including payloads, affected endpoints, or request URLs.
* Potential impact and attack scenarios.
* Suggested fix or remediation if available.

### Response & Resolution Timeline
* **Initial Acknowledgment**: Within **24 hours** of receipt.
* **Triage & Assessment**: Within **48 hours**, confirming severity and scope.
* **Patch & Deployment**: High-severity vulnerabilities are patched within **7 business days**.
* **Public Attribution**: With your permission, we will acknowledge your contribution in our security hall of fame and release notes.

---

## Architectural Security Safeguards

NityaGeeta implements defense-in-depth measures across all layers:

1. **Server-Side Request Forgery (SSRF) Defense**:
   * Outbound proxy requests strictly block private RFC 1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopback (`127.0.0.0/8`, `::1`), and cloud metadata IP addresses (`169.254.169.254`).

2. **Prompt Injection & Script Sanitization**:
   * User inputs to the multi-agent AI council undergo strict payload sanitization, stripping unescaped HTML/JavaScript tags and preventing system-prompt leakage.

3. **Data Protection & Cryptography**:
   * End-to-end TLS 1.3 enforced for data in transit with HTTP Strict Transport Security (`HSTS`).
   * Password hashing utilizing `bcrypt` with unique cryptographic salting.
   * OAuth 2.0 JWT signature verification via asymmetric public keys.

4. **Rate Limiting & Abuse Prevention**:
   * IP and token-based rate limiting on all public API endpoints to prevent distributed denial-of-service (DDoS) and automated scraping.

---

Thank you for helping keep NityaGeeta safe, authentic, and secure for seekers worldwide.
