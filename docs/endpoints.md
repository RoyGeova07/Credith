# API Endpoints — Credith Service

**Base URL:** `/api`
**Auth:** JWT Bearer token via `Authorization: Bearer <token>` (only on certain endpoints)
**Body format:** JSON
**DB schema:** `cd` (PostgreSQL)

---

## Users (`/api/users`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users` | No | List all users (paginated: `?limit=&offset=`, excludes password) |
| GET | `/api/users/:id` | No | Get user by UUID (excludes password) |
| POST | `/api/users` | No | Register a new user (signup). Validates name/email/password, hashes password, checks duplicate email, returns JWT. |
| PUT | `/api/users/desactivate/:id` | Yes | Soft-deactivate user (`isActive=false`) |
| PUT | `/api/users/activate/:id` | Yes | Reactivate user (`isActive=true`) |
| PUT | `/api/users/update-password` | Yes | Update authenticated user's password (body: `currentPassword`, `newPassword`) |

---

## Companies (`/api/companies`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/companies` | No | List all companies (paginated) |
| GET | `/api/companies/:id` | No | Get company by UUID |
| POST | `/api/companies` | No | Create company (requires `name`, `rtn`; validates duplicate RTN) |
| PUT | `/api/companies/:id` | No | Update company fields |
| DELETE | `/api/companies/:id` | No | Hard-delete a company |

---

## Stores (`/api/stores`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/stores` | No | List all stores (paginated, includes company data) |
| GET | `/api/stores/:id` | No | Get store by UUID |
| POST | `/api/stores` | No | Create store (requires `address` as int, `companyId`) |
| PUT | `/api/stores/:id` | No | Update store fields |
| PUT | `/api/stores/deactivate/:id` | No | Deactivate store (`isActive=false`) |
| PUT | `/api/stores/activate/:id` | No | Activate store (`isActive=true`) |

---

## Products (`/api/products`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/products` | No | List products (paginated, optional `?storeId=` filter) |
| GET | `/api/products/:id` | No | Get product by UUID |
| POST | `/api/products` | No | Create product (name + sellPrice required; links to stores via `stores` array) |
| PUT | `/api/products/:id` | No | Update product fields |
| DELETE | `/api/products/:id` | No | Soft-delete (archive) product |
| POST | `/api/products/:id/recover` | No | Restore soft-deleted product |

---

## Categories (`/api/categories`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/categories` | No | List all categories (ordered by createdAt desc) |
| POST | `/api/categories` | No | Create category (name + description; checks duplicates) |
| PUT | `/api/categories/:categoryId` | No | Update category |
| PATCH | `/api/categories/:categoryId/activate` | No | Activate category |
| PATCH | `/api/categories/:categoryId/deactivate` | No | Deactivate category |

---

## CAIs — Tax Invoice Numbers (`/api/cais`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/cais` | No | List all CAIs (paginated, includes ranges) |
| POST | `/api/cais` | No | Create CAI + initial range; deactivates old active CAIs; validates range overlap |
| DELETE | `/api/cais/:id` | No | Hard-delete CAI + its ranges (transactional) |

---

## CAI Ranges (`/api/cai-ranges`, `/api/cais/:caiId/ranges`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/cai-ranges` | No | List all ranges (paginated, includes parent CAI) |
| GET | `/api/cais/:caiId/ranges` | No | List ranges for a specific CAI |
| GET | `/api/cai-ranges/:id` | No | Get range by UUID |
| POST | `/api/cai-ranges` | No | Create range under active CAI; deactivates old ranges; validates overlap |
| PUT | `/api/cai-ranges/:id` | No | Update range; blocked if bills already exist |
| DELETE | `/api/cai-ranges/:id` | No | Delete range; blocked if bills are associated |

---

## Checkout Machines (`/api/checkout-machines`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/checkout-machines` | No | List all machines (paginated, includes user data) |
| GET | `/api/checkout-machines/:id` | No | Get machine by UUID |
| POST | `/api/checkout-machines` | No | Create machine (machineNumber, name, userId; validates user uniqueness) |
| PUT | `/api/checkout-machines/:id` | No | Update machine fields |
| PUT | `/api/checkout-machines/deactivate/:id` | No | Deactivate machine |
| PUT | `/api/checkout-machines/activate/:id` | No | Activate machine |
| PUT | `/api/checkout-machines/:id/associate-user` | No | Associate user to machine |
| DELETE | `/api/checkout-machines/:id` | No | Hard-delete machine |

---

## Roles (`/api/roles`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/roles` | No | List all roles (paginated, ordered by name ASC) |
| GET | `/api/roles/:id` | No | Get role by UUID |
| POST | `/api/roles` | No | Create role (name must be Employee, Admin, or Owner) |
| POST | `/api/roles/associate-user` | No | Associate role to user (inserts into `users_roles`) |
| PUT | `/api/roles/:id` | No | Update role name/description |
| DELETE | `/api/roles/:id` | No | Hard-delete role |

---

## Clients (`/api/clients`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/clients` | No | List all clients (paginated, ordered by name ASC) |
| GET | `/api/clients/:id` | No | Get client by UUID |
| POST | `/api/clients` | No | Create client (name required; validates unique DNI) |
| PUT | `/api/clients/:id` | No | Update client fields |
| DELETE | `/api/clients/:id` | No | Hard-delete client |

---

## Bills (`/api/bills`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/bills` | No | Create invoice. Complex transactional flow: validates user has checkout machine + store, validates CAI range, increments `currentNumber`, creates bill + details, deducts inventory, creates payment plan (CASH or INSTALLMENT with monthly installments), links to client. |

---

## Payment Plans (`/api/payment-plan`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/payment-plan/:planId/recalculate` | No | Recalculate installment plan with new month count; destroys & recreates monthly payments; blocked if already paid or interest pending |
| POST | `/api/payment-plan/:planId/pay` | No | Make payment from a given month onward; distributes amount; marks plan PAYED if fully covered |
| GET | `/api/payment-plan/pending-payments` | No | List all pending/overdue payments up to current month (with client info) |
| GET | `/api/payment-plan/:dni` | No | Get active payment plan for a client by DNI |

---

## Reports (`/api/reports`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/reports/products` | No | Product performance by company. Params: `companyId` (required), `storeId`, `month`, `year`. Returns qty sold, in-stock, gross/net gain per product per store. |
| GET | `/api/reports/stores` | No | Monthly store report. Params: `storeId`. Returns gross/net gain, employees, operating status. |
| GET | `/api/reports/companies` | No | Monthly company report. Params: `companyId`. Returns aggregated gross/net gain across all active stores. |

---

## Utility

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health-check: `{ message: "Hello from the backend!" }` |
| GET | `/api-docs` | Swagger UI (dev only), auto-generated from JSDoc annotations |

---

## Middleware Summary

| Middleware | Scope | Description |
|------------|-------|-------------|
| LoggerMiddleware | Global (except test) | Logs method, URL, timestamp, status, duration |
| authMiddleware | 3 user routes only | Verifies JWT from `Authorization: Bearer <token>`, attaches `req.user` |
| cors | Global | Allows `http://localhost:5173` |
| express.json() | Global | JSON body parsing |

---

## Key Notes

- No dedicated login endpoint exists — `POST /api/users` (signup) returns a JWT.
- No password-reset flow, only authenticated password update.
- **Soft deletes**: Products, bills. **Hard deletes**: Companies, stores, checkout machines, roles, clients, CAIs, CAI ranges.
- **Soft deactivation** (isActive flag): Users.
- Most endpoints are **unauthenticated** — only 3 user-management routes require auth.
- ENUM values: `payment_type` = `'CASH' | 'INSTALLMENT'`, `status` = `'PAYED' | 'PENDING' | 'OVERDUE'`.
