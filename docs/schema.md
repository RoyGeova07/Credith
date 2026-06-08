# Database Schema — `cd` Schema (Credith)

## Schema: `cd`

---

## Table: `companies`
| Column | Type | Constraints |
|---|---|---|
| company_id | UUID | PK, default UUIDV4 |
| name | STRING(100) | nullable |
| rtn | STRING(25) | NOT NULL |
| email | STRING(100) | nullable |
| address | STRING | nullable |
| created_at | DATE | NOT NULL, default CURRENT_TIMESTAMP |
| updated_at | DATE | NOT NULL, default CURRENT_TIMESTAMP |
| deleted_at | DATE | nullable (soft delete) |

**Indexes:**
- `idx_company_name` on `name`
- `idx_company_email` on `email`
- `idx_company_rtn` on `rtn`

---

## Table: `stores`
| Column | Type | Constraints |
|---|---|---|
| store_id | UUID | PK, default UUIDV4 |
| address | INTEGER | NOT NULL |
| is_active | BOOLEAN | default true |
| company_id | UUID | FK → companies.company_id |
| created_at | DATE | NOT NULL, default CURRENT_TIMESTAMP |
| updated_at | DATE | NOT NULL, default CURRENT_TIMESTAMP |
| deleted_at | DATE | nullable (soft delete) |

---

## Table: `users`
| Column | Type | Constraints |
|---|---|---|
| user_id | UUID | PK, default UUIDV4 |
| first_name | STRING(100) | NOT NULL |
| second_name | STRING(100) | NOT NULL |
| first_last_name | STRING(100) | NOT NULL |
| second_last_name | STRING(100) | NOT NULL |
| email | STRING(100) | nullable |
| password | STRING | nullable |
| is_active | BOOLEAN | default true |
| store_id | UUID | FK → stores.store_id |
| created_at | DATE | nullable |
| updated_at | DATE | nullable |
| deleted_at | DATE | nullable (soft delete) |

**Indexes:**
- `idx_user_email_unique` UNIQUE on `email`

---

## Table: `roles`
| Column | Type | Constraints |
|---|---|---|
| role_id | UUID | PK, default UUIDV4 |
| name | STRING(50) | NOT NULL |
| description | STRING | nullable |
| deleted_at | DATE | nullable (soft delete) |

**Indexes:**
- `idx_role_name_unique` UNIQUE on `name`

---

## Junction Table: `users_roles`
Many-to-many between users and roles.

| Column | Type | Constraints |
|---|---|---|
| user_id | UUID | NOT NULL, FK → users.user_id, ON DELETE CASCADE, ON UPDATE CASCADE |
| role_id | UUID | NOT NULL, FK → roles.role_id, ON DELETE CASCADE, ON UPDATE CASCADE |

---

## Table: `products`
| Column | Type | Constraints |
|---|---|---|
| product_id | UUID | PK, default UUIDV4 |
| name | STRING | NOT NULL |
| image_url | STRING | nullable |
| description | STRING | NOT NULL |
| buy_price | DECIMAL(16,8) | default 0 |
| sell_price | DECIMAL(16,8) | NOT NULL |
| min_gain_percentage | SMALLINT | nullable |
| is_active | BOOLEAN | default true |
| created_at | DATE | NOT NULL, default CURRENT_TIMESTAMP |
| updated_at | DATE | NOT NULL, default CURRENT_TIMESTAMP |
| deleted_at | DATE | nullable (soft delete) |

**Indexes:**
- `idx_product_name_unique` on `name`

---

## Table: `categories`
| Column | Type | Constraints |
|---|---|---|
| category_id | UUID | PK, default UUIDV4 |
| name | STRING | NOT NULL |
| description | STRING | NOT NULL |
| is_active | BOOLEAN | default true |
| created_at | DATE | NOT NULL, default CURRENT_TIMESTAMP |
| updated_at | DATE | NOT NULL, default CURRENT_TIMESTAMP |
| deleted_at | DATE | nullable (soft delete) |

**Indexes:**
- `idx_category_name_unique` on `name`

---

## Junction Table: `products_categories`
Many-to-many between products and categories.

| Column | Type | Constraints |
|---|---|---|
| product_id | UUID | NOT NULL, FK → products.product_id, ON DELETE CASCADE, ON UPDATE CASCADE |
| category_id | UUID | NOT NULL, FK → categories.category_id, ON DELETE CASCADE, ON UPDATE CASCADE |

---

## Junction Table: `stores_inventories`
Many-to-many between stores and products (with stock count).

| Column | Type | Constraints |
|---|---|---|
| product_id | UUID | NOT NULL, FK → products.product_id, ON DELETE CASCADE, ON UPDATE CASCADE |
| store_id | UUID | NOT NULL, FK → stores.store_id, ON DELETE CASCADE, ON UPDATE CASCADE |
| in_stock | INTEGER | NOT NULL, default 1 |

---

## Table: `cais`
(CAI = government-authorized tax invoice numbers)

| Column | Type | Constraints |
|---|---|---|
| cai_id | UUID | PK, default UUIDV4 |
| government_id | STRING(75) | NOT NULL |
| expiration_date | DATE | NOT NULL |
| is_active | BOOLEAN | default true |
| created_at | DATE | NOT NULL, default CURRENT_TIMESTAMP |
| updated_at | DATE | NOT NULL, default CURRENT_TIMESTAMP |
| deleted_at | DATE | nullable (soft delete) |

**Indexes:**
- `idx_cais_government_id_unique` UNIQUE on `government_id`

---

## Table: `cai_ranges`
(Each CAI has a range of bill numbers)

| Column | Type | Constraints |
|---|---|---|
| cai_range_id | UUID | PK, default UUIDV4 |
| min_range | INTEGER | NOT NULL |
| max_range | INTEGER | NOT NULL |
| current_number | INTEGER | NOT NULL, default 0 |
| expiration_date | DATE | NOT NULL |
| is_active | BOOLEAN | default true |
| cai_id | UUID | FK → cais.cai_id |
| created_at | DATE | NOT NULL, default CURRENT_TIMESTAMP |
| updated_at | DATE | NOT NULL, default CURRENT_TIMESTAMP |
| deleted_at | DATE | nullable (soft delete) |

**Indexes:**
- `idx_cai_ranges_expiration_date` on `expiration_date`

---

## Table: `checkout_machines`
| Column | Type | Constraints |
|---|---|---|
| checkout_machine_id | UUID | PK, default UUIDV4 |
| machine_number | INTEGER | nullable |
| name | STRING(50) | nullable |
| is_active | BOOLEAN | default true |
| user_id | UUID | FK → users.user_id |
| created_at | DATE | NOT NULL, default CURRENT_TIMESTAMP |
| updated_at | DATE | NOT NULL, default CURRENT_TIMESTAMP |
| deleted_at | DATE | nullable (soft delete) |

**Indexes:**
- `idx_checkout_machine_number` on `machine_number`
- `idx_checkout_machine_name` on `name`

---

## Table: `clients`
| Column | Type | Constraints |
|---|---|---|
| client_id | UUID | PK, default UUIDV4 |
| name | STRING | NOT NULL |
| dni | STRING(25) | nullable |
| phone | STRING(25) | nullable |
| address | STRING | nullable |
| is_active | BOOLEAN | default true |
| created_at | DATE | NOT NULL, default CURRENT_TIMESTAMP |
| updated_at | DATE | NOT NULL, default CURRENT_TIMESTAMP |
| deleted_at | DATE | nullable (soft delete) |

**Indexes:**
- `idx_client_dni_unique` UNIQUE on `dni`

---

## Table: `bills`
| Column | Type | Constraints |
|---|---|---|
| bill_id | UUID | PK, default UUIDV4 |
| bill_number | INTEGER | nullable |
| created_at | DATE | nullable |
| limit_date | DATEONLY | nullable |
| company_name | STRING(100) | nullable |
| company_rtn | STRING(25) | nullable |
| company_email | STRING(100) | nullable |
| company_address | STRING | nullable |
| checkout_machine_number | INTEGER | nullable |
| checkout_machine_name | STRING(50) | nullable |
| cashier_name | STRING(50) | nullable |
| customer_name | STRING(100) | nullable |
| customer_phone | STRING(25) | nullable |
| customer_address | STRING | nullable |
| payment_type | ENUM('CASH', 'INSTALLMENT') | nullable |
| isv15_amount | DECIMAL(18,6) | nullable |
| isv18_amount | DECIMAL(18,6) | nullable |
| discount_percentage | SMALLINT | nullable |
| discount_amount | DECIMAL(18,6) | nullable |
| exonerated | DECIMAL(18,6) | nullable |
| exempt | DECIMAL(18,6) | nullable |
| subtotal | DECIMAL(18,6) | nullable |
| total | DECIMAL(18,6) | nullable |
| cai_range_id | UUID | FK → cai_ranges.cai_range_id |
| store_id | UUID | FK → stores.store_id |
| user_id | UUID | FK → users.user_id |
| updated_at | DATE | NOT NULL, default CURRENT_TIMESTAMP |
| deleted_at | DATE | nullable (soft delete) |

---

## Table: `bill_details`
(Line items for each bill)

| Column | Type | Constraints |
|---|---|---|
| bill_detail_id | UUID | PK, default UUIDV4 |
| quantity | INTEGER | default 1 |
| sell_price | DECIMAL(18,6) | NOT NULL |
| discount_percentage | SMALLINT | default 0 |
| discount_amount | DECIMAL(18,6) | default 0 |
| total | DECIMAL(18,6) | nullable |
| product_id | UUID | FK → products.product_id |
| bill_id | UUID | FK → bills.bill_id |
| created_at | DATE | NOT NULL, default CURRENT_TIMESTAMP |
| updated_at | DATE | NOT NULL, default CURRENT_TIMESTAMP |
| deleted_at | DATE | nullable (soft delete) |

---

## Table: `bill_payment_plans`
(Installment plan for a bill paid over time)

| Column | Type | Constraints |
|---|---|---|
| bill_payment_plan_id | UUID | PK, default UUIDV4 |
| total_to_pay | DECIMAL(18,6) | NOT NULL |
| payed_amount | DECIMAL(18,6) | default 0 |
| starting_date | DATE | nullable |
| months_to_pay | INTEGER | nullable |
| payment_day | SMALLINT | nullable |
| interest_rate | SMALLINT | NOT NULL, default 0 |
| created_at | DATE | NOT NULL |
| last_payment_time | DATE | nullable |
| status | ENUM('PAYED', 'PENDING', 'OVERDUE') | nullable |
| bill_id | UUID | FK → bills.bill_id |
| updated_at | DATE | NOT NULL, default CURRENT_TIMESTAMP |
| deleted_at | DATE | nullable (soft delete) |

---

## Junction Table: `clients_payment_plans`
Many-to-many between clients and bill_payment_plans.

| Column | Type | Constraints |
|---|---|---|
| bill_payment_plan_id | UUID | NOT NULL, FK → bill_payment_plans.bill_payment_plan_id, ON DELETE CASCADE, ON UPDATE CASCADE |
| client_id | UUID | NOT NULL, FK → clients.client_id, ON DELETE CASCADE, ON UPDATE CASCADE |

---

## Table: `monthly_payments`
(Individual monthly installments within a payment plan)

| Column | Type | Constraints |
|---|---|---|
| monthly_payment_id | UUID | PK, default UUIDV4 |
| payment_amount | DECIMAL(18,6) | NOT NULL |
| interest_to_pay | DECIMAL(18,6) | nullable |
| payment_deadline | DATE | nullable |
| payed_amount | DECIMAL(18,6) | default 0 |
| is_payed | BOOLEAN | default false |
| bill_payment_plan_id | UUID | FK → bill_payment_plans.bill_payment_plan_id |
| created_at | DATE | NOT NULL, default CURRENT_TIMESTAMP |
| updated_at | DATE | NOT NULL, default CURRENT_TIMESTAMP |
| deleted_at | DATE | nullable (soft delete) |

---

## Entity Relationship Summary

```
companies ──< stores ──< users
                            │
                     checkout_machines
                    
products ──< products_categories >── categories
stores ──< stores_inventories >── products

cais ──< cai_ranges ──< bills
stores ──< bills
users ──< bills

bills ──< bill_details >── products
bills ──< bill_payment_plans
bill_payment_plans ──< monthly_payments
bill_payment_plans ──< clients_payment_plans >── clients

users ──< users_roles >── roles
```

### Notes
- All tables use UUID primary keys and soft deletes (`deleted_at`).
- `created_at` and `updated_at` use `CURRENT_TIMESTAMP` defaults.
- Schema name is `cd`.
- ENUM types: `bills.payment_type` ('CASH', 'INSTALLMENT'), `bill_payment_plans.status` ('PAYED', 'PENDING', 'OVERDUE').
