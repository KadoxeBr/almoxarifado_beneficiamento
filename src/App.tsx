/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Entries } from './pages/Entries';
import { Exits } from './pages/Exits';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-bg-dark flex items-center justify-center text-brand-blue font-mono text-sm animate-pulse">Carregando...</div>;
  }

  if (!isAuthenticated) {
    return (
      <>
        <Toaster 
          position="top-center" 
          toastOptions={{
            className: 'bg-bg-card border-border-dark text-white font-bold uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl',
          }}
        />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  return (
    <Router>
      <Toaster 
        position="top-center" 
        toastOptions={{
          className: 'bg-bg-card border-border-dark text-white font-bold uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl',
        }}
      />
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/estoque" element={<Inventory />} />
          <Route path="/entradas" element={<Entries />} />
          <Route path="/entradas/nova" element={<Entries />} />
          <Route path="/saidas" element={<Exits />} />
          <Route path="/saidas/nova" element={<Exits />} />
          <Route path="/relatorios" element={<Reports />} />
          <Route path="/cadastros" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}
