export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  date: string; // ISO string
  items: CartItem[];
  total: number;
  paymentMethod: 'cash' | 'e-wallet';
}

export type ViewState = 'pos' | 'inventory' | 'reports';

export interface SalesSummary {
  totalRevenue: number;
  totalTransactions: number;
  dailySales: { date: string; amount: number }[];
}
