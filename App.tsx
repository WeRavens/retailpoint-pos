import React, { useState } from 'react';
import { ViewState } from './types';
import { POS } from './components/POS';
import { Inventory } from './components/Inventory';
import { Reports } from './components/Reports';
import { LayoutGrid, ShoppingCart, BarChart3, Menu, Store, Sun, Moon } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('pos');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'pos': return <POS isDarkMode={isDarkMode} />;
      case 'inventory': return <Inventory isDarkMode={isDarkMode} />;
      case 'reports': return <Reports isDarkMode={isDarkMode} />;
      default: return <POS />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        currentView === view 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/10' 
          : isDarkMode 
            ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
            : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  const ThemeToggle = () => (
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl w-full transition-all ${
        isDarkMode 
          ? 'text-yellow-400 hover:bg-slate-800' 
          : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
      }`}
    >
      {isDarkMode ? (
        <><Sun className="w-5 h-5" /> <span className="font-medium text-slate-300">Light Mode</span></>
      ) : (
        <><Moon className="w-5 h-5" /> <span className="font-medium">Dark Mode</span></>
      )}
    </button>
  );

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 text-gray-900'
    }`}>
      
      {/* Sidebar - Desktop */}
      <aside className={`hidden md:flex flex-col w-64 border-r h-full p-4 z-10 transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-2 px-4 mb-10 pt-2">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Pelangi Nusantara</h1>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>POS System</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem view="pos" icon={ShoppingCart} label="Cashier (POS)" />
          <NavItem view="inventory" icon={LayoutGrid} label="Inventory" />
          <NavItem view="reports" icon={BarChart3} label="Reports" />
          <div className={`my-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`} />
          <ThemeToggle />
        </nav>

        <div className={`p-4 rounded-2xl border mt-auto ${
          isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-gray-50 border-gray-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-inner">
              AD
            </div>
            <div className="overflow-hidden">
              <p className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admin User</p>
              <p className={`text-[10px] font-medium truncate uppercase ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>Store Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className={`md:hidden fixed top-0 left-0 right-0 h-16 border-b z-20 flex items-center justify-between px-4 transition-colors duration-300 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Pelangi Nusantara</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`p-2 active:scale-95 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className={`absolute top-16 left-0 right-0 border-b p-4 space-y-2 shadow-2xl animate-in slide-in-from-top-4 duration-200 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
          }`} onClick={e => e.stopPropagation()}>
            <NavItem view="pos" icon={ShoppingCart} label="Cashier (POS)" />
            <NavItem view="inventory" icon={LayoutGrid} label="Inventory" />
            <NavItem view="reports" icon={BarChart3} label="Reports" />
            <div className={`my-2 border-t ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`} />
            <ThemeToggle />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full pt-16 md:pt-0">
        <div className={`flex-1 h-full overflow-hidden relative ${isDarkMode ? 'dark' : ''}`}>
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;