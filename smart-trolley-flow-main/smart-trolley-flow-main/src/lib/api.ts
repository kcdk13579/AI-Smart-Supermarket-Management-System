/**
 * Auth API client for the auth-service backend.
 * Base URL is read from VITE_AUTH_API_URL (default http://localhost:8081).
 */

const getAuthBaseUrl = (): string => {
  if (import.meta.env.VITE_AUTH_API_URL) {
    return import.meta.env.VITE_AUTH_API_URL.replace(/\/$/, "");
  }

  const hostname = window.location.hostname;
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.")
  ) {
    return `http://${hostname}:8081`;
  }

  return "http://localhost:8081";
};

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  /** Optional: ROLE_CUSTOMER. Defaults to ROLE_CUSTOMER. */
  role?: string;
}

export interface AuthResponse {
  token: string;
  role: string;
}

export async function login(body: LoginRequest): Promise<AuthResponse> {
  const res = await fetch(`${getAuthBaseUrl()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Login failed");
  }
  return res.json() as Promise<AuthResponse>;
}

export async function register(body: RegisterRequest): Promise<void> {
  const res = await fetch(`${getAuthBaseUrl()}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Registration failed");
  }
}

/**
 * Returns the Authorization header value for authenticated requests.
 * Use with fetch/axios when calling other backend services that expect JWT.
 */
export function getAuthHeader(token: string | null): Record<string, string> {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
