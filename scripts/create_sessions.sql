CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    client_id INTEGER,
    token TEXT,
    created_at timestamp
)