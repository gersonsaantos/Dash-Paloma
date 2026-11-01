// ============================================================
// FLOW PRO
// TELA AGENDA
// ============================================================
// ============================================================
// CONFIGURAÇÃO
// ============================================================
const API_AGENDA =
"https://script.google.com/macros/s/AKfycbwUbF_-HVYBS68Ljs8kBHHGstCNMVNdPuGWJbTiCOyHN-gHw1cL55E68MQDYy3MJDmiXQ/exec";
// ============================================================
let dataSelecionadaAgenda = new Date();
let mesCalendario =
dataSelecionadaAgenda.getMonth();
let anoCalendario =
dataSelecionadaAgenda.getFullYear();
let clienteEditandoAgenda = null;
// ============================================================
// INICIAR TELA
// ============================================================
document.addEventListener(
"DOMContentLoaded",
function () {
iniciarTelaAgenda();
}
);
// ============================================================
// QUANDO OS DADOS DA API CHEGAREM
// ============================================================
document.addEventListener(
"dadosCarregados",
function () {
iniciarTelaAgenda();
}
);
// ============================================================
// INICIAR
// ============================================================
function iniciarTelaAgenda() {
if (
typeof dadosSistema === "undefined" ||
!dadosSistema
) {
return;
}
if (
!Array.isArray(
dadosSistema.agendamentos
)
) {
return;
}
criarCalendarioCompleto();
criarCalendarioSemanal();
mostrarAgendamentosDoDia(
dataSelecionadaAgenda
);
atualizarResumoDia(
dataSelecionadaAgenda
);
prepararBotaoAdicionar(); }
// ============================================================
// FORMATAR DATA PARA COMPARAÇÃO
// ============================================================

function normalizarData(data) {
if (!data) {
return ""; }
const texto =
String(data).trim();
if (!texto) {
return ""; }
// YYYY-MM-DD
if (
/^\d{4}-\d{2}-\d{2}$/.test(texto)
) {
return texto; }
// DD/MM/YYYY
if (
/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(texto)
) {
const partes =
texto.split("/");
return (
partes[2] +
"-" +
partes[1].padStart(2, "0") +
"-" +
partes[0].padStart(2, "0")
);}
return texto; }
// ============================================================
// DATA DO OBJETO
// ============================================================
function dataParaString(data) {
const ano =
data.getFullYear();
const mes =
String(
data.getMonth() + 1
).padStart(2, "0");
const dia =
String(
data.getDate()
).padStart(2, "0");
return (
ano +
"-" +
mes +
"-" +
dia
);}
// ============================================================
// FORMATAR DATA PARA EXIBIÇÃO
// ============================================================
function formatarDataExibicao(data) {
const partes =
normalizarData(data)
if (partes.length !== 3) {
return data || ""; }
return (
partes[2] +
"/" +
partes[1] +
"/" +
partes[0]
);}
// ============================================================
// NOME DO DIA
// ============================================================
function nomeDiaSemana(data) {
const nomes = [
"Domingo",
"Segunda-feira",
"Terça-feira",
"Quarta-feira",

"Quinta-feira",
"Sexta-feira",
"Sábado"
];
return nomes[
data.getDay()
];}
// ============================================================
// NOME DO MÊS
// ============================================================
function nomeMes(mes) {
const meses = [
"Janeiro",
"Fevereiro",
"Março",
"Abril",
"Maio",
"Junho",
"Julho",
"Agosto",
"Setembro",
"Outubro",
"Novembro",
"Dezembro"
];
return meses[mes]; }
// ============================================================
// PEGAR AGENDAMENTOS DO DIA
// ============================================================
function pegarAgendamentosDoDia(data) {
const dataBusca =
dataParaString(data);
return (
dadosSistema.agendamentos || [] )
.filter(function (agendamento) {
return (
normalizarData(
agendamento.data
) === dataBusca
);
})
.sort(function (a, b) {
return String(
a.horario || ""
).localeCompare(
String(
b.horario || "" )
);
}); }
// ============================================================
// MOSTRAR AGENDAMENTOS DO DIA
// ============================================================
function mostrarAgendamentosDoDia(data) {
const lista = document.getElementById("listaClientesDia");
if (!lista) return;

const agendamentos = pegarAgendamentosDoDia(data);
lista.innerHTML = "";

if (agendamentos.length === 0) {
lista.innerHTML = `
<div class="agenda-sem-clientes">
<i class="fa-regular fa-calendar-xmark"></i>
<p>Nenhum agendamento para este dia.</p>
</div>`;
return;
}

agendamentos.forEach(function (cliente) {
const calculo = fpCalcularPrecoUI(cliente);
const total = fpValorNumericoUI(cliente.valorTotal);
const recebido = fpValorNumericoUI(cliente.valorRecebido) || 0;
const saldoInformado = fpValorNumericoUI(cliente.saldoPendente);
const valorTotal = total !== null ? total : (calculo.status === "ok" ? calculo.valor : null);
const saldo = saldoInformado !== null ? saldoInformado : (valorTotal !== null ? Math.max(0, valorTotal - recebido) : null);
const status = String(cliente.statusFinanceiro || (saldo === null ? "Pendente" : saldo <= 0 ? "Quitado" : recebido > 0 ? "Parcial" : "Pendente"));
const percentual = valorTotal > 0 ? Math.max(0, Math.min(100, (recebido / valorTotal) * 100)) : 0;
const statusClasse = status.toLowerCase().includes("quitado") ? "quitado" : status.toLowerCase().includes("parcial") ? "parcial" : status.toLowerCase().includes("cancelado") ? "cancelado" : "pendente";
const podeReceber = saldo !== null && saldo > 0 && !status.toLowerCase().includes("cancelado");
const valorTexto = valorTotal !== null ? formatarMoeda(valorTotal) : fpTextoPrecoUI(cliente);

const item = document.createElement("article");
item.className = "cliente-agenda-dia cliente-agenda-financeiro";
item.innerHTML = `
<div class="cliente-agenda-hora">${fpEscaparHTMLAgenda(cliente.horario || "--:--")}</div>
<div class="cliente-agenda-info">
<strong>${fpEscaparHTMLAgenda(cliente.nome || "Cliente")}</strong>
<span>${fpEscaparHTMLAgenda(cliente.servico || "-")}</span>
</div>
<div class="agenda-card-top-actions">
<span class="agenda-status-financeiro ${statusClasse}">${fpEscaparHTMLAgenda(status)}</span>
<strong class="agenda-valor-total">${valorTexto}</strong>
<button type="button" class="agenda-menu-toggle" aria-label="Mais opções" aria-expanded="false">
<i class="fa-solid fa-ellipsis"></i>
</button>
<div class="agenda-menu-opcoes" hidden>
${podeReceber ? `<button type="button" class="agenda-menu-pagamento"><i class="fa-solid fa-receipt"></i> Registrar pagamento</button>` : `<span class="agenda-menu-quitado"><i class="fa-solid fa-circle-check"></i> Sem saldo pendente</span>`}
</div>
</div>
<div class="agenda-financeiro-progresso">
<div class="agenda-financeiro-barra"><span class="agenda-financeiro-fill ${statusClasse}" style="width:${percentual.toFixed(2)}%"></span></div>
<div class="agenda-financeiro-legenda">
<span> ${formatarMoeda(recebido)} recebidos</span>
<span>${saldo !== null ? formatarMoeda(saldo) : "Saldo indisponível"} pendentes</span>
</div>
</div>
<div class="acoes-cliente-agenda">
<button type="button" class="btn-detalhes-agenda">Detalhes</button>
<button type="button" class="btn-editar-agenda">Editar</button>
<button type="button" class="btn-excluir-agenda">Excluir</button>
</div>`;

item.querySelector(".btn-detalhes-agenda").addEventListener("click", function(){ abrirDetalhesCliente(cliente); });
item.querySelector(".btn-editar-agenda").addEventListener("click", function(){ editarClienteAgenda(cliente); });
item.querySelector(".btn-excluir-agenda").addEventListener("click", function(){ excluirClienteAgenda(cliente); });
const menuBotao = item.querySelector(".agenda-menu-toggle");
const menu = item.querySelector(".agenda-menu-opcoes");
menuBotao.addEventListener("click", function(event){
 event.stopPropagation();
 const abrir = menu.hidden;
 fpFecharMenusAgenda();
 menu.hidden = !abrir;
 menuBotao.setAttribute("aria-expanded", abrir ? "true" : "false");
});
const botaoPagamento = item.querySelector(".agenda-menu-pagamento");
if (botaoPagamento) botaoPagamento.addEventListener("click", function(){
 fpFecharMenusAgenda();
 abrirModalPagamentoAgenda(cliente, valorTotal, recebido, saldo);
});

lista.appendChild(item);
});
}

function fpEscaparHTMLAgenda(valor){
return String(valor === null || valor === undefined ? "" : valor)
.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function fpFecharMenusAgenda(){
document.querySelectorAll(".agenda-menu-opcoes").forEach(function(menu){ menu.hidden = true; });
document.querySelectorAll(".agenda-menu-toggle").forEach(function(botao){ botao.setAttribute("aria-expanded", "false"); });
}

document.addEventListener("click", function(event){
if (!event.target.closest || !event.target.closest(".agenda-card-top-actions")) fpFecharMenusAgenda();
});

function fpConverterMoedaDigitada(valor){
let texto = String(valor || "").trim().replace(/R\$/gi, "").replace(/\s/g, "");
if (texto.includes(",")) texto = texto.replace(/\./g, "").replace(",", ".");
const numero = Number(texto);
return Number.isFinite(numero) ? Math.round(numero * 100) / 100 : NaN;
}

function abrirModalPagamentoAgenda(cliente, total, recebido, saldo){
if (saldo === null || saldo === undefined || !Number.isFinite(Number(saldo)) || Number(saldo) <= 0){
alert("Este agendamento não possui saldo pendente disponível para recebimento.");
return;
}
let modal = document.getElementById("modalPagamentoAgenda");
if (!modal){
modal = document.createElement("div");
modal.id = "modalPagamentoAgenda";
modal.className = "modal-detalhes-cliente";
modal.innerHTML = `
<div class="modal-conteudo modal-pagamento-conteudo">
<button type="button" class="modal-fechar" id="fecharPagamentoAgenda" aria-label="Fechar">×</button>
<p class="agenda-pagamento-kicker">CONTROLE FINANCEIRO</p>
<h2>Registrar pagamento</h2>
<div class="agenda-pagamento-cliente" id="agendaPagamentoCliente"></div>
<div class="agenda-pagamento-resumo" id="agendaPagamentoResumo"></div>
<form id="formPagamentoAgenda" class="form-agendamento">
<label for="pagamentoValorAgenda">Valor recebido (R$)</label>
<input id="pagamentoValorAgenda" type="number" min="0.01" step="0.01" required inputmode="decimal">
<label for="pagamentoFormaAgenda">Forma de pagamento</label>
<select id="pagamentoFormaAgenda" required>
<option value="">Selecione</option>
<option value="Pix">Pix</option>
<option value="Dinheiro">Dinheiro</option>
<option value="Cartão de débito">Cartão de débito</option>
<option value="Cartão de crédito">Cartão de crédito</option>
<option value="Transferência">Transferência</option>
<option value="Não informado">Não informado</option>
</select>
<label for="pagamentoObservacaoAgenda">Observação (opcional)</label>
<input id="pagamentoObservacaoAgenda" type="text" maxlength="250" placeholder="Ex.: pagamento realizado após o atendimento">
<button type="submit" class="btn-salvar-agendamento" id="confirmarPagamentoAgenda">Confirmar recebimento</button>
</form>
</div>`;
document.body.appendChild(modal);
document.getElementById("fecharPagamentoAgenda").addEventListener("click", function(){ modal.classList.remove("ativo"); });
modal.addEventListener("click", function(event){ if(event.target === modal) modal.classList.remove("ativo"); });
fpConfigurarFormularioPagamentoAgenda();
}
modal.dataset.agendamentoId = cliente.id || "";
modal.dataset.origem = cliente.origem || "Formulario";
modal.dataset.nomeCliente = cliente.nome || "Cliente";
modal.dataset.saldo = String(Number(saldo));
document.getElementById("agendaPagamentoCliente").textContent = (cliente.nome || "Cliente") + " • " + (cliente.servico || "Atendimento");
document.getElementById("agendaPagamentoResumo").innerHTML = `
<div><span>Valor total</span><strong>${total !== null ? formatarMoeda(total) : "Não definido"}</strong></div>
<div><span>Já recebido</span><strong>${formatarMoeda(recebido || 0)}</strong></div>
<div><span>Saldo pendente</span><strong class="saldo-destaque">${formatarMoeda(saldo)}</strong></div>`;
const campoValor = document.getElementById("pagamentoValorAgenda");
campoValor.max = Number(saldo).toFixed(2);
campoValor.value = Number(saldo).toFixed(2);
document.getElementById("pagamentoFormaAgenda").value = "";
document.getElementById("pagamentoObservacaoAgenda").value = "";
modal.classList.add("ativo");
}

function fpConfigurarFormularioPagamentoAgenda(){
const form = document.getElementById("formPagamentoAgenda");
if (!form || form.dataset.configurado === "sim") return;
form.dataset.configurado = "sim";
form.addEventListener("submit", async function(event){
event.preventDefault();
const modal = document.getElementById("modalPagamentoAgenda");
const botao = document.getElementById("confirmarPagamentoAgenda");
const saldo = Number(modal.dataset.saldo || 0);
const valor = fpConverterMoedaDigitada(document.getElementById("pagamentoValorAgenda").value);
const forma = document.getElementById("pagamentoFormaAgenda").value;
if (!Number.isFinite(valor) || valor <= 0){ alert("Informe um valor válido maior que zero."); return; }
if (valor > saldo + 0.001){ alert("O valor informado ultrapassa o saldo pendente de " + formatarMoeda(saldo) + "."); return; }
if (!forma){ alert("Selecione a forma de pagamento."); return; }
botao.disabled = true;
botao.textContent = "Registrando...";
try{
const payload = {
acao: "registrarPagamento",
id: modal.dataset.agendamentoId,
origem: modal.dataset.origem,
valor: valor,
formaPagamento: forma,
tipoPagamento: Math.abs(valor - saldo) < 0.005 ? "Quitação" : "Parcial",
dataRecebimento: new Date().toISOString(),
observacao: document.getElementById("pagamentoObservacaoAgenda").value.trim()
};
const resposta = await fetch(API_AGENDA, {
method: "POST",
headers: {"Content-Type": "text/plain;charset=utf-8"},
body: JSON.stringify(payload)
});
const resultado = await resposta.json();
if (!resultado || !resultado.sucesso) throw new Error(resultado && resultado.erro ? resultado.erro : "Não foi possível registrar o pagamento.");
modal.classList.remove("ativo");
alert("Pagamento registrado com sucesso. Novo saldo: " + formatarMoeda(resultado.saldoPendente) + ".");
if (typeof carregarDados === "function"){
await carregarDados();
document.dispatchEvent(new Event("dadosCarregados"));
}else{
location.reload();
}
}catch(erro){
console.error("Erro ao registrar pagamento Flow Pro:", erro);
alert(erro.message || "Não foi possível registrar o pagamento. Tente novamente.");
}finally{
botao.disabled = false;
botao.textContent = "Confirmar recebimento";
}
});
}
// ============================================================
// ATUALIZAR RESUMO
// ============================================================
function atualizarResumoDia(data) {
const resumo =
document.querySelector(
".agenda-summary strong"
);
const quantidade =
document.querySelector(
".agenda-summary > span"
);
const agendamentos =
pegarAgendamentosDoDia(data);
if (resumo) {
resumo.textContent =
nomeDiaSemana(data) +
", " +
data.getDate() +
" de " +
nomeMes(
data.getMonth()
);}
if (quantidade) {
quantidade.textContent =
agendamentos.length + (
agendamentos.length === 1
? " agendamento"
: " agendamentos"
);}}
// ============================================================
// CALENDÁRIO COMPLETO
// ============================================================
function criarCalendarioCompleto() {
const container =
document.getElementById(
"calendarAgenda"
);
if (!container) {
return; }
const primeiroDia =
new Date(
anoCalendario,
mesCalendario, 1
);
const ultimoDia =
new Date(

anoCalendario,
mesCalendario + 1, 0
);
const inicioSemana =
primeiroDia.getDay();
const quantidadeDias =
ultimoDia.getDate();
let html = `
<div class="calendar-agenda-header">
<button
type="button"
id="mesAnterior"
aria-label="Mês anterior" >‹
</button>
<div>
<strong>
${nomeMes(mesCalendario)}
</strong>
<span>
${anoCalendario}
</span>
</div>
<button
type="button"
id="mesProximo"
aria-label="Próximo mês" >›
</button>
</div>
<div class="calendar-agenda-weekdays">
<span>D</span>
<span>S</span>
<span>T</span>
<span>Q</span>
<span>Q</span>
<span>S</span>
<span>S</span>
</div>
<div class="calendar-agenda-days">
`;
// Espaços antes do primeiro dia
for (
let i = 0;
i < inicioSemana;
i++
) {
html += `
<button
type="button"
class="calendar-day vazio"
></button>
`;}
// Dias
for (
let dia = 1;
dia <= quantidadeDias;
dia++
) {
const data =
new Date(
anoCalendario,
mesCalendario,
dia
);
const dataString =
dataParaString(data);
const selecionado =
dataString ===
dataParaString(
dataSelecionadaAgenda
);
const temAgendamento =

(dadosSistema.agendamentos || [])
.some(function (item) {
return (
normalizarData(
item.data
) === dataString
);
});
html += `
<button
type="button"
class="
calendar-day
${
selecionado
? "active-day"
: "" }
${
temAgendamento
? "has-agendamento"
: "" }"
data-data="${dataString}" >
${dia}
</button>
`;}
html += `
</div>
`;
container.innerHTML =
html;
const anterior =
document.getElementById(
"mesAnterior"
);
const proximo =
document.getElementById(
"mesProximo"
);
if (anterior) {
anterior.onclick =
function () {
mesCalendario--;
if (mesCalendario < 0) {
mesCalendario = 11;
anoCalendario--; }
criarCalendarioCompleto();
};}
if (proximo) {
proximo.onclick =
function () {
mesCalendario++;
if (mesCalendario > 11) {
mesCalendario = 0;
anoCalendario++; }
criarCalendarioCompleto();
};}
container
.querySelectorAll(
".calendar-day:not(.vazio)" )
.forEach(function (botao) {
botao.addEventListener(
"click",
function () {
selecionarData(
botao.dataset.data
);}
);
}); }
// ============================================================
// SELECIONAR DATA
// ============================================================

function selecionarData(dataString) {
const partes =
dataString.split("-");
dataSelecionadaAgenda =
new Date(
Number(partes[0]),
Number(partes[1]) - 1,
Number(partes[2])
);
mesCalendario =
dataSelecionadaAgenda.getMonth();
anoCalendario =
dataSelecionadaAgenda.getFullYear();
criarCalendarioCompleto();
criarCalendarioSemanal();
mostrarAgendamentosDoDia(
dataSelecionadaAgenda
);
atualizarResumoDia(
dataSelecionadaAgenda
);}
// ============================================================
// CALENDÁRIO SEMANAL
// ============================================================
function criarCalendarioSemanal() {
const dias =
document.querySelectorAll(
".week-numbers span"
);
if (!dias.length) {
return; }
const inicioSemana =
new Date(
dataSelecionadaAgenda
);
inicioSemana.setDate(
dataSelecionadaAgenda.getDate() -
dataSelecionadaAgenda.getDay()
);
dias.forEach(
function (elemento, indice) {
const data =
new Date(
inicioSemana
);
data.setDate(
inicioSemana.getDate() +
indice
);
elemento.textContent =
data.getDate();
elemento.dataset.data =
dataParaString(data);
elemento.classList.remove(
"active-day"
);
if (
dataParaString(data) ===
dataParaString(
dataSelecionadaAgenda )
) {
elemento.classList.add(
"active-day"
);}
elemento.onclick =
function () {
selecionarData(
elemento.dataset.data
);
};}

);}
// ============================================================
// ABRIR / FECHAR CALENDÁRIO COMPLETO
// ============================================================
function configurarBotaoCalendario() {
const botao =
document.getElementById(
"abrirCalendario"
);
const calendario =
document.getElementById(
"calendarFullContainer"
);
if (!botao || !calendario) {
return; }
botao.onclick =
function () {
calendario.classList.toggle(
"ativo"
);
};}
configurarBotaoCalendario();
// ============================================================
// VALOR DO SERVIÇO
// ============================================================
// ============================================================
// VALOR DO SERVIÇO
// ============================================================
function fpNormalizarPrecoUI(texto){
return String(texto || "")
.trim()
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g, "")
.replace(/\s+/g, " "); }
function fpValorNumericoUI(valor){
if(valor === null || valor === undefined || valor === "") return null;
if(typeof valor === "number") return Math.round(valor * 100) / 100;
let texto = String(valor).trim().replace(/R\$/g, "").replace(/\s/g, "");
if(texto.indexOf(",") >= 0){
texto = texto.replace(/\./g, "").replace(",", "."); }
const numero = Number(texto);
return isNaN(numero) ? null : Math.round(numero * 100) / 100; }
function fpLinhaPrecoUI(principal, variacao, cabelo, tamanho){
if(typeof dadosSistema === "undefined" ||
!Array.isArray(dadosSistema.servicos)){
return null; }
const p = fpNormalizarPrecoUI(principal);
const v = fpNormalizarPrecoUI(variacao);
const c = fpNormalizarPrecoUI(cabelo);
const t = fpNormalizarPrecoUI(tamanho);
return dadosSistema.servicos.find(function(item){
const itemPrincipal = fpNormalizarPrecoUI(item.servicoPrincipal || item.nome);
const itemVariacao = fpNormalizarPrecoUI(item.variacao);
const itemCabelo = fpNormalizarPrecoUI(item.tipoCabelo);
const itemTamanho = fpNormalizarPrecoUI(item.tamanho);
const ativo = item.ativo !== false;
return ativo &&
itemPrincipal === p &&
itemVariacao === v &&
(itemCabelo === c || itemCabelo === "todos") &&
(itemTamanho === t || itemTamanho === "todos");
}) || null; }
function fpCalcularPrecoUI(cliente){
cliente = cliente || {};
const servico = fpNormalizarPrecoUI(cliente.servico);
const penteado = fpNormalizarPrecoUI(cliente.penteado);
const combinado = (servico + " " + penteado).trim();
const tamanhoTexto = fpNormalizarPrecoUI(cliente.tamanhoCabelo);
let tamanho = "";
if(tamanhoTexto.indexOf("pequeno") >= 0 || /\bp\b/.test(tamanhoTexto)){

tamanho = "Pequeno (P)";
}else if(tamanhoTexto.indexOf("medio") >= 0 || /\bm\b/.test(tamanhoTexto)){
tamanho = "Médio (M)";
}else if(tamanhoTexto.indexOf("grande") >= 0 || /\bg\b/.test(tamanhoTexto)){
tamanho = "Grande (G)"; }
const temMaquiagem = combinado.indexOf("maquiagem") >= 0;
const temBabyliss = combinado.indexOf("babyliss") >= 0;
const temPenteado = combinado.indexOf("penteado") >= 0 ||
combinado.indexOf("semi-preso") >= 0 ||
combinado.indexOf("semi preso") >= 0 ||
combinado.indexOf("coque") >= 0;
let total = 0;
let itens = [];
let pendente = false;
let incompleto = false;
if(temMaquiagem){
const linha = fpLinhaPrecoUI("Maquiagem", "Maquiagem", "Todos", "Todos");
if(!linha || linha.valorPendente || fpNormalizarPrecoUI(linha.tipoCalculo) === "avaliacao"){
incompleto = true;
}else{
const valor = fpValorNumericoUI(linha.valor);
if(valor === null){ incompleto = true; }
else { total += valor; itens.push({nome:"Maquiagem", valor:valor}); } }}
if(temPenteado){
let variacao = "";
if(combinado.indexOf("semi-preso") >= 0 || combinado.indexOf("semi preso") >= 0){
variacao = "Semi-Preso";
}else if(combinado.indexOf("coque") >= 0){
variacao = "Coque"; }
let cabelo = "";
if(combinado.indexOf("cacheado") >= 0){
cabelo = "Cacheado";
}else if(combinado.indexOf("liso") >= 0){
cabelo = "Liso";
}else{
/* Compatibilidade com respostas antigas que nao informavam o tipo:
 o calculo antigo do sistema tratava ausencia de "cacheado" como liso. */
cabelo = "Liso"; }
if(!variacao){
incompleto = true;
}else{
const linha = fpLinhaPrecoUI("Penteado", variacao, cabelo, "Todos");
if(!linha || linha.valorPendente || fpNormalizarPrecoUI(linha.tipoCalculo) === "avaliacao"){
incompleto = true;
}else{
const valor = fpValorNumericoUI(linha.valor);
if(valor === null){ incompleto = true; }
else{
total += valor;
itens.push({nome:variacao + " " + cabelo, valor:valor});
if(tamanho === "Grande (G)" &&
fpNormalizarPrecoUI(linha.regraAdicional).indexOf("+20") >= 0){
total += 20;
itens.push({nome:"Adicional cabelo grande", valor:20}); }}}}}
if(temBabyliss){
let cabelo = "";
if(combinado.indexOf("cacheado") >= 0){
cabelo = "Cacheado";
}else if(combinado.indexOf("liso") >= 0){
cabelo = "Liso";
}else{
cabelo = "Liso"; }
if(!tamanho){
incompleto = true;
}else{
const variacao = "Babyliss " + cabelo;
const linha = fpLinhaPrecoUI("Babyliss", variacao, cabelo, tamanho);
if(linha && (linha.valorPendente || fpNormalizarPrecoUI(linha.tipoCalculo) === "avaliacao")){
pendente = true;
}else if(!linha){
incompleto = true;

}else{
const valor = fpValorNumericoUI(linha.valor);
if(valor === null){ incompleto = true; }
else{
total += valor;
itens.push({nome:variacao + " " + tamanho, valor:valor}); }}}}
return {
status: pendente ? "pendente" : (incompleto || itens.length === 0 ? "incompleto" : "ok"),
valor: pendente || incompleto || itens.length === 0 ? null : Math.round(total * 100) / 100,
subtotalConhecido: Math.round(total * 100) / 100,
itens: itens
};}
function fpTextoPrecoUI(cliente){
const resultado = fpCalcularPrecoUI(cliente);
if(resultado.status === "pendente") return "A avaliar";
if(resultado.status !== "ok") return "Preço indisponível";
return formatarMoeda(resultado.valor); }
// Mantem o nome da funcao usado pelo restante da agenda.
function encontrarValorServico(cliente){
const resultado = fpCalcularPrecoUI(cliente);
return resultado.status === "ok" ? resultado.valor : 0; }
// ============================================================
// FORMATAR MOEDA
// ============================================================
function formatarMoeda(valor) {
return Number(valor || 0)
.toLocaleString(
"pt-BR", {
style: "currency",
currency: "BRL" }
);}
// ============================================================
// DETALHES DO CLIENTE
// ============================================================
function abrirDetalhesCliente(cliente) {
let modal =
document.getElementById(
"modalDetalhesAgenda"
);
if (!modal) {
modal =
document.createElement(
"div"
);
modal.id =
"modalDetalhesAgenda";
modal.className =
"modal-detalhes-cliente";
modal.innerHTML = `
<div class="modal-conteudo">
<button
type="button"
id="fecharModalAgenda"
class="modal-fechar" >×
</button>
<h2>
Detalhes do atendimento
</h2>
<div
id="conteudoDetalhesCliente"
></div>
</div>
`;
document.body.appendChild(
modal
);
document
.getElementById(
"fecharModalAgenda" )
.onclick =

function () {
modal.classList.remove(
"ativo"
);
};
modal.addEventListener(
"click",
function (event) {
if (
event.target === modal
) {
modal.classList.remove(
"ativo"
);}}
);}
const conteudo =
document.getElementById(
"conteudoDetalhesCliente"
);
const localizacao =
cliente.localizacao ||
cliente.linkLocalizacao ||
"";
conteudo.innerHTML = `
<div class="detalhe-item">
<strong>
Cliente
</strong>
<span>
${
cliente.nome || "-" }
</span>
</div>
<div class="detalhe-item">
<strong>
Telefone
</strong>
<span>
${
cliente.telefone || "-" }
</span>
</div>
<div class="detalhe-item">
<strong>
Data
</strong>
<span>
${
formatarDataExibicao(
cliente.data )}
</span>
</div>
<div class="detalhe-item">
<strong>
Horário
</strong>
<span>
${
cliente.horario || "-" }
</span>
</div>
<div class="detalhe-item">
<strong>
Horário final
</strong>
<span>
${
cliente.horaFim || "-" }
</span>
</div>
<div class="detalhe-item">

<strong>
Serviço
</strong>
<span>
${
cliente.servico || "-" }
</span>
</div>
<div class="detalhe-item">
<strong>
Tamanho do cabelo
</strong>
<span>
${
cliente.tamanhoCabelo || "-" }
</span>
</div>
<div class="detalhe-item">
<strong>
Penteado
</strong>
<span>
${
cliente.penteado || "-" }
</span>
</div>
<div class="detalhe-item">
<strong>
Bairro
</strong>
<span>
${
cliente.bairro || "-" }
</span>
</div>
<div class="detalhe-item">
<strong>
Localização
</strong>
${
localizacao
? `
<a
href="${localizacao}"
target="_blank"
rel="noopener noreferrer" >
Abrir localização
</a> `
: `
<span>-</span> `}
</div>
<div class="detalhe-item">
<strong>
Autorização de uso de imagem
</strong>
<span>
${
cliente.autorizacaoImagem ||
cliente.autorizacao ||
"-" }
</span>
</div>
`;
modal.classList.add(
"ativo"
);}
// ============================================================
// PREPARAR BOTÃO ADICIONAR
// ============================================================
function prepararBotaoAdicionar() {

const area =
document.querySelector(
".add-agenda"
);
if (!area) {
return; }
area.onclick =
function () {
abrirModalNovoAgendamento();
};}
// ============================================================
// MODAL NOVO AGENDAMENTO
// ============================================================
function abrirModalNovoAgendamento() {
let modal =
document.getElementById(
"modalNovoAgendamento"
);
if (!modal) {
modal =
document.createElement(
"div"
);
modal.id =
"modalNovoAgendamento";
modal.className =
"modal-detalhes-cliente";
modal.innerHTML = `
<div class="modal-conteudo">
<button
type="button"
class="modal-fechar"
id="fecharNovoAgendamento" >×
</button>
<h2>
Novo agendamento
</h2>
<form
class="form-agendamento"
id="formNovoAgendamento" >
<label>
Cliente
</label>
<input
type="text"
id="novoCliente"
placeholder="Nome da cliente"
required >
<label>
Telefone
</label>
<input
type="tel"
id="novoTelefone"
placeholder="Telefone" >
<label>
Data
</label>
<input
type="date"
id="novoData"
required >
<label>
Hora inicial
</label>
<input
type="time"
id="novoHora"
required >
<label>
Hora final

</label>
<input
type="time"
id="novoHoraFim" >
<label>
Serviço
</label>
<select
id="novoServico"
required >
<option value="">Selecione o serviço</option>
<option value="Maquiagem">Maquiagem</option>
<option value="Babyliss">Babyliss</option>
<option value="Penteado">Penteado</option>
<option value="Maquiagem + Babyliss">Maquiagem + Babyliss</option>
<option value="Maquiagem + Penteado">Maquiagem + Penteado</option>
</select>
<div id="campoTamanhoCabelo" style="display:none;">
<label for="novoTamanhoCabelo">Tamanho do cabelo</label>
<select id="novoTamanhoCabelo">
<option value="">Selecione o tamanho</option>
<option value="Pequeno (P)">Pequeno (P)</option>
<option value="Médio (M)">Médio (M)</option>
<option value="Grande (G)">Grande (G)</option>
</select>
</div>
<div id="campoPenteado" style="display:none;">
<label for="novoPenteado">Tipo de penteado / Babyliss</label>
<select id="novoPenteado">
<option value="">Selecione uma opção</option>
<option value="Coque Liso" data-categoria="penteado">Coque Liso</option>
<option value="Coque Cacheado" data-categoria="penteado">Coque Cacheado</option>
<option value="Semi-Preso Liso" data-categoria="penteado">Semi-Preso Liso</option>
<option value="Semi-Preso Cacheado" data-categoria="penteado">Semi-Preso Cacheado</option>
<option value="Babyliss Liso" data-categoria="babyliss">Babyliss Liso</option>
<option value="Babyliss Cacheado" data-categoria="babyliss">Babyliss Cacheado</option>
</select>
</div>
<label>
Bairro
</label>
<input
type="text"
id="novoBairro"
placeholder="Bairro" >
<label>
Localização
</label>
<input
type="url"
id="novoLocalizacao"
placeholder="Link do Google Maps" >
<label>
Autorização de uso de imagem
</label>
<select
id="novoAutorizacao" >
<option value="">
Selecione
</option>
<option value="Sim, Autorizo">
Sim, Autorizo
</option>
<option value="Não autorizo">
Não autorizo
</option>
</select>
<button
type="submit"

class="btn-salvar-agendamento" >
Salvar agendamento
</button>
</form>
</div>
`;
document.body.appendChild(
modal
);
document
.getElementById(
"fecharNovoAgendamento" )
.onclick =
function () {
modal.classList.remove(
"ativo"
);
};
modal.addEventListener(
"click",
function (event) {
if (
event.target === modal
) {
modal.classList.remove(
"ativo"
);}}
);
configurarFormularioNovoAgendamento(); }
document.getElementById(
"novoData"
).value =
dataParaString(
dataSelecionadaAgenda
);
modal.classList.add(
"ativo"
);}
// ============================================================
// CAMPOS DEPENDENTES DO SERVIÇO
// ============================================================
function configurarFormularioNovoAgendamento() {
const servico = document.getElementById("novoServico");
const campoTamanho = document.getElementById("campoTamanhoCabelo");
const campoPenteado = document.getElementById("campoPenteado");
const tamanho = document.getElementById("novoTamanhoCabelo");
const detalhe = document.getElementById("novoPenteado");
if (!servico || !campoTamanho || !campoPenteado || !tamanho || !detalhe) {
return; }
// Evita registrar o mesmo evento mais de uma vez.
if (servico.dataset.configurado === "sim") {
atualizarCamposServico();
return; }
servico.dataset.configurado = "sim";
function atualizarCamposServico() {
const valor = String(servico.value || "").toLowerCase();
const temBabyliss = valor.includes("babyliss");
const temPenteado = valor.includes("penteado");
const temEstilo = temBabyliss || temPenteado;
const soMaquiagem = valor === "maquiagem";
campoTamanho.style.display = temEstilo ? "block" : "none";
campoPenteado.style.display = temEstilo ? "block" : "none";
tamanho.required = temEstilo;
detalhe.required = temEstilo;
if (!temEstilo || soMaquiagem) {
tamanho.value = "";
detalhe.value = ""; }
Array.from(detalhe.options).forEach(function(opcao) {

if (!opcao.value) {
opcao.hidden = false;
opcao.disabled = false;
return; }
const categoria = opcao.dataset.categoria || "";
const mostrar = (temBabyliss && categoria === "babyliss") ||
(temPenteado && categoria === "penteado");
opcao.hidden = !mostrar;
opcao.disabled = !mostrar;
});
if (detalhe.selectedOptions.length &&
detalhe.selectedOptions[0].disabled) {
detalhe.value = ""; }}
servico.addEventListener("change", atualizarCamposServico);
atualizarCamposServico(); }
// ============================================================
// SALVAR NOVO AGENDAMENTO
// ============================================================
function configurarSalvarFormulario() {
const form =
document.getElementById(
"formNovoAgendamento"
);
if (!form) {
return; }
// Evita registrar o evento de salvar várias vezes
// quando o modal é recriado pelo sistema
if(form.dataset.configurado){
return; }
form.dataset.configurado = "sim";
form.addEventListener(
"submit",
async function (event) {
event.preventDefault();
const botao =
form.querySelector(
".btn-salvar-agendamento"
);
const agendamento = {
data:
document.getElementById(
"novoData"
).value,
horario:
document.getElementById(
"novoHora"
).value,
horaFim:
document.getElementById(
"novoHoraFim"
).value,
nome:
document.getElementById(
"novoCliente"
).value.trim(),
telefone:
document.getElementById(
"novoTelefone"
).value.trim(),
servico:
document.getElementById(
"novoServico"
).value,
tamanhoCabelo:
document.getElementById(
"novoTamanhoCabelo"
).value,

penteado:
document.getElementById(
"novoPenteado"
).value,
bairro:
document.getElementById(
"novoBairro"
).value.trim(),
localizacao:
document.getElementById(
"novoLocalizacao"
).value.trim(),
autorizacaoImagem:
document.getElementById(
"novoAutorizacao"
).value
};
botao.disabled =
true;
botao.textContent =
"Salvando...";
try {
/* Envia os dados para a API do Flow Pro.
 A coluna Serviço guarda a categoria escolhida; a coluna Penteado
 guarda a opção detalhada (Coque Liso, Babyliss Cacheado etc.). */
const resposta =
await fetch(
API_AGENDA, {
method: "POST",
headers: {
"Content-Type":
"text/plain;charset=utf-8"
},
body:
JSON.stringify(
agendamento )}
);
const resultado =
await resposta.json();
if (
resultado &&
resultado.sucesso
) {
alert(
"Agendamento salvo com sucesso!"
);
document
.getElementById(
"modalNovoAgendamento" )
.classList.remove(
"ativo"
);
if (
typeof carregarDados ===
"function"
) {
await carregarDados();
document.dispatchEvent(
new Event("dadosCarregados")
);}
} else {
throw new Error(
resultado &&
resultado.erro
? resultado.erro
: "Não foi possível salvar."
);}
} catch (erro) {
console.error(

"Erro ao salvar agendamento:",
erro
);
alert(
"Não foi possível salvar o agendamento. Confira a conexão com a API e tente novamente."
);
} finally {
botao.disabled =
false;
botao.textContent =
"Salvar agendamento"; }}
);}
// ============================================================
// OBSERVAR CRIAÇÃO DO MODAL
// ============================================================
const observadorAgenda =
new MutationObserver(
function () {
configurarSalvarFormulario(); }
);
observadorAgenda.observe(
document.body, {
childList: true,
subtree: true }
);
// ============================================================
// MODAL EDITAR CLIENTE
// ============================================================
function editarClienteAgenda(clienteOuId){
const cliente = (clienteOuId && typeof clienteOuId === "object")
? clienteOuId
: pegarClientePorIdAgenda(clienteOuId);
if(!cliente){
return; }
const id = cliente.id || "";
clienteEditandoAgenda = cliente;
let modal =
document.getElementById("modalEditarAgenda");
if(!modal){
modal = document.createElement("div");
modal.id="modalEditarAgenda";
modal.className="modal-detalhes-cliente";
modal.innerHTML=`
<div class="modal-conteudo">
<button class="modal-fechar" id="fecharEditarAgenda">×</button>
<h2>Editar agendamento</h2>
<form id="formEditarAgenda">
<input id="editarId" type="hidden">
<input id="editarOrigem" type="hidden">
<input id="editarLinhaPlanilha" type="hidden">
<label>Cliente</label>
<input id="editarNome">
<label>Telefone</label>
<input id="editarTelefone">
<label>Data</label>
<input id="editarData" type="date">
<label>Horário</label>
<input id="editarHorario" type="time">
<label>Serviço</label>
<input id="editarServico">
<label>Bairro</label>
<input id="editarBairro">
<label>Localização</label>
<input id="editarLocalizacao">
<button type="submit" class="btn-salvar-agendamento">
Salvar alterações
</button>
</form>
</div>
`;
document.body.appendChild(modal);

document.getElementById("fecharEditarAgenda").onclick=function(){
modal.classList.remove("ativo");
};
configurarFormularioEditarAgenda(); }
document.getElementById("editarId").value=cliente.id || id;
document.getElementById("editarOrigem").value=cliente.origem || "";
document.getElementById("editarLinhaPlanilha").value=cliente.linhaPlanilha || "";
document.getElementById("editarNome").value=cliente.nome || "";
document.getElementById("editarTelefone").value=cliente.telefone || "";
document.getElementById("editarData").value=normalizarData(cliente.data);
document.getElementById("editarHorario").value=cliente.horario || "";
document.getElementById("editarServico").value=cliente.servico || "";
document.getElementById("editarBairro").value=cliente.bairro || "";
document.getElementById("editarLocalizacao").value=cliente.localizacao || "";
modal.classList.add("ativo"); }
function configurarFormularioEditarAgenda(){
const form=document.getElementById("formEditarAgenda");
if(!form || form.dataset.configurado){
return; }
form.dataset.configurado="sim";
form.addEventListener("submit",async function(e){
e.preventDefault();
try {
const dados={
acao:"editar",
id:document.getElementById("editarId").value,
origem:document.getElementById("editarOrigem").value || clienteEditandoAgenda?.origem || "",
linhaPlanilha:Number(document.getElementById("editarLinhaPlanilha").value) || clienteEditandoAgenda?.linhaPlanilha || null,
nome:document.getElementById("editarNome").value,
telefone:document.getElementById("editarTelefone").value,
data:document.getElementById("editarData").value,
horario:document.getElementById("editarHorario").value,
horaFim: clienteEditandoAgenda?.horaFim || "",
servico:document.getElementById("editarServico").value,
tamanhoCabelo: clienteEditandoAgenda?.tamanhoCabelo || "",
penteado: clienteEditandoAgenda?.penteado || "",
autorizacaoImagem: clienteEditandoAgenda?.autorizacaoImagem ||
clienteEditandoAgenda?.autorizacao || "",
bairro:document.getElementById("editarBairro").value,
localizacao:document.getElementById("editarLocalizacao").value
};
const resposta = await fetch(API_AGENDA,{
method:"POST",
headers:{
"Content-Type":"text/plain;charset=utf-8"
},
body:JSON.stringify(dados)
});
const resultado = await resposta.json();
if(!resultado || !resultado.sucesso){
throw new Error(resultado && resultado.erro ? resultado.erro : "Não foi possível editar o agendamento."); }
document.getElementById("modalEditarAgenda").classList.remove("ativo");
if(typeof carregarDados==="function"){
await carregarDados();
document.dispatchEvent(new Event("dadosCarregados")); }
} catch(erro) {
console.error("Erro ao editar agendamento:", erro);
alert("Não foi possível salvar as alterações. Confira a origem do agendamento e tente novamente."); }
}); }
// ============================================================
// MODAL EXCLUIR CLIENTE
// ============================================================
function excluirClienteAgenda(clienteOuId){
const cliente = (clienteOuId && typeof clienteOuId === "object")
? clienteOuId
: pegarClientePorIdAgenda(clienteOuId);
if(!cliente){
return; }

const id = cliente.id || "";
let modal=document.getElementById("modalExcluirAgenda");
if(!modal){
modal=document.createElement("div");
modal.id="modalExcluirAgenda";
modal.className="modal-detalhes-cliente";
modal.innerHTML=`
<div class="modal-conteudo">
<h2>Excluir agendamento?</h2>
<p id="textoExcluirAgenda"></p>
<div class="acoes-modal">
<button id="cancelarExcluirAgenda">
Cancelar
</button>
<button id="confirmarExcluirAgenda">
Excluir
</button>
</div>
</div>`;
document.body.appendChild(modal); }
document.getElementById("textoExcluirAgenda").textContent =
"Deseja excluir "+cliente.nome+"?";
modal.classList.add("ativo");
document.getElementById("cancelarExcluirAgenda").onclick=function(){
modal.classList.remove("ativo");
};
document.getElementById("confirmarExcluirAgenda").onclick=async function(){
try {
const resposta = await fetch(API_AGENDA,{
method:"POST",
headers:{
"Content-Type":"text/plain;charset=utf-8"
},
body:JSON.stringify({
acao:"excluir",
id:id,
origem:cliente.origem || "",
linhaPlanilha:cliente.linhaPlanilha || null
})
});
const resultado = await resposta.json();
if(!resultado || !resultado.sucesso){
throw new Error(resultado && resultado.erro ? resultado.erro : "Não foi possível excluir o agendamento."); }
modal.classList.remove("ativo");
if(typeof carregarDados === "function"){
await carregarDados();
document.dispatchEvent(new Event("dadosCarregados"));
}else if(typeof dadosSistema !== "undefined" && dadosSistema.agendamentos){
dadosSistema.agendamentos = dadosSistema.agendamentos.filter(function(item){
if(item === cliente) return false;
const mesmaOrigem = String(item.origem || "") === String(cliente.origem || "");
const mesmaLinha = Number(item.linhaPlanilha || 0) === Number(cliente.linhaPlanilha || 0);
if(mesmaOrigem && cliente.linhaPlanilha && mesmaLinha) return false;
return !(mesmaOrigem && String(item.id || "") === String(id || "") && !cliente.linhaPlanilha);
});
mostrarAgendamentosDoDia(dataSelecionadaAgenda);
atualizarResumoDia(dataSelecionadaAgenda);
if(typeof atualizarCardsInicio==="function") atualizarCardsInicio();
if(typeof carregarAgendaHoje==="function") carregarAgendaHoje();
if(typeof carregarProximoAtendimento==="function") carregarProximoAtendimento(); }
} catch(erro) {
console.error("Erro ao excluir agendamento:", erro);
alert("Não foi possível excluir o agendamento. Confira os dados e tente novamente."); }
};}
// ============================================================
// INICIALIZAÇÃO FINAL
// ============================================================

setTimeout(
function () {
configurarBotaoCalendario();
prepararBotaoAdicionar();
configurarSalvarFormulario();
},
500
);
// ============================================================
// BUSCAR CLIENTE POR ID
// ============================================================
function pegarClientePorIdAgenda(id){
return (dadosSistema.agendamentos || [])
.find(function(cliente){
return String(cliente.id) === String(id);
});
}