<p align="center">
  <img src="https://img.shields.io/badge/Java-21_LTS-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" />
  <img src="https://img.shields.io/badge/Spring_Boot-4.1.1-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redux_Toolkit-2.13-764ABC?style=for-the-badge&logo=redux&logoColor=white" />
</p>

<h1 align="center">🤖 Agentic AI Platform</h1>

<p align="center">
  <strong>Enterprise-grade autonomous AI operations platform built with Spring Boot 4 and React 19.</strong><br/>
  Multi-tenant architecture with JWT authentication, AI-powered document processing, marketing automation,<br/>
  live Google rank tracking, and 50+ UI pages across 6 enterprise pillars.
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-platform-modules">Modules</a> •
  <a href="#-api-endpoints">API</a> •
  <a href="#-database">Database</a> •
  <a href="#-deployment">Deployment</a>
</p>

---

## ✨ Key Highlights

- **🔐 Zero-Trust Auth** — JWT access/refresh tokens, BCrypt password hashing, OAuth2 Resource Server, multi-tenant isolation
- **📄 AI Document Processing** — Upload any document → Apache Tika extracts text → Regex extracts structured fields with confidence scores → SHA-256 deduplication → Auto-approve or flag to Exception Queue
- **📧 AI Email Campaigns** — Groq LLM generates personalized outreach emails grounded in your uploaded brochures/catalogs, then sends via SMTP to imported CSV contacts
- **📬 Email Engagement Tracking & IMAP Reply Intelligence** — 100% free, provider-agnostic 1x1 open pixel tracking, instant link click redirection, IMAP SSL inbound reply synchronization, smart thread parsing, and company-enriched analytics
- **🔍 Live SEO Rank Tracking** — SerpAPI queries real Google results for your keywords, finds your domain position in top 100 organic results, tracks rank history with deltas
- **🤖 AI SEO Optimization** — Groq AI generates optimized meta titles, descriptions, H2 headings, and actionable recommendations for each tracked keyword
- **📊 Customer 360** — Unified customer view with health scores, churn probability, engagement signals, and AI-generated cross-sell/upsell/retention offers
- **🌗 Dark/Light Theme** — Full CSS variable-based theming with one-click toggle
- **📱 50+ Pages** — Operations, Marketing, HR, Strategy, Finance, Security modules with dedicated UIs

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT 19 + VITE 8                        │
│                                                             │
│  Redux Toolkit Store ──► 50+ Page Components                │
│  (10 slices)              (Lucide React Icons)              │
│                                                             │
│  API Client (2400+ LOC) ── auto token refresh               │
│               │                                             │
│         Vite Dev Proxy                                      │
│        :5173 → :9095                                        │
└───────────────┬─────────────────────────────────────────────┘
                │ REST / JSON
┌───────────────▼─────────────────────────────────────────────┐
│                 SPRING BOOT 4.1.1                           │
│                                                             │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌───────────┐   │
│  │  Auth   │  │ Document │  │ Marketing │  │ Security  │   │
│  │  (JWT)  │  │ Intake   │  │ (Groq AI) │  │ (OAuth2)  │   │
│  │ BCrypt  │  │ (Tika)   │  │ (SerpAPI) │  │ CORS/CSRF │   │
│  └─────────┘  └──────────┘  └───────────┘  └───────────┘   │
│                                                             │
│  Flyway Migrations (V1–V9) ── JPA/Hibernate ── Validation  │
└───────────────┬─────────────────────────────────────────────┘
                │ JDBC
┌───────────────▼─────────────────────────────────────────────┐
│              MySQL 8.0 (InnoDB)                             │
│  Tables: dms_tenants, iam_users, iam_refresh_sessions,      │
│          dms_documents, dms_document_content,                │
│          mkt_customer_lists, mkt_contacts,                   │
│          mkt_proposals, mkt_customer_360_*,                  │
│          mkt_seo_keywords                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Backend

| Technology | Version | What it does |
|:---|:---|:---|
| **Java** | 21 LTS | Language runtime |
| **Spring Boot** | 4.1.1 | Web framework, DI, auto-configuration |
| **Spring Security** | 6.x | Authentication & authorization layer |
| **Spring Data JPA** | 4.x | ORM with Hibernate, repository pattern |
| **Spring OAuth2 Resource Server** | 6.x | Stateless JWT token validation |
| **Spring Mail** | 4.x | SMTP email delivery for campaigns |
| **Flyway** | 11.x | Database migration versioning (9 scripts) |
| **MySQL Connector/J** | 8.x | JDBC driver for MySQL |
| **Apache Tika** | 3.2.2 | PDF/DOCX/image text extraction & OCR |
| **Apache Commons CSV** | 1.14.1 | CSV parsing for contact imports |
| **BCrypt** | — | Password hashing (60-round) |
| **Jakarta Validation** | 3.x | Request DTO validation (`@Valid`, `@NotBlank`) |
| **Maven Wrapper** | 3.x | Build tool (included, no global install) |

### Frontend

| Technology | Version | What it does |
|:---|:---|:---|
| **React** | 19.3 | Component-based UI framework |
| **Vite** | 8.3 | Dev server with HMR + production bundler |
| **Redux Toolkit** | 2.13 | Centralized state management (10 slices) |
| **React Redux** | 9.3 | React bindings for Redux store |
| **Lucide React** | 1.61 | 200+ SVG icon components |
| **CSS Custom Properties** | — | Dark/Light theme system |

### External Services

| Service | What it does |
|:---|:---|
| **Groq Cloud API** | LLM for email drafts, SEO tips, proposals, contact scoring |
| **SerpAPI** | Live Google search rank tracking |
| **SMTP Server** | Email campaign delivery |

---

## 📦 Platform Modules

The platform has **6 pillars** with **43+ routes** and **50+ page components**:

### Pillar 1 — ⚙️ Operations (Process Automation)

| Page | What it does |
|:---|:---|
| **Document Intake** | Upload documents → Tika text extraction → field extraction with confidence scores → SHA-256 dedup → auto-approve or flag to Exception Queue |
| **Exception Queue** | Review flagged documents with reasons (low confidence, over limit, duplicate) |
| **Process Mining** | Discover process bottlenecks and optimization opportunities |
| **Knowledge Assistant** | AI knowledge base and Q&A |
| **Projects** | Project portfolio dashboard |
| **Status** | Real-time operational monitoring |
| **Planner & Team** | Resource planning and team allocation |
| **Workflow Improvements** | AI-suggested process optimizations |
| **Automated Reports** | Scheduled intelligence reports |
| **Docs & Security** | Document classification and access control |

### Pillar 2 — 👥 HR & People

| Page | What it does |
|:---|:---|
| **Person Identification** | Identity verification and profiling |
| **AI On-Call Interview** | Automated candidate screening |
| **Offer Letters** | AI-drafted employment offers |
| **Salary Disbursement** | Payroll processing dashboard |
| **Experience Letters** | Automated certificate generation |
| **Policies & Documentation** | HR policy and employee document vault |

### Pillar 3 — 📢 Marketing (Revenue Intelligence)

| Page | What it does |
|:---|:---|
| **Email Sender (Content Studio)** | 3-step outreach workflow with AI generation grounded in brochures. Features **Responses & Inbox** tracking dashboard with real-time Email Opens (1x1 pixel), Link Clicks (302 redirect), IMAP reply synchronization (GoDaddy/Gmail/M365), smart thread parsing (separating incoming replies from original pitch), and live activity streams enriched with Company Names |
| **SEO Keywords** | Track keywords with live Google rank via SerpAPI. Click "Optimize" → Groq AI generates meta title, description, H2 headings, and actionable SEO checklist. "Check Rank" re-fetches live position. "Sweep" updates all keywords at once |
| **Customer Lists** | Import contacts via CSV (email, company, industry, revenue, churn probability). Create AI-segmented lists with Groq-powered contact selection |
| **Customer 360** | Unified account view with Tier (1-4), ARR, health score, churn probability. Engagement signals (usage, API telemetry, portal analytics). AI-generated offers (cross-sell, upsell, retention) |
| **Proposals** | AI-generated business proposals using Groq LLM. Pipeline tracking: Draft → Sent → Under Review → Negotiation → Accepted/Rejected. Send proposals via email |
| **Brochures & Catalogs** | Upload marketing assets (PDF, images). Used as factual grounding source for AI email generation |
| **Lead Management** | Lead capture, scoring, pipeline tracking |
| **Recommendations** | AI confidence-ranked engagement strategies |
| **Predictive Scoring** | Churn prediction and revenue forecasting |
| **Attribution & ROI** | Multi-touch attribution modeling |

### Pillar 4 — 🧭 Leadership & Strategy

| Page | What it does |
|:---|:---|
| **Goals & Sub-Goals** | OKR-style goal tracking |
| **Strategic Timelines** | Gantt-style strategic planning |
| **Plan of Action** | Actionable strategic roadmaps |
| **Policies** | Organizational policy management |

### Pillar 5 — 💰 Finance & Capital

| Page | What it does |
|:---|:---|
| **Single Dashboard** | Unified financial overview |
| **Revenues (Projects)** | Project-wise revenue tracking |
| **Expenses & Costs** | Cost management and budgeting |
| **Taxes & Compliance** | Tax calculation and compliance |
| **Projections & Planning** | Financial forecasting and scenario planning |

### Pillar 6 — 🛡 Security & Defense

| Page | What it does |
|:---|:---|
| **Command Center** | Security overview and threat dashboard |
| **Data Security** | Data classification and protection policies |
| **IP Security** | Intellectual property monitoring |
| **Personnel Safety** | Employee security protocols |
| **Equipment Security** | Asset tracking and protection |
| **Infrastructure** | Infrastructure hardening status |
| **Sentry Console** | Live camera feed monitoring, incident detection (connects to external Sentry server on port 9090) |

---

## 📋 Prerequisites

| Tool | Version | Verify |
|:---|:---|:---|
| Java JDK | 21+ | `java -version` |
| Node.js | 20+ | `node -v` |
| npm | 10+ | `npm -v` |
| MySQL Server | 8.0+ | `mysql --version` |
| Git | 2.x+ | `git --version` |

> Maven is **not** required globally — the project ships with Maven Wrapper (`mvnw` / `mvnw.cmd`).

---

## 🚀 Quick Start

### 1️⃣ Clone

```bash
git clone https://github.com/Abhio2i/Agentic-Ai-new.git
cd Agentic-Ai-new
```

### 2️⃣ Create the MySQL database

```sql
mysql -u root -p
```

```sql
CREATE DATABASE IF NOT EXISTS agentic_ai_platform
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
```

### 3️⃣ Configure backend environment

```bash
cd agentic-ai-platform
cp .env.example .env
```

Edit `.env`:

```env
# ── Required ──────────────────────────────────────
DATABASE_URL=jdbc:mysql://localhost:3306/agentic_ai_platform
DATABASE_USERNAME=root
DATABASE_PASSWORD=your-mysql-password

# Generate: openssl rand -base64 32
JWT_SECRET_BASE64=your-generated-secret-here

AUTH_REGISTRATION_ENABLED=true
AUTH_COOKIE_SECURE=false

# ── Optional (AI features) ───────────────────────
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=openai/gpt-oss-120b
GROQ_BASE_URL=https://api.groq.com/openai/v1

# ── Optional (Live SEO ranking) ──────────────────
SERPAPI_API_KEY=your-serpapi-key

# ── Optional (Email campaigns) ───────────────────
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=you@example.com
SMTP_PASSWORD=your-smtp-password
SMTP_FROM=you@example.com
```

### 4️⃣ Start the backend

```bash
# Windows
.\mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

> Flyway automatically runs all 9 migrations on first startup. Backend starts at **http://localhost:9095**

### 5️⃣ Start the frontend

```bash
cd ../ai-agentic-frontend
npm install
npm run dev
```

> Frontend starts at **http://localhost:5173** with API proxy to backend.

### 6️⃣ Open & Register

Go to **http://localhost:5173**, register a new account, and start using the platform.

---

## ⚙️ Environment Variables

### Backend (`agentic-ai-platform/.env`)

| Variable | Required | Default | Description |
|:---|:---:|:---|:---|
| `DATABASE_URL` | ✅ | `jdbc:mysql://localhost:3306/agentic_ai_platform` | JDBC connection URL |
| `DATABASE_USERNAME` | ✅ | `root` | MySQL username |
| `DATABASE_PASSWORD` | ✅ | — | MySQL password |
| `JWT_SECRET_BASE64` | ✅ | — | Base64 JWT signing key (`openssl rand -base64 32`) |
| `AUTH_REGISTRATION_ENABLED` | | `false` | Allow new user registration |
| `AUTH_COOKIE_SECURE` | | `true` | `false` for local HTTP development |
| `SERVER_PORT` | | `9095` | HTTP port |
| `GROQ_API_KEY` | | — | Groq Cloud API key (enables AI features) |
| `GROQ_MODEL` | | `openai/gpt-oss-120b` | LLM model name |
| `GROQ_BASE_URL` | | `https://api.groq.com/openai/v1` | Groq API base URL |
| `SERPAPI_API_KEY` | | — | SerpAPI key (enables live Google rank tracking) |
| `SERPAPI_ENGINE` | | `google` | Search engine |
| `SERPAPI_GL` | | `us` | Country for search results |
| `SERPAPI_HL` | | `en` | Language for search results |
| `SMTP_HOST` | | — | Mail server hostname |
| `SMTP_PORT` | | `587` | Mail server port |
| `SMTP_USERNAME` | | — | SMTP auth username |
| `SMTP_PASSWORD` | | — | SMTP auth password |
| `SMTP_AUTH` | | `true` | Enable SMTP authentication |
| `SMTP_STARTTLS` | | `true` | Enable STARTTLS |
| `SMTP_SSL` | | `false` | Enable SSL (port 465) |
| `SMTP_FROM` | | — | Default sender email |
| `SMTP_ALLOWED_FROM` | | — | Comma-separated allowed senders |

### Frontend (`ai-agentic-frontend/.env`)

| Variable | Default | Description |
|:---|:---|:---|
| `VITE_BACKEND_URL` | `http://localhost:9095` | Backend API URL |

---

## 📡 API Endpoints

A complete **Postman Collection** is included:  
📁 `agentic-ai-platform/postman/agentic-ai-platform.postman_collection.json`

### Authentication

| Method | Endpoint | Description | Status |
|:---|:---|:---|:---|
| `POST` | `/api/auth/register` | Register user (tenantId, email, password, displayName) | `201` |
| `POST` | `/api/auth/login` | Login → returns accessToken + refreshToken | `200` |
| `POST` | `/api/auth/refresh` | Refresh access token | `200` |
| `POST` | `/api/auth/logout` | Revoke refresh token | `204` |

### Document Intake 🔒

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/documents/intake` | Upload file (multipart) → Tika extraction → field parsing → store |
| `GET` | `/api/documents` | List all ingested documents |
| `GET` | `/api/documents/:id` | Get document metadata + extracted fields + confidence scores |
| `GET` | `/api/documents/:id/content` | Download original file |
| `DELETE` | `/api/documents/:id` | Delete document |

### Marketing — Contacts 🔒

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/marketing/contacts/import` | Import contacts from CSV file |
| `GET` | `/api/marketing/contacts` | List all imported contacts |
| `GET` | `/api/marketing/contacts/by-domain?domain=x` | Filter contacts by email domain |

### Marketing — Customer Lists 🔒

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/marketing/customer-lists` | List all customer lists |
| `POST` | `/api/marketing/customer-lists` | Create customer list |
| `PUT` | `/api/marketing/customer-lists/:id` | Update customer list |
| `DELETE` | `/api/marketing/customer-lists/:id` | Delete customer list |
| `GET` | `/api/marketing/customer-lists/:id/contacts` | Get list members |
| `POST` | `/api/marketing/customer-lists/:id/generate` | AI-generate contact list (Groq) |

### Marketing — SEO Keywords 🔒

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/marketing/seo/config` | Provider status (live vs demo) |
| `GET` | `/api/marketing/seo/keywords` | List tracked keywords |
| `POST` | `/api/marketing/seo/keywords` | Add keyword (auto-fetches live rank) |
| `DELETE` | `/api/marketing/seo/keywords/:id` | Remove keyword |
| `POST` | `/api/marketing/seo/keywords/:id/optimize` | AI optimization (Groq → meta title, desc, headings, tips) |
| `POST` | `/api/marketing/seo/keywords/:id/check-rank` | Re-fetch live Google rank (SerpAPI) |
| `POST` | `/api/marketing/seo/sweep` | Bulk refresh all keyword ranks |

### Marketing — Proposals 🔒

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/marketing/proposals` | List proposals |
| `POST` | `/api/marketing/proposals` | Create proposal |
| `POST` | `/api/marketing/proposals/generate` | AI-generate proposal (Groq) |
| `PUT` | `/api/marketing/proposals/:id` | Update proposal |
| `POST` | `/api/marketing/proposals/:id/send` | Email proposal to client |
| `GET` | `/api/marketing/proposals/pipeline` | Pipeline stats |

### Marketing — Email Campaigns 🔒

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/marketing/campaigns/generate-email` | AI email draft (Groq + brochure grounding) |
| `POST` | `/api/marketing/campaigns/send` | Send bulk email campaign via SMTP |
| `GET` | `/api/marketing/campaigns` | List sent campaigns |
| `GET` | `/api/marketing/campaigns/senders` | Get allowed sender addresses |

### Marketing — Assets 🔒

| Method | Endpoint | Description |
|:---|:---|:---|
| `POST` | `/api/marketing/assets` | Upload brochure/catalog (multipart) |
| `GET` | `/api/marketing/assets` | List assets |
| `GET` | `/api/marketing/assets/:id/preview` | Preview asset |
| `GET` | `/api/marketing/assets/:id/download` | Download asset |
| `DELETE` | `/api/marketing/assets/:id` | Delete asset |

### Customer 360 🔒

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/marketing/customer-360/accounts` | List accounts with health scores |
| `POST` | `/api/marketing/customer-360/accounts` | Create account |
| `PUT` | `/api/marketing/customer-360/accounts/:id` | Update account |
| `GET` | `/api/marketing/customer-360/accounts/:id/signals` | Get engagement signals |
| `POST` | `/api/marketing/customer-360/accounts/:id/signals` | Add signal |
| `GET` | `/api/marketing/customer-360/accounts/:id/offers` | Get AI offers |
| `POST` | `/api/marketing/customer-360/accounts/:id/offers` | Add offer |

> 🔒 = Requires `Authorization: Bearer <accessToken>` header

---

## 🗄 Database

**9 Flyway migrations** manage the schema automatically:

| # | File | Tables Created |
|:---|:---|:---|
| V1 | `create_identity_schema` | `dms_tenants`, `iam_users`, `iam_refresh_sessions` |
| V2 | `create_document_intake` | `dms_documents` (extracted text, fields, confidence, SHA-256) |
| V3 | `seed_local_development_tenant` | Seeds default tenant `11111111-...` |
| V4 | `store_original_document_content` | `dms_document_content` (LONGBLOB) |
| V5 | `create_marketing_customer_lists` | `mkt_customer_lists` |
| V6 | `create_marketing_contacts` | `mkt_contacts`, `mkt_customer_list_contacts` (join table) |
| V7 | `create_marketing_proposals` | `mkt_proposals` |
| V8 | `create_customer_360` | `mkt_customer_360_accounts`, `_signals`, `_offers` |
| V9 | `create_seo_keywords` | `mkt_seo_keywords` (rank history, difficulty, intent) |
| V11 | `create_email_tracking_and_replies` | `mkt_campaign_events` (opens & clicks), `mkt_campaign_replies` (IMAP inbox) |

**Design patterns:**
- **Multi-tenant** — Every table has `tenant_id` (UUID) with FK to `dms_tenants`
- **UUIDs** — `BINARY(16)` primary keys for distributed compatibility
- **Microsecond timestamps** — `TIMESTAMP(6)` for all date fields
- **CHECK constraints** — Rank > 0, difficulty 0–100, revenue ≥ 0, etc.
- **Composite indexes** — On `(tenant_id, keyword)`, `(tenant_id, created_at)`, etc.

---

## 🔐 Security

| Layer | Implementation |
|:---|:---|
| **Authentication** | JWT (HMAC-SHA) — 15-minute access + 30-day refresh tokens |
| **Password Storage** | BCrypt via Spring Security `BCryptPasswordEncoder` |
| **Authorization** | OAuth2 Resource Server with role-based access (`USER`, `ADMIN`) |
| **Sessions** | Fully stateless (`SessionCreationPolicy.STATELESS`) |
| **CORS** | Allowlisted origins with credentials support |
| **Multi-tenancy** | `tenant_id` extracted from JWT claims on every request |
| **Document Integrity** | SHA-256 content hashing for deduplication & tamper detection |
| **Input Validation** | Jakarta Bean Validation (`@Valid`) on all request DTOs |
| **Token Refresh** | Frontend API client auto-refreshes on 401 responses |

---

## 🤖 AI Features (How they work)

### Groq LLM Integration

| Feature | Input | Output |
|:---|:---|:---|
| **SEO Optimization** | Keyword + target URL + intent | Meta title (60 chars), meta description (155 chars), 3 H2 headings, 3 recommendations |
| **Email Generation** | Domain + industry + tone + topic + brochure text | Subject line, HTML body, plain text (personalized with `{{firstName}}`, `{{company}}`) |
| **Proposal Generation** | Client name + services + custom instructions | Full proposal document with sections |
| **Contact Selection** | Contact list + campaign criteria | Filtered and scored contact subset |

### SerpAPI Integration

| Feature | How it works |
|:---|:---|
| **Rank Tracking** | Queries `serpapi.com/search.json` with `num=100` for real Google results |
| **Domain Matching** | Scans `organic_results[].link`, `displayed_link`, `source` for your domain |
| **Rank History** | Stores `current_rank` and `previous_rank`, calculates delta |
| **101 = Not Found** | If domain isn't in top 100, rank is set to 101 |
| **Bulk Sweep** | Updates all tracked keywords in one operation |

---

## 📬 Email Engagement Tracking & Inbound Reply Intelligence

The platform includes a **100% free, provider-agnostic, enterprise tracking system** that matches the architecture of HubSpot, Salesforce, and Apollo.io:

- **1x1 Transparent Open Pixel**:
  - Automatically injected before `</body>` in all outreach emails.
  - Returns a 42-byte invisible GIF with `no-cache` headers, recording recipient email, IP address, and timestamp.
- **Instant Link Click Redirection (HTTP 302)**:
  - Automatically rewrites anchor links (`<a href="...">`) to route through `/api/public/track/click`.
  - Records click events with target URL and forwards the user to their destination in <20ms.
- **GoDaddy / Any IMAP Inbound Reply Sync (Port 993 SSL)**:
  - `EmailReplySyncService` polls your mailbox via secure IMAP SSL and fetches incoming replies from leads/schools.
  - **Smart Regex Thread Parsing**: Automatically strips out quoted pitch history (`On ... wrote:`, `-----Original Message-----`) so only the clean respondent text is displayed.
  - **Auto-Confirmed Opens**: Automatically credits a verified `OPEN` event upon receiving a reply, overcoming mail client image blocking.
- **Company & Contact Name Enrichment**:
  - Automatically resolves recipient email to their registered **Company Name** (e.g. *MTU Maintenance Canada Ltd*, *Win Global*, *Wheatley School*) and personal contact name.
- **Responses & Inbox Dashboard (`ContentStudioPage.jsx`)**:
  - Live 4-card funnel: **Campaigns Sent**, **Email Opens**, **Link Clicks**, and **Inbound Replies**.
  - Interactive view toggle between **Inbound Replies Inbox** and **Live Opens & Clicks Activity Feed**.
  - **Read Full Message Modal**: Displays a prominent green card for the recipient's reply at the top, and a clean collapsible card for the original outreach pitch at the bottom.
  - Complete architecture guide available in [EMAIL_TRACKING_ARCHITECTURE_GUIDE.md](EMAIL_TRACKING_ARCHITECTURE_GUIDE.md).

---

## 📁 Project Structure

```
Agentic-Ai-new/
│
├── agentic-ai-platform/           # ☕ Spring Boot Backend (Java 21)
│   ├── src/main/java/.../
│   │   ├── auth/                   #   JWT auth (register, login, refresh, logout)
│   │   ├── documents/              #   Document intake (Tika, SHA-256, field extraction)
│   │   ├── marketing/              #   Customer lists, contacts, SEO, proposals,
│   │   │                           #   campaigns, assets, Customer 360
│   │   ├── security/               #   SecurityConfig, JWT service, CORS
│   │   └── common/                 #   Global exception handler
│   ├── src/main/resources/
│   │   ├── application.properties  #   Config with ${ENV_VAR} binding
│   │   └── db/migration/           #   9 Flyway SQL scripts
│   ├── postman/                    #   Complete API test collection
│   ├── scripts/                    #   create-local-database.sql
│   ├── .env.example                #   Environment template
│   ├── pom.xml                     #   Maven dependencies
│   └── mvnw / mvnw.cmd            #   Maven Wrapper
│
├── ai-agentic-frontend/            # ⚛️ React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/               #   Login/Register page
│   │   │   ├── operations/         #   10 operation page components
│   │   │   ├── marketing/          #   10 marketing page components
│   │   │   ├── hr/                 #   7 HR page components
│   │   │   ├── strategy/           #   4 strategy page components
│   │   │   ├── finance/            #   5 finance page components
│   │   │   ├── security/           #   7 security page components
│   │   │   └── common/             #   Shared modals, drawers
│   │   ├── services/
│   │   │   └── apiClient.js        #   Centralized API client (2400+ LOC)
│   │   ├── store/                  #   Redux Toolkit (10 slices)
│   │   └── App.jsx                 #   Root with PageRouter (43+ routes)
│   ├── vite.config.js              #   Vite + API proxy config
│   └── package.json
│
└── README.md
```

---

## 🚢 Deployment

### Build for Production

```bash
# Backend → fat JAR
cd agentic-ai-platform
./mvnw clean package -DskipTests
# → target/agentic-ai-platform-0.1.0-SNAPSHOT.jar

# Frontend → static files
cd ../ai-agentic-frontend
npm run build
# → dist/
```

### Run Production

```bash
java -jar agentic-ai-platform/target/agentic-ai-platform-0.1.0-SNAPSHOT.jar
```

### Frontend Hosting

The `dist/` folder includes `_redirects` for SPA routing. Deploy to:

| Platform | Notes |
|:---|:---|
| **Netlify** | Drop `dist/` folder, `_redirects` handles SPA routing |
| **Vercel** | `vercel.json` included with rewrite rules |
| **Nginx** | Add `try_files $uri /index.html` |
| **AWS S3 + CloudFront** | Enable SPA error page redirect to `index.html` |

### Docker Example

```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/agentic-ai-platform-0.1.0-SNAPSHOT.jar app.jar
EXPOSE 9095
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

**Guidelines:**
- Backend → Spring Boot conventions, service-interface pattern, DTOs for all requests/responses
- Frontend → Functional components, Redux Toolkit slices, Lucide icons
- Database → Flyway migrations only, never alter schema manually
- API → RESTful, proper HTTP status codes, JSON responses

---

## 📄 License

Proprietary — All rights reserved.

---

<p align="center">
  Built by <a href="https://github.com/Abhio2i"><strong>Abhio2i</strong></a><br/>
  <sub>Enterprise Agentic AI — Autonomous Business Operations Platform</sub>
</p>
