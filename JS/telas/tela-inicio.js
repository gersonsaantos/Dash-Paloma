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
timeZone: "America/Sao_Paulo"
}
);
elemento.innerHTML =
dataFormatada.charAt(0).toUpperCase()
+
dataFormatada.slice(1);
}
// =====================================
// PEGAR DATA ATUAL DE BRASÍLIA
// =====================================
function pegarDataBrasilia(){
return new Date().toLocaleDateString(
"en-CA",
{
timeZone: "America/Sao_Paulo"
}
);
}
// =====================================
// CONVERTER DATA
// =====================================
function criarDataSegura(data){
if(!data) return null;
if(data instanceof Date){
return data;
}
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
);
}
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
);
}
const tentativa =
new Date(texto);
if(isNaN(tentativa.getTime())){
return null;
}
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
.replace(/[\u0300-\u036f]/g, "");
}
// =====================================
// CONVERTER VALOR
// =====================================
function converterValor(valor){
if(typeof valor === "number"){
return valor;
}
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
.replace(",", ".");
}
const numero =
Number(texto);
return isNaN(numero)
? 0
: numero;
}
// =====================================
// ENCONTRAR VALOR DO SERVIÇO
// =====================================
function encontrarValorServicoHome(
nomeServico,
tamanhoCabelo
){
if(!dadosSistema.servicos){
return 0;
}
if(!nomeServico){
return 0;
}
const servicos =
dadosSistema.servicos;
const nome =
normalizarTexto(
nomeServico
);
const tamanho =
normalizarTexto(
tamanhoCabelo
);
// ==================================
// SERVIÇO EXATO
// ==================================
let encontrado =
servicos.find(servico => {
return normalizarTexto(
servico.nome
) === nome;
});
if(encontrado){
return converterValor(
encontrado.valor
);
}
// ==================================
// SERVIÇO COM "+"
// ==================================
if(nomeServico.includes("+")){
const partes =
nomeServico
.split("+")
.map(
parte =>
parte.trim()
)
.filter(Boolean);
let total = 0;
partes.forEach(parte => {
const parteNormalizada =
normalizarTexto(
parte
);
let servicoEncontrado =
servicos.find(servico => {
return normalizarTexto(
servico.nome
) === parteNormalizada;
});
if(servicoEncontrado){
total += converterValor(
servicoEncontrado.valor
);
return;
}
// ==================================
// TENTAR COM TAMANHO DO CABELO
// ==================================
if(tamanho){
servicoEncontrado =
servicos.find(servico => {
const nomeTabela =
normalizarTexto(
servico.nome
);
return (
nomeTabela.includes(
parteNormalizada
)
&&
nomeTabela.includes(
tamanho
.replace(
"(p)",
""
)
.replace(
"(m)",
""
)
.replace(
"(g)",
""
)
.trim()
)
);
});
if(servicoEncontrado){
total += converterValor(
servicoEncontrado.valor
);
return;
}
}
});
return total;
}
// ==================================
// BUSCA PARCIAL
// ==================================
encontrado =
servicos.find(servico => {
const nomeTabela =
normalizarTexto(
servico.nome
);
return (
nomeTabela.includes(nome)
||
nome.includes(nomeTabela)
);
});
if(encontrado){
return converterValor(
encontrado.valor
);
}
return 0;
}
// =====================================
// FORMATAR MOEDA
// =====================================
function formatarMoeda(valor){
return Number(valor || 0)
.toLocaleString(
"pt-BR",
{
style: "currency",
currency: "BRL"
}
);
}
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
return;
}
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
return cliente.data === hoje;
}
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
atendimentosHoje.length;
}
// ==================================
// FATURAMENTO DO DIA
// ==================================
let faturamentoHoje = 0;
atendimentosHoje.forEach(
cliente => {
faturamentoHoje +=
encontrarValorServicoHome(
cliente.servico,
cliente.tamanhoCabelo
);
}
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
);
}
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
return false;
}
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
return false;
}
// Mesmo mês
if(
mesCliente !== mesAtual
){
return false;
}
// Hoje ou data futura
if(
diaCliente < diaAtual
){
return false;
}
return true;
}
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
proximosAgendamentos.length;
}
}
// ==================================
// CLIENTES CADASTRADAS
// ==================================
const clientesValidas =
agendamentos.filter(
cliente => {
return String(
cliente.nome || ""
).trim() !== "";
}
);
const elementoClientes =
document.getElementById(
"clientesCadastradas"
);
if(elementoClientes){
elementoClientes.innerText =
clientesValidas.length;
}
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
);
}
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
return;
}
const agendamentos =
dadosSistema.agendamentos;
if(agendamentos.length === 0){
lista.innerHTML =
"<p>Nenhum atendimento cadastrado.</p>";
return;
}
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
return cliente.data === dataHoje;
}
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
b.horario || ""
)
);
}
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
return;
}
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
cliente.tamanhoCabelo
);
lista.innerHTML += `
<div class="cliente-home">
<div class="horario">
${cliente.horario || "--:--"}
</div>
<img
src="assets/Avatares/cliente01 (27).jpg"
alt="${cliente.nome}"
>
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
`;
}
);
}
// =====================================
// INICIAR QUANDO A PÁGINA ABRIR
// =====================================
document.addEventListener(
"DOMContentLoaded",
function(){
iniciarInicio();
}
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
return;
}
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
"R$ 0,00";
}
return;
}
const agendamentos =
dadosSistema.agendamentos;
// ==================================
// DATA E HORA ATUAL DE BRASÍLIA
// ==================================
const agora = new Date();
const partes =
new Intl.DateTimeFormat(
"en-US",
{
timeZone: "America/Sao_Paulo",
year: "numeric",
month: "2-digit",
day: "2-digit",
hour: "2-digit",
minute: "2-digit",
hour12: false
}
).formatToParts(agora);
const valores = {};
partes.forEach(parte => {
if(parte.type !== "literal"){
valores[parte.type] =
parte.value;
}
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
return false;
}
// Data futura
if(
cliente.data > dataAtual
){
return true;
}
// Data passada
if(
cliente.data < dataAtual
){
return false;
}
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
"R$ 0,00";
}
window.proximoAtendimento =
null;
return;
}
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
encontrarValorServico(
proximo.servico,
proximo.tamanhoCabelo
);
valorElemento.innerText =
formatarMoeda(valor);
}
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
);
}
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
return "";
}
const partesData =
data.split("-");
const partesHora =
horario.split(":");
if(
partesData.length !== 3 ||
partesHora.length < 2
){
return "";
}
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
minuto,
0
);
const agora =
new Date();
const diferenca =
atendimento.getTime()
-
agora.getTime();
if(diferenca <= 0){
return "Agora";
}
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
return "Amanhã";
}
return `Daqui a ${dias} dias`;
}
if(horas > 0){
if(minutosRestantes > 0){
return `Daqui a ${horas}h ${minutosRestantes}min`;
}
return `Daqui a ${horas}h`;
}
if(minutosRestantes > 0){
return `Daqui a ${minutosRestantes} min`;
}
return "Agora";
}
// =====================================
// MODAL DE DETALHES DO PRÓXIMO
// =====================================
function abrirDetalhesProximo(){
const cliente =
window.proximoAtendimento;
if(!cliente){
return;
}
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
id="fecharModalCliente"
>
×
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
<strong>
Horário final
</strong>
<span id="detalheHoraFim">
</span>
</div>
<div class="detalhe-item">
<strong>
Serviço
</strong>
<span id="detalheServico">
</span>
</div>
<div class="detalhe-item">
<strong>
Tamanho do cabelo
</strong>
<span id="detalheCabelo">
</span>
</div>
<div class="detalhe-item">
<strong>
Penteado
</strong>
<span id="detalhePenteado">
</span>
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
"fecharModalCliente"
)
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
fecharDetalhesProximo();
}
}
);
}
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
// ==================================
// ABRIR MODAL
// ==================================
modal.classList.add(
"ativo"
);
}
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
);
}
}
// =====================================
// FORMATAR DATA DOS DETALHES
// =====================================
function formatarDataDetalhes(
data
){
if(!data){
return "-";
}
const partes =
data.split("-");
if(partes.length !== 3){
return data;
}
return (
partes[2]
+
"/"
+
partes[1]
+
"/"
+
partes[0]
);
}
// =====================================
// ABRIR TODOS OS AGENDAMENTOS DO DIA
// =====================================
function abrirTodosAgendamentosHoje(){
if(
!dadosSistema ||
!Array.isArray(dadosSistema.agendamentos)
){
return;
}
const hoje =
pegarDataBrasilia();
const clientesHoje =
dadosSistema.agendamentos.filter(
cliente => {
return cliente.data === hoje;
}
);
clientesHoje.sort(
(a,b)=>{
return String(
a.horario || ""
)
.localeCompare(
String(
b.horario || ""
)
);
}
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
);
}
let html = `
<div class="modal-conteudo">
<button
class="modal-fechar"
id="fecharTodosAgenda"
>
×
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
`;
}
clientesHoje.forEach(
(cliente,index)=>{
const valor =
encontrarValorServicoHome(
cliente.servico,
cliente.tamanhoCabelo
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
<button
class="btn-editar-home"
data-id="${cliente.id}">
Editar
</button>
<button
class="btn-excluir-home"
data-id="${cliente.id}">
Excluir
</button>
</div>
</div>
`;
}
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
"fecharTodosAgenda"
)
.onclick =
function(){
modal.classList.remove(
"ativo"
);
};
}
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
);
}
}
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
carregarProximoAtendimento();
}
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
return;
}
abrirTodosAgendamentosHoje();
});
// =====================================
// HOME - BOTÕES DETALHES E EDITAR
// =====================================
document.addEventListener(
"click",
function(event){
const detalhe =
event.target.closest(".btn-detalhes-home");
if(detalhe){
const id =
Number(detalhe.dataset.id);
const cliente =
dadosSistema.agendamentos.find(
item => item.id === id
);
homeAbrirDetalhesCliente(cliente);
}
const editar =
event.target.closest(".btn-editar-home");
if(editar){
const id =
Number(editar.dataset.id);
const cliente =
dadosSistema.agendamentos.find(
item => item.id === id
);
homeAbrirEditarCliente(cliente);
}
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
document.body.appendChild(modal);
}
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
<p><strong>Localização:</strong> ${cliente.localizacao || "-"}</p>
<p><strong>Uso de imagem:</strong> ${cliente.autorizacaoImagem || "-"}</p>
</div>`;
modal.classList.add("ativo");
}
function fecharModalHomeDetalhes(){
const modal = document.getElementById("modalHomeDetalhes");
if(modal){
modal.classList.remove("ativo");
}
}
// =====================================
// HOME - EDITAR
// =====================================
function homeAbrirEditarCliente(cliente){
if(!cliente) return;
window.clienteEditando = cliente;
let modal = document.getElementById("modalHomeEditar");
if(!modal){
modal = document.createElement("div");
modal.id = "modalHomeEditar";
modal.className = "modal-detalhes-cliente";
document.body.appendChild(modal);
}
modal.innerHTML = `
<div class="modal-conteudo">
<button class="modal-fechar" onclick="fecharModalHomeEditar()">×</button>
<h2>Editar agendamento</h2>
<label>Nome</label>
<input id="editarNome" value="${cliente.nome || ""}">
<label>Telefone</label>
<input id="editarTelefone" value="${cliente.telefone || ""}">
<label>Data</label>
<input id="editarData" value="${cliente.data || ""}">
<label>Horário</label>
<input id="editarHorario" value="${cliente.horario || ""}">
<label>Bairro</label>
<input id="editarBairro" value="${cliente.bairro || ""}">
<label>Localização</label>
<input id="editarLocalizacao" value="${cliente.localizacao || ""}">
<label>Serviço</label>
<input id="editarServico" value="${cliente.servico || ""}">
<label>Tamanho do cabelo</label>
<input id="editarTamanho" value="${cliente.tamanhoCabelo || ""}">
<label>Penteado</label>
<input id="editarPenteado" value="${cliente.penteado || ""}">
<label>Autorização de imagem</label>
<input id="editarImagem" value="${cliente.autorizacaoImagem || ""}">
<label>Condição</label>
<input id="editarCondicao" value="${cliente.condicaoConfirmacao || ""}">
<button onclick="salvarEdicaoAgendamento()">
Salvar alterações
</button>
</div>
`;
modal.classList.add("ativo");
}
async function salvarEdicaoAgendamento(){
const cliente = window.clienteEditando;
if(!cliente) return;
const dados = {
acao:"editar",
id:cliente.id,
nome:document.getElementById("editarNome").value,
telefone:document.getElementById("editarTelefone").value,
data:document.getElementById("editarData").value,
horario:document.getElementById("editarHorario").value,
bairro:document.getElementById("editarBairro").value,
localizacao:document.getElementById("editarLocalizacao").value,
servico:document.getElementById("editarServico").value,
tamanhoCabelo:document.getElementById("editarTamanho").value,
penteado:document.getElementById("editarPenteado").value,
autorizacaoImagem:document.getElementById("editarImagem").value,
condicaoConfirmacao:document.getElementById("editarCondicao").value
};
try{
const resposta = await fetch(
URL_API,
{
method:"POST",
body:JSON.stringify(dados)
}
);
const retorno = await resposta.json();
if(retorno.sucesso){
fecharModalHomeEditar();
await carregarDados();
mostrarMensagemSistema(
"Agendamento atualizado com sucesso!"
);
}
}catch(erro){
console.error(
"Erro ao editar agendamento:",
erro
);
mostrarMensagemSistema(
"Erro ao atualizar agendamento."
);
}
}
function fecharModalHomeEditar(){
const modal = document.getElementById("modalHomeEditar");
if(modal){
modal.classList.remove("ativo");
}
}
// =====================================
// BOTAO EXCLUIR - AGENDA HOME
// =====================================
document.addEventListener(
"click",
async function(event){
const excluir =
event.target.closest(
".btn-excluir-home"
);
if(!excluir){
return;
}
const id =
Number(
excluir.dataset.id
);
const cliente =
dadosSistema.agendamentos.find(
item => item.id === id
);
if(!cliente){
return;
}
excluirAgendamentoHome(cliente);
});
// =====================================
// EXCLUIR AGENDAMENTO HOME
// =====================================
async function excluirAgendamentoHome(cliente){
if(!cliente){
return;
}
abrirModalConfirmarExclusao(cliente);
return;
try{
const resposta =
await fetch(
URL_API,
{
method:"POST",
body:JSON.stringify({
acao:"excluir",
id:cliente.id
})
}
);
const retorno =
await resposta.json();
console.log(
"Resposta exclusão:",
retorno
);
if(retorno.sucesso){
dadosSistema.agendamentos =
dadosSistema.agendamentos.filter(
item =>
item.id !== cliente.id
);
carregarAgendaHoje();
atualizarCardsInicio();
carregarProximoAtendimento();
mostrarMensagemSistema(
"Agendamento excluído com sucesso!"
);
}else{
mostrarMensagemSistema(
retorno.erro || "Não foi possível excluir."
);
}
}catch(erro){
console.error(
"Erro ao excluir agendamento:",
erro
);
mostrarMensagemSistema(
"Erro ao excluir agendamento."
);
}
}
// =====================================
// MODAL CONFIRMAÇÃO DE EXCLUSÃO
// =====================================
function abrirModalConfirmarExclusao(cliente){
let modal =
document.getElementById("modalConfirmarExclusao");
if(!modal){
modal = document.createElement("div");
modal.id = "modalConfirmarExclusao";
modal.className = "modal-detalhes-cliente";
document.body.appendChild(modal);
}
window.clienteExclusao = cliente;
modal.innerHTML = `
<div class="modal-conteudo">
<button
class="modal-fechar"
onclick="fecharModalConfirmarExclusao()">
×
</button>
<h2>Confirmar exclusão</h2>
<p>
Deseja excluir este agendamento?
</p>
<strong>
${cliente.nome || "-"}
</strong>
<div class="acoes-modal">
<button
onclick="fecharModalConfirmarExclusao()">
Cancelar
</button>
<button
onclick="executarExclusaoAgendamento()">
Excluir
</button>
</div>
</div>
`;
modal.classList.add("ativo");
}
function fecharModalConfirmarExclusao(){
const modal =
document.getElementById("modalConfirmarExclusao");
if(modal){
modal.classList.remove("ativo");
}
}
async function executarExclusaoAgendamento(){
const cliente =
window.clienteExclusao;
if(!cliente){
return;
}
try{
const resposta =
await fetch(
URL_API,
{
method:"POST",
body:JSON.stringify({
acao:"excluir",
id:cliente.id
})
}
);
const retorno =
await resposta.json();
if(retorno.sucesso){
dadosSistema.agendamentos =
dadosSistema.agendamentos.filter(
item => item.id !== cliente.id
);
fecharModalConfirmarExclusao();
carregarAgendaHoje();
atualizarCardsInicio();
carregarProximoAtendimento();
mostrarMensagemSistema(
"Agendamento excluído com sucesso!"
);
}
}catch(erro){
console.error(
"Erro ao excluir:",
erro
);
mostrarMensagemSistema(
"Erro ao excluir agendamento."
);
}
}
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