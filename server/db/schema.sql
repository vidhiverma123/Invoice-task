CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255),
    expire_token TIMESTAMP
);

CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    phone_number VARCHAR(255),
    business_name VARCHAR(255),
    contact_address TEXT,
    logo TEXT,
    website VARCHAR(255),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(255),
    address TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    due_date TIMESTAMP,
    currency VARCHAR(10),
    items JSONB,
    rates VARCHAR(255),
    vat NUMERIC,
    total NUMERIC,
    sub_total NUMERIC,
    notes TEXT,
    status VARCHAR(50),
    invoice_number VARCHAR(255),
    type VARCHAR(50),
    creator INTEGER REFERENCES users(id),
    total_amount_received NUMERIC,
    client JSONB,
    payment_records JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);