import React, { useMemo, useState, useEffect } from 'react';
import { getSalesSummary } from '../services/data';
import { SalesSummary } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, Calendar } from 'lucide-react';

export const Reports: React.FC<{ isDarkMode?: boolean }> = ({ isDarkMode = false }) => {
  const [summary, setSummary] = useState<SalesSummary | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      const data = await getSalesSummary();
      setSummary(data);
    };
    fetchSummary();
  }, []);

  if (!summary) return <div>Memuat...</div>;

  // Calculate today's sales
  const today = new Date().toLocaleDateString('en-CA');
  const todaysSales = summary.dailySales.find(d => d.date === today)?.amount || 0;

  return (
    <div className={`p-4 md:p-6 h-full overflow-y-auto transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Laporan Penjualan</h1>
        <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'} text-sm`}>Ringkasan kinerja toko</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`p-6 rounded-xl shadow-sm border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total Pendapatan</h3>
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Rp {summary.totalRevenue.toLocaleString('id-ID')}</div>
          <p className="text-sm text-green-600 flex items-center mt-2">
            <TrendingUp className="w-4 h-4 mr-1" />
            Penjualan sepanjang waktu
          </p>
        </div>

        <div className={`p-6 rounded-xl shadow-sm border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Transaksi</h3>
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{summary.totalTransactions}</div>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Total pesanan diproses</p>
        </div>

        <div className={`p-6 rounded-xl shadow-sm border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Penjualan Hari Ini</h3>
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Rp {todaysSales.toLocaleString('id-ID')}</div>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Pendapatan untuk {new Date().toLocaleDateString('id-ID')}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className={`p-6 rounded-xl shadow-sm border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} mb-8`}>
        <h2 className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Tren Penjualan Harian</h2>
        <div className="h-80 w-full">
          {summary.dailySales.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              < BarChart data={summary.dailySales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#1e293b' : '#E5E7EB'} />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  stroke={isDarkMode ? '#64748b' : '#9CA3AF'}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  stroke={isDarkMode ? '#64748b' : '#9CA3AF'} 
                  tick={{ fontSize: 12 }} 
                  tickLine={false}
                  tickFormatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
                />
                <Tooltip 
                  cursor={{ fill: isDarkMode ? '#1e293b' : '#F3F4F6' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                    color: isDarkMode ? '#f1f5f9' : '#000000'
                  }}
                  itemStyle={{ color: '#6366f1' }}
                  formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex items-center justify-center text-gray-400">
               Belum ada data penjualan.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};