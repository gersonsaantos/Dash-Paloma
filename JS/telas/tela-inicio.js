
// =====================================
// TELA INÍCIO - FLOW PRO
// =====================================
// =====================================
// INICIAR TELA
// =====================================
function iniciarInicio(){
atualizarSaudacao();
atualizarData();
atualizarCardsInicio();
carregarAgendaHoje();
}
// =====================================
// SAUDAÇÃO AUTOMÁTICA
// =====================================
function atualizarSaudacao(){
const elemento =
document.getElementById("saudacao");
if(!elemento) return;
const agora = new Date();
const hora = Number(
agora.toLocaleString(
"pt-BR",
{
timeZone: "America/Sao_Paulo",
hour: "2-digit"
}
)
);
let mensagem = "";
if(hora >= 5 && hora < 12){
mensagem = "Bom dia";
}
else if(hora >= 12 && hora < 18){
mensagem = "Boa tarde";
}
else{
mensagem = "Boa noite";
}
const nomeUsuario = "Paloma";
elemento.innerHTML =
`${mensagem}, ${nomeUsuario}! ■■`;
}
// =====================================
// DATA ATUAL - BRASÍLIA
// =====================================
function atualizarData(){
const elemento =
document.getElementById("dataAtual");
if(!elemento) return;
const hoje = new Date();
const dataFormatada =
hoje.toLocaleDateString(
"pt-BR",
{
weekday: "long",
day: "numeric",

month: "long",
year: "numeric",
timeZone: "America/Sao_Paulo" }
);
elemento.innerHTML =
dataFormatada.charAt(0).toUpperCase() +
dataFormatada.slice(1); }
// =====================================
// PEGAR DATA ATUAL DE BRASÍLIA
// =====================================
function pegarDataBrasilia(){
return new Date().toLocaleDateString(
"en-CA", {
timeZone: "America/Sao_Paulo" }
);}
// =====================================
// CONVERTER DATA
// =====================================
function criarDataSegura(data){
if(!data) return null;
if(data instanceof Date){
return data; }
const texto =
String(data).trim();
if(!texto) return null;
// ==================================
// FORMATO YYYY-MM-DD
// ==================================
if(
/^\d{4}-\d{2}-\d{2}$/.test(texto)
){
const partes =
texto.split("-");
return new Date(
Number(partes[0]),
Number(partes[1]) - 1,
Number(partes[2])
);}
// ==================================
// FORMATO DD/MM/YYYY
// ==================================
if(
/^\d{2}\/\d{2}\/\d{4}$/.test(texto)
){
const partes =
texto.split("/");
return new Date(
Number(partes[2]),
Number(partes[1]) - 1,
Number(partes[0])
);}
const tentativa =
new Date(texto);
if(isNaN(tentativa.getTime())){
return null; }
return tentativa;

}
// =====================================
// NORMALIZAR TEXTO
// =====================================
function normalizarTexto(texto){
return String(texto || "")
.trim()
.toLowerCase()
.normalize("NFD")
.replace(/[\u0300-\u036f]/g, ""); }
// =====================================
// CONVERTER VALOR
// =====================================
function converterValor(valor){
if(typeof valor === "number"){
return valor; }
if(!valor) return 0;
let texto =
String(valor)
.trim()
.replace("R$", "")
.trim();
// Formato brasileiro
// Exemplo: 1.850,00
if(texto.includes(",")){
texto =
texto
.replace(/\./g, "")
.replace(",", "."); }
const numero =
Number(texto);
return isNaN(numero)
? 0
: numero; }
// =====================================
// ENCONTRAR VALOR DO SERVIÇO
// =====================================
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
function encontrarValorServicoHome(nomeServico, tamanhoCabelo, penteado){
const cliente = (nomeServico && typeof nomeServico === "object")

? nomeServico
: {servico:nomeServico, tamanhoCabelo:tamanhoCabelo, penteado:penteado};
const resultado = fpCalcularPrecoUI(cliente);
return resultado.status === "ok" ? resultado.valor : 0; }
// =====================================
// FORMATAR MOEDA
// =====================================
function formatarMoeda(valor){
return Number(valor || 0)
.toLocaleString(
"pt-BR", {
style: "currency",
currency: "BRL" }
);}
// =====================================
// ATUALIZAR CARDS DA HOME
// =====================================
function atualizarCardsInicio(){
console.log(
"Atualizando cards da Home..."
);
if(
!dadosSistema ||
!dadosSistema.agendamentos
){
console.log(
"Agendamentos ainda não carregados."
);
return; }
const agendamentos =
dadosSistema.agendamentos;
// ==================================
// DATA ATUAL
// ==================================
const hoje =
pegarDataBrasilia();
console.log(
"Data atual:",
hoje
);
// ==================================
// ATENDIMENTOS DE HOJE
// ==================================
const atendimentosHoje =
agendamentos.filter(
cliente => {
return cliente.data === hoje; }
);
// ==================================
// CARD:
// ATENDIMENTOS HOJE
// ==================================
const elementoAtendimentos =
document.getElementById(
"atendimentosHoje"
);
if(elementoAtendimentos){

elementoAtendimentos.innerText =
atendimentosHoje.length; }
// ==================================
// FATURAMENTO DO DIA
// ==================================
let faturamentoHoje = 0;
atendimentosHoje.forEach(
cliente => {
faturamentoHoje +=
encontrarValorServicoHome(
cliente.servico,
cliente.tamanhoCabelo,
cliente.penteado
);}
);
// ==================================
// CARD:
// FATURAMENTO DO DIA
// ==================================
const elementoFaturamento =
document.getElementById(
"faturamentoHoje"
);
if(elementoFaturamento){
elementoFaturamento.innerText =
formatarMoeda(
faturamentoHoje
);}
// ==================================
// PRÓXIMOS AGENDAMENTOS
// ==================================
//
// Conta somente os atendimentos:
//
// HOJE
// +
// DIAS RESTANTES DO MÊS
//
// Não conta meses futuros.
// Não conta dias que já passaram.
//
// ==================================
const dataAtual =
criarDataSegura(
hoje
);
if(dataAtual){
const anoAtual =
dataAtual.getFullYear();
const mesAtual =
dataAtual.getMonth();
const diaAtual =
dataAtual.getDate();
const proximosAgendamentos =
agendamentos.filter(
cliente => {
const dataCliente =

criarDataSegura(
cliente.data
);
if(!dataCliente){
return false; }
const anoCliente =
dataCliente.getFullYear();
const mesCliente =
dataCliente.getMonth();
const diaCliente =
dataCliente.getDate();
// Mesmo ano
if(
anoCliente !== anoAtual
){
return false; }
// Mesmo mês
if(
mesCliente !== mesAtual
){
return false; }
// Hoje ou data futura
if(
diaCliente < diaAtual
){
return false; }
return true; }
);
console.log(
"Próximos agendamentos do mês:",
proximosAgendamentos
);
// ==================================
// CARD:
// PRÓXIMOS AGENDAMENTOS
// ==================================
const elementoProximos =
document.getElementById(
"proximosAgendamentos"
);
if(elementoProximos){
elementoProximos.innerText =
proximosAgendamentos.length; } }
// ==================================
// CLIENTES CADASTRADAS
// ==================================
const clientesValidas =
agendamentos.filter(
cliente => {
return String(
cliente.nome || ""
).trim() !== ""; }
);
const elementoClientes =
document.getElementById(
"clientesCadastradas"

);
if(elementoClientes){
elementoClientes.innerText =
clientesValidas.length; }
// ==================================
// LOG
// ==================================
console.log(
"Atendimentos hoje:",
atendimentosHoje.length
);
console.log(
"Faturamento hoje:",
faturamentoHoje
);
console.log(
"Próximos agendamentos:",
agendamentos.length
);
console.log(
"Clientes cadastradas:",
clientesValidas.length
);}
// =====================================
// AGENDA DO DIA
// =====================================
function carregarAgendaHoje(){
const lista =
document.getElementById(
"agendaHoje"
);
if(!lista) return;
console.log(
"Atualizando agenda..."
);
if(
!dadosSistema ||
!dadosSistema.agendamentos
){
lista.innerHTML =
"<p>Carregando agenda...</p>";
return; }
const agendamentos =
dadosSistema.agendamentos;
if(agendamentos.length === 0){
lista.innerHTML =
"<p>Nenhum atendimento cadastrado.</p>";
return; }
// ==================================
// DATA DE HOJE
// ==================================
const dataHoje =
pegarDataBrasilia();
// ==================================
// FILTRAR HOJE
// ==================================
const clientesHoje =

agendamentos.filter(
cliente => {
return cliente.data === dataHoje; }
);
console.log(
"Data procurada:",
dataHoje
);
console.log(
"Clientes encontrados:",
clientesHoje
);
// ==================================
// ORDENAR POR HORÁRIO
// ==================================
clientesHoje.sort(
(a,b) => {
return String(
a.horario || ""
).localeCompare(
String(
b.horario || "" )
);}
);
lista.innerHTML = "";
// ==================================
// NENHUM AGENDAMENTO
// ==================================
if(clientesHoje.length === 0){
lista.innerHTML = `
<p>
Nenhum atendimento hoje.
</p>
`;
return; }
// ==================================
// MOSTRAR MÁXIMO 4 CLIENTES NA HOME
// ==================================
const clientesExibidos =
clientesHoje.slice(0,4);
clientesExibidos.forEach(
cliente => {
const valor =
encontrarValorServicoHome(
cliente.servico,
cliente.tamanhoCabelo,
cliente.penteado
);
lista.innerHTML += `
<div class="cliente-home">
<div class="horario">
${cliente.horario || "--:--"}
</div>
<img
src="assets/Avatares/cliente01 (27).jpg"
alt="${cliente.nome}" >
<div class="cliente-info-home">

<h3>
${cliente.nome}
</h3>
<p>
${cliente.servico || "Serviço não informado"}
</p>
</div>
<div class="valor-home">
${formatarMoeda(valor)}
</div>
</div>
`;}
);}
// =====================================
// INICIAR QUANDO A PÁGINA ABRIR
// =====================================
document.addEventListener(
"DOMContentLoaded",
function(){
iniciarInicio(); }
);
// =====================================
// PRÓXIMO ATENDIMENTO
// =====================================
function carregarProximoAtendimento(){
const horarioElemento =
document.getElementById("proximoHorario");
const tempoElemento =
document.getElementById("proximoTempo");
const nomeElemento =
document.getElementById("proximoNome");
const servicoElemento =
document.getElementById("proximoServico");
const valorElemento =
document.getElementById("proximoValor");
if(
!horarioElemento ||
!tempoElemento ||
!nomeElemento ||
!servicoElemento
){
return; }
// ==================================
// VERIFICAR API
// ==================================
if(
!dadosSistema ||
!Array.isArray(dadosSistema.agendamentos)
){
horarioElemento.innerText = "--:--";
tempoElemento.innerText =
"Carregando...";
nomeElemento.innerText =
"Carregando...";
servicoElemento.innerText =
"--";
if(valorElemento){

valorElemento.innerText =
"R$ 0,00"; }
return; }
const agendamentos =
dadosSistema.agendamentos;
// ==================================
// DATA E HORA ATUAL DE BRASÍLIA
// ==================================
const agora = new Date();
const partes =
new Intl.DateTimeFormat(
"en-US", {
timeZone: "America/Sao_Paulo",
year: "numeric",
month: "2-digit",
day: "2-digit",
hour: "2-digit",
minute: "2-digit",
hour12: false }
).formatToParts(agora);
const valores = {};
partes.forEach(parte => {
if(parte.type !== "literal"){
valores[parte.type] =
parte.value; }
});
const dataAtual =
`${valores.year}-${valores.month}-${valores.day}`;
const horaAtual =
`${valores.hour}:${valores.minute}`;
// ==================================
// FILTRAR ATENDIMENTOS FUTUROS
// ==================================
const futuros =
agendamentos.filter(cliente => {
if(
!cliente.data ||
!cliente.horario
){
return false; }
// Data futura
if(
cliente.data > dataAtual
){
return true; }
// Data passada
if(
cliente.data < dataAtual
){
return false; }
// Hoje:
// somente horários que ainda
// não passaram
return (
cliente.horario >= horaAtual
);
});

// ==================================
// ORDENAR POR DATA E HORA
// ==================================
futuros.sort((a,b) => {
const primeiro =
`${a.data} ${a.horario}`;
const segundo =
`${b.data} ${b.horario}`;
return primeiro.localeCompare(
segundo
);
});
// ==================================
// NENHUM PRÓXIMO ATENDIMENTO
// ==================================
if(futuros.length === 0){
horarioElemento.innerText =
"--:--";
tempoElemento.innerText =
"Nenhum atendimento próximo";
nomeElemento.innerText =
"Agenda encerrada";
servicoElemento.innerText =
"--";
if(valorElemento){
valorElemento.innerText =
"R$ 0,00"; }
window.proximoAtendimento =
null;
return; }
// ==================================
// PRIMEIRO DA LISTA
// ==================================
const proximo =
futuros[0];
// Guardar para os detalhes
window.proximoAtendimento =
proximo;
// ==================================
// PREENCHER HORÁRIO
// ==================================
horarioElemento.innerText =
proximo.horario;
// ==================================
// PREENCHER NOME
// ==================================
nomeElemento.innerText =
proximo.nome ||
"Cliente";
// ==================================
// PREENCHER SERVIÇO
// ==================================
servicoElemento.innerText =
proximo.servico ||
"Serviço não informado";
// ==================================
// PREENCHER VALOR

// ==================================
if(valorElemento){
const valor =
encontrarValorServicoHome(
proximo.servico,
proximo.tamanhoCabelo,
proximo.penteado
);
valorElemento.innerText =
formatarMoeda(valor); }
// ==================================
// PREENCHER TEMPO
// ==================================
tempoElemento.innerText =
calcularTempoAte(
proximo.data,
proximo.horario
);
console.log(
"Próximo atendimento:",
proximo
);}
// =====================================
// CALCULAR TEMPO ATÉ O ATENDIMENTO
// =====================================
function calcularTempoAte(
data,
horario
){
if(
!data ||
!horario
){
return ""; }
const partesData =
data.split("-");
const partesHora =
horario.split(":");
if(
partesData.length !== 3 ||
partesHora.length < 2
){
return ""; }
const ano =
Number(partesData[0]);
const mes =
Number(partesData[1]) - 1;
const dia =
Number(partesData[2]);
const hora =
Number(partesHora[0]);
const minuto =
Number(partesHora[1]);
const atendimento =
new Date(
ano,
mes,

dia,
hora,
minuto, 0
);
const agora =
new Date();
const diferenca =
atendimento.getTime() -
agora.getTime();
if(diferenca <= 0){
return "Agora"; }
const minutos =
Math.floor(
diferenca / 60000
);
const dias =
Math.floor(
minutos / 1440
);
const horas =
Math.floor(
(minutos % 1440) / 60
);
const minutosRestantes =
minutos % 60;
if(dias > 0){
if(dias === 1){
return "Amanhã"; }
return `Daqui a ${dias} dias`; }
if(horas > 0){
if(minutosRestantes > 0){
return `Daqui a ${horas}h ${minutosRestantes}min`; }
return `Daqui a ${horas}h`; }
if(minutosRestantes > 0){
return `Daqui a ${minutosRestantes} min`; }
return "Agora"; }
// =====================================
// MODAL DE DETALHES DO PRÓXIMO
// =====================================
function abrirDetalhesProximo(){
const cliente =
window.proximoAtendimento;
if(!cliente){
return; }
let modal =
document.getElementById(
"modalDetalhesCliente"
);
// ==================================
// CRIAR MODAL
// ==================================
if(!modal){
modal =
document.createElement(
"div"
);
modal.id =

"modalDetalhesCliente";
modal.className =
"modal-detalhes-cliente";
modal.innerHTML = `
<div class="modal-conteudo">
<button
type="button"
class="modal-fechar"
id="fecharModalCliente" >×
</button>
<h2>
Detalhes do atendimento
</h2>
<div class="detalhe-item">
<strong>
Cliente
</strong>
<span id="detalheNome">
</span>
</div>
<div class="detalhe-item">
<strong>
Telefone
</strong>
<span id="detalheTelefone">
</span>
</div>
<div class="detalhe-item">
<strong>
Data
</strong>
<span id="detalheData">
</span>
</div>
<div class="detalhe-item">
<strong>
Horário
</strong>
<span id="detalheHorario">
</span>
</div>
<div class="detalhe-item">
<strong>Horário final</strong>
<span id="detalheHoraFim"></span>
</div>
<div class="detalhe-item">
<strong>Serviço</strong>
<span id="detalheServico"></span>
</div>
<div class="detalhe-item">
<strong>Tamanho do cabelo</strong>
<span id="detalheCabelo"></span>
</div>
<div class="detalhe-item">
<strong>Penteado</strong>
<span id="detalhePenteado"></span>
</div>
<div class="detalhe-item">

<strong>Bairro</strong>
<span id="detalheBairro"></span>
</div>
<div class="detalhe-item">
<strong>Localização</strong>
<span id="detalheLocalizacao"></span>
</div>
<div class="detalhe-item">
<strong>Autorização de imagem</strong>
<span id="detalheAutorizacaoImagem"></span>
</div>
<div class="detalhe-item">
<strong>Confirmação</strong>
<span id="detalheCondicaoConfirmacao"></span>
</div>
</div>
`;
document.body.appendChild(
modal
);
// ==================================
// BOTÃO FECHAR
// ==================================
document
.getElementById(
"fecharModalCliente" )
.addEventListener(
"click",
fecharDetalhesProximo
);
// ==================================
// FECHAR CLICANDO FORA
// ==================================
modal.addEventListener(
"click",
function(event){
if(
event.target === modal
){
fecharDetalhesProximo(); }}
);}
// ==================================
// PREENCHER DETALHES
// ==================================
document.getElementById(
"detalheNome"
).innerText =
cliente.nome || "-";
document.getElementById(
"detalheTelefone"
).innerText =
cliente.telefone || "-";
document.getElementById(
"detalheData"
).innerText =
formatarDataDetalhes(
cliente.data

);
document.getElementById(
"detalheHorario"
).innerText =
cliente.horario || "-";
document.getElementById(
"detalheHoraFim"
).innerText =
cliente.horaFim || "-";
document.getElementById(
"detalheServico"
).innerText =
cliente.servico || "-";
document.getElementById(
"detalheCabelo"
).innerText =
cliente.tamanhoCabelo || "-";
document.getElementById(
"detalhePenteado"
).innerText =
cliente.penteado || "-";
document.getElementById(
"detalheBairro"
).innerText =
cliente.bairro || "-";
const localizacaoEl = document.getElementById("detalheLocalizacao");
const urlLocalizacao = String(cliente.localizacao || "").trim();
if (urlLocalizacao && /^https?:\/\//i.test(urlLocalizacao)) {
localizacaoEl.innerHTML = `<a href="${urlLocalizacao.replace(/"/g, "&quot;")}" target="_blank" rel="noopener noreferrer" class="btn-localizacao">Abrir localização</a>`;
} else if (urlLocalizacao) {
localizacaoEl.textContent = urlLocalizacao;
} else {
localizacaoEl.textContent = "Não informada";
}
document.getElementById(
"detalheAutorizacaoImagem"
).innerText =
cliente.autorizacaoImagem || "-";
document.getElementById(
"detalheCondicaoConfirmacao"
).innerText =
cliente.condicaoConfirmacao || "-";
// ==================================
// ABRIR MODAL
// ==================================
modal.classList.add(
"ativo"
);}
// =====================================
// FECHAR MODAL
// =====================================
function fecharDetalhesProximo(){
const modal =
document.getElementById(
"modalDetalhesCliente"
);

if(modal){
modal.classList.remove(
"ativo"
);}}
// =====================================
// FORMATAR DATA DOS DETALHES
// =====================================
function formatarDataDetalhes(
data
){
if(!data){
return "-"; }
const partes =
data.split("-");
if(partes.length !== 3){
return data; }
return (
partes[2] +
"/" +
partes[1] +
"/" +
partes[0]
);}
// =====================================
// ABRIR TODOS OS AGENDAMENTOS DO DIA
// =====================================
function abrirTodosAgendamentosHoje(){
if(
!dadosSistema ||
!Array.isArray(dadosSistema.agendamentos)
){
return; }
const hoje =
pegarDataBrasilia();
const clientesHoje =
dadosSistema.agendamentos.filter(
cliente => {
return cliente.data === hoje; }
);
clientesHoje.sort(
(a,b)=>{
return String(
a.horario || "" )
.localeCompare(
String(
b.horario || "" )
);}
);
let modal =
document.getElementById(
"modalTodosAgenda"
);
if(!modal){
modal =
document.createElement(
"div"
);

modal.id =
"modalTodosAgenda";
modal.className =
"modal-detalhes-cliente";
document.body.appendChild(
modal
);}
let html = `
<div class="modal-conteudo">
<button
class="modal-fechar"
id="fecharTodosAgenda" >×
</button>
<h2>
Agenda do dia
</h2>
`;
if(clientesHoje.length === 0){
html += `
<p>
Nenhum atendimento hoje.
</p>
`;}
clientesHoje.forEach(
(cliente,index)=>{
const valor =
encontrarValorServicoHome(
cliente.servico,
cliente.tamanhoCabelo,
cliente.penteado
);
html += `
<div class="agenda-todos-item">
<div>
<strong>
${cliente.horario || "--:--"}
</strong>
<p>
${cliente.nome}
</p>
<span>
${cliente.servico}
</span>
<br>
<b>
${formatarMoeda(valor)}
</b>
</div>
<div class="acoes-agenda-home">
<button
class="btn-detalhes-home"
data-id="${cliente.id}">
Detalhes
</button>
</div>
</div>

`;}
);
html += `
</div>
`;
modal.innerHTML =
html;
modal.classList.add(
"ativo"
);
document
.getElementById(
"fecharTodosAgenda" )
.onclick =
function(){
modal.classList.remove(
"ativo"
);
};}
// =====================================
// BOTÃO VER DETALHES
// =====================================
document.addEventListener(
"DOMContentLoaded",
function(){
const botao =
document.getElementById(
"verDetalhesProximo"
);
if(botao){
botao.addEventListener(
"click",
abrirDetalhesProximo
);}}
);
// =====================================
// ATUALIZAR QUANDO A API TERMINAR
// =====================================
document.addEventListener(
"dadosCarregados",
function(){
console.log(
"API finalizada. Atualizando Home..."
);
atualizarCardsInicio();
carregarAgendaHoje();
carregarProximoAtendimento(); }
);
// =====================================
// BOTÃO VER TODOS AGENDA
// =====================================
document.addEventListener(
"click",
function(event){
const botao =
event.target.closest(
"#verTodosAgenda"

);
if(!botao){
return; }
abrirTodosAgendamentosHoje();
});
// =====================================
// HOME - BOTÃO DETALHES
// =====================================
document.addEventListener(
"click",
function(event){
const detalhe =
event.target.closest(".btn-detalhes-home");
if(detalhe){
const id =
String(detalhe.dataset.id);
const cliente =
dadosSistema.agendamentos.find(
item => String(item.id) === String(id)
);
homeAbrirDetalhesCliente(cliente); }
});
// =====================================
// HOME - DETALHES
// =====================================
function homeAbrirDetalhesCliente(cliente){
if(!cliente) return;
let modal = document.getElementById("modalHomeDetalhes");
if(!modal){
modal = document.createElement("div");
modal.id = "modalHomeDetalhes";
modal.className = "modal-detalhes-cliente";
document.body.appendChild(modal); }
modal.innerHTML = `
<div class="modal-conteudo">
<button class="modal-fechar" onclick="fecharModalHomeDetalhes()">×</button>
<h2>Detalhes do atendimento</h2>
<p><strong>Cliente:</strong> ${cliente.nome || "-"}</p>
<p><strong>Telefone:</strong> ${cliente.telefone || "-"}</p>
<p><strong>Data:</strong> ${cliente.data || "-"}</p>
<p><strong>Horário:</strong> ${cliente.horario || "-"}</p>
<p><strong>Serviço:</strong> ${cliente.servico || "-"}</p>
<p><strong>Tamanho:</strong> ${cliente.tamanhoCabelo || "-"}</p>
<p><strong>Penteado:</strong> ${cliente.penteado || "-"}</p>
<p><strong>Bairro:</strong> ${cliente.bairro || "-"}</p>
<p><strong>Localização:</strong></p>
${
cliente.localizacao ?`
<a href="${cliente.localizacao}" target="_blank" class="btn-localizacao"> ■ Abrir localização
</a> `:
"-" }
<p><strong>Uso de imagem:</strong> ${cliente.autorizacaoImagem || "-"}</p>
</div>`;
modal.classList.add("ativo"); }
function fecharModalHomeDetalhes(){
const modal = document.getElementById("modalHomeDetalhes");
if(modal){

modal.classList.remove("ativo"); }}
// =====================================
// MENSAGEM DO SISTEMA
// =====================================
function mostrarMensagemSistema(texto){
let mensagem =
document.getElementById(
"mensagemSistemaFlow"
);
if(!mensagem){
mensagem =
document.createElement("div");
mensagem.id =
"mensagemSistemaFlow";
mensagem.className =
"mensagem-sistema-flow";
document.body.appendChild(
mensagem
);
}
mensagem.innerHTML = texto;
mensagem.classList.add(
"mostrar"
);
setTimeout(function(){
mensagem.classList.remove(
"mostrar"
);
},3000);
}