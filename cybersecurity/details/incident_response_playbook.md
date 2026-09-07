# NityaGeeta Incident Response Playbook & Anatomy of Cyber Attacks

**Security Framework**: Incident Response Lifecycle & Threat Vector Mitigation  
**Objective**: Establish a formal, structured response protocol to detect, contain, eradicate, and recover from cybersecurity incidents while learning from each event to permanently improve posture.

---

## 1. Core Incident Response Framework

```
   ┌─────────────────────────────────────────────────────────┐
   │ 1. PREPARATION                                          │
   │    Rate limiting, input bounds, backups, playbooks      │
   └───────────────────────────┬─────────────────────────────┘
                               │
   ┌───────────────────────────▼─────────────────────────────┐
   │ 2. DETECTION & ANALYSIS                                 │
   │    Monitoring HTTP 429/403/413 spikes, auth failures    │
   └───────────────────────────┬─────────────────────────────┘
                               │
   ┌───────────────────────────▼─────────────────────────────┐
   │ 3. CONTAINMENT                                          │
   │    IP throttling, session termination, token revoking   │
   └───────────────────────────┬─────────────────────────────┘
                               │
   ┌───────────────────────────▼─────────────────────────────┐
   │ 4. ERADICATION & RECOVERY                               │
   │    Patching vulnerability, database rollforward         │
   └───────────────────────────┬─────────────────────────────┘
                               │
   ┌───────────────────────────▼─────────────────────────────┐
   │ 5. POST-INCIDENT ACTIVITY (LESSONS LEARNED)             │
   │    RCA report, updating regression suites, hardening    │
   └─────────────────────────────────────────────────────────┘
```

---

## 2. Anatomy of Common Cyber Attacks & NityaGeeta Defenses

### 2.1 Malware and Ransomware
- **Threat Vector**: Malicious software (trojans, worms, spyware) infiltrating systems to destroy or encrypt data for ransom.
- **NityaGeeta Mitigation**:
  - Pure Python/TypeScript code execution in ephemeral environments.
  - Zero arbitrary file execution on server or client.
  - Canonical scriptures are immutable read-only JSON datasets and Weaviate cloud collections.
  - Cloud PostgreSQL automated hourly point-in-time recovery (PITR) ensures zero reliance on paying extortion demands.

### 2.2 Phishing and Spear Phishing
- **Threat Vector**: Deceptive emails or spoofed websites tricking administrators or users into revealing credentials or OAuth tokens.
- **NityaGeeta Mitigation**:
  - Enforced Google OAuth (OIDC) with mandatory multi-factor authentication (MFA).
  - Strict Content-Security-Policy (CSP) blocking external unauthorized scripts and form actions.
  - Sacred privacy pledge: NityaGeeta never sends emails requesting passwords or financial information.

### 2.3 Advanced Persistent Threats (APTs)
- **Threat Vector**: Well-funded, patient threat actors maintaining long dwell times, evading detection, and moving laterally across internal networks.
- **NityaGeeta Mitigation**:
  - Network segmentation between frontend, API, and database layers.
  - Defense in depth: An attacker bypassing one layer (e.g. rate limiter) still confronts Pydantic bounds, SQL parameterization, and AI prompt guardrails.
  - Automated penetration test suite run continuously to detect anomalies.

### 2.4 Denial of Service (DoS) and Distributed DoS (DDoS)
- **Threat Vector**: Single-source floods or multi-source botnets overwhelming network capacity to make services inaccessible to legitimate seekers.
- **NityaGeeta Mitigation**:
  - Next.js sliding-window token bucket in `middleware.ts` dropping high-frequency requests.
  - 1 MB maximum payload limit rejecting memory-exhaustion payloads immediately with HTTP 413.
  - Upstream CDN caching for static assets, fonts, and common PDF range chunks.
