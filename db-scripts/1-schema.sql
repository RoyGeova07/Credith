CREATE TYPE BILL_TYPE AS ENUM (
    'CASH',
    'INSTALLMENT'
);

CREATE TYPE PAYMENT_STATUS AS ENUM(
    'PAYED',
    'PENDING',
    'OVERDUE'
);

CREATE TABLE IF NOT EXISTS categories(
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS products(
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    buy_price DECIMAL(16,8) DEFAULT 0,
    sell_price DECIMAL(16, 8) CHECK (sell_price >= buy_price),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_product_name ON products(name);

CREATE TABLE IF NOT EXISTS products_categories(
    product_id UUID,
    category_id UUID,
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE IF NOT EXISTS cai(
    cai_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    government_id VARCHAR(75) NOT NULL,
    min_range INTEGER NOT NULL,
    max_range INTEGER NOT NULL,
    expiration_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_cai_gov_id ON cai(government_id);

CREATE TABLE IF NOT EXISTS store(
    store_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rtn VARCHAR(25) NOT NULL,
    address VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS checkout_machine(
    checkout_machine_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL,
    machine_number INTEGER NOT NULL,
    name VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (store_id) REFERENCES store(store_id)
);

CREATE TABLE IF NOT EXISTS bills(
    bill_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(100),
    email VARCHAR(100),
    address VARCHAR(255),
    customer_name VARCHAR(100),
    customer_rtn VARCHAR(25),
    store_id UUID NOT NULL,
    bill_number INTEGER,
    cai_id UUID NOT NULL,
    checkout_machine_id UUID NOT NULL,
    creation_date TIMESTAMPTZ,
    limit_date TIMESTAMPTZ,
    bill_type BILL_TYPE,
    taxes_percentage SMALLINT CHECK(taxes_percentage >= 0 and taxes_percentage <= 100),
    taxes_amount DECIMAL(18,6) DEFAULT 0 CHECK (taxes_amount >= 0),
    discount_percentage SMALLINT CHECK(discount_percentage >= 0 and discount_percentage <= 100),
    discounted_amount DECIMAL(18,6) DEFAULT 0 CHECK (discounted_amount >= 0),
    exonerated DECIMAL(18,6) DEFAULT 0 CHECK (exonerated >= 0),
    exempt DECIMAL(18,6) DEFAULT 0 CHECK (exempt >= 0),
    subtotal DECIMAL(18,6) CHECK (subtotal > 0),
    total DECIMAL(18,6) CHECK (total > 0),
    is_active BOOLEAN,
    FOREIGN KEY (store_id) REFERENCES store(store_id),
    FOREIGN KEY (cai_id) REFERENCES cai(cai_id),
    FOREIGN KEY (checkout_machine_id) REFERENCES checkout_machine(checkout_machine_id)
);

CREATE TABLE IF NOT EXISTS bills_payment_plan(
    bill_payment_plan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id UUID NOT NULL,

    initial_payment DECIMAL(18, 6) CHECK(initial_payment >= 0) DEFAULT 0,
    total_to_pay DECIMAL(18, 6) CHECK (total_to_pay >= 0),
    payed_amount DECIMAL(18, 6) CHECK(payed_amount >= 0) DEFAULT 0,

    months_to_pay SMALLINT CHECK (months_to_pay >= 0) DEFAULT 1,
    payment_day SMALLINT CHECK (payment_day >= 0 and payment_day <= 31),
    interest_rate SMALLINT NOT NULL CHECK (interest_rate >= 0 and interest_rate <= 100) DEFAULT 0,
    creation_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_payment_time TIMESTAMPTZ,

    status PAYMENT_STATUS,

    FOREIGN KEY (bill_id) REFERENCES bills(bill_id)
);

CREATE TABLE IF NOT EXISTS monthly_payments(
    monthly_payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_payment_plan_id UUID NOT NULL,

    payment_amount DECIMAL(18,6),
    interest_to_pay DECIMAL(18,6),
    payment_deadline TIMESTAMPTZ,

    payed_amount DECIMAL(18,6),
    is_payed BOOLEAN,

    FOREIGN KEY (bill_payment_plan_id) REFERENCES bills_payment_plan(bill_payment_plan_id)
);

CREATE TABLE IF NOT EXISTS bill_details(
    bill_detail_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL,
    bill_id UUID NOT NULL,
    quantity INTEGER CHECK (quantity > 0) DEFAULT 1,
    sell_price DECIMAL(18,6) NOT NULL CHECK (sell_price >= 0),
    discount_percentage INTEGER CHECK (discount_percentage >= 0 and discount_percentage <= 100),
    total DECIMAL(18,6) CHECK (total >= 0),
    FOREIGN KEY (bill_id) REFERENCES bills(bill_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE IF NOT EXISTS roles(
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_name VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS users(
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(255),
    is_active BOOLEAN
);

CREATE INDEX idx_users_names ON users(name);
CREATE INDEX idx_users_emails ON users(email);

CREATE TABLE IF NOT EXISTS users_roles(
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);
