# NityaGeeta Security Audit & Vulnerability Reports

This directory houses the formal cybersecurity vulnerability reports, risk management evaluations, and penetration test execution logs for the NityaGeeta platform.

---

## Report Directory Index

| Document | Purpose & Scope | Standards & Methodology |
| :--- | :--- | :--- |
| [`cybersecurity_vulnerability_report.md`](file:///c:/Users/Meeta/OneDrive%20-%20Algonquin%20College/Subjects/6/Entrepreneurship/NityaGeeta/cybersecurity/reports/cybersecurity_vulnerability_report.md) | Comprehensive enterprise audit report covering Asset Valuation, Threat Modeling, Inherent vs. Residual Risk, BIA/RTO/RPO, Defense in Depth, VAPT, Cryptography, and OWASP Top 10 remediation. | OWASP Top 10, NIST SP 800-30 & Enterprise VAPT Standards |
| [`vapt_test_execution_log.md`](file:///c:/Users/Meeta/OneDrive%20-%20Algonquin%20College/Subjects/6/Entrepreneurship/NityaGeeta/cybersecurity/reports/vapt_test_execution_log.md) | Verified execution logs and test-by-test output from the 17-point automated penetration testing suite (`qa/test_cybersecurity_defenses.py`). | Empirical Verification (17/17 PASS) |

---

## Key Metrics at a Glance
- **Automated Security Tests**: 17 Executed, 17 Passed, 0 Failed (100% Pass Rate).
- **Core Defenses Validated**: SQLi, Buffer/Memory DoS, SSRF, Prompt Injection, CSP/HSTS Headers, Edge Rate Limiting, Defense in Depth, and Bcrypt Salting.
- **Residual Risk Level**: All Critical & High inherent risks mitigated to **Low** or **Very Low**.
