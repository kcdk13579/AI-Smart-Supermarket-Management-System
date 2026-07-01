# Smart Trolley – Tech Stack Flow (Updated)

![Tech stack flow](techstack-flow-updated.png)

## Main architecture

```mermaid
flowchart TB
    subgraph User["👤 User"]
        Browser[Browser]
    end

    subgraph Frontend["Frontend (Port 8080)"]
        direction TB
        Vite[Vite Dev Server]
        React[React 18]
        Router[React Router]
        AuthContext[AuthContext]
        UI[shadcn/ui + Tailwind]
        Pages[Pages: Admin, Customer, Login, Register, Dashboard, etc.]
        API_Client["api.ts (auth client)"]

        Vite --> React
        React --> Router
        React --> AuthContext
        React --> UI
        React --> Pages
        Pages --> API_Client
        AuthContext --> API_Client
    end

    subgraph AuthService["Auth Service (Port 8081) – Spring Boot"]
        direction TB
        Spring[Spring Boot]
        AuthController["AuthController"]
        AuthSvc["AuthService"]
        JwtService["JwtService"]
        UserRepo["UserRepository"]
        Security[SecurityConfig + JwtAuthFilter]

        Spring --> Security
        Spring --> AuthController
        AuthController --> AuthSvc
        AuthSvc --> JwtService
        AuthSvc --> UserRepo
    end

    Browser --> Frontend
    API_Client -->|"VITE_AUTH_API_URL"| AuthService
    AuthController --> AuthSvc
    AuthSvc --> UserRepo
    AuthSvc --> JwtService
```

## Request flow: Login / Register

```mermaid
sequenceDiagram
    participant U as User
    participant P as Page (Login/Register)
    participant API as api.ts (login/register)
    participant Spring as Spring Auth Service :8081
    participant AuthSvc as AuthService
    participant JWT as JwtService
    participant Repo as UserRepository

    U->>P: Submit email/password
    P->>API: login(email, password)
    API->>Spring: POST /api/auth/login
    Spring->>AuthSvc: login(request)
    AuthSvc->>Repo: findByEmail
    Repo-->>AuthSvc: User
    AuthSvc->>JWT: generateToken(email, role)
    JWT-->>AuthSvc: token
    AuthSvc-->>Spring: AuthResponse(token, role)
    Spring-->>API: 200 JSON
    API-->>P: { token, role }
    P->>P: AuthContext + navigate
    P->>U: Dashboard / Home
```

## Simplified end-to-end flow

```mermaid
flowchart LR
    A[User] --> B[Browser]
    B --> C[Vite :8080]
    C --> D[React App]
    D --> E[AuthContext]
    E --> F["api.ts"]
    F --> G[Spring Auth :8081]
    G --> H[AuthController]
    H --> I[AuthService]
    I --> J[UserRepository / JwtService]
    J --> I
    I --> H
    H --> G
    G --> F
    F --> E
    E --> D
    D --> C
    C --> B
    B --> A
```

## Stack by layer

```mermaid
flowchart TB
    subgraph Presentation["Presentation"]
        React["React 18"]
        Tailwind["Tailwind CSS"]
        shadcn["shadcn/ui"]
        Recharts["Recharts"]
    end

    subgraph Client_Logic["Client logic"]
        ReactRouter["React Router"]
        AuthContext["AuthContext"]
        Typescript_F["TypeScript"]
    end

    subgraph Build["Build & dev"]
        Vite["Vite"]
    end

    subgraph API_Client["API client"]
        Fetch["fetch()"]
        AuthAPI["api.ts → VITE_AUTH_API_URL"]
    end

    subgraph Backend["Backend – Auth"]
        SpringBoot["Spring Boot 3"]
        Java["Java 17"]
        Security["Spring Security"]
        JWT["JWT (jjwt)"]
    end

    subgraph Persistence["Persistence (auth)"]
        Memory["In-memory UserRepository"]
    end

    Presentation --> Client_Logic
    Client_Logic --> Build
    Build --> API_Client
    API_Client --> Backend
    Backend --> Persistence
```

## Auth service package structure

```mermaid
flowchart LR
    subgraph auth_service["com.supermarket.auth_service"]
        App[AuthServiceApplication]
        Ctrl[controller]
        Svc[service]
        Sec[security]
        Repo[repository]
        Dto[dto]
        Cfg[config]
        Model[model]
    end

    App --> Ctrl
    App --> Svc
    App --> Sec
    Ctrl --> AuthController
    Ctrl --> GlobalExceptionHandler
    Svc --> AuthService
    Sec --> JwtService
    Sec --> JwtAuthFilter
    Repo --> UserRepository
    Dto --> LoginRequest
    Dto --> RegisterRequest
    Dto --> AuthResponse
    Cfg --> SecurityConfig
    Model --> User
```

## Test flow (auth-service)

```mermaid
flowchart TB
    subgraph Tests["src/test/java/com/supermarket/auth_service/"]
        AuthControllerIntegrationTest["AuthControllerIntegrationTest"]
        AuthServiceTest["AuthServiceTest"]
        JwtServiceTest["JwtServiceTest"]
    end

    AuthControllerIntegrationTest --> MockMvc[MockMvc]
    AuthControllerIntegrationTest --> Login[POST /api/auth/login]
    AuthControllerIntegrationTest --> Register[POST /api/auth/register]
    AuthServiceTest --> AuthService[AuthService]
    JwtServiceTest --> JwtService[JwtService]
```

---

*View in any Mermaid-compatible viewer (GitHub, VS Code with Mermaid extension, or [mermaid.live](https://mermaid.live)).*
