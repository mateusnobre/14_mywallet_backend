CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    client_id INTEGER,
    "value" FLOAT,
    comment TEXT,
    created_at timestamp
)