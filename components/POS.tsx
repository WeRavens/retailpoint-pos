import React, { useState, useEffect, useMemo } from 'react';
import { Product, CartItem, Transaction } from '../types';
import { getProducts, saveTransaction } from '../services/data';
import { ReceiptModal } from './ReceiptModal';
import { QRISModal } from './QRISModal';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, ShoppingCart, PackageOpen, X, ChevronUp, ChevronDown } from 'lucide-react';

export const POS: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = false }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showQRIS, setShowQRIS] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [isCartOpenMobile, setIsCartOpenMobile] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getProducts();
      setProducts(data);
    };
    fetchProducts();
  }, [lastTransaction]);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ['All', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    if (window.innerWidth < 1024) {
      setSearch('');
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const product = products.find(p => p.id === id);
        const maxStock = product ? product.stock : item.quantity;
        const newQty = Math.max(1, Math.min(item.quantity + delta, maxStock));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const completeTransaction = async (method: 'cash' | 'e-wallet') => {
    const generateId = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    };

    const transaction: Transaction = {
      id: generateId(),
      date: new Date().toISOString(),
      items: [...cart],
      total,
      paymentMethod: method
    };

    await saveTransaction(transaction);
    setLastTransaction(transaction);
    setCart([]);
    setIsProcessing(false);
    setShowReceipt(true);
    setIsCartOpenMobile(false);
  };

  const handleCheckout = async (method: 'cash' | 'e-wallet') => {
    if (cart.length === 0) return;
    
    if (method === 'e-wallet') {
      setShowQRIS(true);
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    await completeTransaction('cash');
  };

  const handleQRISSuccess = async () => {
    setShowQRIS(false);
    setIsProcessing(true);
    await completeTransaction('e-wallet');
  };

  return (
    <div className={`h-full flex flex-col lg:flex-row gap-0 lg:gap-6 p-0 lg:p-6 overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#0f111a]' : 'bg-gray-50'}`}>
      
      {/* Product Section */}
      <div className={`flex-1 flex flex-col min-h-0 lg:rounded-xl shadow-sm border-b lg:border overflow-hidden z-0 transition-colors duration-500 ${
        isDarkMode ? 'bg-[#161926] border-[#1e2235]' : 'bg-white border-gray-200'
      }`}>
        {/* Search Header - Sticky on Mobile */}
        <div className={`p-4 border-b space-y-3 sticky top-0 z-10 transition-colors duration-500 ${
          isDarkMode ? 'bg-[#161926] border-[#1e2235]' : 'bg-white border-gray-100'
        }`}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari produk..."
              className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-base ${
                isDarkMode ? 'bg-[#1e2235] border-[#2d334d] text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900'
              }`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : isDarkMode 
                      ? 'bg-[#1e2235] text-slate-400 border border-[#2d334d] hover:bg-[#252a41]'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid - Larger targets for fingers */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400">
              <PackageOpen className="w-16 h-16 mb-2 opacity-30" />
              <p className="font-medium">Produk tidak ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => {
                const isLowStock = product.stock <= product.lowStockThreshold;
                const outOfStock = product.stock === 0;
                const cartQty = cart.find(i => i.id === product.id)?.quantity || 0;
                
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={outOfStock}
                    className={`relative flex flex-col p-3 rounded-2xl border transition-all text-left shadow-sm active:scale-95 touch-manipulation ${
                      outOfStock 
                        ? 'opacity-40 grayscale border-gray-200 cursor-not-allowed' 
                        : isDarkMode
                          ? 'bg-[#1e2235] border-[#2d334d] hover:border-indigo-500 shadow-lg shadow-black/20 hover:shadow-indigo-500/10'
                          : 'bg-white border-gray-100 hover:border-indigo-300 ring-indigo-500/10 hover:ring-4 text-gray-900'
                    }`}
                  >
                    {cartQty > 0 && (
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg ring-2 ring-white">
                        {cartQty}
                      </div>
                    )}
                    
                    <div className={`w-full aspect-square rounded-xl flex items-center justify-center mb-3 font-bold text-2xl transition-colors ${
                      isDarkMode ? 'bg-[#252a41] text-indigo-400 opacity-90' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {product.name.charAt(0)}
                    </div>
                    
                    <div className="flex-1 min-h-[3rem]">
                      <h3 className={`font-bold text-sm leading-tight line-clamp-2 ${isDarkMode ? 'text-slate-100' : 'text-gray-800'}`}>{product.name}</h3>
                      <p className={`text-[10px] mt-1 uppercase tracking-wider font-semibold ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>{product.category}</p>
                    </div>

                    <div className="mt-3 flex justify-between items-center w-full">
                      <p className="font-black text-indigo-600 text-base">Rp {product.price.toLocaleString('id-ID')}</p>
                      <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        outOfStock ? 'bg-red-100 text-red-600' : 
                        isLowStock ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {outOfStock ? 'Habis' : `${product.stock}`}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart Container - Desktop & Mobile Logic */}
      <div className={`
        fixed lg:static inset-0 z-40 transition-transform duration-300 lg:translate-y-0
        ${isCartOpenMobile ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
        flex flex-col lg:w-96
      `}>
        {/* Mobile Header for Cart */}
        <div className={`lg:hidden h-20 border-b flex items-center justify-between px-6 rounded-t-3xl shadow-2xl ${
          isDarkMode ? 'bg-[#1e2235] border-[#2d334d]' : 'bg-white border-gray-100'
        }`}>
          <div className="flex flex-col">
            <h2 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
              Pesanan Anda
            </h2>
            <p className="text-xs text-gray-500">{totalItems} barang</p>
          </div>
          <button onClick={() => setIsCartOpenMobile(false)} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-[#252a41] text-slate-400' : 'bg-gray-100 text-gray-500'}`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Content */}
        <div className={`flex-1 lg:rounded-xl shadow-2xl border flex flex-col overflow-hidden transition-colors duration-500 ${
          isDarkMode ? 'bg-[#161926] border-[#1e2235]' : 'bg-white border-gray-200'
        }`}>
          <div className={`hidden lg:flex p-4 border-b items-center justify-between ${
            isDarkMode ? 'bg-[#1e2235]/50 border-[#1e2235]' : 'bg-gray-50 border-gray-100'
          }`}>
            <h2 className={`font-bold flex items-center gap-2 text-lg ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              <ShoppingCart className="w-5 h-5 text-indigo-600" />
              Keranjang
            </h2>
            <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold">
              {totalItems} barang
            </span>
          </div>

          <div className={`flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide transition-colors duration-500 ${isDarkMode ? 'bg-[#0f111a]' : 'bg-gray-50/30'}`}>
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50 space-y-4">
                <ShoppingCart className="w-20 h-20" />
                <p className="font-medium">Keranjang masih kosong</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className={`flex gap-4 items-center p-4 rounded-2xl border shadow-sm transition-all animate-in slide-in-from-right-4 duration-300 ${
                  isDarkMode ? 'bg-[#1e2235] border-[#2d334d]' : 'bg-white border-gray-100'
                }`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                    isDarkMode ? 'bg-[#252a41] text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {item.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <h4 className={`text-sm font-bold truncate ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>{item.name}</h4>
                    <p className="text-sm font-black text-indigo-600 mt-0.5">Rp {item.price.toLocaleString('id-ID')}</p>
                  </div>
                  <div className={`flex items-center gap-1 p-1 rounded-xl ${isDarkMode ? 'bg-[#0f111a]' : 'bg-gray-100'}`}>
                    <button onClick={() => updateQuantity(item.id, -1)} className={`w-8 h-8 flex items-center justify-center rounded-lg shadow-sm active:scale-95 transition-all ${
                      isDarkMode ? 'bg-[#252a41] text-slate-200 hover:bg-[#2d334d]' : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}>
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className={`w-8 text-center text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className={`w-8 h-8 flex items-center justify-center rounded-lg shadow-sm active:scale-95 transition-all ${
                      isDarkMode ? 'bg-[#252a41] text-slate-200 hover:bg-[#2d334d]' : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}>
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-1">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className={`p-6 border-t bg-white space-y-6 ${
            isDarkMode ? 'bg-[#1e2235] border-[#1e2235]' : 'bg-white border-gray-200'
          }`}>
            <div className={`p-4 rounded-2xl space-y-3 ${isDarkMode ? 'bg-[#0f111a]' : 'bg-gray-50'}`}>
              <div className={`flex justify-between text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                <span>Subtotal</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <div className={`flex justify-between text-2xl font-black pt-2 border-t ${
                isDarkMode ? 'text-white border-[#2d334d]' : 'text-gray-900 border-gray-200'
              }`}>
                <span>Total</span>
                <span className="text-indigo-500">Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleCheckout('cash')}
                disabled={cart.length === 0 || isProcessing}
                className="flex flex-col items-center justify-center gap-1 py-4 px-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 disabled:opacity-50 transition-all font-bold shadow-lg shadow-emerald-900/20 active:scale-95"
              >
                <Banknote className="w-6 h-6" />
                <span className="text-xs uppercase tracking-tighter">Tunai</span>
              </button>
              <button
                onClick={() => handleCheckout('e-wallet')}
                disabled={cart.length === 0 || isProcessing}
                className="flex flex-col items-center justify-center gap-1 py-4 px-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all font-bold shadow-lg shadow-indigo-900/20 active:scale-95"
              >
                <CreditCard className="w-6 h-6" />
                <span className="text-xs uppercase tracking-tighter">E-Wallet</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bottom Bar for Mobile */}
      {cart.length > 0 && !isCartOpenMobile && (
        <div className="lg:hidden fixed bottom-6 left-4 right-4 z-30">
          <button 
            onClick={() => setIsCartOpenMobile(true)}
            className="w-full bg-indigo-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500 p-2 rounded-xl relative">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-white text-indigo-600 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              </div>
              <div className="text-left">
                <p className="text-xs text-indigo-100 font-bold uppercase tracking-widest leading-none mb-1">Lihat Pesanan</p>
                <p className="text-lg font-black">Rp {total.toLocaleString('id-ID')}</p>
              </div>
            </div>
            <ChevronUp className="w-6 h-6 opacity-50" />
          </button>
        </div>
      )}

      <ReceiptModal 
        isOpen={showReceipt} 
        onClose={() => setShowReceipt(false)} 
        transaction={lastTransaction} 
      />

      <QRISModal 
        isOpen={showQRIS}
        onClose={() => setShowQRIS(false)}
        onSuccess={handleQRISSuccess}
        total={total}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};