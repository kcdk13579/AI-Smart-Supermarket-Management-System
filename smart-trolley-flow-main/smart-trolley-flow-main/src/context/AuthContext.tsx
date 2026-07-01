import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { login as apiLogin, type AuthResponse } from "@/lib/api";

const TOKEN_KEY = "smartmart_token";
const ROLE_KEY = "smartmart_role";
const EMAIL_KEY = "smartmart_email";

export type AuthRole = "ROLE_ADMIN" | "ROLE_CUSTOMER" | string;

interface AuthState {
  token: string | null;
  role: AuthRole | null;
  email: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCustomerRole: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
  setAuth: (data: AuthResponse, email?: string) => void;
}

const initialState: AuthState = {
  token: null,
  role: null,
  email: null,
  isAuthenticated: false,
  isAdmin: false,
  isCustomerRole: false,
};

const AuthContext = createContext<AuthContextValue | null>(null);

function loadStored(): AuthState {
  const token = localStorage.getItem(TOKEN_KEY);
  const role = localStorage.getItem(ROLE_KEY) as AuthRole | null;
  const email = localStorage.getItem(EMAIL_KEY);
  const isAdmin = role === "ROLE_ADMIN";
  const isCustomerRole = role === "ROLE_CUSTOMER";
  return {
    token,
    role,
    email,
    isAuthenticated: !!token,
    isAdmin,
    isCustomerRole,
  };
}

function persist(token: string, role: string, email?: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  if (email) localStorage.setItem(EMAIL_KEY, email);
}

function clearStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(EMAIL_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(loadStored);

  useEffect(() => {
    setState(loadStored());
  }, []);

  const setAuth = useCallback((data: AuthResponse, explicitEmail?: string) => {
    // If no explicitEmail is provided, attempt to retrieve the old one from current state.
    // If neither exists, check localStorage as a last resort fallback.
    const finalEmail = explicitEmail || state.email || localStorage.getItem(EMAIL_KEY) || undefined;
    persist(data.token, data.role, finalEmail);
    const isAdmin = data.role === "ROLE_ADMIN";
    const isCustomerRole = data.role === "ROLE_CUSTOMER";
    setState({
      token: data.token,
      role: data.role,
      email: finalEmail || null,
      isAuthenticated: true,
      isAdmin,
      isCustomerRole,
    });
  }, [state.email]);

  const login = useCallback(async (email: string, password: string): Promise<AuthResponse> => {
    const data = await apiLogin({ email, password });
    persist(data.token, data.role, email);
    const isAdmin = data.role === "ROLE_ADMIN";
    const isCustomerRole = data.role === "ROLE_CUSTOMER";
    setState({
      token: data.token,
      role: data.role,
      email,
      isAuthenticated: true,
      isAdmin,
      isCustomerRole,
    });
    return data;
  }, []);

  const logout = useCallback(() => {
    clearStorage();
    setState(initialState);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      setAuth,
    }),
    [state, login, logout, setAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
