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
cp .env.example .env   # set VITE_API_URL to your backend, defaults to http://localhost:8080
npm run dev
```

The backend must be running with a non-`local` Spring profile (`dev` or `prod`)
for JWT authentication to actually be enforced — see "Backend issues" below.

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

Base URL: `VITE_API_URL` (e.g. `http://localhost:8080`). Note that **only** the
auth endpoints are prefixed with `/api/v1`; every other controller is mounted
at its own root path (see "Backend issues" #1).

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/v1/register` | public | body `RegisterRequest` → `AuthenticationResponse{token}` |
| POST | `/api/v1/authenticate` | public | body `AuthenticateRequest{email,password}` → `AuthenticationResponse{token}` |
| GET | `/user/me` | auth | current user from the JWT principal |
| GET | `/user/find/{id}` | auth | |
| GET | `/user/findAll?page&size&sort` | auth | |
| PUT | `/user/update/{id}` | auth | body must include `id`; path `{id}` is ignored server-side |
| DELETE | `/user/delete/{id}` | auth | |
| POST/PUT/GET/DELETE | `/equipment/save`, `/update/{id}`, `/find/{id}`, `/findAll?name&status&page&size&sort`, `/delete/{id}` | auth | |
| POST/PUT/GET/DELETE | `/location/save`, `/update/{id}`, `/find/{id}`, `/findAll?name&page&size&sort`, `/delete/{id}` | auth | |
| POST/PUT/GET/DELETE | `/material/save`, `/update/{id}`, `/find/{id}`, `/findAll?fileName&page&size&sort`, `/delete/{id}` | auth | metadata only, see issue #2 |
| POST/PUT/GET/DELETE | `/meter/save`, `/update/{id}`, `/find/{id}`, `/findAll?name&equipmentId&page&size&sort`, `/findByEquipment/{equipmentId}`, `/delete/{id}` | auth | |
| POST/GET/DELETE | `/meter/{meterId}/readings`, `/meter/{meterId}/readings?from&to&page&size&sort`, `/meter/{meterId}/readings/latest`, `/meter/{meterId}/readings/total?from&to`, `/meter/{meterId}/readings/{id}` | auth | `from`/`to` are ISO `LocalDateTime` |
| POST/PUT/GET/DELETE | `/sparePart/save`, `/update/{id}`, `/find/{id}`, `/findAll?name&page&size&sort`, `/delete/{id}` | auth | |
| POST/PUT/GET/PATCH/DELETE | `/task/save`, `/update/{id}`, `/find/{id}`, `/findAll?name&status&page&size&sort`, `/delete/{id}` | auth | |
| POST/PUT/GET/PATCH/DELETE | `/defect/save`, `/update/{id}`, `/find/{id}`, `/findAll?name&equipmentId&defectStatus&page&size&sort`, `/findByEquipment/{equipmentId}`, `/{id}/status?status=`, `/delete/{id}` | auth | see issue #3 |

All list endpoints return Spring's `Page<T>` shape (`content`, `totalElements`,
`totalPages`, `number`, ...). Errors follow `GlobalExceptionHandler`'s shapes:
`{timestamp, status, errors}` for 400 validation errors, `{timestamp, status,
error}` for everything else (404/409/401/500).

## Backend issues found

Per the brief, these are documented rather than silently worked around:

1. **Inconsistent base path.** `AuthenticationController` is the only
   controller mapped under `/api/v1`; every other controller (`/equipment`,
   `/location`, `/task`, ...) has no shared prefix. The frontend's `api/*.ts`
   modules hardcode each path exactly as the backend exposes it.
2. **`Material` has no file transfer endpoint.** The entity stores the actual
   bytes (`Material.data: byte[]`), and `MaterialDto.downloadUrl` exists, but
   no controller method ever populates `downloadUrl` or accepts/streams file
   content. The Materials page therefore manages metadata (file name, content
   type, size, links to a defect/equipment) only — there's no way to actually
   upload or download the underlying file through this API.
   **Suggested backend fix:** add multipart upload (`POST
   /material/{id}/data`) and a byte-streaming download endpoint, and have
   `MaterialServiceImpl` populate `downloadUrl`.
3. **`DefectDto` never exposes `defectStatus`.** The entity has a
   `defectStatus` field, `GET /defect/findAll` accepts a `defectStatus` filter
   that works server-side, and `PATCH /defect/{id}/status` updates it — but
   `DefectMapper` doesn't map the field onto `DefectDto`, so no response body
   (list, find-by-id, or the status-patch response) ever contains a defect's
   current status. The Defect list/detail pages can filter and set status but
   cannot display the current value; this is called out in the UI itself.
   **Suggested backend fix:** add `@Mapping` (implicit, since names match) for
   `defectStatus` in `DefectMapper`, or add it explicitly if MapStruct isn't
   picking it up.
4. **Update endpoints ignore their `{id}` path variable.** `UserController`,
   `EquipmentController`, `LocationController`, `MaterialController`,
   `MeterController`, `SparePartController`, `TaskController`, and
   `DefectController` all take `@PathVariable Long id` on `PUT /update/{id}`
   but never read it — the service layer uses `dto.getId()` from the request
   body instead. Functionally harmless as long as the body's `id` is correct
   (which this frontend always ensures), but the path variable is dead code
   and could mislead API consumers who assume REST conventions.
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
