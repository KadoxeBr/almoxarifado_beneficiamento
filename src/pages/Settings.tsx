/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Users, 
  Layers, 
  PiggyBank, 
  Cpu, 
  Truck,
  Plus,
  Search,
  Trash2,
  X,
  Edit2
} from 'lucide-react';
import { sheetsService } from '../services/sheetsService';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

type EntityType = 'employees' | 'sectors' | 'costCenters' | 'machines' | 'suppliers';

interface EntityConfig {
  id: EntityType;
  label: string;
  icon: any;
  color: string;
}

const configs: EntityConfig[] = [
  { id: 'employees', label: 'Funcionários', icon: Users, color: 'green' },
  { id: 'sectors', label: 'Setores', icon: Layers, color: 'indigo' },
  { id: 'costCenters', label: 'Centros de Custo', icon: PiggyBank, color: 'purple' },
  { id: 'machines', label: 'Máquinas', icon: Cpu, color: 'cyan' },
  { id: 'suppliers', label: 'Fornecedores', icon: Truck, color: 'orange' },
];

export function Settings() {
  const [activeTab, setActiveTab] = React.useState<EntityType | null>(null);
  const [data, setData] = React.useState<any[]>([]);
  const [sectors, setSectors] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [newEntity, setNewEntity] = React.useState<any>({ id: '', nome: '', extra: '', setor: '', dataAdmissao: '' });

  React.useEffect(() => {
    if (activeTab) {
      loadData();
    }
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    let result: any[] = [];
    switch (activeTab) {
      case 'employees': 
        result = await sheetsService.getEmployees(); 
        const loadedSectors = await sheetsService.getSectors();
        setSectors(loadedSectors);
        break;
      case 'sectors': result = await sheetsService.getSectors(); break;
      case 'costCenters': result = await sheetsService.getCostCenters(); break;
      case 'machines': result = await sheetsService.getMachines(); break;
      case 'suppliers': result = await sheetsService.getSuppliers(); break;
    }
    setData(result);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTab) return;
    
    setLoading(true);
    try {
      let res;
      if (isEditing) {
        res = await sheetsService.updateEntity(activeTab, newEntity.id, newEntity);
      } else {
        res = await sheetsService.addEntity(activeTab, newEntity);
      }

      if (res.status === 'success') {
        toast.success(res.message || (isEditing ? 'Registro atualizado com sucesso!' : 'Registro cadastrado com sucesso!'));
        setIsAdding(false);
        setIsEditing(false);
        setNewEntity({ id: '', nome: '', extra: '', setor: '', dataAdmissao: '' });
        loadData();
      } else {
        toast.error(res.message || 'Erro ao salvar registro.');
      }
    } catch (error) {
      toast.error('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item: any) => {
    setNewEntity({ 
      id: item.id, 
      nome: item.nome, 
      extra: item.extra || '',
      setor: item.setor || '',
      dataAdmissao: item.dataAdmissao || ''
    });
    setIsEditing(true);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!activeTab) return;
    if (!window.confirm(`Tem certeza que deseja excluir o registro ${id}?`)) return;
    
    setLoading(true);
    try {
      const res = await sheetsService.deleteEntity(activeTab, id);
      if (res.status === 'success') {
        toast.success(res.message || 'Registro excluído com sucesso!');
        loadData();
      } else {
        toast.error(res.message || 'Erro ao excluir registro.');
      }
    } catch (error) {
      toast.error('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(item => {
    const search = searchQuery.toLowerCase();
    const nameMatch = item.nome ? String(item.nome).toLowerCase().includes(search) : false;
    const idMatch = item.id ? String(item.id).toLowerCase().includes(search) : false;
    return nameMatch || idMatch;
  });

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Central de Cadastros</h2>
        <p className="text-slate-500 uppercase text-[9px] tracking-[0.4em] font-bold mt-1">Gestão de Tabelas Base</p>
      </header>

      {!activeTab ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {configs.map((config) => (
            <button 
              key={config.id}
              onClick={() => setActiveTab(config.id)}
              className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-white/10 transition-all group flex flex-col items-center gap-4 shadow-xl"
            >
              <div className={cn(
                "p-5 rounded-2xl group-hover:scale-110 transition-all duration-500",
                config.color === 'green' && "bg-green-500/10 text-green-500",
                config.color === 'indigo' && "bg-indigo-500/10 text-indigo-500",
                config.color === 'purple' && "bg-purple-500/10 text-purple-500",
                config.color === 'cyan' && "bg-cyan-500/10 text-cyan-500",
                config.color === 'orange' && "bg-orange-500/10 text-orange-500",
              )}>
                <config.icon className="w-8 h-8" />
              </div>
              <span className="font-black text-[10px] text-slate-900 uppercase tracking-[0.2em]">{config.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setActiveTab(null)}
              className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-900 transition-all"
            >
              <X className="w-4 h-4" /> Voltar ao Menu
            </button>
            <h3 className="text-sm font-black text-brand-orange uppercase tracking-widest">
              {configs.find(c => c.id === activeTab)?.label}
            </h3>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input 
                  type="text" 
                  placeholder="Pesquisar..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-1 focus:ring-brand-orange transition-all"
                />
              </div>
              <button 
                onClick={() => {
                  setNewEntity({ id: '', nome: '', extra: '', setor: '', dataAdmissao: '' });
                  setIsEditing(false);
                  setIsAdding(true);
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-900/20"
              >
                <Plus className="w-4 h-4" /> Novo Registro
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/50">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/50 text-[9px] uppercase text-slate-500 font-black tracking-widest border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">ID / Código</th>
                    <th className="px-6 py-4">Nome / Descrição</th>
                    {activeTab === 'employees' && <th className="px-6 py-4">Setor</th>}
                    {activeTab === 'employees' && <th className="px-6 py-4">Admissão</th>}
                    <th className="px-6 py-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr><td colSpan={activeTab === 'employees' ? 5 : 3} className="px-6 py-12 text-center text-slate-500 uppercase font-bold tracking-widest text-xs animate-pulse">Carregando...</td></tr>
                  ) : filteredData.length === 0 ? (
                    <tr><td colSpan={activeTab === 'employees' ? 5 : 3} className="px-6 py-12 text-center text-slate-500 uppercase font-bold tracking-widest text-xs">Nenhum registro</td></tr>
                  ) : (
                    filteredData.map((item, index) => (
                      <tr key={`${item.id}-${index}`} className="hover:bg-white/5 transition-all">
                        <td className="px-6 py-4 font-mono text-xs text-brand-blue font-bold">{item.id}</td>
                        <td className="px-6 py-4 font-bold text-slate-900 uppercase">{item.nome}</td>
                        {activeTab === 'employees' && <td className="px-6 py-4 text-slate-600 text-xs font-bold uppercase">{item.setor || '-'}</td>}
                        {activeTab === 'employees' && <td className="px-6 py-4 text-slate-600 text-xs">{item.dataAdmissao ? item.dataAdmissao.split('-').reverse().join('/') : '-'}</td>}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleEditClick(item)}
                              className="p-2 text-slate-500 hover:text-brand-blue transition-all rounded-lg hover:bg-blue-500/10"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-slate-500 hover:text-red-500 transition-all rounded-lg hover:bg-red-500/10"
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
      )}

      {/* Modal de Cadastro */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-50/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">
                {isEditing ? 'Editar Cadastro' : 'Novo Cadastro'}
              </h3>
              <button onClick={() => { setIsAdding(false); setIsEditing(false); }} className="text-slate-500 hover:text-slate-900"><X /></button>
            </div>

            <form onSubmit={handleAdd} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest">Código / ID</label>
                <input 
                  type="text" 
                  required
                  disabled={isEditing}
                  value={newEntity.id}
                  onChange={(e) => setNewEntity(prev => ({ ...prev, id: e.target.value.toUpperCase() }))}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-1 focus:ring-brand-orange font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="EX: ID-001"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest">Nome / Descrição</label>
                <input 
                  type="text" 
                  required
                  value={newEntity.nome}
                  onChange={(e) => setNewEntity(prev => ({ ...prev, nome: e.target.value.toUpperCase() }))}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-1 focus:ring-brand-orange"
                  placeholder="NOME COMPLETO"
                />
              </div>

              {activeTab === 'employees' && (
                <>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest">Setor</label>
                    <select
                      required
                      value={newEntity.setor}
                      onChange={(e) => setNewEntity(prev => ({ ...prev, setor: e.target.value }))}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-1 focus:ring-brand-orange"
                    >
                      <option value="">Selecione um setor</option>
                      {sectors.map(s => (
                        <option key={s.id} value={s.nome}>{s.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-4 tracking-widest">Data de Admissão</label>
                    <input 
                      type="date" 
                      required
                      value={newEntity.dataAdmissao}
                      onChange={(e) => setNewEntity(prev => ({ ...prev, dataAdmissao: e.target.value }))}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 outline-none focus:ring-1 focus:ring-brand-orange"
                    />
                  </div>
                </>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-brand-orange text-white font-black py-5 rounded-2xl uppercase text-[10px] tracking-[0.3em] hover:bg-orange-600 transition-all shadow-lg shadow-orange-900/20 active:scale-95"
              >
                {loading ? 'Salvando...' : (isEditing ? 'Atualizar Cadastro' : 'Confirmar Cadastro')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
