import React from 'react';
import { Transaction } from '../types';
import { Printer, CheckCircle, X } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, transaction }) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 modal-overlay backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Pembayaran Berhasil
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Printable Area */}
        <div id="printable-receipt" className="p-6 bg-white overflow-y-auto flex-1">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Pelangi Nusantara</h2>
            <p className="text-sm text-gray-500">Sistem Kasir UMKM</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(transaction.date).toLocaleString('id-ID')}</p>
            <p className="text-xs text-gray-400">ID: {transaction.id.slice(0, 8)}</p>
          </div>

          <div className="border-t border-b border-dashed border-gray-300 py-4 mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="pb-2">Barang</th>
                  <th className="pb-2 text-right">Jml</th>
                  <th className="pb-2 text-right">Harga</th>
                </tr>
              </thead>
              <tbody>
                {transaction.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-1">{item.name}</td>
                    <td className="py-1 text-right">{item.quantity}</td>
                    <td className="py-1 text-right">Rp {item.price.toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Metode Pembayaran</span>
              <span className="font-medium capitalize">{transaction.paymentMethod === 'cash' ? 'Tunai' : 'E-Wallet'}</span>
            </div>
            <div className="flex justify-between text-xl font-bold mt-4 pt-4 border-t border-gray-200">
              <span>Total</span>
              <span>Rp {transaction.total.toLocaleString('id-ID')}</span>
            </div>
          </div>
          
          <div className="mt-8 text-center text-xs text-gray-400">
            <p>Terima kasih telah berbelanja!</p>
            <p>Kami tunggu kunjungan Anda kembali.</p>
          </div>
        </div>

        {/* Modal Footer (Hidden when printing) */}
        <div className="p-4 border-t bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Cetak Struk
          </button>
        </div>
      </div>
    </div>
  );
};