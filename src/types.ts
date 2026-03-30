/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OperationType = 'ENTRADA' | 'SAIDA' | 'CADASTRO';

export interface Product {
  id: string;
  desc: string;
  un: string;
  saldo: number;
  estoqueMin: number;
  ultimoCusto: number;
  dataCadastro: string;
}

export interface Movement {
  id: number;
  data: string;
  tipo: OperationType;
  idProduto: string;
  quantidade: number;
  valorUnitario: number;
  total: number;
  funcionario: string;
  setor: string;
  centroCusto: string;
  maquina?: string;
  fornecedor?: string;
}

export interface Employee {
  id: string;
  nome: string;
  setor: string;
  dataAdmissao?: string;
}

export interface Sector {
  id: string;
  nome: string;
}

export interface CostCenter {
  id: string;
  nome: string;
}

export interface Machine {
  id: string;
  nome: string;
}

export interface Supplier {
  id: string;
  nome: string;
}

export interface DashboardStats {
  totalProdutos: number;
  itensCriticos: number;
  movHoje: number;
  entradasMes: number;
  saidasMes: number;
}
