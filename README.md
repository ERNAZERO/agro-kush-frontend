# AgroKush Frontend

React + TypeScript + Vite client for the AgroKush Spring Boot backend
(`AgroKushProject`). Built directly against the backend's controllers, DTOs and
entities — no mock data, no invented endpoints.

## Stack

- React 19 + TypeScript (strict mode) + Vite
- React Router 7 for routing and protected routes
- TanStack Query 5 for server state (caching, loading/error states, cache invalidation on mutations)
- Axios for the HTTP layer, with a request interceptor that attaches the JWT and a response interceptor that logs the user out on 401
- Tailwind CSS v4 for styling (white / green / dark-grey palette)

## Getting started

```bash
npm install
cp .env.example .env   # leave VITE_API_URL empty: the dev server proxies /api itself
npm run dev
```

This expects the backend on `http://localhost:8080` — either `docker compose up`
in `AgroKushProject` (which binds it to loopback) or `./mvnw spring-boot:run`
there. It must run with a non-`local` Spring profile (`dev` or `prod`) for JWT
authentication to actually be enforced — see "Backend issues" below.

## Docker

This repository builds an image but does not define a stack of its own: the SPA
is useless without the API, and nginx proxies to a `backend` service that only
exists in the other compose network. The full stack lives in `AgroKushProject`'s
`docker-compose.yml`, with this repository checked out next to it:

```bash
docker compose up --build
```

That serves the app on <http://localhost:3000> and proxies everything under
`/api/` to the backend, so the browser only ever talks to one origin.

Notes:

- The image is built with an **empty** `VITE_API_URL`, so the bundle uses
  relative paths and the same image works in every environment. The backend's
  address is proxy configuration, not a build input. Set `VITE_API_URL` to an
  absolute URL only if you deliberately want cross-origin calls — and remember
  Vite inlines it at build time, so changing it needs a rebuild, not a restart.
- `nginx.conf` forwards `/api/` to `backend:8080` unchanged (no prefix
  rewriting: the backend already serves `/api/v1/...`). No SPA route starts with
  `/api`, so pages and API paths never collide.
- Unknown paths fall back to `index.html` so react-router deep links survive a
  refresh; hashed files under `/assets/` get a one-year immutable cache and
  `index.html` gets `no-cache`.
- `npm run dev` mirrors this through Vite's own proxy (`vite.config.ts`), which
  forwards `/api` to `http://localhost:8080`. Dev and production behave the same.

## Project structure

```
src/
├── api/            # axios client + one module per resource (typed requests, react-query hooks)
├── components/
│   ├── common/     # Button, Input, Select, TextArea, Table, Pagination, Modal, ConfirmDialog, ...
│   └── layout/     # Navbar, Sidebar, AppLayout
├── context/        # AuthContext (login/register/logout/current user)
├── hooks/          # useAuth, useDebouncedValue
├── pages/          # one folder per entity (list/detail/form pages)
├── routes/         # router.tsx, ProtectedRoute
├── types/          # dto.ts, enums.ts, api.ts (Page<T>, error shapes) — mirror the backend exactly
└── utils/          # apiError.ts, pageParams.ts, format.ts
```

## API map

Base URL: `VITE_API_URL` — `http://localhost:8080` when calling the backend
cross-origin, or **empty** when the API is proxied under the same origin (paths
below already start with `/api/v1`, so no extra prefix is needed). Each
resource is a collection with the same five operations — shown here for
`equipment`, identical for `locations`, `materials`, `spare-parts`, `tasks`,
`meters`, `defects` and `users`:

| Method | Path | Notes |
|---|---|---|
| POST | `/api/v1/equipment` | create → 201 |
| GET | `/api/v1/equipment` | list → `Page<T>`, plus this collection's filters |
| GET | `/api/v1/equipment/{id}` | read one |
| PUT | `/api/v1/equipment/{id}` | replace; the path `{id}` wins over the body |
| DELETE | `/api/v1/equipment/{id}` | → 204 |

Filters accepted by each collection `GET` (always alongside `page`, `size`, `sort`):

| Collection | Filters |
|---|---|
| `/api/v1/equipment` | `name`, `status` |
| `/api/v1/locations` | `name` |
| `/api/v1/materials` | `fileName` — metadata only, see issue #2 |
| `/api/v1/spare-parts` | `name` |
| `/api/v1/tasks` | `name`, `status` |
| `/api/v1/meters` | `name`, `equipmentId` |
| `/api/v1/defects` | `name`, `equipmentId`, `defectStatus` — see issue #3 |
| `/api/v1/users` | none; no create endpoint exists |

Everything outside that pattern:

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/v1/register` | public | `RegisterRequest` → `AuthenticationResponse{token}` |
| POST | `/api/v1/authenticate` | public | `AuthenticateRequest{email,password}` → `{token}` |
| GET | `/api/v1/users/me` | auth | current user from the JWT principal |
| GET | `/api/v1/equipment/{id}/meters` | auth | `List<MeterDto>` |
| GET | `/api/v1/equipment/{id}/defects` | auth | `List<DefectDto>` |
| PATCH | `/api/v1/defects/{id}/status?status=` | auth | see issue #3 |
| POST | `/api/v1/meters/{meterId}/readings` | auth | body carries no `meterId` — the path does |
| GET | `/api/v1/meters/{meterId}/readings?from&to&page&size&sort` | auth | `from`/`to` are ISO `LocalDateTime` |
| GET | `/api/v1/meters/{meterId}/readings/latest` | auth | |
| GET | `/api/v1/meters/{meterId}/readings/total?from&to` | auth | |
| DELETE | `/api/v1/meters/{meterId}/readings/{id}` | auth | |

All list endpoints return Spring's `Page<T>` shape (`content`, `totalElements`,
`totalPages`, `number`, ...). Errors follow `GlobalExceptionHandler`'s shapes:
`{timestamp, status, errors}` for 400 validation errors, `{timestamp, status,
error}` for everything else (404/409/401/500).

## Backend issues found

Per the brief, these are documented rather than silently worked around:

1. ~~**Inconsistent base path.**~~ Fixed: every controller now sits under
   `/api/v1` with REST-shaped collection paths, so `api/*.ts` no longer has to
   special-case the auth endpoints.
2. **`Material` has no file transfer endpoint.** The entity stores the actual
   bytes (`Material.data: byte[]`), and `MaterialDto.downloadUrl` exists, but
   no controller method ever populates `downloadUrl` or accepts/streams file
   content. The Materials page therefore manages metadata (file name, content
   type, size, links to a defect/equipment) only — there's no way to actually
   upload or download the underlying file through this API.
   **Suggested backend fix:** add multipart upload (`POST
   /api/v1/materials/{id}/data`) and a byte-streaming download endpoint, and have
   `MaterialServiceImpl` populate `downloadUrl`.
3. **`DefectDto` never exposes `defectStatus`.** The entity has a
   `defectStatus` field, `GET /api/v1/defects` accepts a `defectStatus` filter
   that works server-side, and `PATCH /api/v1/defects/{id}/status` updates it — but
   `DefectMapper` doesn't map the field onto `DefectDto`, so no response body
   (list, find-by-id, or the status-patch response) ever contains a defect's
   current status. The Defect list/detail pages can filter and set status but
   cannot display the current value; this is called out in the UI itself.
   **Suggested backend fix:** add `@Mapping` (implicit, since names match) for
   `defectStatus` in `DefectMapper`, or add it explicitly if MapStruct isn't
   picking it up.
4. ~~**Update endpoints ignore their `{id}` path variable.**~~ Fixed: every
   `PUT /api/v1/<collection>/{id}` now copies the path id onto the body before
   the service runs, so the URL is the authoritative identifier.

5. **`RegisterRequest.username` is collected but discarded.** The register
   form requires a `username`, but `AuthenticationService.register()` never
   reads it and the `User` entity has no `username` column — only
   `email`/`firstName`/`lastName` are persisted. The frontend still collects
   it (required by validation) but it has no effect after registration.
6. **`spring.profiles.active=local` is the default profile**
   (`application.properties`), which activates `LocalSecurityConfig` —
   `.anyRequest().permitAll()` — meaning **authentication is not enforced at
   all** unless the backend is started with `dev` or `prod` active. The
   frontend always sends the JWT and handles 401s, so it works correctly
   either way, but don't be surprised if unauthenticated requests succeed
   against a default-profile local backend.
7. **`RecordNotFoundException` is unused dead code.** `GlobalExceptionHandler`
   has a handler for it, but no service ever throws it — every "not found"
   case throws `ResponseStatusException(NOT_FOUND, ...)` instead, which is
   also handled. No frontend impact, just noted for completeness.

## What's implemented

Every controller/endpoint above has a corresponding page and `react-query`
hook. Auth (register/login/logout, JWT persisted in `localStorage`, protected
routes, 401 → auto-logout), full CRUD for Equipment, Location, Meter (+ nested
readings: add/list/latest/total-by-period/delete), SparePart, Task, Defect
(+ status update), Material (metadata), and read/edit/delete for Users
(no create — the backend has no admin-create-user endpoint). Every list view
has loading/error/empty states and pagination; every delete requires
confirmation; every form shows field-level and request-level errors.
