/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Search, 
  ArrowDownToDot, 
  Plus, 
  Trash2, 
  Save,
  Truck,
  Calendar,
  DollarSign
} from 'lucide-react';
import { sheetsService } from '../services/sheetsService';
import { Product, Supplier, Movement } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export function Entries() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Form state
  const [formData, setFormData] = React.useState({
    quantidade: '',
    valorUnitario: '',
    fornecedor: '',
    data: new Date().toISOString().split('T')[0]
  });

  React.useEffect(() => {
    sheetsService.getProducts().then(setProducts);
    sheetsService.getSuppliers().then(setSuppliers);
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
    setFormData(prev => ({ ...prev, valorUnitario: p.ultimoCusto.toString() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return toast.error('Selecione um produto');
    
    setLoading(true);
    const movement: Partial<Movement> = {
      tipo: 'ENTRADA',
      idProduto: selectedProduct.id,
      quantidade: parseFloat(formData.quantidade),
      valorUnitario: parseFloat(formData.valorUnitario),
      fornecedor: formData.fornecedor,
      data: formData.data,
      funcionario: 'ADMIN', // Should come from auth
      setor: 'ALMOXARIFADO',
      centroCusto: 'GERAL'
    };

    const res = await sheetsService.addMovement(movement);
    setLoading(false);

    if (res.status === 'success') {
      toast.success(res.message);
      setSelectedProduct(null);
      setSearchQuery('');
      setFormData({
        quantidade: '',
        valorUnitario: '',
        fornecedor: '',
        data: new Date().toISOString().split('T')[0]
      });
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="text-center md:text-left">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Abastecimento</h2>
        <p className="text-slate-500 uppercase text-[9px] tracking-[0.4em] font-bold mt-2">Entrada de Materiais no Estoque</p>
      </header>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl border border-slate-200 space-y-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-blue/20"></div>
        
        <div className="relative">
          <label className="text-sm font-medium text-slate-700 mb-1.5 ml-1">Localizar Produto (Código ou Nome)</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input 
              type="text" 
              placeholder="Ex: COMP-0001 ou Óleo..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (selectedProduct) setSelectedProduct(null);
              }}
              className={cn(
                "w-full pl-12 pr-4 py-4 bg-slate-50 border rounded-2xl text-slate-900 outline-none transition-all font-medium",
                selectedProduct ? "border-brand-blue" : "border-slate-200 focus:ring-1 focus:ring-brand-blue"
              )}
            />
          </div>
          
          {searchResults.length > 0 && (
            <div className="absolute w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto p-2">
              {searchResults.map((p, index) => (
                <div 
                  key={`${p.id}-${index}`} 
                  onClick={() => handleSelectProduct(p)}
                  className="p-3 border-b border-slate-200 last:border-0 hover:bg-white/5 rounded-xl transition-all cursor-pointer"
                >
                  <p className="text-[10px] text-brand-blue font-mono font-bold uppercase">{p.id}</p>
                  <p className="text-xs text-slate-900 font-bold uppercase">{p.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 mb-1.5 ml-1">Fornecedor</label>
            <div className="relative">
              <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <select 
                required
                value={formData.fornecedor}
                onChange={(e) => setFormData(prev => ({ ...prev, fornecedor: e.target.value }))}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-1 focus:ring-brand-blue appearance-none"
              >
                <option value="">Selecione...</option>
                {suppliers.map((s, index) => <option key={`${s.id}-${index}`} value={s.nome}>{s.nome}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 mb-1.5 ml-1">Data da Nota</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input 
                type="date" 
                required
                value={formData.data}
                onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 mb-1.5 ml-1">Quantidade</label>
            <div className="relative">
              <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input 
                type="number" 
                step="0.01"
                required
                placeholder="0.00"
                value={formData.quantidade}
                onChange={(e) => setFormData(prev => ({ ...prev, quantidade: e.target.value }))}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-1 focus:ring-brand-blue font-mono"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-600 uppercase">
                {selectedProduct?.un || 'UN'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 mb-1.5 ml-1">Valor Unitário</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              <input 
                type="number" 
                step="0.01"
                required
                placeholder="0.00"
                value={formData.valorUnitario}
                onChange={(e) => setFormData(prev => ({ ...prev, valorUnitario: e.target.value }))}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-1 focus:ring-brand-blue font-mono"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex justify-between items-center">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total da Operação</span>
          <span className="text-2xl font-black text-brand-blue font-mono">
            R$ {(parseFloat(formData.quantidade || '0') * parseFloat(formData.valorUnitario || '0')).toFixed(2)}
          </span>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-brand-blue text-white font-black py-5 rounded-2xl uppercase text-[10px] tracking-[0.3em] hover:bg-blue-500 transition-all shadow-lg shadow-brand-blue/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? 'Processando...' : 'Efetivar Entrada'}
        </button>
      </form>
    </div>
  );
}
