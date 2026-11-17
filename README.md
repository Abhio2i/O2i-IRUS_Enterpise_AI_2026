<p align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-4.1.1-brightgreen?style=for-the-badge&logo=springboot" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/Java-21%20LTS-orange?style=for-the-badge&logo=openjdk" alt="Java 21" />
  <img src="https://img.shields.io/badge/React-19.3-blue?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8.3-purple?style=for-the-badge&logo=vite" alt="Vite 8" />
  <img src="https://img.shields.io/badge/MySQL-8.0-blue?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL 8" />
  <img src="https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge" alt="License" />
</p>

# 🤖 Agentic AI Platform

> **Enterprise-grade, multi-pillar AI operations platform** with zero-trust document management, AI-powered marketing automation, strategic planning, HR management, financial intelligence, and sovereign security — all orchestrated through autonomous AI agents.

---

## 📑 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Tech Stack](#-tech-stack)
- [Platform Pillars](#-platform-pillars--modules)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Frontend Architecture](#-frontend-architecture)
- [Security Architecture](#-security-architecture)
- [AI & ML Integrations](#-ai--ml-integrations)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React 19 + Vite 8)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │ Redux TK │ │ Lucide   │ │ API      │ │  6 Pillar UIs    │   │
│  │ Store    │ │ React    │ │ Client   │ │  (50+ pages)     │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
│                   Vite Dev Proxy (:5173 → :9095)                │
└─────────────────────────┬───────────────────────────────────────┘
                          │ REST / JSON
┌─────────────────────────▼───────────────────────────────────────┐
│                   BACKEND (Spring Boot 4.1.1)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │ Security │ │ Auth &   │ │ Document │ │ Marketing &      │   │
│  │ (JWT +   │ │ IAM      │ │ Intake   │ │ Revenue Intel    │   │
│  │  OAuth2) │ │ (BCrypt) │ │ (Tika)   │ │ (Groq + SerpAPI) │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
│                     Flyway Migrations                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │ JDBC / JPA
┌─────────────────────────▼───────────────────────────────────────┐
│                     MySQL 8.0 (InnoDB)                          │
│  Multi-tenant schema: dms_*, iam_*, mkt_*                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Java** | 21 LTS | Runtime & language |
| **Spring Boot** | 4.1.1 | Application framework |
| **Spring Security** | 6.x | Authentication & authorization |
| **Spring Data JPA** | 4.x | ORM & repository abstraction |
| **Spring OAuth2 Resource Server** | 6.x | JWT-based stateless auth |
| **Flyway** | 11.x | Database version control & migrations |
| **MySQL Connector/J** | 8.x | JDBC driver |
| **Apache Tika** | 3.2.2 | Document text extraction (PDF, DOCX, etc.) |
| **Apache Commons CSV** | 1.14.1 | CSV parsing for contact imports |
| **Spring Boot Mail** | 4.x | SMTP email campaigns |
| **BCrypt** | — | Password hashing |
| **Maven Wrapper** | 3.x | Build tool (no global install needed) |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.3 | UI component framework |
| **Vite** | 8.3 | Build tool & HMR dev server |
| **Redux Toolkit** | 2.13 | Global state management |
| **React Redux** | 9.3 | React bindings for Redux |
| **Lucide React** | 1.61 | Icon library (200+ icons) |
| **CSS Variables** | — | Theming (Dark / Light modes) |

### Database & Infrastructure

| Technology | Version | Purpose |
|---|---|---|
| **MySQL** | 8.0 | Primary relational database |
| **InnoDB** | — | Transactional storage engine |
| **Flyway** | — | 9 versioned migration scripts |

### External AI / API Services

| Service | Purpose |
|---|---|
| **Groq API** (LLM) | AI content generation — email drafts, SEO recommendations, proposals, contact selection |
| **SerpAPI** | Live Google SERP rank tracking for SEO keywords |
| **SMTP Provider** | Transactional & marketing email delivery |

---

## 🏛 Platform Pillars & Modules

The platform is organized into **6 enterprise pillars**, each powered by autonomous AI agents:

### Pillar 1 — Operations (Process Automation)
| Module | Description |
|---|---|
| **Projects** | Project portfolio management dashboard |
| **Status** | Real-time operational status monitoring |
| **Planner & Team** | Resource planning and team allocation |
| **Docs & Security** | Document security classification and access control |
| **Workflow Improvements** | AI-suggested process optimizations |
| **Exception Queue** | Anomaly detection and exception handling with prioritization |
| **Document Intake** | Zero-trust document ingestion with AI text extraction (Apache Tika), field extraction, confidence scoring, SHA-256 deduplication |
| **Process Mining** | Process bottleneck discovery and optimization |
| **Knowledge Assistant** | AI-powered knowledge base and Q&A |
| **Automated Reports** | Scheduled intelligence reports |

### Pillar 2 — HR & People (Team Value)
| Module | Description |
|---|---|
| **Person Identification** | Identity verification and profiling |
| **AI On-Call Interview** | Automated candidate screening |
| **Offer Letters** | AI-generated offer letter drafting |
| **Policies** | HR policy management and compliance |
| **Salary Disbursement** | Payroll processing dashboard |
| **Experience Letters** | Automated experience certificate generation |
| **Documentation** | Employee documentation vault |

### Pillar 3 — Marketing (Revenue Intelligence)
| Module | Description |
|---|---|
| **Lead Management** | Lead capture, scoring, and pipeline tracking |
| **Proposals** | AI-generated business proposals using Groq LLM |
| **Customer Lists** | AI-segmented customer lists with CSV import, Groq AI contact selection |
| **Recommendations** | AI confidence-ranked engagement strategies |
| **Brochures & Catalogs** | Marketing asset management with file upload/preview/download |
| **SEO Keywords** | Live Google rank tracking (SerpAPI) + Groq AI optimization |
| **Email Sender** (Content Studio) | Groq AI email generation with SMTP delivery, brochure-grounded content |
| **Customer 360** | Unified customer view with health scores, signals, and AI-generated offers |
| **Predictive Scoring** | Churn prediction and revenue forecasting |
| **Attribution & ROI** | Multi-touch attribution modeling |

### Pillar 4 — Leadership & Strategy (Strategic Excellence)
| Module | Description |
|---|---|
| **Goals & Sub-Goals** | OKR-style goal tracking |
| **Strategic Timelines** | Gantt-style strategic planning |
| **Plan of Action** | Actionable strategic roadmaps |
| **Policies** | Organizational policy management |

### Pillar 5 — Finance & Capital (Enterprise Settlement)
| Module | Description |
|---|---|
| **Single Dashboard** | Unified financial overview |
| **Revenues (Projects)** | Project-wise revenue tracking |
| **Expenses & Costs** | Cost management and budgeting |
| **Taxes & Compliance** | Tax calculation and compliance tracking |
| **Projections & Planning** | Financial forecasting and scenario planning |

### Pillar 6 — Security & Defense (Sovereign Shield)
| Module | Description |
|---|---|
| **Command Center** | Security overview and threat dashboard |
| **Data Security** | Data classification and protection policies |
| **IP Security** | Intellectual property monitoring |
| **Personnel Safety** | Employee security protocols |
| **Equipment Security** | Asset tracking and protection |
| **Infrastructure** | Infrastructure hardening status |
| **Sentry Console** | Real-time security event monitoring (port 9090) |

---

## 📁 Project Structure

```
Agentic-Ai-new/
├── agentic-ai-platform/              # ☕ Spring Boot Backend
│   ├── src/main/java/com/example/agentic_ai_platform/
│   │   ├── AgenticAiPlatformApplication.java
│   │   ├── auth/                     # Authentication & IAM
│   │   │   ├── controller/           # AuthController (register, login, refresh, logout)
│   │   │   ├── dto/                  # AuthRequests, AuthResponse, AuthUserResponse
│   │   │   ├── entity/               # PlatformUser, RefreshSession, Tenant
│   │   │   ├── repository/           # JPA repositories
│   │   │   └── service/              # AuthService (BCrypt + JWT)
│   │   ├── common/
│   │   │   └── controller/           # ApiExceptionHandler (global error handling)
│   │   ├── documents/                # Document Intake Module
│   │   │   ├── controller/           # DocumentIntakeController
│   │   │   ├── dto/                  # DocumentResponse, DocumentFileResponse
│   │   │   ├── entity/               # Document, DocumentContent
│   │   │   ├── repository/           # DocumentRepository, DocumentContentRepository
│   │   │   ├── service/              # DocumentIntakeService (interface)
│   │   │   └── serviceimpl/          # DocumentIntakeServiceImpl (Tika integration)
│   │   ├── marketing/                # Marketing & Revenue Intelligence
│   │   │   ├── controller/           # Customer360, CustomerLists, Contacts, SEO, Proposals, Assets, Campaigns
│   │   │   ├── dto/                  # Request/Response DTOs
│   │   │   ├── entity/               # JPA entities (SeoKeyword, MarketingProposal, Customer360*, etc.)
│   │   │   ├── repository/           # Spring Data JPA repositories
│   │   │   ├── service/              # Service interfaces
│   │   │   └── serviceimpl/          # GoogleSerpRankService, GroqContentGenerator, GroqContactSelector
│   │   └── security/                 # Security Configuration
│   │       ├── SecurityConfig.java   # CORS, CSRF, OAuth2 Resource Server, BCrypt
│   │       └── jwt/                  # JwtConfig, JwtService, JwtCookieService
│   ├── src/main/resources/
│   │   ├── application.properties    # Externalized configuration with env var binding
│   │   ├── db/migration/             # Flyway SQL migrations (V1–V9)
│   │   ├── static/                   # Legacy static UI (index.html, css/, js/)
│   │   └── templates/                # Thymeleaf templates (if any)
│   ├── scripts/
│   │   └── create-local-database.sql # MySQL database creation script
│   ├── postman/
│   │   └── agentic-ai-platform.postman_collection.json  # Complete API test collection
│   ├── .env.example                  # Environment variable template
│   ├── pom.xml                       # Maven project configuration
│   ├── mvnw / mvnw.cmd              # Maven Wrapper (no global Maven needed)
│   └── .gitignore
│
├── ai-agentic-frontend/              # ⚛️ React Frontend
│   ├── src/
│   │   ├── main.jsx                  # React entry point with Redux Provider
│   │   ├── App.jsx                   # Root component with PageRouter & auth gate
│   │   ├── App.css                   # Component styles
│   │   ├── index.css                 # Global styles & CSS variable theming
│   │   ├── components/
│   │   │   ├── Sidebar.jsx           # 6-pillar navigation with live/plan badges
│   │   │   ├── Topbar.jsx            # Breadcrumb navigation bar
│   │   │   ├── Header.jsx            # App header
│   │   │   ├── AgentSelector.jsx     # AI agent selection component
│   │   │   ├── GovernanceDrawer.jsx  # Governance & compliance slide-out
│   │   │   ├── GovernanceAuditDrawer.jsx
│   │   │   ├── auth/                 # LoginPage
│   │   │   ├── common/               # AgentRoadmapModal, AuthModal
│   │   │   ├── operations/           # 10 operation page components
│   │   │   ├── marketing/            # 10 marketing page components
│   │   │   ├── strategy/             # 4 strategy page components
│   │   │   ├── hr/                   # 7 HR page components
│   │   │   ├── finance/              # 5 finance page components
│   │   │   └── security/             # 7 security page components
│   │   ├── services/
│   │   │   └── apiClient.js          # Centralized API client (2400+ lines, auto token refresh)
│   │   ├── store/                    # Redux Toolkit slices
│   │   │   ├── index.js              # Store configuration
│   │   │   ├── authSlice.js          # Authentication state
│   │   │   ├── marketingSlice.js     # Marketing module state
│   │   │   ├── operationsSlice.js    # Operations module state
│   │   │   ├── navigationSlice.js    # Routing & sidebar state
│   │   │   ├── financeSlice.js       # Finance module state
│   │   │   ├── hrSlice.js            # HR module state
│   │   │   ├── securitySlice.js      # Security module state
│   │   │   ├── strategySlice.js      # Strategy module state
│   │   │   ├── governanceSlice.js    # Governance & audit state
│   │   │   └── themeSlice.js         # Dark/Light theme state
│   │   └── assets/                   # Static assets (images, SVGs)
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── icons.svg
│   │   └── _redirects                # SPA routing for Netlify/CDN deployment
│   ├── vite.config.js                # Vite config with API proxy
│   ├── package.json
│   ├── .env                          # VITE_BACKEND_URL
│   └── .gitignore
│
└── README.md                         # ← You are here
```

---

## 📋 Prerequisites

| Requirement | Version | Check |
|---|---|---|
| **Java JDK** | 21+ | `java -version` |
| **Node.js** | 20+ | `node -v` |
| **npm** | 10+ | `npm -v` |
| **MySQL Server** | 8.0+ | `mysql --version` |
| **Git** | 2.x+ | `git --version` |

> **Note:** Maven is NOT required globally — the project includes Maven Wrapper (`mvnw` / `mvnw.cmd`).

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Abhio2i/Agentic-Ai-new.git
cd Agentic-Ai-new
```

### 2. Set Up MySQL Database

```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create the database
CREATE DATABASE IF NOT EXISTS agentic_ai_platform
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;
```

### 3. Configure Backend Environment

```bash
cd agentic-ai-platform
cp .env.example .env
```

Edit `.env` with your credentials:

```properties
DATABASE_URL=jdbc:mysql://localhost:3306/agentic_ai_platform
DATABASE_USERNAME=root
DATABASE_PASSWORD=your-mysql-password
JWT_SECRET_BASE64=<run: openssl rand -base64 32>
AUTH_REGISTRATION_ENABLED=true
AUTH_COOKIE_SECURE=false
GROQ_API_KEY=your-groq-api-key        # Optional: enables AI features
SERPAPI_API_KEY=your-serpapi-key        # Optional: enables live SEO ranking
```

### 4. Start the Backend

```bash
# Windows
.\mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

Flyway will automatically run all 9 database migrations on first startup. The backend starts on **http://localhost:9095**.

### 5. Start the Frontend

```bash
cd ../ai-agentic-frontend
npm install
npm run dev
```

The frontend starts on **http://localhost:5173** with API proxy to the backend.

### 6. Access the Platform

Open **http://localhost:5173** in your browser and register a new account.

---

## ⚙️ Environment Variables

### Backend (`agentic-ai-platform/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | `jdbc:mysql://localhost:3306/agentic_ai_platform` | JDBC connection string |
| `DATABASE_USERNAME` | ✅ | `root` | MySQL username |
| `DATABASE_PASSWORD` | ✅ | — | MySQL password |
| `JWT_SECRET_BASE64` | ✅ | — | Base64-encoded JWT signing key |
| `AUTH_REGISTRATION_ENABLED` | ❌ | `false` | Enable/disable user registration |
| `AUTH_COOKIE_SECURE` | ❌ | `true` | Set `false` for local HTTP dev |
| `GROQ_API_KEY` | ❌ | — | Groq Cloud API key for AI features |
| `GROQ_MODEL` | ❌ | `openai/gpt-oss-120b` | LLM model identifier |
| `GROQ_BASE_URL` | ❌ | `https://api.groq.com/openai/v1` | Groq API base URL |
| `SMTP_HOST` | ❌ | — | SMTP server hostname |
| `SMTP_PORT` | ❌ | `587` | SMTP port |
| `SMTP_USERNAME` | ❌ | — | SMTP auth username |
| `SMTP_PASSWORD` | ❌ | — | SMTP auth password |
| `SMTP_AUTH` | ❌ | `true` | Enable SMTP authentication |
| `SMTP_STARTTLS` | ❌ | `true` | Enable STARTTLS |
| `SMTP_SSL` | ❌ | `false` | Enable SSL (for port 465) |
| `SMTP_FROM` | ❌ | — | Default sender email |
| `SMTP_ALLOWED_FROM` | ❌ | — | Comma-separated allowed sender emails |
| `SERPAPI_API_KEY` | ❌ | — | SerpAPI key for live Google rank tracking |
| `SERPAPI_ENGINE` | ❌ | `google` | Search engine type |
| `SERPAPI_GL` | ❌ | `us` | Geolocation for search results |
| `SERPAPI_HL` | ❌ | `en` | Language for search results |

### Frontend (`ai-agentic-frontend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_BACKEND_URL` | ❌ | `http://localhost:9095` | Backend API URL |

---

## 📡 API Reference

The backend exposes a RESTful JSON API. A complete **Postman Collection** is included at:

```
agentic-ai-platform/postman/agentic-ai-platform.postman_collection.json
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login & get tokens | ❌ |
| `POST` | `/api/auth/refresh` | Refresh JWT access token | ❌ |
| `POST` | `/api/auth/logout` | Revoke refresh token | ❌ |

### Document Intake Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/documents/intake` | Upload & process document | ✅ Bearer |
| `GET` | `/api/documents` | List all documents | ✅ Bearer |
| `GET` | `/api/documents/:id` | Get document metadata | ✅ Bearer |
| `GET` | `/api/documents/:id/content` | Download original file | ✅ Bearer |
| `DELETE` | `/api/documents/:id` | Delete document | ✅ Bearer |

### Marketing Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/marketing/contacts/import` | Import contacts CSV | ✅ Bearer |
| `GET` | `/api/marketing/contacts` | List contacts | ✅ Bearer |
| `GET/POST/PUT/DELETE` | `/api/marketing/customer-lists/**` | Customer list CRUD | ✅ Bearer |
| `POST` | `/api/marketing/customer-lists/:id/generate` | AI-generate contact list | ✅ Bearer |
| `GET/POST/DELETE` | `/api/marketing/seo/keywords/**` | SEO keyword CRUD | ✅ Bearer |
| `POST` | `/api/marketing/seo/keywords/:id/optimize` | AI SEO optimization | ✅ Bearer |
| `POST` | `/api/marketing/seo/keywords/:id/check-rank` | Live Google rank check | ✅ Bearer |
| `POST` | `/api/marketing/seo/sweep` | Bulk rank refresh | ✅ Bearer |
| `GET` | `/api/marketing/seo/config` | SEO provider status | ✅ Bearer |
| `GET/POST/DELETE` | `/api/marketing/proposals/**` | Proposal CRUD | ✅ Bearer |
| `GET/POST/DELETE` | `/api/marketing/assets/**` | Marketing asset management | ✅ Bearer |
| `GET` | `/api/marketing/customer-360/**` | Customer 360 views | ✅ Bearer |
| `POST` | `/api/marketing/campaigns/send` | Send email campaign | ✅ Bearer |

---

## 🗄 Database Schema

The database is managed through **9 Flyway migrations** running in order:

| Migration | Tables Created | Purpose |
|---|---|---|
| **V1** | `dms_tenants`, `iam_users`, `iam_refresh_sessions` | Multi-tenant identity & auth |
| **V2** | `dms_documents` | Document intake with extracted text, fields, confidence |
| **V3** | — (seed data) | Local development tenant seed |
| **V4** | `dms_document_content` | Original file binary storage (LONGBLOB) |
| **V5** | `mkt_customer_lists` | Marketing customer list management |
| **V6** | `mkt_contacts`, `mkt_customer_list_contacts` | Contact management with join table |
| **V7** | `mkt_proposals` | AI-generated marketing proposals |
| **V8** | `mkt_customer_360_accounts`, `mkt_customer_360_signals`, `mkt_customer_360_offers` | Customer 360 analytics |
| **V9** | `mkt_seo_keywords` | SEO keyword tracking with rank history |

### Key Design Decisions

- **Multi-tenancy:** Every table includes `tenant_id` (BINARY(16) UUID) with foreign key to `dms_tenants`
- **UUIDs as Primary Keys:** All IDs are BINARY(16) UUIDs for distributed-system compatibility
- **Timestamps:** TIMESTAMP(6) with microsecond precision
- **Constraints:** CHECK constraints enforce data integrity (ranks > 0, difficulty 0–100, etc.)
- **Indexes:** Composite indexes on tenant + frequently-queried columns

---

## 🎨 Frontend Architecture

### State Management (Redux Toolkit)

```
Redux Store
├── authSlice          → JWT tokens, user profile, login state
├── navigationSlice    → Active route, sidebar state, org config
├── themeSlice         → Dark/Light mode
├── operationsSlice    → Projects, exceptions, documents, workflows
├── marketingSlice     → Leads, contacts, lists, SEO, proposals
├── strategySlice      → Goals, timelines, action plans
├── financeSlice       → Revenue, expenses, taxes, projections
├── hrSlice            → Employees, interviews, payroll
├── securitySlice      → Threat data, security events
└── governanceSlice    → Audit logs, compliance data
```

### Routing

The app uses a **Redux-driven client-side router** (no React Router dependency). The `PageRouter` component switches views based on `navigationSlice.activeRoute`, supporting 43+ unique routes across all 6 pillars.

### Theming

- **CSS Custom Properties** for consistent design tokens
- **Dark / Light mode** toggle persisted in Redux
- Applied via `data-theme` attribute on the root element

### API Client

A centralized `apiClient.js` (2,400+ lines) provides:
- Automatic JWT Bearer token injection
- Transparent token refresh on 401 responses
- User-friendly error message parsing
- Configurable backend URL (env, localStorage override, hostname auto-detect)

---

## 🔐 Security Architecture

| Layer | Technology | Implementation |
|---|---|---|
| **Authentication** | JWT (HMAC-SHA) | Stateless Bearer tokens, 15-min access + 30-day refresh |
| **Password Storage** | BCrypt | Spring Security `BCryptPasswordEncoder` |
| **Authorization** | Spring Security + OAuth2 Resource Server | Role-based access control (`USER`, `ADMIN`) |
| **Session Management** | Stateless | `SessionCreationPolicy.STATELESS` — no server-side sessions |
| **CORS** | Spring CORS Config | Allowlisted origins with credentials support |
| **CSRF** | Disabled | Safe for stateless JWT APIs |
| **Multi-tenancy** | Tenant ID in JWT claims | Extracted from `tenant_id` claim on every request |
| **Document Integrity** | SHA-256 | Content hashing for deduplication and tamper detection |
| **Input Validation** | Jakarta Bean Validation | `@Valid` on all request DTOs |

---

## 🤖 AI & ML Integrations

### Groq LLM (via OpenAI-compatible API)

| Feature | Prompt Strategy | Output |
|---|---|---|
| **SEO Optimization** | Keyword + target page + intent → structured JSON | Meta title, meta description, H2 headings, recommendations |
| **Email Generation** | Domain + industry + tone + topic + brochure source → JSON | Subject line, HTML body, plain text |
| **Proposal Generation** | Structured prompt with custom instructions → JSON | Full proposal document |
| **Contact Selection** | AI analyzes contacts for campaign targeting | Filtered, scored contact lists |

### SerpAPI (Live Google Search)

| Feature | Implementation |
|---|---|
| **Rank Tracking** | Queries `serpapi.com/search.json` with `num=100` |
| **Domain Matching** | Scans `organic_results[].link`, `displayed_link`, `source` |
| **Rank History** | Stores `current_rank` and `previous_rank` with delta calculation |
| **Bulk Sweep** | Updates all tracked keywords in a single operation |

---

## 🚢 Deployment

### Production Build

```bash
# Backend: Build fat JAR
cd agentic-ai-platform
./mvnw clean package -DskipTests
# Output: target/agentic-ai-platform-0.1.0-SNAPSHOT.jar

# Frontend: Build static assets
cd ../ai-agentic-frontend
npm run build
# Output: dist/
```

### Run Production Backend

```bash
java -jar target/agentic-ai-platform-0.1.0-SNAPSHOT.jar
```

### Frontend Deployment

The frontend builds to static files in `dist/` and can be deployed to:
- **Netlify** (includes `_redirects` for SPA routing)
- **Vercel**
- **Nginx** / **Apache** (configure SPA fallback)
- **AWS S3 + CloudFront**

### Docker (Optional)

```dockerfile
# Backend Dockerfile example
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/agentic-ai-platform-0.1.0-SNAPSHOT.jar app.jar
EXPOSE 9095
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 🤝 Contributing

1. **Fork** this repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- **Backend:** Follow Spring Boot conventions, service-interface pattern, DTO separation
- **Frontend:** Functional components, Redux Toolkit slices, Lucide icons
- **Database:** Flyway migrations only — never modify schema manually
- **API:** RESTful conventions, proper HTTP status codes, JSON responses

---

## 📄 License

This project is proprietary software. All rights reserved.

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://github.com/Abhio2i">Abhio2i</a></strong>
  <br/>
  <sub>Enterprise Agentic AI Platform — Powering the future of autonomous business operations</sub>
</p>
#   A g e n t i c - A i - n e w  
 