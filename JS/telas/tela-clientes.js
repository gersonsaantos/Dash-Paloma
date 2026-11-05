/* FLOW PRO — CLIENTES E DESLOCAMENTO */
(function(){
 "use strict";
 let clientesUnicos=[], buscaAtual="", buscaBairro="", inicializado=false;
 const $=id=>document.getElementById(id);
 let avisoTimer=null;
 function prepararAvisos(){
  if(document.getElementById("mensagemTaxaDeslocamento")) return;
  const aviso=document.createElement("div");
  aviso.id="mensagemTaxaDeslocamento"; aviso.setAttribute("role","status"); aviso.setAttribute("aria-live","polite"); aviso.hidden=true;
  aviso.style.cssText="position:fixed;top:20px;right:20px;z-index:100000;max-width:min(420px,calc(100vw - 32px));padding:13px 17px;border-radius:12px;font-size:13px;font-weight:600;line-height:1.4;display:flex;align-items:center;gap:10px;box-shadow:0 10px 30px rgba(30,15,25,.18);transition:opacity .2s ease,transform .2s ease;";
  document.body.appendChild(aviso);
 }
 function mostrarMensagemTaxa(texto,tipo){
  prepararAvisos(); const el=$("mensagemTaxaDeslocamento"); if(!el)return;
  clearTimeout(avisoTimer); el.hidden=false; el.style.display="flex";el.style.opacity="1";el.style.transform="translateY(0)";
  el.style.background=tipo==="sucesso"?"#eaf7ef":tipo==="erro"?"#fff0ef":"#f7eff4";
  el.style.color=tipo==="sucesso"?"#176b3a":tipo==="erro"?"#a12622":"#713653";
  el.style.border="1px solid "+(tipo==="sucesso"?"#b8e2c7":tipo==="erro"?"#f0c2bf":"#ead5e0");
  el.replaceChildren();
  const icone=document.createElement("span"); icone.textContent=tipo==="sucesso"?"✓":"!";icone.style.cssText="font-size:17px;font-weight:800;";
  const mensagem=document.createElement("span"); mensagem.textContent=texto;el.append(icone,mensagem);
  avisoTimer=setTimeout(()=>{el.style.opacity="0";el.style.transform="translateY(-8px)";setTimeout(()=>{el.hidden=true;},220);},5000);
 }
 document.addEventListener("DOMContentLoaded", iniciar);
 document.addEventListener("dadosCarregados", renderizar);
 function iniciar(){
  if(!$('clientes')||inicializado)return; inicializado=true;
  $('buscaClientes')?.addEventListener('input',e=>{buscaAtual=e.target.value||'';renderizarResultados();});
  $('buscaBairros')?.addEventListener('input',e=>{buscaBairro=e.target.value||'';renderizarTaxas();});
  document.querySelectorAll('.clientes-tab').forEach(btn=>btn.addEventListener('click',()=>ativarAba(btn.dataset.tab)));
  prepararAvisos();
  $('formTaxaDeslocamento')?.addEventListener('submit',salvarTaxa);
  $('cancelarEdicaoTaxa')?.addEventListener('click',limparFormularioTaxa);
  renderizar();
 }
 function ativarAba(aba){
  const clientes=aba==='clientes';
  $('tabClientes').classList.toggle('active',clientes); $('tabDeslocamento').classList.toggle('active',!clientes);
  $('tabClientes').setAttribute('aria-selected',String(clientes)); $('tabDeslocamento').setAttribute('aria-selected',String(!clientes));
  $('painelClientes').hidden=!clientes; $('painelDeslocamento').hidden=clientes;
 }
 function normalizarTexto(v){return String(v??'').trim().toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ');}
 function normalizarTelefone(v){return String(v??'').replace(/\D/g,'');}
 function lerData(v){if(!v)return null;const s=String(v).trim();let m=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);if(m)return new Date(+m[1],+m[2]-1,+m[3]);m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);if(m)return new Date(+m[3],+m[2]-1,+m[1]);const d=new Date(s);return isNaN(d)?null:new Date(d.getFullYear(),d.getMonth(),d.getDate());}
 function dataHoje(){const p=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).reduce((a,x)=>(a[x.type]=x.value,a),{});return new Date(+p.year,+p.month-1,+p.day);}
 function agruparClientes(registros){const grupos=new Map();registros.forEach(r=>{if(!r||!String(r.nome||'').trim())return;const nome=String(r.nome).trim(),tel=String(r.telefone||'').trim(),limpo=normalizarTelefone(tel),chave=limpo?'tel:'+limpo:'nome:'+normalizarTexto(nome);if(!grupos.has(chave))grupos.set(chave,{nome,telefone:tel,datas:[]});const c=grupos.get(chave);if(!c.telefone&&tel)c.telefone=tel;const d=lerData(r.dataCadastro||r.dataCriacao||r.criadoEm||r.timestamp||r.dataRegistro||r.data);if(d)c.datas.push(d);});return [...grupos.values()].map(c=>({...c,primeiroRegistro:c.datas.length?new Date(Math.min(...c.datas.map(d=>d.getTime()))):null})).sort((a,b)=>a.nome.localeCompare(b.nome,'pt-BR',{sensitivity:'base'}));}
 function renderizar(){const dados=typeof dadosSistema!=='undefined'&&Array.isArray(dadosSistema.agendamentos)?dadosSistema.agendamentos:null;if(!dados){mostrarEstado('listaResultadosClientes','Não foi possível carregar os clientes. Verifique a conexão com a API.');return;}clientesUnicos=agruparClientes(dados);const hoje=dataHoje();$('totalClientes').textContent=clientesUnicos.length;$('novasClientesMes').textContent=clientesUnicos.filter(c=>c.primeiroRegistro&&c.primeiroRegistro.getFullYear()===hoje.getFullYear()&&c.primeiroRegistro.getMonth()===hoje.getMonth()).length;renderizarResultados();renderizarTaxas();}
 function renderizarResultados(){const lista=$('listaResultadosClientes');if(!lista)return;const q=normalizarTexto(buscaAtual),qt=normalizarTelefone(buscaAtual);const itens=clientesUnicos.filter(c=>!q||normalizarTexto(c.nome).includes(q)||(qt&&normalizarTelefone(c.telefone).includes(qt)));lista.replaceChildren();if(!itens.length){mostrarEstado('listaResultadosClientes',buscaAtual.trim()?'Nenhuma cliente encontrada. Confira o nome ou telefone.':'Nenhuma cliente cadastrada foi encontrada.');return;}itens.forEach(c=>{const linha=document.createElement('div');linha.className='client-item client-result';const dados=document.createElement('div');dados.className='client-data';const nome=document.createElement('h3');nome.className='client-name';nome.textContent=c.nome;const tel=document.createElement('p');tel.className='client-phone';tel.textContent=c.telefone||'Telefone não informado';dados.append(nome,tel);linha.append(dados);lista.append(linha);});}
 function mostrarEstado(id,msg){const el=$(id);if(!el)return;el.replaceChildren();const p=document.createElement('p');p.className='client-empty-state';p.textContent=msg;el.append(p);}
 function moeda(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
 function renderizarTaxas(){const lista=$('listaTaxasDeslocamento');if(!lista)return;const taxas=Array.isArray(dadosSistema.taxasDeslocamento)?dadosSistema.taxasDeslocamento:[];const q=normalizarTexto(buscaBairro);const itens=taxas.filter(t=>!q||normalizarTexto(t.bairro+' '+(t.municipio||'')).includes(q));$('totalTaxasDeslocamento').textContent=taxas.length+' '+(taxas.length===1?'bairro':'bairros');lista.replaceChildren();if(!itens.length){mostrarEstado('listaTaxasDeslocamento',q?'Nenhum bairro corresponde à busca.':'Nenhuma taxa cadastrada. Use o formulário acima para adicionar o primeiro bairro.');return;}itens.forEach(t=>{const card=document.createElement('article');card.className='deslocamento-item';const info=document.createElement('div');info.className='deslocamento-item-info';const nome=document.createElement('strong');nome.textContent=t.bairro;const valor=document.createElement('b');valor.textContent=moeda(t.taxa);const detalhe=document.createElement('small');detalhe.textContent=[t.municipio,t.tipoReferencia,(t.ativo?'Ativa':'Inativa'),t.conferencia].filter(Boolean).join(' • ');info.append(nome,detalhe);const acoes=document.createElement('div');acoes.className='deslocamento-item-actions';acoes.append(valor);const editar=document.createElement('button');editar.type='button';editar.className='icon-action';editar.title='Editar taxa';editar.innerHTML='<i class="fa-solid fa-pen"></i>';editar.addEventListener('click',()=>editarTaxa(t));const excluir=document.createElement('button');excluir.type='button';excluir.className='icon-action danger';excluir.title='Excluir taxa';excluir.innerHTML='<i class="fa-solid fa-trash"></i>';excluir.addEventListener('click',()=>excluirTaxa(t,excluir));acoes.append(editar,excluir);card.append(info,acoes);lista.append(card);});}
 function editarTaxa(t){const f=$('formTaxaDeslocamento');f.elements.id.value=t.id;f.elements.municipio.value=t.municipio||'';f.elements.bairro.value=t.bairro;f.elements.tipoReferencia.value=t.tipoReferencia||'Bairro/localidade';f.elements.taxa.value=Number(t.taxa||0).toFixed(2);f.elements.conferencia.value=t.conferencia||'';f.elements.ativo.checked=t.ativo!==false;$('cancelarEdicaoTaxa').hidden=false;f.querySelector('button[type=submit]').innerHTML='<i class="fa-solid fa-check"></i> Atualizar taxa';f.elements.bairro.focus();}
 function limparFormularioTaxa(){const f=$('formTaxaDeslocamento');f.reset();f.elements.id.value='';f.elements.ativo.checked=true;$('cancelarEdicaoTaxa').hidden=true;f.querySelector('button[type=submit]').innerHTML='<i class="fa-solid fa-check"></i> Salvar taxa';}
 async function salvarTaxa(e){
  e.preventDefault();
  const f=e.currentTarget,b=f.querySelector('button[type=submit]');
  const dados={id:f.elements.id.value,municipio:f.elements.municipio.value.trim(),bairro:f.elements.bairro.value.trim(),tipoReferencia:f.elements.tipoReferencia.value,taxa:f.elements.taxa.value,conferencia:f.elements.conferencia.value,ativo:f.elements.ativo.checked};
  if(!dados.municipio||!dados.bairro||!dados.taxa){mostrarMensagemTaxa("Preencha município, bairro e taxa antes de salvar.","erro");return;}
  if(b.disabled)return;
  const eraEdicao=Boolean(dados.id),textoOriginal=b.innerHTML;
  b.disabled=true;b.innerHTML="Salvando...";
  try{
   if(typeof salvarTaxaDeslocamentoAPI!=="function")throw new Error("A comunicação com a API não foi carregada.");
   await salvarTaxaDeslocamentoAPI(dados);
   limparFormularioTaxa();
   mostrarMensagemTaxa(eraEdicao?"Atualizado com sucesso! A taxa foi salva na planilha.":"Salvo com sucesso! O bairro foi cadastrado na planilha.","sucesso");
  }catch(err){mostrarMensagemTaxa(err.message||"Não foi possível salvar. Tente novamente.","erro");}
  finally{b.disabled=false;b.innerHTML=textoOriginal;}
 }
 async function excluirTaxa(t,botao){
  if(botao?.disabled)return;
  if(!t.id){mostrarMensagemTaxa("Não foi possível identificar o registro para excluir.","erro");return;}
  if(botao)botao.disabled=true;
  try{
   if(typeof excluirTaxaDeslocamentoAPI!=="function")throw new Error("A comunicação com a API não foi carregada.");
   await excluirTaxaDeslocamentoAPI(t.id);
   mostrarMensagemTaxa("Excluído com sucesso! O bairro foi removido da lista.","sucesso");
  }catch(err){mostrarMensagemTaxa(err.message||"Não foi possível excluir o bairro.","erro");}
  finally{renderizarTaxas();}
 }
})();