# Access Controls, Hardening & Lateral Movement Prevention

**Security Domain**: Access Control Architecture & Defense-in-Depth Hardening  
**Historical Case Studies**: 2015 TSA Master Key Leak & 2017 Equifax Breach  
**System Architecture**: NityaGeeta Defense Implementation  

---

## 1. Access Controls & The Need-to-Know Principle

### The TSA Master Key Case Study
In 2014, the United States Transportation Security Administration (TSA) established a standardized lock system with seven physical "master keys." In 2015, a photo of all seven keys was published in a Washington Post feature article. The image had sufficient resolution for 3D modelers to digitize the bitting codes, and CAD blueprints were posted to GitHub. Within 24 hours, anyone with access to a hobbyist 3D printer could fabricate functional master keys to open any luggage lock in airports worldwide.

**Core Axiom**:  
*"The failure was not in the physical design of the lock; it was in the failure to enforce proper access control measures over the master key information."*

### NityaGeeta Implementation of Need-to-Know & Principle of Least Privilege (PoLP)
1. **Server-Side Secret Isolation**:
   - `DATABASE_URL`, `WEAVIATE_API_KEY`, `GOOGLE_CLIENT_SECRET`, and `NEXTAUTH_SECRET` reside solely in backend `.env` runtimes.
   - Zero production keys are prefixed with `NEXT_PUBLIC_`, ensuring they are never bundled into client-side JavaScript sent to user browsers.
2. **Database Role Privileges**:
   - Web application database connections operate under restricted service accounts prohibiting `DROP TABLE`, schema alterations, or superuser permissions.
3. **Session Ownership Verification**:
   - In `api/main.py`, conversation deletion (`DELETE /api/v1/sessions/{session_id}`) requires matching `user_email` in the query:
     ```sql
     DELETE FROM conversations WHERE id = %s::uuid AND user_id = %s::uuid;
     ```
     This prevents **Broken Object Level Authorization (BOLA / IDOR)**, ensuring users cannot access or delete another user's conversation by guessing or enumerating session UUIDs.

---

## 2. Security Hardening & Network Segmentation

### The Equifax Data Breach Case Study
In 2017, Equifax suffered an unauthorized intrusion that exposed 147 million sensitive credit records:
1. **Unpatched Web Framework**: Attackers exploited CVE-2017-5638 in Apache Struts. A security patch had been available for over two months, but Equifax failed to deploy it.
2. **Insufficient Network Segmentation**: Once attackers breached the public portal, there were no internal segmentation boundaries. They moved laterally across internal databases to access credit records stored in separate departments.
3. **Expired Inspection Certificates**: Equifax's internal network traffic inspection device had an expired SSL certificate, blinding intrusion detection systems (NIDS) to encrypted data exfiltration for 76 days.
4. **Impact**: Over $575 million in penalties and settlements with the FTC, CFPB, and 50 states.

### NityaGeeta Hardening Measures Against Equifax-Style Failures
1. **Continuous Dependency Auditing**:
   - Node packages and Python packages are continuously locked via `package-lock.json` and monitored for known CVEs.
2. **Network Segmentation**:
   - The Next.js frontend web layer and the FastAPI neural RAG service communicate over isolated network boundaries.
   - Neon PostgreSQL and Weaviate Cloud require mutual TLS connections and are never directly exposed to the public internet without credential validation.
3. **Certificate & Transport Modernization**:
   - All external communication enforces **TLS 1.3**.
   - Configured **HSTS with 2-Year Preload** (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`), preventing SSL-stripping and certificate downgrades.
