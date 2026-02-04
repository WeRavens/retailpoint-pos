import { Product, Transaction, SalesSummary } from '../types';
import { supabase } from './supabase';

const PRODUCTS_TABLE = 'products';
const TRANSACTIONS_TABLE = 'transactions';

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from(PRODUCTS_TABLE)
    .select('*')
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data as Product[];
};

export const saveProduct = async (product: Product): Promise<void> => {
  const { error } = await supabase
    .from(PRODUCTS_TABLE)
    .upsert({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold
    });
  
  if (error) {
    console.error('Error saving product:', error);
  }
};

export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from(PRODUCTS_TABLE)
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting product:', error);
  }
};

export const updateStock = async (items: { id: string; quantity: number }[]): Promise<void> => {
  // Supabase doesn't have a direct "decrement" multi-row update in a simple way without RPC
  // So we'll update them one by one or create an RPC later.
  // For now, let's do it simply by fetching and updating.
  
  for (const item of items) {
    const { data: product } = await supabase
      .from(PRODUCTS_TABLE)
      .select('stock')
      .eq('id', item.id)
      .single();
    
    if (product) {
      await supabase
        .from(PRODUCTS_TABLE)
        .update({ stock: Math.max(0, product.stock - item.quantity) })
        .eq('id', item.id);
    }
  }
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from(TRANSACTIONS_TABLE)
    .select('*')
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
  return data as Transaction[];
};

export const saveTransaction = async (transaction: Transaction): Promise<void> => {
  const { error } = await supabase
    .from(TRANSACTIONS_TABLE)
    .insert({
      id: transaction.id,
      date: transaction.date,
      total: transaction.total,
      paymentMethod: transaction.paymentMethod,
      items: transaction.items
    });
  
  if (error) {
    console.error('Error saving transaction:', error);
    return;
  }
  
  // Also update stock
  await updateStock(transaction.items.map(i => ({ id: i.id, quantity: i.quantity })));
};

export const getSalesSummary = async (): Promise<SalesSummary> => {
  const transactions = await getTransactions();
  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
  
  // Group by date (YYYY-MM-DD)
  const salesMap: Record<string, number> = {};
  transactions.forEach(t => {
    try {
      const date = new Date(t.date).toISOString().split('T')[0];
      salesMap[date] = (salesMap[date] || 0) + Number(t.total);
    } catch (e) {
      console.error('Error parsing date:', t.date);
    }
  });

  const dailySales = Object.keys(salesMap).map(date => ({
    date,
    amount: salesMap[date]
  })).sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalRevenue,
    totalTransactions: transactions.length,
    dailySales
  };
};