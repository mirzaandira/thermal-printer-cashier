export interface Product {
  id: string;
  name: string;
  category_id: string;
  price: number;
  cost?: number;
  sku?: string;
  image_url?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  quantity: number;
  reorder_level: number;
  last_restocked?: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  cashier_id: string;
  subtotal: number;
  tax: number;
  discount_amount: number;
  discount_percent: number;
  total: number;
  payment_method: string;
  status: 'completed' | 'pending' | 'cancelled';
  notes?: string;
  created_at: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total: number;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  pin: string;
  role: 'admin' | 'cashier' | 'manager';
  active: boolean;
  created_at: string;
}

export interface CartItem {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  total: number;
}
