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
// VARIÁVEIS
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
prepararBotaoAdicionar();
}
// ============================================================
// FORMATAR DATA PARA COMPARAÇÃO
// ============================================================
function normalizarData(data) {
if (!data) {
return "";
}
const texto =
String(data).trim();
if (!texto) {
return "";
}
// YYYY-MM-DD
if (
/^\d{4}-\d{2}-\d{2}$/.test(texto)
) {
return texto;
}
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
);
}
return texto;
}
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
);
}
// ============================================================
// FORMATAR DATA PARA EXIBIÇÃO
// ============================================================
function formatarDataExibicao(data) {
const partes =
normalizarData(data)
.split("-");
if (partes.length !== 3) {
return data || "";
}
return (
partes[2] +
"/" +
partes[1] +
"/" +
partes[0]
);
}
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
];
}
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
return meses[mes];
}
// ============================================================
// PEGAR AGENDAMENTOS DO DIA
// ============================================================
function pegarAgendamentosDoDia(data) {
const dataBusca =
dataParaString(data);
return (
dadosSistema.agendamentos || []
)
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
b.horario || ""
)
);
});
}
// ============================================================
// MOSTRAR AGENDAMENTOS DO DIA
// ============================================================
function mostrarAgendamentosDoDia(data) {
const lista =
document.getElementById(
"listaClientesDia"
);
if (!lista) {
return;
}
const agendamentos =
pegarAgendamentosDoDia(data);
lista.innerHTML = "";
if (agendamentos.length === 0) {
lista.innerHTML = `
<div class="agenda-sem-clientes">
<i class="fa-regular fa-calendar-xmark"></i>
<p>
Nenhum agendamento para este dia.
</p>
</div>
`;
return;
}
agendamentos.forEach(
function (cliente, indice) {
const valor =
encontrarValorServico(
cliente
);
const item =
document.createElement(
"div"
);
item.className =
"cliente-agenda-dia";
item.innerHTML = `
<div class="cliente-agenda-hora">
${
cliente.horario ||
"--:--"
}
</div>
<div class="cliente-agenda-info">
<strong>
${
cliente.nome ||
"Cliente"
}
</strong>
<span>
${
cliente.servico ||
"-"
}
</span>
</div>
<div class="cliente-agenda-valor">
${
valor > 0
? formatarMoeda(valor)
: ""
}
</div>
<div class="acoes-cliente-agenda">
<button
type="button"
class="btn-detalhes-agenda"
data-id="${cliente.id}"
>
Detalhes
</button>
<button
type="button"
class="btn-editar-agenda"
data-id="${cliente.id}"
>
Editar
</button>
<button
type="button"
class="btn-excluir-agenda"
data-id="${cliente.id}"
>
Excluir
</button>
</div>
`;
const botao =
item.querySelector(
".btn-detalhes-agenda"
);
botao.addEventListener(
"click",
function () {
abrirDetalhesCliente(
cliente
);
}
);
const botaoEditar =
item.querySelector(
".btn-editar-agenda"
);
if(botaoEditar){
botaoEditar.addEventListener(
"click",
function(){
editarClienteAgenda(
cliente.id
);
}
);
}
const botaoExcluir =
item.querySelector(
".btn-excluir-agenda"
);
if(botaoExcluir){
botaoExcluir.addEventListener(
"click",
function(){
excluirClienteAgenda(
cliente.id
);
}
);
}
lista.appendChild(item);
}
);
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
);
}
if (quantidade) {
quantidade.textContent =
agendamentos.length +
(
agendamentos.length === 1
? " agendamento"
: " agendamentos"
);
}
}
// ============================================================
// CALENDÁRIO COMPLETO
// ============================================================
function criarCalendarioCompleto() {
const container =
document.getElementById(
"calendarAgenda"
);
if (!container) {
return;
}
const primeiroDia =
new Date(
anoCalendario,
mesCalendario,
1
);
const ultimoDia =
new Date(
anoCalendario,
mesCalendario + 1,
0
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
aria-label="Mês anterior"
>
‹
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
aria-label="Próximo mês"
>
›
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
`;
}
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
: ""
}
${
temAgendamento
? "has-agendamento"
: ""
}
"
data-data="${dataString}"
>
${dia}
</button>
`;
}
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
anoCalendario--;
}
criarCalendarioCompleto();
};
}
if (proximo) {
proximo.onclick =
function () {
mesCalendario++;
if (mesCalendario > 11) {
mesCalendario = 0;
anoCalendario++;
}
criarCalendarioCompleto();
};
}
container
.querySelectorAll(
".calendar-day:not(.vazio)"
)
.forEach(function (botao) {
botao.addEventListener(
"click",
function () {
selecionarData(
botao.dataset.data
);
}
);
});
}
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
);
}
// ============================================================
// CALENDÁRIO SEMANAL
// ============================================================
function criarCalendarioSemanal() {
const dias =
document.querySelectorAll(
".week-numbers span"
);
if (!dias.length) {
return;
}
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
dataSelecionadaAgenda
)
) {
elemento.classList.add(
"active-day"
);
}
elemento.onclick =
function () {
selecionarData(
elemento.dataset.data
);
};
}
);
}
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
return;
}
botao.onclick =
function () {
calendario.classList.toggle(
"ativo"
);
};
}
configurarBotaoCalendario();
// ============================================================
// VALOR DO SERVIÇO
// ============================================================
// ============================================================
// VALOR DO SERVIÇO
// ============================================================
function encontrarValorServico(cliente){
if(
!dadosSistema ||
!Array.isArray(dadosSistema.servicos)
){
return 0;
}
const servicoCliente =
normalizarTexto(
cliente.servico
);
let total = 0;
// SERVIÇO COM +
let partes =
servicoCliente
.split("+")
.map(function(item){
return item.trim();
})
.filter(Boolean);
partes.forEach(function(parte){
let encontrado =
dadosSistema.servicos.find(
function(servico){
return (
normalizarTexto(
servico.nome
)
===
parte
);
}
);
if(encontrado){
total +=
Number(
encontrado.valor
);
}
});
// SE NÃO TEM +
if(total === 0){
let encontrado =
dadosSistema.servicos.find(
function(servico){
return (
normalizarTexto(
servico.nome
)
===
servicoCliente
);
}
);
if(encontrado){
total =
Number(
encontrado.valor
);
}
}
return total || 0;
}
// ============================================================
// FORMATAR MOEDA
// ============================================================
function formatarMoeda(valor) {
return Number(valor || 0)
.toLocaleString(
"pt-BR",
{
style: "currency",
currency: "BRL"
}
);
}
// ============================================================
// DETALHES DO CLIENTE
// ============================================================
function abrirDetalhesCliente(cliente) {
let modal =
document.getElementById(
"modalDetalhesCliente"
);
if (!modal) {
modal =
document.createElement(
"div"
);
modal.id =
"modalDetalhesCliente";
modal.innerHTML = `
<div class="modal-conteudo">
<button
type="button"
id="fecharModalCliente"
class="modal-fechar"
>
×
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
"fecharModalCliente"
)
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
);
}
}
);
}
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
cliente.nome || "-"
}
</span>
</div>
<div class="detalhe-item">
<strong>
Telefone
</strong>
<span>
${
cliente.telefone || "-"
}
</span>
</div>
<div class="detalhe-item">
<strong>
Data
</strong>
<span>
${
formatarDataExibicao(
cliente.data
)
}
</span>
</div>
<div class="detalhe-item">
<strong>
Horário
</strong>
<span>
${
cliente.horario || "-"
}
</span>
</div>
<div class="detalhe-item">
<strong>
Horário final
</strong>
<span>
${
cliente.horaFim || "-"
}
</span>
</div>
<div class="detalhe-item">
<strong>
Serviço
</strong>
<span>
${
cliente.servico || "-"
}
</span>
</div>
<div class="detalhe-item">
<strong>
Tamanho do cabelo
</strong>
<span>
${
cliente.tamanhoCabelo || "-"
}
</span>
</div>
<div class="detalhe-item">
<strong>
Penteado
</strong>
<span>
${
cliente.penteado || "-"
}
</span>
</div>
<div class="detalhe-item">
<strong>
Bairro
</strong>
<span>
${
cliente.bairro || "-"
}
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
rel="noopener noreferrer"
>
Abrir localização
</a>
`
: `
<span>-</span>
`
}
</div>
<div class="detalhe-item">
<strong>
Autorização de uso de imagem
</strong>
<span>
${
cliente.autorizacaoImagem ||
cliente.autorizacao ||
"-"
}
</span>
</div>
`;
modal.classList.add(
"ativo"
);
}
// ============================================================
// PREPARAR BOTÃO ADICIONAR
// ============================================================
function prepararBotaoAdicionar() {
const area =
document.querySelector(
".add-agenda"
);
if (!area) {
return;
}
area.onclick =
function () {
abrirModalNovoAgendamento();
};
}
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
id="fecharNovoAgendamento"
>
×
</button>
<h2>
Novo agendamento
</h2>
<form
class="form-agendamento"
id="formNovoAgendamento"
>
<label>
Cliente
</label>
<input
type="text"
id="novoCliente"
placeholder="Nome da cliente"
required
>
<label>
Telefone
</label>
<input
type="tel"
id="novoTelefone"
placeholder="Telefone"
>
<label>
Data
</label>
<input
type="date"
id="novoData"
required
>
<label>
Hora inicial
</label>
<input
type="time"
id="novoHora"
required
>
<label>
Hora final
</label>
<input
type="time"
id="novoHoraFim"
>
<label>
Serviço
</label>
<select
id="novoServico"
required
>
<option value="">
Selecione o serviço
</option>
<option value="Maquiagem">
Maquiagem
</option>
<option value="Maquiagem + semi-preso">
Maquiagem + Semi-Preso
</option>
<option value="Maquiagem + coque">
Maquiagem + Coque
</option>
<option value="Maquiagem + babyliss pequeno">
Maquiagem + Babyliss Pequeno
</option>
<option value="Maquiagem + babyliss médio">
Maquiagem + Babyliss Médio
</option>
<option value="Maquiagem + babyliss grande">
Maquiagem + Babyliss Grande
</option>
</select>
<div
id="campoTamanhoCabelo"
>
<label>
Tamanho do cabelo
</label>
<select
id="novoTamanhoCabelo"
>
<option value="">
Selecione o tamanho
</option>
<option value="Pequeno (P)">
Pequeno (P)
</option>
<option value="Médio (M)">
Médio (M)
</option>
<option value="Grande (G)">
Grande (G)
</option>
</select>
</div>
<div
id="campoPenteado"
>
<label>
Penteado
</label>
<select
id="novoPenteado"
>
<option value="">
Selecione o penteado
</option>
<option value="Semi-Preso">
Semi-Preso
</option>
<option value="Coque">
Coque
</option>
</select>
</div>
<label>
Bairro
</label>
<input
type="text"
id="novoBairro"
placeholder="Bairro"
>
<label>
Localização
</label>
<input
type="url"
id="novoLocalizacao"
placeholder="Link do Google Maps"
>
<label>
Autorização de uso de imagem
</label>
<select
id="novoAutorizacao"
>
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
class="btn-salvar-agendamento"
>
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
"fecharNovoAgendamento"
)
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
);
}
}
);
configurarFormularioNovoAgendamento();
}
document.getElementById(
"novoData"
).value =
dataParaString(
dataSelecionadaAgenda
);
modal.classList.add(
"ativo"
);
}
// ============================================================
// CAMPOS DEPENDENTES DO SERVIÇO
// ============================================================
function configurarFormularioNovoAgendamento() {
const servico =
document.getElementById(
"novoServico"
);
const campoTamanho =
document.getElementById(
"campoTamanhoCabelo"
);
const campoPenteado =
document.getElementById(
"campoPenteado"
);
if (!servico) {
return;
}
servico.addEventListener(
"change",
function () {
const valor =
servico.value
.toLowerCase();
const tamanho =
document.getElementById(
"novoTamanhoCabelo"
);
const penteado =
document.getElementById(
"novoPenteado"
);
// ==========================
// SOMENTE MAQUIAGEM
// ==========================
if(
valor === "maquiagem"
){
campoTamanho.style.display =
"none";
campoPenteado.style.display =
"none";
tamanho.value =
"";
penteado.value =
"";
}
// ==========================
// SEMI-PRESO OU COQUE
// ==========================
else if(
valor.includes("semi-preso")
||
valor.includes("coque")
){
campoTamanho.style.display =
"block";
campoPenteado.style.display =
"block";
if(
valor.includes("semi-preso")
){
penteado.value =
"Semi-Preso";
}
if(
valor.includes("coque")
){
penteado.value =
"Coque";
}
}
// ==========================
// BABYLISS
// ==========================
else if(
valor.includes("babyliss")
){
campoTamanho.style.display =
"block";
campoPenteado.style.display =
"none";
penteado.value =
"";
}
else {
campoTamanho.style.display =
"none";
campoPenteado.style.display =
"none";
}
}
);
}
// ============================================================
// SALVAR NOVO AGENDAMENTO
// ============================================================
function configurarSalvarFormulario() {
const form =
document.getElementById(
"formNovoAgendamento"
);
if (!form) {
return;
}
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
/*
* IMPORTANTE:
*
* O seu Apps Script atual possui
* apenas doGet().
*
* Portanto, esta parte só funcionará
* depois que adicionarmos um doPost()
* ao Apps Script.
*/
const resposta =
await fetch(
API_AGENDA,
{
method: "POST",
headers: {
"Content-Type":
"text/plain;charset=utf-8"
},
body:
JSON.stringify(
agendamento
)
}
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
"modalNovoAgendamento"
)
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
);
}
} else {
throw new Error(
resultado &&
resultado.erro
? resultado.erro
: "Não foi possível salvar."
);
}
} catch (erro) {
console.error(
"Erro ao salvar agendamento:",
erro
);
alert(
"O formulário está pronto, mas o Apps Script ainda precisa receber afunção de gravação."
);
} finally {
botao.disabled =
false;
botao.textContent =
"Salvar agendamento";
}
}
);
}
// ============================================================
// OBSERVAR CRIAÇÃO DO MODAL
// ============================================================
const observadorAgenda =
new MutationObserver(
function () {
configurarSalvarFormulario();
}
);
observadorAgenda.observe(
document.body,
{
childList: true,
subtree: true
}
);
// ============================================================
// MODAL EDITAR CLIENTE
// ============================================================
function editarClienteAgenda(id){
const cliente = pegarClientePorIdAgenda(id);
clienteEditandoAgenda = cliente;
if(!cliente){
return;
}
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
configurarFormularioEditarAgenda();
}
document.getElementById("editarId").value=cliente.id || id;
document.getElementById("editarNome").value=cliente.nome || "";
document.getElementById("editarTelefone").value=cliente.telefone || "";
document.getElementById("editarData").value=normalizarData(cliente.data);
document.getElementById("editarHorario").value=cliente.horario || "";
document.getElementById("editarServico").value=cliente.servico || "";
document.getElementById("editarBairro").value=cliente.bairro || "";
document.getElementById("editarLocalizacao").value=cliente.localizacao || "";
modal.classList.add("ativo");
}
function configurarFormularioEditarAgenda(){
const form=document.getElementById("formEditarAgenda");
if(!form || form.dataset.configurado){
return;
}
form.dataset.configurado="sim";
form.addEventListener("submit",async function(e){
e.preventDefault();
const dados={
acao:"editar",
id:document.getElementById("editarId").value,
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
await fetch(API_AGENDA,{
method:"POST",
headers:{
"Content-Type":"text/plain;charset=utf-8"
},
body:JSON.stringify(dados)
});
document.getElementById("modalEditarAgenda").classList.remove("ativo");
if(typeof carregarDados==="function"){
await carregarDados();
document.dispatchEvent(new Event("dadosCarregados"));
}
});
}
// ============================================================
// MODAL EXCLUIR CLIENTE
// ============================================================
function excluirClienteAgenda(id){
const cliente=pegarClientePorIdAgenda(id);
if(!cliente){
return;
}
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
document.body.appendChild(modal);
}
document.getElementById("textoExcluirAgenda").textContent =
"Deseja excluir "+cliente.nome+"?";
modal.classList.add("ativo");
document.getElementById("cancelarExcluirAgenda").onclick=function(){
modal.classList.remove("ativo");
};
document.getElementById("confirmarExcluirAgenda").onclick=async function(){
await fetch(API_AGENDA,{
method:"POST",
headers:{
"Content-Type":"text/plain;charset=utf-8"
},
body:JSON.stringify({
acao:"excluir",
id:id
})
});
modal.classList.remove("ativo");
if(typeof dadosSistema !== "undefined" && dadosSistema.agendamentos){
dadosSistema.agendamentos =
dadosSistema.agendamentos.filter(function(cliente){
return Number(cliente.id) !== Number(id);
});
}
mostrarAgendamentosDoDia(dataSelecionadaAgenda);
atualizarResumoDia(dataSelecionadaAgenda);
if(typeof atualizarCardsInicio==="function"){
atualizarCardsInicio();
}
if(typeof carregarAgendaHoje==="function"){
carregarAgendaHoje();
}
if(typeof carregarProximoAtendimento==="function"){
carregarProximoAtendimento();
}
};
}
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
return Number(cliente.id) === Number(id);
});
}