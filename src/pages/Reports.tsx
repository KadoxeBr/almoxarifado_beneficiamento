/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Activity, 
  ArrowDownToDot, 
  ArrowUpFromDot, 
  Calendar,
  Download,
  FileSpreadsheet,
  Filter,
  Search,
  Trash2,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import { sheetsService } from '../services/sheetsService';
import { Movement, Employee, Product } from '../types';
import { cn } from '../lib/utils';
import { format, parseISO } from 'date-fns';

export function Reports() {
  const [movements, setMovements] = React.useState<Movement[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filterType, setFilterType] = React.useState<string>('');
  const [filterEmployee, setFilterEmployee] = React.useState<string>('');
  const [searchProduct, setSearchProduct] = React.useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [movsData, empData, prodData] = await Promise.all([
        sheetsService.getMovements(),
        sheetsService.getEmployees(),
        sheetsService.getProducts()
      ]);
      setMovements(movsData);
      setEmployees(empData);
      setProducts(prodData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleDeleteMovement = async (id: number) => {
    if (!window.confirm(`Tem certeza que deseja excluir a movimentação #${id}? O saldo do produto será revertido.`)) return;
    
    try {
      const res = await sheetsService.deleteMovement(id);
      if (res.status === 'success') {
        toast.success('Movimentação excluída com sucesso!');
        loadData();
      } else {
        toast.error(res.message || 'Erro ao excluir movimentação.');
      }
    } catch (error) {
      toast.error('Erro de conexão.');
    }
  };

  const filteredMovements = movements.filter(m => {
    const matchesType = !filterType || m.tipo === filterType;
    const matchesEmployee = !filterEmployee || m.funcionario === filterEmployee;
    const search = searchProduct.toLowerCase();
    const productDesc = products.find(p => p.id === m.idProduto)?.desc || '';
    const matchesProduct = !searchProduct || 
      (m.idProduto ? String(m.idProduto).toLowerCase().includes(search) : false) ||
      productDesc.toLowerCase().includes(search);
    return matchesType && matchesEmployee && matchesProduct;
  });

  const handleExportCSV = () => {
    if (filteredMovements.length === 0) {
      toast.error('Nenhum dado para exportar.');
      return;
    }

    const headers = ['Data', 'Tipo', 'Código Produto', 'Descrição Produto', 'Quantidade', 'Responsável/Fornecedor', 'Setor', 'Total (R$)'];
    const csvContent = [
      headers.join(';'),
      ...filteredMovements.map(m => {
        const productDesc = products.find(p => p.id === m.idProduto)?.desc || 'PRODUTO DESCONHECIDO';
        return [
          m.data,
          m.tipo,
          m.idProduto,
          `"${productDesc}"`,
          m.quantidade,
          `"${m.funcionario || m.fornecedor || ''}"`,
          `"${m.setor || ''}"`,
          m.total.toFixed(2).replace('.', ',')
        ].join(';');
      })
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_movimentacoes_${format(new Date(), 'dd-MM-yyyy_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Relatório exportado com sucesso!');
  };

  // Data for charts
  const typeData = [
    { name: 'Entradas', value: movements.filter(m => m.tipo === 'ENTRADA').length },
    { name: 'Saídas', value: movements.filter(m => m.tipo === 'SAIDA').length },
  ];

  // Top employees by exits (Saídas)
  const employeeExitsData = Object.entries(
    movements
      .filter(m => m.tipo === 'SAIDA')
      .reduce((acc, m) => {
        const empName = m.funcionario || 'Desconhecido';
        acc[empName] = (acc[empName] || 0) + m.quantidade;
        return acc;
      }, {} as Record<string, number>)
  )
  .map(([name, value]) => ({ name, value }))
  .sort((a, b) => b.value - a.value)
  .slice(0, 5); // Top 5

  const COLORS = ['#10B981', '#F37021', '#3B82F6', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Relatórios</h2>
          <p className="text-slate-500 uppercase text-[9px] tracking-[0.4em] font-bold mt-1">Auditoria e Análise de Fluxo</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Exportar CSV
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-900/20">
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="text-base font-bold text-slate-900 mb-6">Movimentação por Tipo</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161B28', border: '1px solid #1F2937', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {typeData.map((item, index) => (
              <div key={`${item.name}-${index}`} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="text-base font-bold text-slate-900 mb-6">Top 5 Funcionários (Saídas/EPIs)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employeeExitsData} layout="vertical" margin={{ left: 20 }}>
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
                  width={80}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#161B28', border: '1px solid #1F2937', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" fill="#F37021" radius={[0, 4, 4, 0]} name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-base font-bold text-slate-900">Log de Operações</h3>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Produto..." 
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:ring-1 focus:ring-brand-orange transition-all text-slate-900 w-32 md:w-40"
              />
            </div>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-xs outline-none focus:ring-1 focus:ring-brand-orange text-slate-900"
            >
              <option value="">Todos Tipos</option>
              <option value="ENTRADA">Entradas</option>
              <option value="SAIDA">Saídas</option>
            </select>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select 
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs outline-none focus:ring-1 focus:ring-brand-orange text-slate-900 w-40 md:w-48 appearance-none"
              >
                <option value="">Todos Funcionários</option>
                {employees.map((emp, index) => (
                  <option key={`${emp.id || emp.nome}-${index}`} value={emp.nome}>{emp.nome}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-[9px] uppercase text-slate-500 font-black tracking-widest border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Produto</th>
                <th className="px-6 py-4 text-center">Qtd</th>
                <th className="px-6 py-4">Responsável</th>
                <th className="px-6 py-4">Setor</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500 uppercase font-bold tracking-widest text-xs animate-pulse">
                    Carregando Auditoria...
                  </td>
                </tr>
              ) : filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500 uppercase font-bold tracking-widest text-xs">
                    Nenhum registro encontrado
                  </td>
                </tr>
              ) : (
                filteredMovements.map((m, index) => (
                  <tr key={`${m.id}-${index}`} className="hover:bg-slate-50 transition-all group">
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                      {m.data}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                        m.tipo === 'ENTRADA' ? "bg-brand-blue/10 text-brand-blue" : "bg-brand-orange/10 text-brand-orange"
                      )}>
                        {m.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-[10px] text-brand-blue font-bold uppercase">{m.idProduto}</span>
                        <span className="text-xs text-slate-900 font-bold uppercase">
                          {products.find(p => p.id === m.idProduto)?.desc || 'PRODUTO DESCONHECIDO'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-slate-900">{m.quantidade}</td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-bold uppercase">{m.funcionario}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-bold uppercase">{m.setor}</td>
                    <td className="px-6 py-4 text-right font-mono text-xs text-slate-900">
                      R$ {m.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDeleteMovement(m.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Excluir Movimentação"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
