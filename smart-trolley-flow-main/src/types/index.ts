// Types for Smart Supermarket Management System

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  price: number;
  weight: number;
  category?: string;
  imageUrl?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  status: 'added' | 'removed';
  scannedAt: Date;
  quantity?: number;
}

export interface Trolley {
  id: string;
  uid?: string;
  status: 'active' | 'inactive' | 'payment_pending' | 'completed';
  customerId?: string;
  customerName?: string;
  items: CartItem[];
  totalAmount: number;
  weightVerified: boolean;
  lastActivity: Date;
}

export interface AvailableTrolley {
  id: string;
  uid: string;
  status: string;
}

export interface Alert {
  id: string;
  type: 'weight_mismatch' | 'unpaid_exit' | 'system';
  trolleyId: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  resolved: boolean;
}

export interface SalesData {
  date: string;
  totalSales: number;
  transactionCount: number;
}

export interface DashboardStats {
  totalSalesToday: number;
  activeTrolleys: number;
  unpaidExitAttempts: number;
  weightMismatchAlerts: number;
}
