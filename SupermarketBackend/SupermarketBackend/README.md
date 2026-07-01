# Auth Service (Backend)

Backend for the SmartMart smart trolley system: authentication (JWT), user management, product CRUD, and stub APIs for dashboard, trolleys, alerts, and sales.

## Tech Stack

- **Java 17**
- **Spring Boot 3.2**
- **Spring Security** (JWT)
- **Spring Data JPA**
- **PostgreSQL**
- **Maven**

## Prerequisites

- JDK 17+
- Maven 3.6+
- PostgreSQL (e.g. 14+)

## Setup

### 1. Database

Create a PostgreSQL database and user:

```sql
CREATE DATABASE supermarket_auth;
-- Optionally create a user or use existing postgres user
```

### 2. Configuration

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/supermarket_auth
spring.datasource.username=postgres
spring.datasource.password=YOUR_PASSWORD
```

### 3. Run

```bash
# With Maven wrapper (Windows)
mvnw.cmd spring-boot:run

# With Maven wrapper (Linux/macOS)
./mvnw spring-boot:run

# Or with installed Maven
mvn spring-boot:run
```

The service starts at **http://localhost:8081**.

## API Overview

### Auth (public)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register (role: ROLE_CUSTOMER) |
| POST | `/api/auth/login` | Login; returns JWT and role |

### Products (authenticated)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | List products |
| GET | `/api/products/{id}` | Get product |
| POST | `/api/products` | Create product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |

### Dashboard, Trolleys, Alerts, Sales (authenticated)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard/stats` | Dashboard stats |
| GET | `/api/trolleys` | List trolleys |
| GET | `/api/trolleys/{id}` | Get trolley |
| GET | `/api/alerts` | List alerts |
| PATCH | `/api/alerts/{id}/resolve` | Resolve alert |
| GET | `/api/sales` | Sales data |

### Customer (ROLE_CUSTOMER only)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/customer/me` | Current customer trolley/cart |

### Security

- **JWT**: Send `Authorization: Bearer <token>` for protected endpoints.
- **Roles**:
  - `ROLE_ADMIN`: `/api/admin/**`
  - `ROLE_CUSTOMER`: `/api/customer/**`, products, dashboard, trolleys, alerts, sales

## API JSON Examples

### Auth

**POST `/api/auth/register`** (Request)

```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "password": "secret123",
  "role": "ROLE_CUSTOMER"
}
```

- Response: `200 OK` with body `"User registered successfully"` (plain text).
- `role` is optional; defaults to `ROLE_CUSTOMER`.

**POST `/api/auth/login`** (Request)

```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "ROLE_CUSTOMER"
}
```

---

### Products

**GET `/api/products`** – Response (array)

```json
[
  {
    "id": 1,
    "barcode": "8901234567890",
    "name": "Organic Milk 1L",
    "price": 4.99,
    "weight": 1050,
    "category": "Dairy",
    "imageUrl": null
  }
]
```

**GET `/api/products/{id}`** – Response (single object)

```json
{
  "id": 1,
  "barcode": "8901234567890",
  "name": "Organic Milk 1L",
  "price": 4.99,
  "weight": 1050,
  "category": "Dairy",
  "imageUrl": null
}
```

**POST `/api/products`** (Request)

```json
{
  "barcode": "8901234567891",
  "name": "Whole Wheat Bread",
  "price": 3.49,
  "weight": 450,
  "category": "Bakery",
  "imageUrl": null
}
```

- Response: same shape as above with `id` set.

**PUT `/api/products/{id}`** (Request – all fields optional)

```json
{
  "barcode": "8901234567891",
  "name": "Whole Grain Bread",
  "price": 3.99,
  "weight": 450,
  "category": "Bakery",
  "imageUrl": null
}
```

**DELETE `/api/products/{id}`** – Response: `204 No Content` (no body).

---

### Dashboard

**GET `/api/dashboard/stats`** – Response

```json
{
  "totalSalesToday": 15847.50,
  "activeTrolleys": 24,
  "unpaidExitAttempts": 3,
  "weightMismatchAlerts": 7
}
```

---

### Trolleys

**GET `/api/trolleys`** – Response (array)

```json
[
  {
    "id": "TRL-001",
    "status": "active",
    "customerId": "cust1",
    "customerName": "John Smith",
    "items": [],
    "totalAmount": 20.96,
    "weightVerified": true,
    "lastActivity": "2024-01-15T10:30:00.123Z"
  },
  {
    "id": "TRL-002",
    "status": "active",
    "customerId": "cust2",
    "customerName": "Sarah Johnson",
    "items": [],
    "totalAmount": 10.98,
    "weightVerified": true,
    "lastActivity": "2024-01-15T10:32:00.456Z"
  }
]
```

**GET `/api/trolleys/{id}`** – Response (single object, same shape as one element above).

---

### Alerts

**GET `/api/alerts`** – Response (array)

```json
[
  {
    "id": "alt1",
    "type": "weight_mismatch",
    "trolleyId": "TRL-003",
    "message": "Weight mismatch detected. Expected: 4170g, Actual: 3650g",
    "severity": "high",
    "timestamp": "2024-01-15T10:45:00.789Z",
    "resolved": false
  },
  {
    "id": "alt2",
    "type": "unpaid_exit",
    "trolleyId": "TRL-005",
    "message": "Unpaid exit attempt at Gate 2",
    "severity": "high",
    "timestamp": "2024-01-15T09:30:00.000Z",
    "resolved": true
  }
]
```

- `type`: `weight_mismatch` | `unpaid_exit` | `system`
- `severity`: `low` | `medium` | `high`

**PATCH `/api/alerts/{id}/resolve`** – Response (single alert object, same shape as above, with `resolved: true`).

---

### Sales

**GET `/api/sales`** – Response (array)

```json
[
  { "date": "2024-01-09", "totalSales": 12450.00, "transactionCount": 156 },
  { "date": "2024-01-10", "totalSales": 14230.50, "transactionCount": 178 },
  { "date": "2024-01-11", "totalSales": 11890.25, "transactionCount": 142 },
  { "date": "2024-01-12", "totalSales": 18560.75, "transactionCount": 234 },
  { "date": "2024-01-13", "totalSales": 21340.00, "transactionCount": 267 },
  { "date": "2024-01-14", "totalSales": 19875.50, "transactionCount": 248 },
  { "date": "2024-01-15", "totalSales": 15847.50, "transactionCount": 198 }
]
```

---

### Customer

**GET `/api/customer/me`** (requires `ROLE_CUSTOMER`) – Response

```json
{
  "trolley": {
    "id": "TRL-001",
    "status": "active",
    "customerId": "cust1",
    "customerName": "John Smith",
    "items": [],
    "totalAmount": 20.96,
    "weightVerified": true,
    "lastActivity": "2024-01-15T10:30:00.123Z"
  },
  "cartItems": [],
  "customerName": "John Smith"
}
```

- `cartItems` can contain objects with `id`, `product`, `status` (`added` | `removed`), `scannedAt` (ISO string).

---

### Error responses

- **401 Unauthorized** (e.g. bad login): `"Invalid email or password"` (plain text).
- **403 Forbidden**: Missing or invalid role for the endpoint.
- **404 Not Found**: e.g. product or trolley by id not found.

## Roles

- **ROLE_ADMIN** – Admin portal; create manually in DB or via a seed.
- **ROLE_CUSTOMER** – Customer portal; default for registration.

## Database Tables

The service uses PostgreSQL. JPA creates/updates tables from entities (`spring.jpa.hibernate.ddl-auto=update`).

| Table        | Description                                  |
|-------------|----------------------------------------------|
| `users`     | User accounts (auth)                         |
| `products`  | Product catalog                              |
| `trolleys`  | Shopping trolleys in the store               |
| `cart_items`| Items scanned into a trolley                 |
| `alerts`    | System alerts related to trolleys            |
| `sales`     | Completed sales transactions (for reports)   |

### Table: `users`

| Column      | Type           | Constraints        | Description                      |
|-------------|----------------|--------------------|----------------------------------|
| `id`        | BIGSERIAL      | PRIMARY KEY        | Auto-generated ID                |
| `name`      | VARCHAR(255)   |                    | Full name                        |
| `email`     | VARCHAR(255)   | NOT NULL, UNIQUE   | Login email                      |
| `password`  | VARCHAR(255)   |                    | Encrypted password               |
| `role`      | VARCHAR(255)   |                    | ROLE_ADMIN or ROLE_CUSTOMER      |

### Table: `products`

| Column      | Type              | Constraints   | Description        |
|-------------|-------------------|---------------|--------------------|
| `id`        | BIGSERIAL         | PRIMARY KEY   | Auto-generated ID  |
| `barcode`   | VARCHAR(255)      | NOT NULL      | Product barcode    |
| `name`      | VARCHAR(255)      | NOT NULL      | Product name       |
| `price`     | DOUBLE PRECISION  | NOT NULL      | Price              |
| `weight`    | INTEGER           | NOT NULL      | Weight (grams)     |
| `category`  | VARCHAR(255)      |               | Category           |
| `imageurl`  | VARCHAR(255)      |               | Image URL          |

### Table: `trolleys`

Backs the `/api/trolleys`, `/api/trolleys/{id}` and `/api/customer/me` APIs.

| Column          | Type              | Constraints                 | Description                                  |
|-----------------|-------------------|-----------------------------|----------------------------------------------|
| `id`            | BIGSERIAL         | PRIMARY KEY                 | Auto-generated ID                            |
| `status`        | VARCHAR(50)       | NOT NULL                    | `active`, `inactive`, `payment_pending`, `completed` |
| `customer_id`   | BIGINT            | FK → `users.id` (nullable)  | Customer currently using the trolley         |
| `total_amount`  | DOUBLE PRECISION  | NOT NULL DEFAULT 0          | Current running total                        |
| `weight_verified`| BOOLEAN          | NOT NULL DEFAULT FALSE      | Whether the trolley weight check passed      |
| `last_activity` | TIMESTAMP         | NOT NULL                    | Last scan / update time                      |

### Table: `cart_items`

Backs the `items` / `cartItems` arrays in trolley and customer APIs.

| Column       | Type              | Constraints                    | Description                                  |
|--------------|-------------------|--------------------------------|----------------------------------------------|
| `id`         | BIGSERIAL         | PRIMARY KEY                    | Auto-generated ID                            |
| `trolley_id` | BIGINT            | NOT NULL, FK → `trolleys.id`   | Owning trolley                               |
| `product_id` | BIGINT            | NOT NULL, FK → `products.id`   | Scanned product                              |
| `status`     | VARCHAR(50)       | NOT NULL                       | `added` or `removed`                         |
| `scanned_at` | TIMESTAMP         | NOT NULL                       | When the item was scanned                    |

### Table: `alerts`

Backs `/api/alerts` and `/api/alerts/{id}/resolve`.

| Column       | Type              | Constraints                    | Description                                  |
|--------------|-------------------|--------------------------------|----------------------------------------------|
| `id`         | BIGSERIAL         | PRIMARY KEY                    | Auto-generated ID                            |
| `type`       | VARCHAR(50)       | NOT NULL                       | `weight_mismatch`, `unpaid_exit`, `system`  |
| `trolley_id` | BIGINT            | FK → `trolleys.id` (nullable)  | Related trolley (if any)                     |
| `message`    | VARCHAR(1024)     | NOT NULL                       | Alert message text                           |
| `severity`   | VARCHAR(50)       | NOT NULL                       | `low`, `medium`, `high`                      |
| `timestamp`  | TIMESTAMP         | NOT NULL                       | When the alert was raised                    |
| `resolved`   | BOOLEAN           | NOT NULL DEFAULT FALSE         | Whether the alert has been resolved          |

### Table: `sales`

Backs `/api/sales` and is used to compute `SalesData` and dashboard stats.

| Column        | Type              | Constraints                    | Description                                  |
|---------------|-------------------|--------------------------------|----------------------------------------------|
| `id`          | BIGSERIAL         | PRIMARY KEY                    | Auto-generated ID                            |
| `trolley_id`  | BIGINT            | FK → `trolleys.id` (nullable)  | Trolley associated with the sale             |
| `customer_id` | BIGINT            | FK → `users.id` (nullable)     | Customer who made the purchase               |
| `date`        | DATE              | NOT NULL                       | Business date of the sale                    |
| `total_amount`| DOUBLE PRECISION  | NOT NULL                       | Total amount for this transaction            |

> **Note:** Column names match the JPA entity fields; Hibernate may use lowercase (e.g. `imageurl`). Types/lengths may vary by dialect.

## Project Structure

```
src/main/java/com/supermarket/auth/
├── config/          # Security, CORS
├── controller/      # REST controllers
├── dto/             # Request/response DTOs
├── entity/          # JPA entities (User, Product)
├── exception/       # Global exception handling
├── repository/      # JPA repositories
├── security/        # JWT filter, user details, JwtUtil
└── service/         # Auth, Product services
```

## Build

```bash
mvn clean package
```

Run the JAR:

```bash
java -jar target/auth-service-0.0.1-SNAPSHOT.jar
```

## Tests

```bash
mvn test
```
