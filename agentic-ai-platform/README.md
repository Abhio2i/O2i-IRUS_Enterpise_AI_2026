# Agentic AI Platform

Java 21 and Spring Boot service for tenant-scoped identity and document intake.

## Run locally (without Docker)

Prerequisites: Java 21, MySQL 8.4, and Maven (or use the included Maven wrapper).

1. Start the local MySQL service, then create the database:

   ```powershell
   Get-Content .\scripts\create-local-database.sql | mysql -u root -p
   ```

2. Create `.env` from `.env.example` only on first setup, then set your MySQL password and JWT secret in `.env`. Keep the Groq API key in this ignored local file. Load its values and start the application from the same PowerShell window:

   ```powershell
   if (-not (Test-Path .env)) { Copy-Item .env.example .env }
   Get-Content .env | ForEach-Object {
       if ($_ -match '^\s*([^#][^=]*)=(.*)$') {
           Set-Item -Path "Env:$($matches[1].Trim())" -Value $matches[2]
       }
   }
   .\mvnw.cmd spring-boot:run
   ```

   Flyway creates the application tables when the service starts. Leave this terminal running.

3. Open `http://localhost:9095/` or import `postman/agentic-ai-platform.postman_collection.json` into Postman. Flyway automatically creates the development tenant used by the UI and collection during app startup. Register once, then use Login on subsequent runs.

A missing `/api/auth/csrf` endpoint was removed from the frontend flow; this application does not implement CSRF tokens.

## API behavior

- `POST /api/auth/register` accepts `tenantId`, `email`, `password`, and `displayName`; the tenant must already exist.
- Registering an email already used in that tenant returns `409 Conflict`; sign in with that account or register with a different email.
- Login returns `401 Unauthorized` when the tenant, email, or password does not match. If an existing account's password is unknown, register with a different email; the API does not expose or reset passwords.
- `POST /api/auth/login` accepts `tenantId`, `email`, and `password`.
- `POST /api/auth/refresh` accepts a JSON `refreshToken` and rotates the tokens.
- `POST /api/auth/logout` accepts a JSON `refreshToken` and revokes the session.
- Auth responses contain access and refresh tokens and set HttpOnly cookies. Documents endpoints accept the access token as a Bearer token.
- `GET /api/documents/{id}/content` returns the original uploaded file for preview/download. The document inspector opens after upload and can be reopened from the document list. PDF, PNG, JPEG, GIF, WebP, and plain-text files preview inline; other formats can be downloaded.
- `DELETE /api/documents/{id}` permanently deletes a document and its stored original file for the authenticated tenant; returns `204 No Content`.
- Marketing customer lists are tenant-scoped at `/api/marketing/customer-lists`: `GET` lists all, `POST` creates, `GET /{id}` retrieves, `PUT /{id}` replaces all editable fields, and `DELETE /{id}` removes a list. All requests require a Bearer access token.
- Customer-list JSON fields: `name`, `description`, `contacts` (non-negative count), `conversionRate` (0–100), `segment`, `status` (`ACTIVE` or `BUILDING`), and `aiGenerated`. Responses also include `id`, `createdAt`, and `updatedAt`.
- Marketing contacts are tenant-scoped. `POST /api/marketing/contacts/import` accepts multipart form data with a `file` CSV part, `GET /api/marketing/contacts` lists this tenant's imported contacts, and `GET /api/marketing/customer-lists/{id}/contacts` returns that tenant-owned list's members.
- CSV must be UTF-8 with a header row. The required, exact header is `email`. Optional headers are `firstName`, `lastName`, `company`, `title`, `industry`, `country`, `annualRevenue`, `customerStatus`, and `churnProbability` (header matching is case-insensitive). Email is normalized to lowercase and unique per tenant. Revenue must be non-negative; churn probability is a percentage from 0 to 100. Invalid rows are skipped and reported; duplicate emails already imported or repeated within the upload are skipped. Defaults limit uploads to 5 MiB, 2,000 nonblank data rows per upload, and 2,000 total contacts per tenant.
- `POST /api/marketing/customer-lists/ai-generate` accepts `{"prompt":"Find active customers in healthcare in Canada","name":"Optional list name"}` and creates a saved list containing only matching contacts from this tenant's imported CSV data. It is selection from your dataset, not web search or new-prospect discovery. Generated lists start with `conversionRate: 0.00`; no conversion results are inferred.
- AI list generation uses Groq and requires `GROQ_API_KEY`. Optional configuration: `GROQ_MODEL` (default `openai/gpt-oss-120b`) and `GROQ_BASE_URL` (default `https://api.groq.com/openai/v1`). The request to Groq contains only internal contact IDs and business attributes (`company`, `title`, `industry`, `country`, `annualRevenue`, `customerStatus`, `churnProbability`); contact emails and names are never sent. AI-selected IDs are checked against the tenant's supplied dataset before membership is saved. Missing provider configuration or failed/invalid provider responses return errors rather than generating a fallback list.
- The service listens on port `9095`; MySQL defaults to `localhost:3306`.

## Project layout

```text
src/main/java/com/example/agentic_ai_platform/
├── controller/              # HTTP controllers
├── dto/                     # Request and response DTOs
├── entity/                  # JPA entities
├── repository/               # Spring Data repositories
├── security/                 # Security and JWT configuration
└── service/                  # Application services
```

Database schema changes belong in `src/main/resources/db/migration` as versioned Flyway SQL migrations.

## Frontend

The web dashboard is served at `http://localhost:9095/`. Its static assets are in `src/main/resources/static/`.

## Configuration

| Variable | Purpose | Default |
| --- | --- | --- |
| `DATABASE_URL` | MySQL JDBC URL | `jdbc:mysql://localhost:3306/agentic_ai_platform` |
| `DATABASE_USERNAME` | MySQL username | `root` |
| `DATABASE_PASSWORD` | MySQL password | Must be set |
| `JWT_SECRET_BASE64` | Base64 HMAC key; decoded value must be at least 32 bytes | Must be set |
| `AUTH_REGISTRATION_ENABLED` | Enables registration | `false` |
| `AUTH_COOKIE_SECURE` | Adds Secure cookie attribute | `true` |
| `GROQ_API_KEY` | Groq API key used for AI-assisted list selection | Required for generation |
| `GROQ_MODEL` | Groq chat completions model | `openai/gpt-oss-120b` |
| `GROQ_BASE_URL` | Groq API base URL | `https://api.groq.com/openai/v1` |
| `MARKETING_CSV_MAX_FILE_BYTES` | CSV file byte limit | `5242880` |
| `MARKETING_CSV_MAX_ROWS` | Maximum nonblank CSV data rows | `2000` |
| `MARKETING_CSV_MAX_TOTAL_CONTACTS` | Maximum saved contacts per tenant | `2000` |
| `DOCUMENTS_MAX_FILE_SIZE` | Global multipart file limit (CSV has a stricter application limit) | `20MB` |
| `DOCUMENTS_MAX_REQUEST_SIZE` | Global multipart request limit including overhead | `21MB` |

Example CSV:

```csv
email,firstName,lastName,company,title,industry,country,annualRevenue,customerStatus,churnProbability
alex@example.com,Alex,Kim,Northwind,VP Sales,Technology,Canada,2500000,ACTIVE,12.5
```

The local `.env` already contains the Groq settings. If you prefer to set them directly in PowerShell instead:

```powershell
$env:GROQ_API_KEY = 'YOUR_GROQ_API_KEY'
$env:GROQ_MODEL = 'openai/gpt-oss-120b'
```
