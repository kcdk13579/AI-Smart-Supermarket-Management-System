## Database Tables and Relationships

This document describes the PostgreSQL tables used by the Smart Supermarket backend and how they relate to each other.  
These tables back the APIs used by the React frontend (trolleys, cart items, alerts, sales, users, and products).

---

## 1. `users` table

**Purpose**: Store all user accounts (both admins and customers).

- **Key columns**
  - `id` (BIGSERIAL, PK): Auto-generated primary key.
  - `name` (VARCHAR): Full name of the user.
  - `email` (VARCHAR, NOT NULL, UNIQUE): Login email.
  - `password` (VARCHAR): Encrypted password.
  - `role` (VARCHAR): `ROLE_ADMIN` or `ROLE_CUSTOMER`.

- **Relations**
  - **1 user → many trolleys**  
    - Foreign key: `trolleys.customer_id` → `users.id`
    - Meaning: A single customer can have multiple trolleys over time (different shopping sessions).
  - **1 user → many sales**  
    - Foreign key: `sales.customer_id` → `users.id`
    - Meaning: A customer can have many completed sales/transactions.

---

## 2. `products` table

**Purpose**: Master catalog of all products that can be scanned into a trolley.

- **Key columns**
  - `id` (BIGSERIAL, PK): Auto-generated primary key.
  - `barcode` (VARCHAR, NOT NULL): Product barcode used for scanning.
  - `name` (VARCHAR, NOT NULL): Product name.
  - `price` (DOUBLE PRECISION, NOT NULL): Unit price.
  - `weight` (INTEGER, NOT NULL): Product weight in grams.
  - `category` (VARCHAR, nullable): Optional product category.
  - `imageurl` (VARCHAR, nullable): Optional product image URL.

- **Relations**
  - **1 product → many cart items**  
    - Foreign key: `cart_items.product_id` → `products.id`
    - Meaning: A product can appear in many different carts/trolleys as separate cart items.

---

## 3. `trolleys` table

**Purpose**: Represent each smart trolley session in the store.  
Backs `/api/trolleys`, `/api/trolleys/{id}`, and the trolley portion of `/api/customer/me`.

- **Key columns**
  - `id` (BIGSERIAL, PK): Auto-generated primary key.
  - `status` (VARCHAR, NOT NULL): Trolley status, e.g. `active`, `inactive`, `payment_pending`, `completed`.
  - `customer_id` (BIGINT, FK, nullable): References `users.id`. Current customer using the trolley.
  - `total_amount` (DOUBLE PRECISION, NOT NULL, default 0): Current running total for the trolley.
  - `weight_verified` (BOOLEAN, NOT NULL, default FALSE): Whether the weight check at the gate has passed.
  - `last_activity` (TIMESTAMP, NOT NULL): Last time the trolley was updated (scan, alert, etc.).

- **Relations**
  - **Many trolleys → one user**
    - Foreign key: `trolleys.customer_id` → `users.id`
    - Meaning: A user can own or use multiple trolleys over time.
  - **1 trolley → many cart items**
    - Foreign key: `cart_items.trolley_id` → `trolleys.id`
    - Meaning: All scan events (items added/removed) for this trolley are stored as cart items.
  - **1 trolley → many alerts**
    - Foreign key: `alerts.trolley_id` → `trolleys.id`
    - Meaning: Any alerts (e.g. weight mismatch, unpaid exit) related to this trolley are linked here.
  - **1 trolley → many sales**
    - Foreign key: `sales.trolley_id` → `trolleys.id`
    - Meaning: One trolley session can be associated with one or more sales records (depending on how checkout is implemented).

---

## 4. `cart_items` table

**Purpose**: Track every product scan event that occurs inside a trolley.  
Backs the `items` / `cartItems` arrays returned to the frontend.

- **Key columns**
  - `id` (BIGSERIAL, PK): Auto-generated primary key.
  - `trolley_id` (BIGINT, FK, NOT NULL): References `trolleys.id`. The trolley this item belongs to.
  - `product_id` (BIGINT, FK, NOT NULL): References `products.id`. The product that was scanned.
  - `status` (VARCHAR, NOT NULL): `added` or `removed`, indicating whether the item is currently in the trolley.
  - `scanned_at` (TIMESTAMP, NOT NULL): When the product was scanned.

- **Relations**
  - **Many cart items → one trolley**
    - Foreign key: `cart_items.trolley_id` → `trolleys.id`
    - Meaning: A trolley can have many cart items; they form the detailed contents of the trolley.
  - **Many cart items → one product**
    - Foreign key: `cart_items.product_id` → `products.id`
    - Meaning: Each cart item refers to exactly one product from the catalog.

This table essentially stores line items for the trolley, with history via `status` and `scanned_at`.

---

## 5. `alerts` table

**Purpose**: Store system alerts related to trolleys and store operations.  
Backs `/api/alerts` and `/api/alerts/{id}/resolve`.

- **Key columns**
  - `id` (BIGSERIAL, PK): Auto-generated primary key.
  - `type` (VARCHAR, NOT NULL): Alert type, e.g. `weight_mismatch`, `unpaid_exit`, `system`.
  - `trolley_id` (BIGINT, FK, nullable): References `trolleys.id`. The trolley this alert is associated with (if any).
  - `message` (VARCHAR, NOT NULL): Human-readable alert message.
  - `severity` (VARCHAR, NOT NULL): `low`, `medium`, or `high`.
  - `timestamp` (TIMESTAMP, NOT NULL): When the alert was raised.
  - `resolved` (BOOLEAN, NOT NULL, default FALSE): Whether the alert has been resolved.

- **Relations**
  - **Many alerts → one trolley**
    - Foreign key: `alerts.trolley_id` → `trolleys.id`
    - Meaning: A trolley can have multiple alerts (e.g. multiple weight mismatch events).

This table allows the admin UI to display active and historical alerts and to mark them as resolved.

---

## 6. `sales` table

**Purpose**: Represent completed sales transactions for reporting and dashboard statistics.  
Backs `/api/sales` and is used to compute `SalesData` and dashboard KPIs.

- **Key columns**
  - `id` (BIGSERIAL, PK): Auto-generated primary key.
  - `trolley_id` (BIGINT, FK, nullable): References `trolleys.id`. Trolley session that produced this sale.
  - `customer_id` (BIGINT, FK, nullable): References `users.id`. Customer who made the purchase.
  - `date` (DATE, NOT NULL): Business date of the sale (used for aggregating per day).
  - `total_amount` (DOUBLE PRECISION, NOT NULL): Total amount of the sale.

- **Relations**
  - **Many sales → one user**
    - Foreign key: `sales.customer_id` → `users.id`
    - Meaning: A user can have many separate sales over time.
  - **Many sales → one trolley**
    - Foreign key: `sales.trolley_id` → `trolleys.id`
    - Meaning: A trolley session can be linked to one or more sales records.

---

## 7. High-level ER overview

At a high level, the relationships between the entities are:

- **User – Trolley**: `User (1) — (N) Trolley` via `trolleys.customer_id`
- **User – Sale**: `User (1) — (N) Sale` via `sales.customer_id`
- **Trolley – CartItem**: `Trolley (1) — (N) CartItem` via `cart_items.trolley_id`
- **Product – CartItem**: `Product (1) — (N) CartItem` via `cart_items.product_id`
- **Trolley – Alert**: `Trolley (1) — (N) Alert` via `alerts.trolley_id`
- **Trolley – Sale**: `Trolley (1) — (N) Sale` via `sales.trolley_id`

This schema allows the frontend to:

- Show active trolleys and their items.
- Show customer-specific trolley and cart information.
- Track alerts related to each trolley.
- Aggregate sales per day and per customer for dashboards and reports.

