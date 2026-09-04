# GovTender Hub — Project Documentation

## 1. Introduction

**GovTender Hub** is a web application for publishing and administering government/PSU tender opportunities. It has two distinct experiences:

- A public tender-intelligence dashboard where visitors can browse, filter, sort, and inspect tenders.
- A password-protected administration area where an operator manages organizations, tenders, and tender PDFs.

The application is a Progressive Web App (PWA) and includes a separate, entirely browser-based PDF Manager. Tender, organization, credential, and attachment metadata live in Supabase; tender PDFs are stored in a public Supabase Storage bucket.

## 2. Scope and Key Capabilities

| Area | Implemented capability |
| --- | --- |
| Public portal | Loads tender records, displays live metrics, search, organization/status filters, sorting, paging, and read-only tender details. |
| Tender lifecycle | Admins can create a tender, view it, edit core fields, and upload PDF attachments. |
| Organization directory | Admins can create, list, and edit organizations and contact details. |
| File management | Tender documents are uploaded to Supabase Storage and associated with a tender. |
| Admin access | First-run password setup, password login, HMAC-signed HTTP-only session cookie, logout. |
| PDF Manager | Client-side PDF merge, split, page arrangement, and file download. No PDF contents are sent to this app’s server. |
| PWA | Installable app manifest, icons, service-worker registration, and basic app-shell caching. |

## 3. Technology Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16.1.6 with the App Router |
| Language | TypeScript (strict mode) |
| UI | React 19, Tailwind CSS 4, Lucide icons, Framer Motion |
| HTTP client | Native `fetch` in server routes; Axios in several client components |
| Database and file storage | Supabase PostgreSQL via the Supabase REST API; Supabase Storage |
| Authentication | Custom single-admin password and signed cookie session; no Supabase Auth user session |
| PDF processing | `pdf-lib` and `jszip`, running in the browser |
| PWA | Custom service worker and web app manifest |

## 4. Repository Structure

```text
.
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Public home / tender dashboard
│   │   ├── about/page.tsx              # About page
│   │   ├── admin/                      # Protected admin screen and login
│   │   ├── api/                        # Route handlers (backend API)
│   │   ├── pdf-manager/page.tsx        # Browser-only PDF tool
│   │   ├── tenders/[status]/page.tsx   # Status route placeholder
│   │   ├── services/[service]/page.tsx # Service route template
│   │   └── tools/[tool]/page.tsx       # Tool route placeholder
│   ├── components/                     # Dashboard/forms/detail view/PWA register
│   └── lib/                            # Server-only Supabase and admin auth helpers
├── supabase/migrations/                # Database/schema migrations
├── public/
│   ├── manifest.webmanifest             # PWA manifest
│   ├── sw.js                            # Service worker
│   └── icons/                           # PWA icons
├── package.json
└── PROJECT_DOCUMENTATION.md
```

## 5. How the Application Works

### 5.1 High-level request/data flow

```text
Public visitor                    Administrator
      │                                  │
      ▼                                  ▼
 Next.js public UI                 /admin (session checked)
      │                                  │
      │ GET /api/public/tenders          ├─ CRUD via protected API routes
      ▼                                  └─ PDF upload via protected API route
 Next.js route handlers                         │
      │                                        ▼
      └──────────────► Supabase REST API + Storage ◄──────────────┘
                              │
                    PostgreSQL tables / public file bucket
```

All Supabase calls are made by server-side Next.js code using `SUPABASE_SERVICE_ROLE_KEY`. The browser does not receive that key and does not call Supabase directly.

### 5.2 Public dashboard flow

1. `src/app/page.tsx` loads in the browser and requests `GET /api/public/tenders` once.
2. The public API queries the `tenders` table, maps database field names to camelCase JSON, and returns all tenders newest-first.
3. The dashboard calculates status dynamically from `dueDate`:
   - `live`: due date is more than 48 hours away.
   - `closing`: due date is within 48 hours.
   - `expired`: due date is in the past.
   - `unknown`: date cannot be parsed.
4. Search matches internal ID, title, organization, and tender number. The UI can filter by organization/status, sort by due date, value, or organization, and paginate at 10 records per page.
5. Selecting a tender opens `TenderDetailView` in `readOnly` mode. Visitors can see mapped tender fields and document links exposed by the public API response.

### 5.3 Admin flow

1. `/admin` runs server-side `isAdminAuthenticated()`. Unauthenticated users are redirected to `/admin/login`.
2. The login page calls `GET /api/admin/status`.
3. If no credential exists, it presents first-time setup; otherwise it presents password login.
4. A successful setup/login sets `govtender_admin_session`, an HTTP-only signed cookie valid for 12 hours.
5. `AdminDashboard` requests protected `GET /api/tenders` and `GET /api/organizations` and lets the admin create/edit records.
6. Every protected API handler independently checks the same session before it performs a data operation.

## 6. Frontend

### 6.1 Pages and routes

| URL | Purpose | Status |
| --- | --- | --- |
| `/` | Main tender dashboard and read-only tender detail modal. | Functional |
| `/about` | Static company/about content. | Present |
| `/admin` | Protected management dashboard. | Functional |
| `/admin/login` | First-run setup and password login. | Functional |
| `/pdf-manager` | Client-side PDF merge, split, and page-arrange utility. | Functional |
| `/tenders/[status]` | Generic status page. | Placeholder/demo cards; not connected to live data |
| `/services/[service]` | Generic service landing page. | Template/static; CTA has no submission logic |
| `/tools/[tool]` | Generic tool landing page. | Placeholder |

The home-page navigation exposes the status, services, and tools routes. Some navigation labels describe planned modules, not necessarily completed functionality.

### 6.2 Main UI components

| Component | Responsibility |
| --- | --- |
| `AdminDashboard` | Admin navigation, record lists, search, record refresh, and editor routing. |
| `NewTenderForm` | Tender creation form; obtains organization choices from the protected organization endpoint. |
| `TenderDetailView` | Tender detail presentation, admin inline editing, confirmation prompt, and PDF upload UI. |
| `NewOrganizationForm` | Organization creation/editing form. |
| `PwaRegister` | Registers the service worker on HTTPS or localhost. |

### 6.3 Design system

`src/app/globals.css` defines light/dark CSS variables for backgrounds, text, borders, primary blue, success green, and destructive red. Tailwind utilities build the interface. `glass-card` and `dropdown-popover` are reusable visual treatments. The root layout provides Geist Sans and Geist Mono fonts and global PWA metadata.

### 6.4 PDF Manager

The PDF Manager uses the browser’s File APIs, `pdf-lib`, and `jszip`:

- **Merge:** combines pages from multiple selected PDFs in user-controlled/sorted order.
- **Split:** extracts one or more page ranges. Multiple resulting PDFs are downloaded as a ZIP.
- **Arrange:** reorders pages and saves a new PDF.

PDF operations and downloads happen locally in the visitor’s browser. This feature is separate from tender-document uploads.

## 7. Backend/API

The backend is implemented as Next.js Route Handlers under `src/app/api`. `src/lib/supabase-server.ts` centralizes server-side REST requests. It injects the Supabase URL/key, disables fetch caching, and throws on non-success responses.

### 7.1 API reference

| Method and path | Auth | Purpose |
| --- | --- | --- |
| `GET /api/public/tenders` | Public | Lists tenders for the public dashboard. |
| `GET /api/tenders` | Admin | Lists tenders including attachment URLs. |
| `POST /api/tenders` | Admin | Creates a tender. Requires the core fields listed below. |
| `PATCH /api/tenders/:id` | Admin | Updates an existing tender by UUID. |
| `GET /api/organizations` | Admin | Lists organizations. |
| `POST /api/organizations` | Admin | Creates an organization. `name` is required. |
| `PATCH /api/organizations` | Admin | Updates an organization; request body includes `_id`. |
| `POST /api/upload` | Admin | Uploads a tender file and creates its attachment metadata. |
| `GET /api/admin/status` | Public | Reports whether initial admin setup is required. |
| `POST /api/admin/setup` | Public, first-run only | Creates the initial password and session. |
| `POST /api/admin/login` | Public | Verifies the password and creates a session. |
| `POST /api/admin/logout` | Public | Clears the session cookie. |

### 7.2 Request mappings

The app API uses camelCase and maps to snake_case PostgreSQL columns.

| API property | Database column |
| --- | --- |
| `_id` | `id` |
| `internalId` | `internal_id` |
| `tenderValue` | `tender_value` |
| `tenderNo` | `tender_no` |
| `portalId` | `portal_id` |
| `emdAmount` | `emd_amount` |
| `publishDate` | `publish_date` |
| `dueDate` | `due_date` |
| `scopeOfWork` | `scope_of_work` |
| `contactPerson` | `contact_person` |
| `contactPhone` | `contact_phone` |
| `contactEmail` | `contact_email` |
| `tenderDocuments` / `corrigendumFiles` | Derived from rows in `attachments` |

### 7.3 Tender creation requirements

`POST /api/tenders` requires these non-empty fields: `internalId`, `title`, `organization`, `tenderValue`, `tenderNo`, `portalId`, `emdAmount`, `publishDate`, and `dueDate`. Optional scope, location, and contact properties are written when supplied.

The form generates IDs in the `GHT-<year>-<four digits>` shape on the client. The database’s unique constraint on `internal_id` is the final duplicate check.

### 7.4 File upload process

1. The admin posts multipart form data containing `file`, `tenderId` (the tender internal ID), and optional `type`.
2. The server resolves the tender UUID from its internal ID.
3. The file is stored in bucket `tender-attachments` at `<tender UUID>/<timestamp>-<sanitized filename>`.
4. The server builds a public storage URL and inserts an `attachments` row.
5. A document is the default type; `type=corrigendum` produces a corrigendum attachment.

The upload UI accepts only `.pdf`, but the route itself does not currently enforce MIME type, extension, or an upload-size limit.

## 8. Authentication and Security

### 8.1 Admin credentials

- The initial password must be at least eight characters.
- The password is salted with 16 random bytes and derived using Node’s `scryptSync` (64-byte result).
- `password_hash` and `password_salt` are stored in `admin_credentials`.
- The password itself is never saved or sent back to the browser.

### 8.2 Session

The session value is `admin.<expiry Unix timestamp>.<HMAC-SHA256 signature>`. Its signature uses `ADMIN_SESSION_SECRET`. It is stored in an HTTP-only cookie with `SameSite=Lax`, path `/`, and a 12-hour maximum age. The Secure flag is enabled in production.

### 8.3 Supabase access boundary

RLS is enabled on all application tables and browser `anon`/`authenticated` roles are revoked from application data and credentials. The app relies on a Supabase **Secret/service-role key** used only by server-side code. The storage bucket is public so a stored document URL can be opened directly; there is no browser write policy.

Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code, commit it to source control, or substitute a publishable/anon key for it.

## 9. Database Design

The schema is defined incrementally in `supabase/migrations`. Apply migrations in filename order.

### 9.1 Entity relationship diagram

```text
admin_credentials
  id (UUID PK)

organizations
  id (UUID PK)
  name
  ...

tenders
  id (UUID PK) ───────────────┐
  internal_id (unique)        │ 1
  organization (text value)   │
  ...                         │
                              │
attachments                   │ many
  id (UUID PK)                │
  tender_id (FK) ─────────────┘
  file_path (unique)
  attachment_type
```

Important: `tenders.organization` is plain text, not a foreign key to `organizations`. The organization table supplies the admin form’s dropdown and directory, but referential integrity is not enforced by PostgreSQL.

### 9.2 `admin_credentials`

| Column | Type | Constraints / role |
| --- | --- | --- |
| `id` | `uuid` | Primary key; defaults to `gen_random_uuid()` |
| `password_hash` | `text` | Required scrypt hash |
| `password_salt` | `text` | Required for current credential lookup |
| `created_at` | `timestamptz` | Defaults to `now()` |
| `updated_at` | `timestamptz` | Defaults to `now()` |

### 9.3 `organizations`

| Column | Type | Constraints / role |
| --- | --- | --- |
| `id` | `uuid` | Primary key; defaults to `gen_random_uuid()` |
| `name` | `text` | Required |
| `details` | `text` | Optional after the `organization_details_optional` migration |
| `contact_person` | `text` | Optional |
| `email` | `text` | Optional |
| `phone` | `text` | Optional |
| `address` | `text` | Optional |
| `created_at`, `updated_at` | `timestamptz` | Default timestamps |

Index: `organizations_created_at_idx (created_at DESC)`.

### 9.4 `tenders`

| Column | Type | Constraints / role |
| --- | --- | --- |
| `id` | `uuid` | Primary key; defaults to `gen_random_uuid()` |
| `internal_id` | `text` | Required and unique |
| `title` | `text` | Required |
| `organization` | `text` | Required; defaults to `PSU` after simplification migration |
| `tender_value` | `numeric` | Required; stored in rupees |
| `tender_no` | `text` | Required |
| `portal_id` | `text` | Required |
| `emd_amount` | `numeric` | Required; stored in rupees |
| `publish_date` | `date` | Required |
| `due_date` | `date` | Required |
| `scope_of_work` | `text` | Optional |
| `location` | `text` | Optional |
| `contact_person` | `text` | Optional |
| `contact_phone` | `text` | Optional |
| `contact_email` | `text` | Optional |
| `created_at`, `updated_at` | `timestamptz` | Default timestamps |

Index: `tenders_created_at_idx (created_at DESC)`.

Earlier migration fields (`category`, `emd_through`, `tender_type`, `form_of_contract`, `corrigendum`) are explicitly removed by `20260819010000_simplify_tenders.sql` and are not part of the final schema.

### 9.5 `attachments`

| Column | Type | Constraints / role |
| --- | --- | --- |
| `id` | `uuid` | Primary key; defaults to `gen_random_uuid()` |
| `tender_id` | `uuid` | Required FK to `tenders(id)`; cascades on tender deletion |
| `file_name` | `text` | Original uploaded filename |
| `file_path` | `text` | Required, unique Supabase Storage object path |
| `file_url` | `text` | Required public object URL |
| `attachment_type` | `text` | Required check: `document` or `corrigendum` |
| `created_at` | `timestamptz` | Defaults to `now()` |

Index: `attachments_tender_id_idx (tender_id)`.

## 10. Environment and Local Setup

### 10.1 Prerequisites

- Node.js version compatible with Next.js 16 (use a current LTS release).
- A Supabase project.
- Supabase Secret key/service-role key and project URL.

### 10.2 Environment variables

Create `.env.local` in the repository root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-secret-or-legacy-service-role-key
ADMIN_SESSION_SECRET=a-long-random-secret-of-at-least-32-bytes
```

`NEXT_PUBLIC_SUPABASE_URL` is intentionally exposed to the browser. The other two variables must remain server-only.

### 10.3 Provision Supabase

Run these migration files in order in the Supabase SQL Editor (or through the Supabase CLI):

1. `20260818000000_admin_access.sql`
2. `20260818010000_admin_data.sql`
3. `20260819000000_organization_details_optional.sql`
4. `20260819010000_simplify_tenders.sql`
5. `20260902000000_tender_extra_fields.sql`

The data migration creates the public `tender-attachments` storage bucket. Ensure the storage API is enabled for the Supabase project.

### 10.4 Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Visit `/admin` to create the first admin password once the environment and migrations are ready.

Available npm scripts:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint with Next.js core-web-vitals and TypeScript rules. |

## 11. PWA and Caching

The root layout registers `/sw.js`. The service worker precaches the home route, manifest, and main icons. It uses:

- Network-first behavior for navigation requests, caching successful page responses and falling back to a cached route/home page offline.
- Cache-first behavior for other same-origin `GET` requests, caching successful basic responses.
- Cache name `govtender-hub-v1`; activation removes older named caches.

API data may be cached by this service worker after the first same-origin request, so an installed/offline client can show stale tender data until its cache is refreshed. Update `CACHE_NAME` when changing offline-cache semantics or deployment assets.

## 12. Current Limitations and Implementation Notes

These are important distinctions between the present code and intended product scope.

1. **Tender edit mapping is incomplete.** `PATCH /api/tenders/:id` writes only core fields (`title`, organization, values, IDs, and dates). It currently does not persist `scopeOfWork`, location, or contact fields when edited in `TenderDetailView`.
2. **Public tender detail does not include attachments.** The public endpoint maps tender fields but does not map attachment rows, so public detail can show tender data but not document links returned by the server. Admin listing does include document URLs.
3. **Status/service/tool pages are not production modules.** Dynamic tender status pages use static sample cards; services and most tools are informational placeholders. Only `/pdf-manager` is a working standalone tool.
4. **No delete endpoints/UI.** Tenders, organizations, and attachments can be created/read/updated but not deleted through the application.
5. **No organization foreign key.** Tender organization names can become stale or differ from directory records because the relationship is text-only.
6. **No server-side input normalization/validation beyond required presence.** The API does not validate numeric ranges, date ordering, email/phone format, or tender ID format. The database does enforce the unique tender internal ID and attachment type check.
7. **Public attachments are deliberately public.** Anyone with a generated storage URL can access a file. Use private storage plus signed URLs if documents must be restricted.
8. **The admin model is a single shared password.** There are no individual accounts, roles, password reset flow, rate limits, audit trail, or CSRF-specific protection beyond same-site cookie behavior.
9. **`updated_at` is application-managed on updates.** The migrations set defaults but do not create a database trigger to update this timestamp automatically.

## 13. Recommended Operational Checklist

- Keep `.env.local` out of version control and rotate any accidentally exposed Secret/service-role key immediately.
- Run all migrations before starting the first admin setup.
- Use a high-entropy `ADMIN_SESSION_SECRET`; changing it invalidates existing admin sessions.
- Test `npm run lint` and `npm run build` before deployment.
- Ensure deployment environment variables are configured server-side.
- Review whether public document URLs are appropriate for the tender material being published.
- Bump the PWA cache name when releasing cache-sensitive frontend changes.

## 14. Primary Source Files

| Concern | Files |
| --- | --- |
| Public dashboard | `src/app/page.tsx`, `src/components/tender-detail-view.tsx` |
| Admin portal | `src/app/admin/page.tsx`, `src/app/admin/login/page.tsx`, `src/components/admin-dashboard.tsx` |
| Create/edit forms | `src/components/new-tender-form.tsx`, `src/components/new-organization-form.tsx` |
| API implementation | `src/app/api/**/route.ts` |
| Authentication | `src/lib/admin-auth.ts` |
| Supabase requests | `src/lib/supabase-server.ts` |
| Schema | `supabase/migrations/*.sql` |
| Global UI/PWA | `src/app/layout.tsx`, `src/app/globals.css`, `public/manifest.webmanifest`, `public/sw.js` |

