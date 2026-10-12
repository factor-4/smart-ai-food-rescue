CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    bag_id BIGINT NOT NULL,
    restaurant_id BIGINT,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price NUMERIC(38,2) NOT NULL,
    status VARCHAR(255) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT orders_status_check CHECK (
        status IN ('PENDING','RESERVED','PAID','CONFIRMED','FAILED','CANCELLING','REJECTED','READY','PICKED_UP')
    )
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);