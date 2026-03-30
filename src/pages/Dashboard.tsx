/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, AlertTriangle, Activity, ArrowDownToDot, 
  ArrowUpFromDot, Search, FileSpreadsheet
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { sheetsService } from '../services/sheetsService';
import { DashboardStats, Product, Movement } from '../types';
import { cn } from '../lib/utils';
import { subMonths, isAfter, parseISO } from 'date-fns';

export function Dashboard() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Product[]>([]);
  const [allProducts, setAllProducts] = React.useState<Product[]>([]);
  const [movements, setMovements] = React.useState<Movement[]>([]);

  React.useEffect(() => {
    sheetsService.getDashboardStats().then(setStats);
    sheetsService.getProducts().then(setAllProducts);
    sheetsService.getMovements().then(setMovements);
  }, []);

  React.useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = allProducts.filter(p => {
        const search = searchQuery.toLowerCase();
        const idMatch = p.id ? String(p.id).toLowerCase().includes(search) : false;
        const descMatch = p.desc ? String(p.desc).toLowerCase().includes(search) : false;
        return idMatch || descMatch;
      });
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, allProducts]);

  if (!stats) return <div className="text-slate-500 font-medium text-sm animate-pulse flex items-center justify-center h-64">Carregando Painel...</div>;

  // Calculate top exits in the last month
  const oneMonthAgo = subMonths(new Date(), 1);
  const topExitsData = Object.entries(
    movements
      .filter(m => m.tipo === 'SAIDA')
      .filter(m => {
        try {
          // Assuming m.data is in a format parseable by Date or parseISO, e.g., '2026-03-29 11:30'
          // We'll replace space with T if needed, or just use new Date()
          const dateStr = m.data.replace(' ', 'T');
          return isAfter(new Date(dateStr), oneMonthAgo);
        } catch (e) {
          return true; // fallback
        }
      })
      .reduce((acc, m) => {
        const prodName = allProducts.find(p => p.id === m.idProduto)?.desc || m.idProduto;
        acc[prodName] = (acc[prodName] || 0) + m.quantidade;
        return acc;
      }, {} as Record<string, number>)
  )
  .map(([name, value]) => ({ name, value }))
  .sort((a, b) => b.value - a.value)
  .slice(0, 5); // Top 5

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Painel Operacional</h2>
          <p className="text-sm text-slate-500 mt-1">Gestão de inventário e fluxo de materiais</p>
        </div>

        <div className="relative w-full md:w-80">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Consultar saldo (Cód/Desc)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all text-slate-900 shadow-sm"
            />
          </div>
          
          {searchResults.length > 0 && (
            <div className="absolute w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto p-2">
              {searchResults.map((p, index) => (
                <div key={`${p.id}-${index}`} className="p-3 border-b border-slate-100 last:border-0 flex justify-between items-center hover:bg-slate-50 rounded-lg transition-all cursor-pointer">
                  <div>
                    <p className="text-xs text-brand-blue font-semibold">{p.id}</p>
                    <p className="text-sm text-slate-700 font-medium truncate max-w-[180px]">{p.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Saldo</p>
                    <p className={cn("text-sm font-bold", p.saldo <= p.estoqueMin ? "text-brand-orange" : "text-slate-900")}>
                      {p.saldo} {p.un}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Total de Itens" value={stats.totalProdutos} icon={Package} color="blue" />
        <StatCard label="Estoque Crítico" value={stats.itensCriticos} icon={AlertTriangle} color="orange" />
        <StatCard label="Movimentos Hoje" value={stats.movHoje} icon={Activity} color="indigo" />
        <StatCard label="Entradas no Mês" value={stats.entradasMes} icon={ArrowDownToDot} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-6">Top Saídas (Último Mês)</h3>
          <div className="h-64">
            {topExitsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topExitsData} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={false} />
                  <XAxis 
                    type="number"
                    stroke="#4B5563" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category"
                    stroke="#4B5563" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    width={100}
                    tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#161B28', border: '1px solid #1F2937', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" fill="#F37021" radius={[0, 4, 4, 0]} name="Quantidade" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm font-medium">
                Nenhuma saída registrada no último mês.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-slate-900">Itens em Nível Crítico</h3>
            <Link to="/estoque" className="text-sm text-brand-blue hover:text-blue-700 font-medium">Ver todos</Link>
          </div>
          <div className="space-y-3">
            {allProducts.filter(p => p.saldo <= p.estoqueMin).slice(0, 4).map((p, index) => (
              <div key={`${p.id}-${index}`} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-xs text-brand-orange font-semibold">{p.id}</p>
                  <p className="text-sm text-slate-700 font-medium truncate max-w-[200px]">{p.desc}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-brand-orange bg-orange-100 px-2.5 py-1 rounded-md">
                    {p.saldo} / {p.estoqueMin} {p.un}
                  </p>
                </div>
              </div>
            ))}
            {allProducts.filter(p => p.saldo <= p.estoqueMin).length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6" />
                </div>
                <p className="text-slate-500 text-sm font-medium">Estoque saudável. Nenhum item crítico.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: number, icon: any, color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-2">{label}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={cn("p-3 rounded-xl", colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
