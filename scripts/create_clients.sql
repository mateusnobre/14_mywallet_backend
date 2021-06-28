CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    "name" text,
    email text,
    "password" text,
    created_at timestamp
)