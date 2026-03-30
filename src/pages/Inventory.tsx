/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, Plus, Package, Edit2, Trash2, X } from 'lucide-react';
import { sheetsService } from '../services/sheetsService';
import { Product } from '../types';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export function Inventory() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [isAdding, setIsAdding] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [newProduct, setNewProduct] = React.useState<Partial<Product>>({
    id: '', desc: '', un: 'UN', saldo: 0, estoqueMin: 0, ultimoCusto: 0
  });

  const generateNextId = (currentProducts: Product[]) => {
    let maxNum = 0;
    for (const p of currentProducts) {
      if (p.id && p.id.startsWith('COMP-')) {
        const numPart = p.id.replace('COMP-', '');
        const num = parseInt(numPart, 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
    const nextNum = maxNum + 1;
    return `COMP-${nextNum.toString().padStart(3, '0')}`;
  };

  const loadProducts = () => {
    setLoading(true);
    sheetsService.getProducts().then(data => {
      setProducts(data);
      setLoading(false);
    });
  };

  React.useEffect(() => {
    loadProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.id || !newProduct.desc) {
      toast.error('Preencha o código e a descrição do produto.');
      return;
    }
    
    setSaving(true);
    try {
      let res;
      if (isEditing) {
        res = await sheetsService.updateEntity('products', newProduct.id, newProduct);
      } else {
        res = await sheetsService.addEntity('products', newProduct);
      }
      
      if (res.status === 'success') {
        toast.success(isEditing ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
        setIsAdding(false);
        setIsEditing(false);
        setNewProduct({ id: '', desc: '', un: 'UN', saldo: 0, estoqueMin: 0, ultimoCusto: 0 });
        loadProducts();
      } else {
        toast.error(res.message || 'Erro ao salvar produto.');
      }
    } catch (error) {
      toast.error('Erro de conexão.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (product: Product) => {
    setNewProduct(product);
    setIsEditing(true);
    setIsAdding(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o produto ${id}?`)) return;
    
    try {
      const res = await sheetsService.deleteEntity('products', id);
      if (res.status === 'success') {
        toast.success('Produto excluído com sucesso!');
        loadProducts();
      } else {
        toast.error(res.message || 'Erro ao excluir produto.');
      }
    } catch (error) {
      toast.error('Erro de conexão.');
    }
  };

  const filteredProducts = products.filter(p => {
    const search = searchQuery.toLowerCase();
    const idMatch = p.id ? String(p.id).toLowerCase().includes(search) : false;
    const descMatch = p.desc ? String(p.desc).toLowerCase().includes(search) : false;
    return idMatch || descMatch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Estoque Atual</h2>
          <p className="text-sm text-slate-500 mt-1">Gerencie os produtos e saldos</p>
        </div>
        <button 
          onClick={() => {
            const nextId = generateNextId(products);
            setNewProduct({ id: nextId, desc: '', un: 'UN', saldo: 0, estoqueMin: 0, ultimoCusto: 0 });
            setIsEditing(false);
            setIsAdding(true);
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-blue text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Novo Produto
        </button>
      </header>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">{isEditing ? 'Editar Produto' : 'Cadastrar Novo Produto'}</h3>
              <button 
                onClick={() => {
                  setIsAdding(false);
                  setIsEditing(false);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 ml-1 block">Código do Produto</label>
                  <input 
                    type="text" 
                    required
                    disabled={true}
                    value={newProduct.id}
                    onChange={e => setNewProduct({...newProduct, id: e.target.value.toUpperCase()})}
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none transition-all uppercase opacity-70 cursor-not-allowed font-semibold text-slate-700"
                    placeholder="Ex: COMP-001"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 ml-1 block">Unidade de Medida</label>
                  <select 
                    value={newProduct.un}
                    onChange={e => setNewProduct({...newProduct, un: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                  >
                    <option value="UN">Unidade (UN)</option>
                    <option value="KG">Quilograma (KG)</option>
                    <option value="L">Litro (L)</option>
                    <option value="CX">Caixa (CX)</option>
                    <option value="PC">Peça (PC)</option>
                    <option value="M">Metro (M)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700 mb-1.5 ml-1 block">Descrição Completa</label>
                  <input 
                    type="text" 
                    required
                    value={newProduct.desc}
                    onChange={e => setNewProduct({...newProduct, desc: e.target.value.toUpperCase()})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all uppercase"
                    placeholder="Ex: ROLAMENTO 6205 ZZ"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 ml-1 block">Saldo Inicial</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={newProduct.saldo}
                    onChange={e => setNewProduct({...newProduct, saldo: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 ml-1 block">Estoque Mínimo</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={newProduct.estoqueMin}
                    onChange={e => setNewProduct({...newProduct, estoqueMin: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setIsEditing(false);
                  }}
                  className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-brand-blue text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? 'Salvando...' : (isEditing ? 'Atualizar Produto' : 'Salvar Produto')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por código ou descrição..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all text-slate-900"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Package className="w-4 h-4" />
            <span>{filteredProducts.length} itens encontrados</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Código</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4 text-center">Un</th>
                <th className="px-6 py-4 text-right">Saldo</th>
                <th className="px-6 py-4 text-right">Mínimo</th>
                <th className="px-6 py-4 text-right">Status</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium text-sm animate-pulse">
                    Carregando inventário...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 font-medium text-sm">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p, index) => (
                  <tr key={`${p.id}-${index}`} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-brand-blue">{p.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{p.desc}</td>
                    <td className="px-6 py-4 text-center text-slate-500">{p.un}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">{p.saldo}</td>
                    <td className="px-6 py-4 text-right text-slate-500">{p.estoqueMin}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-bold",
                        p.saldo <= p.estoqueMin 
                          ? "bg-orange-100 text-orange-700" 
                          : "bg-emerald-100 text-emerald-700"
                      )}>
                        {p.saldo <= p.estoqueMin ? 'CRÍTICO' : 'NORMAL'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditClick(p)}
                          className="p-1.5 text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(p.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                          title="Excluir"
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
