/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Search, 
  ArrowUpFromDot, 
  Minus, 
  User,
  Layers,
  PiggyBank,
  Cpu,
  Calendar
} from 'lucide-react';
import { sheetsService } from '../services/sheetsService';
import { Product, Employee, Sector, CostCenter, Machine, Movement } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export function Exits() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [sectors, setSectors] = React.useState<Sector[]>([]);
  const [costCenters, setCostCenters] = React.useState<CostCenter[]>([]);
  const [machines, setMachines] = React.useState<Machine[]>([]);
  
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    quantidade: '',
    funcionario: '',
    setor: '',
    centroCusto: '',
    maquina: '',
    data: new Date().toISOString().split('T')[0]
  });

  React.useEffect(() => {
    sheetsService.getProducts().then(setProducts);
    // Mocking other data
    setEmployees([{ id: 'E-001', nome: 'JOAO SILVA', setor: 'MANUTENCAO' }, { id: 'E-002', nome: 'MARIA SOUZA', setor: 'PRODUCAO' }]);
    setSectors([{ id: 'S-001', nome: 'MANUTENCAO' }, { id: 'S-002', nome: 'PRODUCAO' }]);
    setCostCenters([{ id: 'CC-001', nome: 'GERAL' }, { id: 'CC-002', nome: 'MAQUINARIA' }]);
    setMachines([{ id: 'M-001', nome: 'EMPILHADEIRA TOYOTA' }, { id: 'M-002', nome: 'TORNO MECANICO' }]);
  }, []);

  React.useEffect(() => {
    if (searchQuery.length > 0 && !selectedProduct) {
      const filtered = products.filter(p => {
        const search = searchQuery.toLowerCase();
        const idMatch = p.id ? String(p.id).toLowerCase().includes(search) : false;
        const descMatch = p.desc ? String(p.desc).toLowerCase().includes(search) : false;
        return idMatch || descMatch;
      });
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, products, selectedProduct]);

  const handleSelectProduct = (p: Product) => {
    setSelectedProduct(p);
    setSearchQuery(`${p.id} - ${p.desc}`);
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return toast.error('Selecione um produto primeiro.');
    
    const qtd = parseFloat(formData.quantidade);
    
    if (isNaN(qtd) || qtd <= 0) {
      return toast.error('A quantidade deve ser maior que zero.');
    }
    
    if (qtd > selectedProduct.saldo) {
      return toast.error(`Saldo insuficiente! O máximo disponível é ${selectedProduct.saldo.toFixed(2)} ${selectedProduct.un}.`);
    }
    
    setLoading(true);
    const movement: Partial<Movement> = {
      tipo: 'SAIDA',
      idProduto: selectedProduct.id,
      quantidade: parseFloat(formData.quantidade),
      funcionario: formData.funcionario,
      setor: formData.setor,
      centroCusto: formData.centroCusto,
      maquina: formData.maquina,
      data: formData.data,
      valorUnitario: selectedProduct.ultimoCusto,
      total: parseFloat(formData.quantidade) * selectedProduct.ultimoCusto
    };

    const res = await sheetsService.addMovement(movement);
    setLoading(false);

    if (res.status === 'success') {
      toast.success(res.message);
      setSelectedProduct(null);
      setSearchQuery('');
      setFormData({
        quantidade: '',
        funcionario: '',
        setor: '',
        centroCusto: '',
        maquina: '',
        data: new Date().toISOString().split('T')[0]
      });
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center md:text-left">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Requisição</h2>
        <p className="text-slate-500 uppercase text-[9px] tracking-[0.4em] font-bold mt-2">Saída de Insumos e Equipamentos</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-orange/20"></div>

        <div className="relative">
          <label className="text-sm font-medium text-slate-700 mb-1.5 ml-1">1. Localizar Item (Cód ou Descrição)</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input 
              type="text" 
              placeholder="Ex: COMP-0001 ou Filtro..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (selectedProduct) setSelectedProduct(null);
              }}
              className={cn(
                "w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl text-slate-900 outline-none transition-all font-medium",
                selectedProduct ? "border-brand-orange" : "border-slate-200 focus:ring-1 focus:ring-brand-orange"
              )}
            />
          </div>
          
          {searchResults.length > 0 && (
            <div className="absolute w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto p-2">
              {searchResults.map((p, index) => (
                <div 
                  key={`${p.id}-${index}`} 
                  onClick={() => handleSelectProduct(p)}
                  className="p-3 border-b border-slate-200 last:border-0 hover:bg-white/5 rounded-xl transition-all cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <p className="text-[10px] text-brand-orange font-mono font-bold uppercase">{p.id}</p>
                    <p className="text-xs text-slate-900 font-bold uppercase">{p.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-slate-500 uppercase font-black">Saldo</p>
                    <p className="text-xs font-mono font-bold text-slate-900">{p.saldo.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-200/50">
          <div className="sm:col-span-1">
            <label className="text-sm font-medium text-slate-700 mb-1.5 ml-1">Qtd</label>
            <div className="relative">
              <Minus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input 
                type="number" 
                step="0.01"
                min="0.01"
                max={selectedProduct?.saldo || 0}
                required
                disabled={!selectedProduct}
                placeholder="0.00"
                value={formData.quantidade}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (selectedProduct && val > selectedProduct.saldo) {
                    toast.error(`Atenção: O saldo máximo é ${selectedProduct.saldo.toFixed(2)}`);
                    setFormData(prev => ({ ...prev, quantidade: selectedProduct.saldo.toString() }));
                  } else {
                    setFormData(prev => ({ ...prev, quantidade: e.target.value }));
                  }
                }}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-mono text-xl outline-none focus:ring-1 focus:ring-brand-orange disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          <div className="sm:col-span-1">
            <label className="text-sm font-medium text-slate-700 mb-1.5 ml-1">Unid</label>
            <input 
              type="text" 
              disabled 
              value={selectedProduct?.un || '---'}
              className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl text-center text-xs text-slate-500 font-bold uppercase"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="text-sm font-medium text-slate-700 mb-1.5 ml-1">Saldo Atual</label>
            <input 
              type="text" 
              disabled 
              value={selectedProduct?.saldo.toFixed(2) || '0.00'}
              className="w-full px-4 py-4 bg-white border border-slate-200 rounded-2xl text-brand-orange font-black text-center text-xl font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 mb-1.5 ml-1">Funcionário</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <select 
                required
                value={formData.funcionario}
                onChange={(e) => setFormData(prev => ({ ...prev, funcionario: e.target.value }))}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-1 focus:ring-brand-orange appearance-none"
              >
                <option value="">Selecione...</option>
                {employees.map((e, index) => <option key={`${e.id}-${index}`} value={e.nome}>{e.nome}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 mb-1.5 ml-1">Setor</label>
            <div className="relative">
              <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <select 
                required
                value={formData.setor}
                onChange={(e) => setFormData(prev => ({ ...prev, setor: e.target.value }))}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-1 focus:ring-brand-orange appearance-none"
              >
                <option value="">Selecione...</option>
                {sectors.map((s, index) => <option key={`${s.id}-${index}`} value={s.nome}>{s.nome}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 mb-1.5 ml-1">Centro de Custo</label>
            <div className="relative">
              <PiggyBank className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <select 
                required
                value={formData.centroCusto}
                onChange={(e) => setFormData(prev => ({ ...prev, centroCusto: e.target.value }))}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-1 focus:ring-brand-orange appearance-none"
              >
                <option value="">Selecione...</option>
                {costCenters.map((cc, index) => <option key={`${cc.id}-${index}`} value={cc.nome}>{cc.nome}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 mb-1.5 ml-1">Máquina / Equipamento</label>
            <div className="relative">
              <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <select 
                value={formData.maquina}
                onChange={(e) => setFormData(prev => ({ ...prev, maquina: e.target.value }))}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-1 focus:ring-brand-orange appearance-none"
              >
                <option value="">Opcional...</option>
                {machines.map((m, index) => <option key={`${m.id}-${index}`} value={m.nome}>{m.nome}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 mb-1.5 ml-1">Data da Requisição</label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input 
              type="date" 
              required
              value={formData.data}
              onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-1 focus:ring-brand-orange"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-brand-orange text-white font-black py-5 rounded-2xl uppercase text-[10px] tracking-[0.3em] hover:bg-orange-500 transition-all shadow-lg shadow-brand-orange/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? 'Processando...' : 'Efetivar Saída'}
        </button>
      </form>
    </div>
  );
}
