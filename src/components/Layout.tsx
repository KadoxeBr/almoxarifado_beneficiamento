/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ArrowDownToDot, ArrowUpFromDot, 
  FileSpreadsheet, Settings, LogOut, Menu, X, User
} from 'lucide-react';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Estoque', icon: Package, path: '/estoque' },
  { label: 'Entradas', icon: ArrowDownToDot, path: '/entradas' },
  { label: 'Saídas', icon: ArrowUpFromDot, path: '/saidas' },
  { label: 'Relatórios', icon: FileSpreadsheet, path: '/relatorios' },
  { label: 'Cadastros', icon: Settings, path: '/cadastros' },
];

export function Layout({ children, onLogout }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const user = auth.currentUser;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-slate-800 shadow-xl z-20">
        <div className="p-6 flex items-center justify-center border-b border-slate-800/50">
          <div className="bg-white p-3 rounded-xl w-full flex justify-center shadow-sm">
            <img 
              src="https://drive.google.com/thumbnail?id=1u60rekYWjseJ0IV_LY0cz7GfvFavgriH&sz=w1000" 
              alt="COMPESCAL" 
              className="h-10 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium",
                  isActive 
                    ? "bg-brand-blue text-white shadow-md" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/50 flex flex-col gap-3">
          {user && (
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'Usuário'} className="w-8 h-8 rounded-full border border-slate-700" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
              )}
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-medium text-slate-200 truncate">{user.displayName || 'Usuário'}</span>
                <span className="text-xs text-slate-500 truncate">{user.email}</span>
              </div>
            </div>
          )}
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <img 
            src="https://drive.google.com/thumbnail?id=1u60rekYWjseJ0IV_LY0cz7GfvFavgriH&sz=w1000" 
            alt="COMPESCAL" 
            className="h-8 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-sidebar/95 backdrop-blur-sm z-40 pt-20 px-6">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl text-base font-medium transition-all",
                    isActive ? "bg-brand-blue text-white shadow-md" : "text-slate-300 hover:bg-white/5"
                  )}
                >
                  <item.icon className="w-6 h-6" />
                  {item.label}
                </Link>
              );
            })}
            <button 
              onClick={() => {
                setIsMobileMenuOpen(false);
                onLogout();
              }}
              className="flex items-center gap-4 p-4 rounded-xl text-base font-medium text-red-400 hover:bg-red-500/10 w-full text-left mt-4"
            >
              <LogOut className="w-6 h-6" />
              Sair do Sistema
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
