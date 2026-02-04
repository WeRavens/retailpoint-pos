import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { getProducts, saveProduct, deleteProduct } from '../services/data';
import { Search, Plus, Edit2, Trash2, AlertTriangle, X, Save } from 'lucide-react';

export const Inventory: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = false }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State using strings to handle input clearing better
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '0',
    stock: '0',
    lowStockThreshold: '10'
  });

  const loadProducts = async () => {
    const data = await getProducts();
    setProducts(data);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price.toString(),
        stock: product.stock.toString(),
        lowStockThreshold: product.lowStockThreshold.toString()
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: '',
        price: '0',
        stock: '0',
        lowStockThreshold: '10'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fallback for environments where crypto.randomUUID is not available
    const generateId = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    };

    const product: Product = {
      id: editingProduct ? editingProduct.id : generateId(),
      name: formData.name,
      category: formData.category,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock) || 0,
      lowStockThreshold: parseInt(formData.lowStockThreshold) || 0
    };
    await saveProduct(product);
    await loadProducts();
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
      await loadProducts();
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`p-4 md:p-6 h-full flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Inventaris</h1>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'} text-sm`}>Kelola produk dan tingkat stok</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk
        </button>
      </div>

      <div className={`rounded-xl shadow-sm border flex flex-col flex-1 min-h-0 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
      }`}>
        <div className={`p-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau kategori..."
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-gray-200 text-gray-900'
              }`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className={`${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50'} sticky top-0 z-10`}>
              <tr>
                <th className={`p-4 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Produk</th>
                <th className={`p-4 text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Kategori</th>
                <th className={`p-4 text-xs font-semibold uppercase tracking-wider text-right ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Harga</th>
                <th className={`p-4 text-xs font-semibold uppercase tracking-wider text-center ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Stok</th>
                <th className={`p-4 text-xs font-semibold uppercase tracking-wider text-right ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Aksi</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-gray-100'}`}>
              {filteredProducts.map(product => {
                const isLowStock = product.stock <= product.lowStockThreshold;
                return (
                  <tr key={product.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}`}>
                    <td className={`p-4 font-medium ${isDarkMode ? 'text-slate-200' : 'text-gray-900'}`}>{product.name}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-100 text-gray-500'}`}>{product.category}</span>
                    </td>
                    <td className={`p-4 text-right font-medium ${isDarkMode ? 'text-slate-200' : 'text-gray-900'}`}>Rp {product.price.toLocaleString('id-ID')}</td>
                    <td className="p-4 text-center">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-sm font-medium ${
                        product.stock === 0 ? (isDarkMode ? 'bg-red-500/10 text-red-400' : 'bg-red-100 text-red-700') :
                        isLowStock ? (isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-100 text-orange-700') : (isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-700')
                      }`}>
                        {isLowStock && <AlertTriangle className="w-3 h-3" />}
                        {product.stock}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800' : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50'}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'text-slate-400 hover:text-red-400 hover:bg-slate-800' : 'text-gray-500 hover:text-red-600 hover:bg-red-50'}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              Tidak ada produk yang cocok dengan pencarian Anda.
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 ${
            isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'
          }`}>
            <div className={`flex justify-between items-center p-6 border-b ${
              isDarkMode ? 'border-slate-800' : 'border-gray-100'
            }`}>
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-700'}`}>Nama Produk</label>
                <input
                  required
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'
                  }`}
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-700'}`}>Kategori</label>
                  <input
                    required
                    type="text"
                    list="categories"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'
                    }`}
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  />
                  <datalist id="categories">
                    <option value="Minuman" />
                    <option value="Makanan" />
                    <option value="Elektronik" />
                    <option value="Pakaian" />
                  </datalist>
                </div>
                <div className="space-y-1">
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-700'}`}>Harga (Rp)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'
                    }`}
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-700'}`}>Stok Saat Ini</label>
                  <input
                    required
                    type="number"
                    min="0"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'
                    }`}
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-700'}`}>Peringatan Stok Rendah</label>
                  <input
                    required
                    type="number"
                    min="0"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300'
                    }`}
                    value={formData.lowStockThreshold}
                    onChange={e => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};