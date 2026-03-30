/**
 * COMPESCAL ALMOXARIFADO - GOOGLE APPS SCRIPT
 * 
 * INSTRUÇÕES DE INSTALAÇÃO:
 * 1. Crie uma nova planilha no Google Sheets.
 * 2. Crie as seguintes abas (planilhas) exatamente com estes nomes:
 *    - Produtos
 *    - Movimentacoes
 *    - Funcionarios
 *    - Setores
 *    - CentrosCusto
 *    - Maquinas
 *    - Fornecedores
 * 3. Vá em "Extensões" > "Apps Script".
 * 4. Apague todo o código existente e cole este código abaixo.
 * 5. Clique em "Implantar" (Deploy) > "Nova implantação".
 * 6. Selecione o tipo "App da Web".
 * 7. Em "Executar como", escolha "Eu".
 * 8. Em "Quem pode acessar", escolha "Qualquer pessoa".
 * 9. Clique em "Implantar" e autorize os acessos.
 * 10. Copie a "URL do app da Web" gerada e coloque nas variáveis de ambiente do sistema (VITE_GOOGLE_SHEETS_API_URL).
 */

const HEADERS = {
  Produtos: ['id', 'desc', 'un', 'saldo', 'estoqueMin', 'ultimoCusto', 'dataCadastro'],
  Movimentacoes: ['id', 'data', 'tipo', 'idProduto', 'quantidade', 'valorUnitario', 'total', 'funcionario', 'setor', 'centroCusto', 'fornecedor', 'maquina'],
  Funcionarios: ['id', 'nome', 'setor'],
  Setores: ['id', 'nome'],
  CentrosCusto: ['id', 'nome'],
  Maquinas: ['id', 'nome'],
  Fornecedores: ['id', 'nome']
};

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  for (const sheetName in HEADERS) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(HEADERS[sheetName]);
      sheet.getRange(1, 1, 1, HEADERS[sheetName].length).setFontWeight("bold");
    } else if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS[sheetName]);
      sheet.getRange(1, 1, 1, HEADERS[sheetName].length).setFontWeight("bold");
    }
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'addMovement') {
      return handleAddMovement(data);
    } else if (action === 'addEntity') {
      return handleAddEntity(data);
    } else if (action === 'updateEntity') {
      return handleUpdateEntity(data);
    } else if (action === 'deleteEntity') {
      return handleDeleteEntity(data);
    } else if (action === 'deleteMovement') {
      return handleDeleteMovement(data);
    }
    
    return createJsonResponse({ status: 'error', message: 'Ação POST desconhecida' });
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'getDashboardData') return getDashboardData();
    if (action === 'getProducts') return getSheetData('Produtos', 'products');
    if (action === 'getMovements') return getSheetData('Movimentacoes', 'movements');
    if (action === 'getEmployees') return getSheetData('Funcionarios', 'employees');
    if (action === 'getSectors') return getSheetData('Setores', 'sectors');
    if (action === 'getCostCenters') return getSheetData('CentrosCusto', 'costCenters');
    if (action === 'getMachines') return getSheetData('Maquinas', 'machines');
    if (action === 'getSuppliers') return getSheetData('Fornecedores', 'suppliers');
    
    return createJsonResponse({ status: 'error', message: 'Ação GET desconhecida' });
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

function handleAddMovement(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Movimentacoes');
  
  if (!sheet || sheet.getLastRow() === 0) {
    setup();
    sheet = ss.getSheetByName('Movimentacoes');
  }
  
  // Create ID
  const lastRow = sheet.getLastRow();
  const id = lastRow > 1 ? parseInt(sheet.getRange(lastRow, 1).getValue()) + 1 : 1;
  
  const rowData = [
    id,
    data.data || new Date().toISOString(),
    data.tipo || '',
    data.idProduto || '',
    data.quantidade || 0,
    data.valorUnitario || 0,
    data.total || 0,
    data.funcionario || '',
    data.setor || '',
    data.centroCusto || '',
    data.fornecedor || '',
    data.maquina || ''
  ];
  
  sheet.appendRow(rowData);
  
  // Atualizar saldo do produto
  updateProductBalance(data.idProduto, data.quantidade, data.tipo, data.valorUnitario);
  
  return createJsonResponse({ status: 'success', message: 'Movimentação registrada com sucesso' });
}

function updateProductBalance(idProduto, quantidade, tipo, valorUnitario) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Produtos');
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  
  let startIndex = 0;
  if (data.length > 0 && String(data[0][0]).toLowerCase() === 'id') {
    startIndex = 1;
  }
  
  for (let i = startIndex; i < data.length; i++) {
    if (data[i][0] === idProduto) {
      let saldoAtual = parseFloat(data[i][3]) || 0;
      let qtd = parseFloat(quantidade) || 0;
      
      if (tipo === 'ENTRADA') {
        saldoAtual += qtd;
        // Atualiza ultimo custo na entrada
        sheet.getRange(i + 1, 6).setValue(valorUnitario);
      } else if (tipo === 'SAIDA') {
        saldoAtual -= qtd;
      }
      
      sheet.getRange(i + 1, 4).setValue(saldoAtual);
      break;
    }
  }
}

function handleAddEntity(data) {
  const typeMap = {
    'products': 'Produtos',
    'employees': 'Funcionarios',
    'sectors': 'Setores',
    'costCenters': 'CentrosCusto',
    'machines': 'Maquinas',
    'suppliers': 'Fornecedores'
  };
  
  const sheetName = typeMap[data.type];
  if (!sheetName) return createJsonResponse({ status: 'error', message: 'Tipo de entidade inválido' });
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet || sheet.getLastRow() === 0) {
    setup();
    sheet = ss.getSheetByName(sheetName);
  }
  
  let rowData = [];
  if (data.type === 'products') {
    rowData = [data.id, data.desc, data.un, data.saldo || 0, data.estoqueMin || 0, data.ultimoCusto || 0, new Date().toISOString()];
  } else if (data.type === 'employees') {
    rowData = [data.id, data.nome, data.setor || ''];
  } else {
    rowData = [data.id, data.nome];
  }
  
  sheet.appendRow(rowData);
  return createJsonResponse({ status: 'success', message: 'Cadastro realizado com sucesso' });
}

function handleUpdateEntity(data) {
  const typeMap = {
    'products': 'Produtos',
    'employees': 'Funcionarios',
    'sectors': 'Setores',
    'costCenters': 'CentrosCusto',
    'machines': 'Maquinas',
    'suppliers': 'Fornecedores'
  };
  
  const sheetName = typeMap[data.type];
  if (!sheetName) return createJsonResponse({ status: 'error', message: 'Tipo de entidade inválido' });
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return createJsonResponse({ status: 'error', message: 'Planilha não encontrada' });
  
  const sheetData = sheet.getDataRange().getValues();
  let rowIndex = -1;
  
  for (let i = 0; i < sheetData.length; i++) {
    if (String(sheetData[i][0]) === String(data.id)) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex === -1) return createJsonResponse({ status: 'error', message: 'Registro não encontrado' });
  
  let rowData = [];
  if (data.type === 'products') {
    const dataCadastro = sheetData[rowIndex - 1][6] || new Date().toISOString();
    rowData = [data.id, data.desc, data.un, data.saldo || 0, data.estoqueMin || 0, data.ultimoCusto || 0, dataCadastro];
  } else if (data.type === 'employees') {
    rowData = [data.id, data.nome, data.setor || ''];
  } else {
    rowData = [data.id, data.nome];
  }
  
  sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
  return createJsonResponse({ status: 'success', message: 'Registro atualizado com sucesso' });
}

function handleDeleteEntity(data) {
  const typeMap = {
    'products': 'Produtos',
    'employees': 'Funcionarios',
    'sectors': 'Setores',
    'costCenters': 'CentrosCusto',
    'machines': 'Maquinas',
    'suppliers': 'Fornecedores'
  };
  
  const sheetName = typeMap[data.type];
  if (!sheetName) return createJsonResponse({ status: 'error', message: 'Tipo de entidade inválido' });
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return createJsonResponse({ status: 'error', message: 'Planilha não encontrada' });
  
  const sheetData = sheet.getDataRange().getValues();
  let rowIndex = -1;
  
  for (let i = 0; i < sheetData.length; i++) {
    if (String(sheetData[i][0]) === String(data.id)) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex === -1) return createJsonResponse({ status: 'error', message: 'Registro não encontrado' });
  
  sheet.deleteRow(rowIndex);
  return createJsonResponse({ status: 'success', message: 'Registro excluído com sucesso' });
}

function handleDeleteMovement(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Movimentacoes');
  if (!sheet) return createJsonResponse({ status: 'error', message: 'Planilha não encontrada' });
  
  const sheetData = sheet.getDataRange().getValues();
  let rowIndex = -1;
  let movData = null;
  
  for (let i = 0; i < sheetData.length; i++) {
    if (String(sheetData[i][0]) === String(data.id)) {
      rowIndex = i + 1;
      movData = sheetData[i];
      break;
    }
  }
  
  if (rowIndex === -1) return createJsonResponse({ status: 'error', message: 'Movimentação não encontrada' });
  
  // Reverse the balance
  const idProduto = movData[3];
  const quantidade = movData[4];
  const tipo = movData[2];
  const valorUnitario = movData[5];
  
  const reverseTipo = tipo === 'ENTRADA' ? 'SAIDA' : 'ENTRADA';
  updateProductBalance(idProduto, quantidade, reverseTipo, valorUnitario);
  
  sheet.deleteRow(rowIndex);
  return createJsonResponse({ status: 'success', message: 'Movimentação excluída com sucesso' });
}

function getSheetData(sheetName, returnKey) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet || sheet.getLastRow() === 0) {
    setup();
    sheet = ss.getSheetByName(sheetName);
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length === 0) return createJsonResponse({ status: 'success', [returnKey]: [] });
  
  const headers = HEADERS[sheetName];
  const result = [];
  
  // Verifica se a primeira linha é o cabeçalho (começa com 'id')
  let startIndex = 0;
  if (data.length > 0 && String(data[0][0]).toLowerCase() === 'id') {
    startIndex = 1;
  }
  
  for (let i = startIndex; i < data.length; i++) {
    const row = data[i];
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    result.push(obj);
  }
  
  return createJsonResponse({ status: 'success', [returnKey]: result });
}

function getDashboardData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Produtos
  const prodSheet = ss.getSheetByName('Produtos');
  let totalProdutos = 0;
  let itensCriticos = 0;
  
  if (prodSheet && prodSheet.getLastRow() > 0) {
    const prodData = prodSheet.getDataRange().getValues();
    
    let startIndex = 0;
    if (prodData.length > 0 && String(prodData[0][0]).toLowerCase() === 'id') {
      startIndex = 1;
    }
    
    totalProdutos = prodData.length - startIndex;
    
    for (let i = startIndex; i < prodData.length; i++) {
      const saldo = parseFloat(prodData[i][3]) || 0;
      const min = parseFloat(prodData[i][4]) || 0;
      if (saldo <= min) itensCriticos++;
    }
  }
  
  // Movimentacoes
  const movSheet = ss.getSheetByName('Movimentacoes');
  let movHoje = 0;
  let entradasMes = 0;
  let saidasMes = 0;
  
  if (movSheet && movSheet.getLastRow() > 0) {
    const movData = movSheet.getDataRange().getValues();
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const todayStr = today.toISOString().split('T')[0];
    
    let startIndex = 0;
    if (movData.length > 0 && String(movData[0][0]).toLowerCase() === 'id') {
      startIndex = 1;
    }
    
    for (let i = startIndex; i < movData.length; i++) {
      let dateStr = '';
      if (movData[i][1] instanceof Date) {
        dateStr = movData[i][1].toISOString();
      } else {
        dateStr = String(movData[i][1]);
      }
      const tipo = movData[i][2];
      
      // Check if today
      if (dateStr.includes(todayStr)) {
        movHoje++;
      }
      
      // Check if current month
      try {
        const movDate = movData[i][1] instanceof Date ? movData[i][1] : new Date(dateStr);
        if (movDate.getMonth() === currentMonth && movDate.getFullYear() === currentYear) {
          if (tipo === 'ENTRADA') entradasMes++;
          if (tipo === 'SAIDA') saidasMes++;
        }
      } catch (e) {}
    }
  }
  
  return createJsonResponse({
    status: 'success',
    totalProdutos,
    itensCriticos,
    movHoje,
    entradasMes,
    saidasMes
  });
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
