# NityaGeeta — Staging vs. Production Environment Strategy & Architecture Plan

This document establishes the comprehensive architectural, operational, and deployment strategy for running **Staging** and **Production** environments for the **NityaGeeta** platform (FastAPI Backend + Next.js 16 Frontend).

---

## 1. Core Principles & Purpose

| Pillar | Staging Environment | Production Environment |
| :--- | :--- | :--- |
| **Primary Mission** | Mirror production behavior to detect regressions, validate security gates, and test integrations safely. | Deliver high-availability, sub-300ms spiritual guidance to live seekers with zero downtime and strict reliability. |
| **Target Users** | Developers, QA testers, automated CI/CD runners, internal stakeholders. | Real-world global seekers, students, and researchers. |
| **Data Policy** | Synthetic / sanitized user data, disposable database branches, ephemeral cache. | Immutable scripture truth, authenticated user profiles, encrypted session logs. |
| **Availability Target** | 99.0% SLA (maintenance windows permitted). | 99.9% SLA (error budget: ~43 mins/month). |

---

## 2. Side-by-Side Comparison Matrix

| Dimension | Staging (`staging`) | Production (`prod`) |
| :--- | :--- | :--- |
| **Domain / URL** | `https://staging.nityageeta.tech` *(or Cloud Run preview URL)* | `https://www.nityageeta.tech` & `https://nityageeta.tech` |
| **Backend API URL** | `https://staging-api.nityageeta.tech` | `https://api.nityageeta.tech` *(or proxied via `/api`)* |
| **Compute Platform** | Google Cloud Run / GKE Staging Namespace | Google Cloud Run / GKE Production Namespace |
| **Scaling Policy** | `min-instances=0`, `max-instances=2` *(Cost-effective, scale-to-zero)* | `min-instances=1`, `max-instances=10` *(Pre-warmed, zero cold starts)* |
| **Compute Resources** | 0.5 vCPU, 512 MB RAM per container | 1–2 vCPU, 1–2 GB RAM per container |
| **PostgreSQL (Neon)** | Isolated Neon Branch (`staging` child branch off `main`) | Primary Neon Branch (`main`) with daily point-in-time recovery (PITR) |
| **Redis Cache** | Ephemeral Redis / DB index `1` (`REDIS_URL=.../1`) | Redis 7.2 persistent instance / DB index `0` |
| **Weaviate Vector DB** | Shared sandbox cluster / isolated namespace or mock vector store | Dedicated Weaviate Cloud instance with mutual TLS |
| **LLM Providers** | Standard free/low-tier API keys (Groq, Gemini Flash, OpenRouter) | Tiered production API keys with automated rate-limit fallbacks |
| **Analytics (GTM/GA4)** | GTM Preview / Debug container | Published Production Container (`GTM-PHTNG299`) |
| **Observability** | Logfire & Langfuse tagged with `env: staging` | Logfire & Langfuse tagged with `env: production` + PagerDuty alerts |
| **SSL / TLS** | Google-managed automated TLS certificate | Google-managed automated TLS certificate + Cloudflare / Cloud Armor WAF |

---

## 3. High-Level Architecture Topology

```mermaid
flowchart TD
    subgraph Staging_Environment["STAGING ENVIRONMENT (staging.nityageeta.tech)"]
        S_DNS["DNS: staging.nityageeta.tech"] --> S_LB["Cloud Run / Ingress (Staging)"]
        S_LB --> S_Next["Next.js Staging Pod\n(min: 0, max: 2)"]
        S_Next --> S_FastAPI["FastAPI Staging Pod\n(min: 0, max: 2)"]
        S_FastAPI --> S_DB[("Neon Postgres\n(Staging Branch)")]
        S_FastAPI --> S_Redis[("Redis (DB 1 - Staging)")]
        S_FastAPI --> S_Weaviate[("Weaviate Vector Sandbox")]
        S_FastAPI -.-> S_Telemetry["Logfire / Langfuse\n(Tag: env=staging)"]
    end

    subgraph Production_Environment["PRODUCTION ENVIRONMENT (www.nityageeta.tech)"]
        P_DNS["DNS: www.nityageeta.tech"] --> P_WAF["Cloud Armor WAF / DDoS Protection"]
        P_WAF --> P_LB["Google Cloud Load Balancer (Managed SSL)"]
        P_LB --> P_Next["Next.js Production Replicas\n(min: 1, max: 10)"]
        P_Next --> P_FastAPI["FastAPI Production Replicas\n(min: 1, max: 10)"]
        P_FastAPI --> P_DB[("Neon Postgres\n(Primary 'main' + PITR)")]
        P_FastAPI --> P_Redis[("Redis 7.2 Cache\n(DB 0 - Production)")]
        P_FastAPI --> P_Weaviate[("Weaviate Cloud Production")]
        P_FastAPI -.-> P_Telemetry["Logfire / Langfuse\n(Tag: env=production)"]
    end
```

---

## 4. Database Isolation Strategy

### A. PostgreSQL: Neon Instant Branching
Neon provides copy-on-write database branching that takes less than 2 seconds without duplicating storage:
1. **Production Branch (`main`)**: Stores live user registrations, saved dilemmas, and verified dispute feedback.
2. **Staging Branch (`staging`)**: Created directly as a child branch of `main`. It contains schema parity and seed data, allowing destructive migration testing without risking production data.
```
  [Neon main (Production)] ────────────► Live user activity
          │
          └──► [Neon staging branch] ──► Disposable, test migrations, seed tests
```

### B. Redis Isolation
* **Production**: Uses `redis://default:password@host:6379/0` (Database index 0).
* **Staging**: Uses `redis://default:password@host:6379/1` (Database index 1) or a separate staging container.
* Key namespace prefixes are strictly enforced: `staging:conv:{id}` vs `prod:conv:{id}`.

### C. Vector Database (Weaviate)
* **Production**: Contains the 649 unique canonical shlokas with verified commentary embeddings.
* **Staging**: Uses the same read-only canonical vectors or an isolated staging class name (`Scripture_Staging`), ensuring test scripts never alter production embeddings.

---

## 5. Configuration & Environment Variables

| Variable | Staging Value (`.env.staging`) | Production Value (`.env.production`) |
| :--- | :--- | :--- |
| `ENVIRONMENT` | `staging` | `production` |
| `DEBUG` | `false` | `false` |
| `PORT` | `8000` | `8000` |
| `NEXT_PUBLIC_API_URL` | `https://staging-api.nityageeta.tech` | `https://api.nityageeta.tech` |
| `NEXT_PUBLIC_GTM_ID` | `GTM-PHTNG299` *(debug mode)* | `GTM-PHTNG299` |
| `DATABASE_URL` | `postgresql://...@neon.tech/neondb?options=project%3Dstaging` | `postgresql://...@neon.tech/neondb` *(Production pooler)* |
| `REDIS_URL` | `redis://...:6379/1` | `redis://...:6379/0` |
| `LOGFIRE_ENVIRONMENT` | `staging` | `production` |
| `LANGFUSE_RELEASE` | `v1.0.0-staging` | `v1.0.0` |

---

## 6. Promotion & Deployment Pipeline (CI/CD)

The workflow follows a strict **Continuous Delivery** model:

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant Git as GitHub (develop branch)
    participant CI as GitHub Actions CI
    participant Stage as Cloud Run (Staging)
    participant Gate as Automated QA & E2E Gate
    participant Prod as Cloud Run (Production)

    Dev->>Git: Push / Merge to 'develop'
    Git->>CI: Trigger Staging Workflow
    CI->>CI: Unit Tests + SonarCloud + Build
    CI->>Stage: Deploy to staging.nityageeta.tech
    Stage->>Gate: Execute Newman API Tests & Playwright E2E
    Gate-->>CI: 100% Pass Confirmed
    Dev->>Git: Open PR: develop -> main (or Tag v1.x.x)
    Git->>CI: Trigger Production Release Workflow
    CI->>Prod: Canary Deployment (10% traffic -> 100%)
    Prod-->>Dev: Zero-Downtime Release Complete!
```

### Staging Automated Quality Gates:
1. **Static Analysis & Linting**: SonarCloud Quality Gate passes with 0 bugs, 0 vulnerabilities.
2. **Automated Backend QA**: `python -m unittest tests/test_qa_suite.py` passes 100%.
3. **Frontend Build Verification**: `npm run build` generates 23/23 routes without TypeScript or syntax warnings.
4. **API Integration Suite**: Newman / Postman executes the 7-page automated API collection against the live staging URL.
5. **E2E Browser Matrix**: Playwright headless browser tests verify theme toggle, chat streaming, and search drawer interactions.

---

## 7. Zero-Downtime Rollout & Rollback Plan

### Rolling Revisions with Traffic Splitting (Google Cloud Run)
Google Cloud Run uses immutable revisions. When a new version is deployed, the previous version remains running until healthchecks pass.

#### Canary Deployment (10% Traffic Test):
```powershell
# Route 90% of traffic to current stable revision, 10% to new revision
gcloud run services update-traffic nityageeta-api `
    --to-revisions=nityageeta-api-v00021=90,nityageeta-api-v00022=10 `
    --region=us-central1
```

#### Instant 1-Second Emergency Rollback:
If an error spike or regression occurs in production, route 100% of traffic back to the prior known-good revision instantly:
```powershell
gcloud run services update-traffic nityageeta-api `
    --to-revisions=nityageeta-api-v00021=100 `
    --region=us-central1
```

---

## 8. SRE Monitoring & Alerting Matrix

| Metric | Warning Threshold | Critical Alert Threshold | Action Triggered |
| :--- | :--- | :--- | :--- |
| **HTTP 5xx Error Rate** | > 1% over 5 mins | > 5% over 2 mins | Page on-call engineer, trigger automated rollback evaluation. |
| **API P95 Latency** | > 800ms | > 2000ms | Trigger autoscaler scale-out, check Redis cache hit ratio. |
| **Time-To-First-Token (TTFT)** | > 400ms | > 1200ms | Fallback to secondary LLM brain (Groq &rarr; Gemini Flash). |
| **Circuit Breaker Status** | Any primary LLM tripped | 3+ LLM providers tripped | Auto-switch to cached offline scripture wisdom responses. |
| **Container Memory** | > 80% usage | > 95% usage | Auto-restart unhealthy worker, capture heap snapshot. |

---

## 9. Staging-to-Production Checklist

Before promoting any release from Staging to Production, verify:

- [ ] All 4 Quality Pillars passed on Staging.
- [ ] Database migration scripts are backwards-compatible (non-destructive).
- [ ] Environment secrets and keys are populated in GCP Secret Manager.
- [ ] Cache invalidation strategy is verified (Redis TTL refreshed).
- [ ] Google Analytics & GTM tags are firing correctly without console errors.
- [ ] Disaster recovery rollback command is confirmed and ready.
