# NityaGeeta Comprehensive Cybersecurity Directory

**Enterprise**: NityaGeeta (Authentic Srimad Bhagavad Gita AI Platform)  
**Security Framework**: Enterprise Threat Modeling, Defense in Depth, VAPT & OWASP Top 10 Standards  
**Defensive Scope**: Risk Management, Network Security, SSRF/Buffer Protection, Cryptography, Access Controls, Hardening & Incident Response  
**Security Status**: All 17 Automated Security Penetration Tests Passing (100% Pass Rate)

---

## Directory Organization

This directory is organized into three specialized pillars:

```
cybersecurity/
├── details/                              # Threat matrices, security architecture, and case studies
│   ├── security_threat_matrix.md         # Deep dive: What securities were added, which can be threats where, and how they are fortified
│   ├── security_architecture_synthesis.md # Complete architectural synthesis of defense domains and real-world case studies
│   ├── access_controls_and_hardening.md  # Need-to-Know Principle, TSA master key leak defense, and network segmentation
│   └── incident_response_playbook.md     # Incident Response lifecycle, Malware, Phishing, APTs, and DDoS mitigation
├── codes/                                # Code references and active defensive implementations
│   ├── README.md                         # Index of defensive code files across the codebase
│   ├── test_cybersecurity_defenses.py    # 17-point automated penetration testing suite
│   ├── middleware_ratelimit.ts           # Next.js sliding-window rate limiter & 1MB body limit guard
│   ├── pdf_proxy_ssrf_guard.ts           # Strict HTTPS, domain whitelist regex, and RFC1918/metadata IP blocker
│   ├── prompt_injection_sanitizer.py     # AI prompt injection sanitizer & XML boundary tagger
│   ├── input_bounds_schemas.py           # Pydantic bounds (Chat <= 2000, PW <= 128) & UUID format validator
│   └── next_security_headers.mjs         # OWASP HTTP security headers (CSP, HSTS, X-Frame-Options)
└── reports/                              # Formal security audit reports and test execution logs
    ├── README.md                         # Index of formal security audit documents
    ├── cybersecurity_vulnerability_report.md # Formal enterprise vulnerability assessment report
    └── vapt_test_execution_log.md        # 17-point automated penetration testing execution audit trail
```

---

## Quick Reference to Key Findings & Defenses

### 1. What securities were added that can be threats where?
Read [`details/security_threat_matrix.md`](file:///c:/Users/Meeta/OneDrive%20-%20Algonquin%20College/Subjects/6/Entrepreneurship/NityaGeeta/cybersecurity/details/security_threat_matrix.md) for the complete breakdown of how:
- **Rate limiting** can accidentally starve legitimate users sharing a NAT IP.
- **Bcrypt hashing** can cause CPU exhaustion DoS if password lengths are unbounded.
- **Reverse proxies** can become SSRF tools if URL validation is loose.
- **Strict CSP** can cause self-inflicted functional outages by blocking web workers.
- **AI Prompt sanitizers** can cause false-positive censorship of legitimate scripture terms if regexes are unconstrained.

### 2. Historical Case Studies Aligned with NityaGeeta Defenses
- **SolarWinds (2021)**: Supply chain build-pipeline injection (SUNSPOT/SUNBURST) $\to$ Pinned package hashes and build-time type verification.
- **The Myth of Talos**: Single-bolt vulnerability destroying an automated guardian $\to$ Elimination of single points of failure via 6 concentric rings of **Defense in Depth**.
- **Rapid7 Energy Company (2018)**: Unprotected internal Ethernet ports bypassing an 8-foot fence $\to$ Elimination of internal blind spots (securing `HEAD` proxy requests and session routes).
- **TSA Master Key Leak (2015)**: Photo of 7 master keys published in the press, allowing 3D-printing $\to$ Strict **Need-to-Know** principle, zero client-exposed secrets, server-side JWT signing.
- **Equifax (2017)**: Unpatched Apache Struts, lack of segmentation, expired certificates ($575M fine) $\to$ Automated dependency audits, network segmentation, TLS 1.3 with 2-year HSTS preload.
