/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Movement, Product, Employee, Sector, CostCenter, Machine, Supplier, DashboardStats } from '../types';

/**
 * GOOGLE APPS SCRIPT TEMPLATE (Copy this to your Google Sheet Script Editor):
 * 
 * function doGet(e) {
 *   const action = e.parameter.action;
 *   const ss = SpreadsheetApp.getActiveSpreadsheet();
 *   
 *   if (action === 'getDashboardData') {
 *     // Logic to calculate stats from sheets
 *     return ContentService.createTextOutput(JSON.stringify({
 *       status: 'success',
 *       totalProdutos: 150,
 *       itensCriticos: 12,
 *       movHoje: 45,
 *       entradasMes: 120,
 *       saidasMes: 98
 *     })).setMimeType(ContentService.MimeType.JSON);
 *   }
 *   
 *   // Add other actions: getProducts, getMovements, addMovement, etc.
 * }
 */

const URL_API = import.meta.env.VITE_GOOGLE_SHEETS_API_URL || '';

export const sheetsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    if (!URL_API) return this.getMockStats();
    try {
      const response = await fetch(`${URL_API}?action=getDashboardData&t=${new Date().getTime()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return this.getMockStats();
    }
  },

  async getProducts(): Promise<Product[]> {
    if (!URL_API) return this.getMockProducts();
    try {
      const response = await fetch(`${URL_API}?action=getProducts&t=${new Date().getTime()}`);
      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return this.getMockProducts();
    }
  },

  async addMovement(movement: Partial<Movement>): Promise<{ status: string; message: string }> {
    if (!URL_API) {
      console.log('Mock: Adding movement', movement);
      return { status: 'success', message: 'Movimentação registrada (Mock)' };
    }
    try {
      const response = await fetch(URL_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action: 'addMovement', ...movement }),
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: 'Erro ao conectar com o servidor' };
    }
  },

  async getMovements(): Promise<Movement[]> {
    if (!URL_API) return this.getMockMovements();
    try {
      const response = await fetch(`${URL_API}?action=getMovements&t=${new Date().getTime()}`);
      const data = await response.json();
      return data.movements || [];
    } catch (error) {
      console.error('Error fetching movements:', error);
      return this.getMockMovements();
    }
  },

  async getEmployees(): Promise<Employee[]> {
    if (!URL_API) return [
      { id: 'E-001', nome: 'JOAO SILVA', setor: 'MANUTENCAO', dataAdmissao: '2025-01-15' }, 
      { id: 'E-002', nome: 'MARIA SOUZA', setor: 'PRODUCAO', dataAdmissao: '2025-06-20' }
    ];
    try {
      const response = await fetch(`${URL_API}?action=getEmployees&t=${new Date().getTime()}`);
      const data = await response.json();
      return data.employees || [];
    } catch (error) {
      return [];
    }
  },

  async getSectors(): Promise<Sector[]> {
    if (!URL_API) return [{ id: 'S-001', nome: 'MANUTENCAO' }, { id: 'S-002', nome: 'PRODUCAO' }];
    try {
      const response = await fetch(`${URL_API}?action=getSectors&t=${new Date().getTime()}`);
      const data = await response.json();
      return data.sectors || [];
    } catch (error) {
      return [];
    }
  },

  async getCostCenters(): Promise<CostCenter[]> {
    if (!URL_API) return [{ id: 'CC-001', nome: 'GERAL' }, { id: 'CC-002', nome: 'MAQUINARIA' }];
    try {
      const response = await fetch(`${URL_API}?action=getCostCenters&t=${new Date().getTime()}`);
      const data = await response.json();
      return data.costCenters || [];
    } catch (error) {
      return [];
    }
  },

  async getMachines(): Promise<Machine[]> {
    if (!URL_API) return [{ id: 'M-001', nome: 'EMPILHADEIRA TOYOTA' }, { id: 'M-002', nome: 'TORNO MECANICO' }];
    try {
      const response = await fetch(`${URL_API}?action=getMachines&t=${new Date().getTime()}`);
      const data = await response.json();
      return data.machines || [];
    } catch (error) {
      return [];
    }
  },

  async getSuppliers(): Promise<Supplier[]> {
    if (!URL_API) return [{ id: 'FORN-001', nome: 'METALURGICA SILVA LTDA' }, { id: 'FORN-002', nome: 'AUTO PECAS CENTRAL' }];
    try {
      const response = await fetch(`${URL_API}?action=getSuppliers&t=${new Date().getTime()}`);
      const data = await response.json();
      return data.suppliers || [];
    } catch (error) {
      return [];
    }
  },

  async addEntity(type: string, entity: any): Promise<{ status: string; message: string }> {
    if (!URL_API) {
      console.log(`Mock: Adding ${type}`, entity);
      return { status: 'success', message: 'Cadastro realizado (Mock)' };
    }
    try {
      const response = await fetch(URL_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action: 'addEntity', type, ...entity }),
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: 'Erro ao conectar com o servidor' };
    }
  },

  async updateEntity(type: string, id: string | number, entity: any): Promise<{ status: string; message: string }> {
    if (!URL_API) {
      console.log(`Mock: Updating ${type} ${id}`, entity);
      return { status: 'success', message: 'Atualização realizada (Mock)' };
    }
    try {
      const response = await fetch(URL_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action: 'updateEntity', type, id, ...entity }),
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: 'Erro ao conectar com o servidor' };
    }
  },

  async deleteEntity(type: string, id: string | number): Promise<{ status: string; message: string }> {
    if (!URL_API) {
      console.log(`Mock: Deleting ${type} ${id}`);
      return { status: 'success', message: 'Exclusão realizada (Mock)' };
    }
    try {
      const response = await fetch(URL_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action: 'deleteEntity', type, id }),
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: 'Erro ao conectar com o servidor' };
    }
  },

  async deleteMovement(id: number): Promise<{ status: string; message: string }> {
    if (!URL_API) {
      console.log(`Mock: Deleting movement ${id}`);
      return { status: 'success', message: 'Exclusão realizada (Mock)' };
    }
    try {
      const response = await fetch(URL_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action: 'deleteMovement', id }),
      });
      return await response.json();
    } catch (error) {
      return { status: 'error', message: 'Erro ao conectar com o servidor' };
    }
  },

  // Mock data for development when URL is not set
  getMockMovements(): Movement[] {
    return [
      { id: 1, data: '2026-03-29 10:00', tipo: 'ENTRADA', idProduto: 'COMP-0001', quantidade: 50, valorUnitario: 12.50, total: 625, funcionario: 'ADMIN', setor: 'ALMOXARIFADO', centroCusto: 'GERAL', fornecedor: 'METALURGICA SILVA LTDA' },
      { id: 2, data: '2026-03-29 11:30', tipo: 'SAIDA', idProduto: 'COMP-0002', quantidade: 10, valorUnitario: 35.00, total: 350, funcionario: 'JOAO SILVA', setor: 'MANUTENCAO', centroCusto: 'MAQUINARIA', maquina: 'EMPILHADEIRA TOYOTA' },
      { id: 3, data: '2026-03-28 14:20', tipo: 'SAIDA', idProduto: 'COMP-0001', quantidade: 5, valorUnitario: 12.50, total: 62.50, funcionario: 'MARIA SOUZA', setor: 'PRODUCAO', centroCusto: 'GERAL' },
    ];
  },

  getMockStats(): DashboardStats {
    return {
      totalProdutos: 124,
      itensCriticos: 8,
      movHoje: 15,
      entradasMes: 85,
      saidasMes: 72
    };
  },

  getMockProducts(): Product[] {
    return [
      { id: 'COMP-0001', desc: 'ROLAMENTO 6205 ZZ', un: 'UN', saldo: 45, estoqueMin: 10, ultimoCusto: 12.50, dataCadastro: '2026-01-01' },
      { id: 'COMP-0002', desc: 'ÓLEO LUBRIFICANTE 15W40', un: 'L', saldo: 120, estoqueMin: 50, ultimoCusto: 35.00, dataCadastro: '2026-01-05' },
      { id: 'COMP-0003', desc: 'FILTRO DE AR T-100', un: 'UN', saldo: 5, estoqueMin: 15, ultimoCusto: 85.00, dataCadastro: '2026-02-10' },
    ];
  }
};
