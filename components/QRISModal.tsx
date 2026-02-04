import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2, QrCode } from 'lucide-react';

interface QRISModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  total: number;
  isDarkMode?: boolean;
}

export const QRISModal: React.FC<QRISModalProps> = ({ isOpen, onClose, onSuccess, total, isDarkMode }) => {
  const [status, setStatus] = useState<'showing' | 'checking' | 'success'>('showing');

  useEffect(() => {
    if (!isOpen) {
      setStatus('showing');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setStatus('checking');
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`relative w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden transition-colors duration-500 ${
        isDarkMode ? 'bg-[#161926] border border-[#1e2235]' : 'bg-white'
      }`}>
        {/* Header */}
        <div className="p-6 text-center border-b border-gray-100 dark:border-slate-800">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex justify-center mb-2">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <QrCode className="w-6 h-6" />
            </div>
          </div>
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Pembayaran QRIS</h2>
          <p className="text-sm text-gray-500 mt-1">Scan kode di bawah untuk membayar</p>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center">
          {status === 'showing' && (
            <>
              <div className={`p-4 rounded-2xl mb-6 shadow-inner ${isDarkMode ? 'bg-white' : 'bg-gray-50'}`}>
                {/* Simulated QR Code using a stylized div */}
                <div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px]"></div>
                  <QrCode className="w-32 h-32 text-slate-800 relative z-10" />
                  <div className="absolute bottom-2 left-0 right-0 text-center">
                    <span className="text-[8px] font-black text-slate-400 tracking-[0.2em]">PELANGI NUSANTARA</span>
                  </div>
                </div>
              </div>
              <div className="text-center mb-8">
                <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total Tagihan</p>
                <p className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Rp {total.toLocaleString('id-ID')}
                </p>
              </div>
              <button
                onClick={handleSimulatePayment}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Konfirmasi Pembayaran
              </button>
            </>
          )}

          {status === 'checking' && (
            <div className="py-12 flex flex-col items-center animate-in zoom-in-95 duration-300">
              <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-6" />
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Mengecek Pembayaran...</p>
              <p className="text-sm text-gray-500 mt-2">Mohon tunggu sebentar</p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-12 flex flex-col items-center animate-in zoom-in-95 duration-300">
              <div className="bg-emerald-100 dark:bg-emerald-500/20 p-4 rounded-full mb-6">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className={`text-2xl font-black ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Pembayaran Berhasil!</p>
              <p className={`text-sm mt-2 text-center ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Transaksi telah kami terima. Struk sedang disiapkan.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 text-center border-t ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-gray-50 border-gray-100'}`}>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Terjamin oleh QRIS Nusantara</p>
        </div>
      </div>
    </div>
  );
};
