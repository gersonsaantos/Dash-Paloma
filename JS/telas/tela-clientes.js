
/* ==========================================================
 FLOW PRO — TELA CLIENTES
 Função: pesquisar clientes por nome ou telefone.
 Fonte: dadosSistema.agendamentos, carregado por JS/api.js.
 Não cria, edita ou exclui dados da planilha.
 ========================================================== */
(function () {
 "use strict";
 let clientesUnicos = [];
 let buscaAtual = "";
 let inicializado = false;
 document.addEventListener("DOMContentLoaded", iniciar);
 document.addEventListener("dadosCarregados", renderizar);
 function iniciar() {
 const pagina = document.getElementById("clientes");
 if (!pagina || inicializado) return;
 inicializado = true;
 const campoBusca = document.getElementById("buscaClientes");
 if (campoBusca) {
 campoBusca.addEventListener("input", function () {
 buscaAtual = campoBusca.value || "";
 renderizarResultados();
 });
 }
 renderizar();
 }
 function normalizarTexto(valor) {
 return String(valor == null ? "" : valor)
 .trim()
 .toLocaleLowerCase("pt-BR")
 .normalize("NFD")
 .replace(/[\u0300-\u036f]/g, "")
 .replace(/\s+/g, " ");
 }
 function normalizarTelefone(valor) {
 return String(valor == null ? "" : valor).replace(/\D/g, "");
 }
 function lerData(valor) {
 if (!valor) return null;
 if (valor instanceof Date && !isNaN(valor.getTime())) {
 return new Date(valor.getFullYear(), valor.getMonth(), valor.getDate());
 }
 const s = String(valor).trim();
 let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
 if (m) {
 const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
 return isNaN(d.getTime()) ? null : d;
 }

 m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
 if (m) {
 const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
 return isNaN(d.getTime()) ? null : d;
 }
 const d = new Date(s);
 if (isNaN(d.getTime())) return null;
 return new Date(d.getFullYear(), d.getMonth(), d.getDate());
 }
 function dataHoje() {
 const agora = new Date();
 const partes = new Intl.DateTimeFormat("en-CA", {
 timeZone: "America/Sao_Paulo",
 year: "numeric",
 month: "2-digit",
 day: "2-digit"
 }).formatToParts(agora);
 const valores = {};
 partes.forEach(function (p) { valores[p.type] = p.value; });
 return new Date(Number(valores.year), Number(valores.month) - 1, Number(valores.day));
 }
 function dataCadastroRegistro(registro) {
 // Usa a data de cadastro quando a API a disponibilizar.
 const valorCadastro = registro.dataCadastro || registro.dataCriacao ||
 registro.criadoEm || registro.timestamp || registro.dataRegistro;
 if (valorCadastro) return lerData(valorCadastro);
 // Compatibilidade com a API atual: ela ainda não envia Data Cadastro.
 // Usa a data de atendimento mais antiga conhecida como aproximação.
 return lerData(registro.data);
 }
 function agruparClientes(registros) {
 const grupos = new Map();
 registros.forEach(function (registro) {
 if (!registro || !String(registro.nome || "").trim()) return;
 const nome = String(registro.nome).trim();
 const telefoneOriginal = String(registro.telefone || "").trim();
 const telefoneLimpo = normalizarTelefone(telefoneOriginal);
 const chave = telefoneLimpo ? "tel:" + telefoneLimpo : "nome:" + normalizarTexto(nome);
 if (!grupos.has(chave)) {
 grupos.set(chave, {
 chave: chave,
 nome: nome,
 telefone: telefoneOriginal,
 datasCadastro: [],
 nomes: []
 });
 }
 const cliente = grupos.get(chave);
 if (!cliente.telefone && telefoneOriginal) cliente.telefone = telefoneOriginal;

 if (!cliente.nomes.includes(nome)) cliente.nomes.push(nome);
 const dc = dataCadastroRegistro(registro);
 if (dc) cliente.datasCadastro.push(dc);
 });
 return Array.from(grupos.values()).map(function (cliente) {
 // O cadastro mais antigo encontrado é usado para estimar a primeira entrada.
 cliente.primeiroRegistro = cliente.datasCadastro.length
 ? new Date(Math.min.apply(null, cliente.datasCadastro.map(function (d) { return d.getTime(); })))
 : null;
 return cliente;
 }).sort(function (a, b) {
 return a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" });
 });
 }
 function renderizar() {
 const pagina = document.getElementById("clientes");
 if (!pagina) return;
 const dados = typeof dadosSistema !== "undefined" &&
 dadosSistema && Array.isArray(dadosSistema.agendamentos)
 ? dadosSistema.agendamentos
 : null;
 if (!dados) {
 mostrarEstado("Não foi possível carregar os clientes. Verifique a conexão com a API.");
 atualizarIndicadores(0, 0);
 return;
 }
 clientesUnicos = agruparClientes(dados);
 const hoje = dataHoje();
 const novasNesteMes = clientesUnicos.filter(function (cliente) {
 const d = cliente.primeiroRegistro;
 return d && d.getFullYear() === hoje.getFullYear() && d.getMonth() === hoje.getMonth();
 }).length;
 atualizarIndicadores(clientesUnicos.length, novasNesteMes);
 renderizarResultados();
 }
 function atualizarIndicadores(total, novas) {
 const elTotal = document.getElementById("totalClientes");
 const elNovas = document.getElementById("novasClientesMes");
 if (elTotal) elTotal.textContent = String(total);
 if (elNovas) elNovas.textContent = String(novas);
 }
 function renderizarResultados() {
 const lista = document.getElementById("listaResultadosClientes");
 if (!lista) return;
 const consulta = normalizarTexto(buscaAtual);
 const consultaTelefone = normalizarTelefone(buscaAtual);

 const resultado = clientesUnicos.filter(function (cliente) {
 if (!consulta) return true;
 return normalizarTexto(cliente.nome).includes(consulta) ||
 (consultaTelefone && normalizarTelefone(cliente.telefone).includes(consultaTelefone));
 });
 lista.replaceChildren();
 if (!resultado.length) {
 mostrarEstado(buscaAtual.trim()
 ? "Nenhuma cliente encontrada. Confira o nome ou telefone digitado."
 : "Nenhuma cliente cadastrada foi encontrada.");
 return;
 }
 const fragmento = document.createDocumentFragment();
 resultado.forEach(function (cliente) {
 const linha = document.createElement("div");
 linha.className = "client-item client-result";
 const dados = document.createElement("div");
 dados.className = "client-data";
 const nome = document.createElement("h3");
 nome.className = "client-name";
 nome.textContent = cliente.nome;
 const telefone = document.createElement("p");
 telefone.className = "client-phone";
 telefone.textContent = cliente.telefone || "Telefone não informado";
 dados.append(nome, telefone);
 linha.appendChild(dados);
 fragmento.appendChild(linha);
 });
 lista.appendChild(fragmento);
 }
 function mostrarEstado(mensagem) {
 const lista = document.getElementById("listaResultadosClientes");
 if (!lista) return;
 lista.replaceChildren();
 const estado = document.createElement("p");
 estado.className = "client-empty-state";
 estado.textContent = mensagem;
 lista.appendChild(estado);
 }
})();