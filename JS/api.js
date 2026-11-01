// =====================================
// FLOW PRO — API CENTRAL
// VERSÃO 4.5
// Leitura de agendamentos, serviços, pagamentos e despesas.
// =====================================

const URL_API = "https://script.google.com/macros/s/AKfycbwUbF_-HVYBS68Ljs8kBHHGstCNMVNdPuGWJbTiCOyHN-gHw1cL55E68MQDYy3MJDmiXQ/exec";

let dadosSistema = {
  versao: "4.5",
  agendamentos: [],
  servicos: [],
  pagamentos: [],
  despesas: []
};

async function carregarDados() {
  try {
    console.log("Flow Pro: buscando dados da API...");

    const resposta = await fetch(URL_API, {
      method: "GET",
      cache: "no-store"
    });

    if (!resposta.ok) {
      throw new Error("A API respondeu com HTTP " + resposta.status);
    }

    const dados = await resposta.json();

    if (!dados || !Array.isArray(dados.agendamentos)) {
      throw new Error("Resposta da API inválida: lista de agendamentos ausente.");
    }

    dadosSistema = {
      ...dados,
      versao: dados.versao || "4.4",
      agendamentos: Array.isArray(dados.agendamentos) ? dados.agendamentos : [],
      servicos: Array.isArray(dados.servicos) ? dados.servicos : [],
      pagamentos: Array.isArray(dados.pagamentos) ? dados.pagamentos : [],
      despesas: Array.isArray(dados.despesas) ? dados.despesas : []
    };

    console.log("Flow Pro: dados carregados.", {
      versao: dadosSistema.versao,
      agendamentos: dadosSistema.agendamentos.length,
      servicos: dadosSistema.servicos.length,
      pagamentos: dadosSistema.pagamentos.length,
      despesas: dadosSistema.despesas.length
    });

    document.dispatchEvent(new Event("dadosCarregados"));
    return dadosSistema;

  } catch (erro) {
    console.error("Flow Pro: erro ao carregar dados:", erro);
    throw erro;
  }
}

// Envia ações ao Apps Script. Não define Content-Type para evitar
// preflight CORS desnecessário no endpoint publicado do Google Apps Script.
async function enviarAcaoAPI(dados) {
  const resposta = await fetch(URL_API, {
    method: "POST",
    body: JSON.stringify(dados)
  });

  if (!resposta.ok) {
    throw new Error("Falha na comunicação com a API (HTTP " + resposta.status + ").");
  }

  const resultado = await resposta.json();

  if (!resultado || resultado.sucesso !== true) {
    throw new Error(
      resultado && resultado.erro
        ? resultado.erro
        : "A API não confirmou a operação."
    );
  }

  return resultado;
}

// Registra uma despesa na aba Despesas.
async function registrarDespesaAPI(dados) {
  const resultado = await enviarAcaoAPI({
    acao: "registrarDespesa",
    data: dados.data,
    descricao: dados.descricao,
    categoria: dados.categoria,
    valor: dados.valor,
    formaPagamento: dados.formaPagamento || dados.pagamento,
    observacao: dados.observacao || dados.observacoes || ""
  });

  await carregarDados();
  return resultado;
}

// Registra um pagamento adicional de um agendamento existente.
// Mantém a mesma ação já implementada na API 4.4.
async function registrarPagamentoAPI(dados) {
  const resultado = await enviarAcaoAPI({
    acao: "registrarPagamento",
    id: dados.id,
    origem: dados.origem,
    valor: dados.valor,
    dataRecebimento: dados.dataRecebimento || dados.data,
    formaPagamento: dados.formaPagamento || dados.pagamento,
    tipoPagamento: dados.tipoPagamento || dados.tipoRecebimento || "Parcial",
    observacao: dados.observacao || dados.observacoes || ""
  });

  await carregarDados();
  return resultado;
}

document.addEventListener("DOMContentLoaded", function () {
  carregarDados().catch(function () {
    // O erro já foi registrado no console. As telas poderão exibir
    // os dados indisponíveis sem interromper a inicialização do app.
  });
});
