// FLOW PRO — API CENTRAL
const URL_API = "https://script.google.com/macros/s/AKfycbwUbF_-HVYBS68Ljs8kBHHGstCNMVNdPuGWJbTiCOyHN-gHw1cL55E68MQDYy3MJDmiXQ/exec";
let dadosSistema = { agendamentos: [], servicos: [], pagamentos: [], despesas: [], taxasDeslocamento: [] };

async function carregarDados(){
  try {
    const resposta = await fetch(URL_API, { cache: "no-store" });
    if (!resposta.ok) throw new Error("Falha HTTP " + resposta.status);
    const dados = await resposta.json();
    if (!dados || !Array.isArray(dados.agendamentos)) throw new Error("Resposta inválida da API Flow Pro.");
    dadosSistema = {
      ...dados,
      agendamentos: Array.isArray(dados.agendamentos) ? dados.agendamentos : [],
      servicos: Array.isArray(dados.servicos) ? dados.servicos : [],
      pagamentos: Array.isArray(dados.pagamentos) ? dados.pagamentos : [],
      despesas: Array.isArray(dados.despesas) ? dados.despesas : [],
      taxasDeslocamento: Array.isArray(dados.taxasDeslocamento) ? dados.taxasDeslocamento : []
    };
    document.dispatchEvent(new Event("dadosCarregados"));
    return dadosSistema;
  } catch (erro) {
    console.error("Erro ao carregar dados do Flow Pro:", erro);
    document.dispatchEvent(new CustomEvent("dadosFalha", { detail: erro }));
    throw erro;
  }
}

document.addEventListener("DOMContentLoaded", function(){ carregarDados().catch(function(){}); });

async function enviarAcaoFlowPro(dados){
  const resposta = await fetch(URL_API, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(dados),
    redirect: "follow"
  });
  if (!resposta.ok) throw new Error("A API não conseguiu concluir a operação.");
  const resultado = await resposta.json();
  if (!resultado || resultado.sucesso !== true) throw new Error((resultado && resultado.erro) || "A operação não foi concluída.");
  return resultado;
}

async function salvarTaxaDeslocamentoAPI(dados){
  const resultado = await enviarAcaoFlowPro({ ...dados, acao: "salvarTaxaDeslocamento" });
  await carregarDados();
  return resultado;
}
async function excluirTaxaDeslocamentoAPI(id){
  const resultado = await enviarAcaoFlowPro({ acao: "excluirTaxaDeslocamento", id: id });
  await carregarDados();
  return resultado;
}
async function registrarDespesaAPI(dados){ return enviarAcaoFlowPro({ ...dados, acao: "registrarDespesa" }); }
async function editarDespesaAPI(dados){ return enviarAcaoFlowPro({ ...dados, acao: "editarDespesa" }); }
async function excluirDespesaAPI(id){ return enviarAcaoFlowPro({ acao: "excluirDespesa", id: id }); }
