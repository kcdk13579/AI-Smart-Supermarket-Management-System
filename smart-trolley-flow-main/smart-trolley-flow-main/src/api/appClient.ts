/**
 * App API client for products, trolleys, alerts, dashboard, sales.
 * Uses VITE_APP_API_URL when set (with JWT); otherwise throws.
 */

import { getAuthHeader } from "@/lib/api";
import type { Product, Trolley, Alert, DashboardStats, SalesData, CartItem, AvailableTrolley } from "@/types";

const TOKEN_KEY = "smartmart_token";

function getAppBaseUrl(): string {
  if (import.meta.env.VITE_APP_API_URL) {
    return String(import.meta.env.VITE_APP_API_URL).replace(/\/$/, "");
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

  return "/"; // fallback to relative if missing
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

async function fetchApp<T>(
  path: string,
  options: RequestInit = {}
): Promise<T | null> {
  const base = getAppBaseUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeader(getToken()),
    ...(options.headers as Record<string, string>),
  };
  const res = await fetch(url, { ...options, headers });

  // A 404 is often used by our API to indicate "no active entity found" (e.g. no active trolley)
  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// --- Products ---

export async function getProducts(): Promise<Product[]> {
  const list = await fetchApp<Product[]>("/api/products");
  return (Array.isArray(list) ? list : []).map(normalizeProduct);
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const p = await fetchApp<Product>(`/api/products/${id}`);
    return normalizeProduct(p);
  } catch {
    return null;
  }
}

export async function createProduct(body: Omit<Product, "id">): Promise<Product> {
  const created = await fetchApp<Product>("/api/products", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return normalizeProduct(created);
}

export async function updateProduct(id: string, body: Partial<Product>): Promise<Product> {
  const updated = await fetchApp<Product>(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return normalizeProduct(updated);
}

export async function deleteProduct(id: string): Promise<void> {
  await fetchApp(`/api/products/${id}`, { method: "DELETE" });
}

function normalizeProduct(p: any): Product {
  return {
    id: String(p.id ?? ""),
    barcode: String(p.barcode ?? ""),
    name: String(p.name ?? ""),
    price: Number(p.price ?? 0),
    weight: Number(p.weight ?? 0),
    category: p.category != null ? String(p.category) : undefined,
    imageUrl: p.imageUrl != null ? String(p.imageUrl) : undefined,
  };
}

// --- Trolleys ---

export async function getTrolleys(): Promise<Trolley[]> {
  const list = await fetchApp<TrolleyDto[]>("/api/trolleys");
  return (Array.isArray(list) ? list : []).map(normalizeTrolley);
}

export async function getTrolley(id: string): Promise<Trolley | null> {
  try {
    const t = await fetchApp<TrolleyDto>(`/api/trolleys/${id}`);
    return normalizeTrolley(t);
  } catch {
    return null;
  }
}

interface TrolleyDto {
  id?: string;
  status?: string;
  customerId?: string;
  customerName?: string;
  items?: CartItemDto[];
  totalAmount?: number;
  weightVerified?: boolean;
  lastActivity?: string;
}
interface CartItemDto {
  id?: string;
  product?: Product;
  status?: string;
  scannedAt?: string;
  quantity?: number;
}

function normalizeTrolley(t: any): Trolley {
  const items = (t.items ?? []).map((i: any) => ({
    id: String(i.id ?? ""),
    product: i.product ? normalizeProduct(i.product) : ({} as Product),
    status: (i.status === "removed" ? "removed" : "added") as "added" | "removed",
    scannedAt: i.scannedAt ? new Date(i.scannedAt) : new Date(),
    quantity: typeof i.quantity === 'number' ? i.quantity : 1,
  }));
  return {
    id: String(t.id ?? ""),
    uid: t.uid,
    status: (t.status as Trolley["status"]) ?? "inactive",
    customerId: t.customerId,
    customerName: t.customerName,
    items,
    totalAmount: Number(t.totalAmount ?? 0),
    weightVerified: Boolean(t.weightVerified),
    lastActivity: t.lastActivity ? new Date(t.lastActivity) : new Date(),
  };
}

// --- Alerts ---

export async function getAlerts(): Promise<Alert[]> {
  const list = await fetchApp<AlertDto[]>("/api/alerts");
  return (Array.isArray(list) ? list : []).map(normalizeAlert);
}

export async function resolveAlert(id: string): Promise<Alert> {
  const updated = await fetchApp<AlertDto>(`/api/alerts/${id}/resolve`, {
    method: "PATCH",
  });
  return normalizeAlert(updated);
}

interface AlertDto {
  id?: string;
  type?: string;
  trolleyId?: string;
  message?: string;
  severity?: string;
  timestamp?: string;
  resolved?: boolean;
}

function normalizeAlert(a: any): Alert {
  return {
    id: String(a.id ?? ""),
    type: (a.type as Alert["type"]) ?? "system",
    trolleyId: String(a.trolleyId ?? ""),
    message: String(a.message ?? ""),
    severity: (a.severity as Alert["severity"]) ?? "medium",
    timestamp: a.timestamp ? new Date(a.timestamp) : new Date(),
    resolved: Boolean(a.resolved),
  };
}

// --- Dashboard ---

export async function getDashboardStats(): Promise<DashboardStats> {
  const stats = await fetchApp<DashboardStats>("/api/dashboard/stats");
  return stats;
}

// --- Sales ---

export async function getSalesData(): Promise<SalesData[]> {
  const list = await fetchApp<SalesData[]>("/api/sales");
  return Array.isArray(list) ? list : [];
}

// --- Customer (current user trolley / cart) ---

export async function getCurrentCustomerTrolley(): Promise<{ trolley: Trolley; cartItems: CartItem[]; customerName: string } | null> {
  try {
    const data = await fetchApp<{ trolley: TrolleyDto; cartItems: CartItemDto[]; customerName: string }>("/api/customer/me");
    if (!data) return null;
    return {
      trolley: normalizeTrolley(data.trolley ?? {}),
      cartItems: (data.cartItems ?? []).map((i) => ({
        id: String(i.id ?? ""),
        product: i.product ? normalizeProduct(i.product) : ({} as Product),
        status: (i.status === "removed" ? "removed" : "added") as "added" | "removed",
        scannedAt: i.scannedAt ? new Date(i.scannedAt) : new Date(),
        quantity: typeof i.quantity === 'number' ? i.quantity : 1,
      })),
      customerName: data.customerName ?? "",
    };
  } catch {
    return null;
  }
}

export function isAppApiConfigured(): boolean {
  return true; // We assume true since we default to /
}

export async function updateCartItemQuantity(itemId: string, quantity: number): Promise<void> {
  await fetchApp(`/api/cart/items/${itemId}/quantity`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity })
  });
}

export async function toggleCartItem(barcode: string): Promise<void> {
  await fetchApp(`/api/cart/items/toggle`, {
    method: 'POST',
    body: JSON.stringify({ barcode })
  });
}

export async function checkoutCart(): Promise<void> {
  await fetchApp(`/api/cart/checkout`, {
    method: 'POST'
  });
}

// --- Trolley Selection (Customer) ---

export async function getAvailableTrolleys(): Promise<AvailableTrolley[]> {
  const data = await fetchApp<{ trolleys: AvailableTrolley[] }>("/api/customer/available-trolleys");
  return data.trolleys ?? [];
}

export async function selectTrolley(uid: string): Promise<{ trolley: Trolley }> {
  const data = await fetchApp<{ trolley: TrolleyDto; message: string }>("/api/customer/select-trolley", {
    method: "POST",
    body: JSON.stringify({ uid }),
  });
  return { trolley: normalizeTrolley(data.trolley ?? {}) };
}

// --- Exit Gate (RFID Scanner) - public endpoint ---

export async function scanExitTrolley(uid: string): Promise<{ gateOpen: boolean; message: string }> {
  return fetchApp<{ gateOpen: boolean; message: string }>("/api/exit/scan", {
    method: "POST",
    body: JSON.stringify({ uid }),
  });
}

// --- Admin: Create Trolley ---

export async function createTrolley(uid: string): Promise<Trolley> {
  const t = await fetchApp<TrolleyDto>("/api/trolleys", {
    method: "POST",
    body: JSON.stringify({ uid }),
  });
  return normalizeTrolley(t);
}

// --- User Profile (Admin/Customer) ---

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await fetchApp("/api/auth/password", {
    method: "PUT",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function getProfile(): Promise<{ name: string; email: string; role: string }> {
  return await fetchApp<{ name: string; email: string; role: string }>("/api/auth/profile") ?? { name: "", email: "", role: "" };
}

export async function updateProfile(name: string, email: string) {
  return await fetchApp<{ token: string; role: string }>("/api/auth/profile", {
    method: "PUT",
    body: JSON.stringify({ name, email }),
  });
}

