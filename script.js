
// =====================================
// FLOW PRO
// NAVEGAÇÃO GERAL DO APLICATIVO
// =====================================
// =====================================
// TROCAR DE TELA
// =====================================
function abrirPagina(nomePagina, botao) {
 // ================================
 // OCULTAR TODAS AS TELAS
 // ================================
 const paginas =
 document.querySelectorAll(".pagina");
 paginas.forEach(function(pagina){
 pagina.classList.remove("ativa");
 });
 // ================================
 // MOSTRAR A TELA SELECIONADA
 // ================================
 const tela =
 document.getElementById(nomePagina);
 if(tela){
 tela.classList.add("ativa");
 }
 // ================================
 // REMOVER MENU ATIVO
 // ================================
 const botoes =
 document.querySelectorAll(".mobile-item");
 botoes.forEach(function(item){

 item.classList.remove("active");
 });
 // ================================
 // ATIVAR BOTÃO SELECIONADO
 // ================================
 if(botao){
 botao.classList.add("active");
 }
}
// =====================================
// SERVICE WORKER
// PWA / APLICATIVO
// =====================================
if("serviceWorker" in navigator){
 window.addEventListener(
 "load",
 function(){
 navigator.serviceWorker.register(
 "service-worker.js"
 )
 .then(function(){
 console.log(
 "Service Worker registrado com sucesso."
 );
 })
 .catch(function(erro){
 console.error(
 "Erro ao registrar Service Worker:",
 erro
 );
 });
 }
 );
}

// =====================================
// MOBILE: EVITAR ZOOM POR TOQUE DUPLO
// Mantém o gesto de pinça disponível para acessibilidade.
// =====================================
(function configurarToqueMobile() {
 function aplicarToqueManipulacao() {
 if (!document.documentElement) return;
 // "manipulation" desativa o zoom por toque duplo em navegadores
 // compatíveis, mas mantém rolagem e zoom por pinça.
 document.documentElement.style.touchAction = "manipulation";
 if (document.body) {
 document.body.style.touchAction = "manipulation";
 }
 }
 if (document.readyState === "loading") {
 document.addEventListener("DOMContentLoaded", aplicarToqueManipulacao, {
 once: true
 });
 } else {
 aplicarToqueManipulacao();
 }
})();