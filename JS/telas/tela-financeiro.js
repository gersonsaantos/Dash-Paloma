
/* =========================================================
   FLOW PRO — FINANCEIRO MOBILE
   Versão integrada à API 4.5 / Google Sheets.
   ========================================================= */

(function () {
  "use strict";

  const state = {
    receitas: [],
    despesas: [],
    agendamentos: [],
    pagamentos: [],
    carregado: false,
    mes: new Date().getMonth(),
    ano: new Date().getFullYear(),
    periodo: "mes",
    charts: {},
    tab: "resumo"
  };

  const moeda = (valor) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(Number(valor) || 0);

  const dataISO = (valor) => {
    if (!valor) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(String(valor))) {
      return String(valor);
    }

    const d = new Date(valor);

    if (Number.isNaN(d.getTime())) return "";

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const hojeISO = () => dataISO(new Date());

  const dataLocal = (iso) => {
    if (!iso) return "—";

    const [ano, mes, dia] = iso.split("-").map(Number);

    return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR");
  };

  function numero(valor) {
    if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;
    const texto = String(valor ?? "").trim().replace(/\./g, "").replace(",", ".");
    const n = Number(texto);
    return Number.isFinite(n) ? n : 0;
  }

  function normalizarPagamento(item) {
    const status = String(item.status || "").trim().toLowerCase();
    return {
      id: item.id || "",
      idAgendamento: item.idAgendamento || "",
      cliente: item.cliente || "",
      data: dataISO(item.data),
      valor: numero(item.valor),
      pagamento: item.formaPagamento || "",
      tipoRecebimento: item.tipoPagamento || "",
      origem: item.origem || "",
      status: status === "recebido" ? "Recebido" : (item.status || ""),
      observacoes: item.observacao || "",
      servico: ""
    };
  }

  function normalizarDespesa(item) {
    return {
      id: item.id || "",
      data: dataISO(item.data),
      descricao: item.descricao || "",
      categoria: item.categoria || "Outras despesas",
      valor: numero(item.valor),
      pagamento: item.formaPagamento || "",
      observacoes: item.observacao || ""
    };
  }

  function sincronizarDados() {
    // dadosSistema é declarado com "let" no api.js; nesse caso,
    // existe no escopo global do JavaScript, mas não como window.dadosSistema.
    const dados = (typeof dadosSistema !== "undefined" && dadosSistema)
      ? dadosSistema
      : (window.dadosSistema || {});
    state.agendamentos = Array.isArray(dados.agendamentos) ? dados.agendamentos : [];
    state.pagamentos = Array.isArray(dados.pagamentos) ? dados.pagamentos : [];
    state.despesas = Array.isArray(dados.despesas) ? dados.despesas.map(normalizarDespesa) : [];

    const agendamentosPorId = new Map(
      state.agendamentos.map((a) => [String(a.id || ""), a])
    );

    state.receitas = state.pagamentos
      .map(normalizarPagamento)
      .filter((p) => p.status === "Recebido" && p.valor > 0)
      .map((p) => {
        const agendamento = agendamentosPorId.get(String(p.idAgendamento)) || {};
        p.servico = agendamento.servico || "Serviço não informado";
        return p;
      });

    state.carregado = true;
  }

  function elemento(seletor, raiz = document) {
    return raiz.querySelector(seletor);
  }

  function todos(seletor, raiz = document) {
    return Array.from(raiz.querySelectorAll(seletor));
  }

  function atualizarValor(seletor, valor) {
    const el = elemento(seletor);

    if (el) {
      el.textContent = valor;
    }
  }

  function registrosNoPeriodo(lista) {
    return lista.filter((item) => {
      if (!item.data) return false;

      const [ano, mes] = item.data.split("-").map(Number);

      if (state.periodo === "ano") {
        return ano === state.ano;
      }

      return ano === state.ano && mes - 1 === state.mes;
    });
  }

  function totais() {
    const receitas = registrosNoPeriodo(state.receitas).filter(
      (item) => item.status === "Recebido"
    );
    const despesas = registrosNoPeriodo(state.despesas);

    const agendamentosPeriodo = state.agendamentos.filter((item) => {
      const data = dataISO(item.data);
      if (!data) return false;
      const [ano, mes] = data.split("-").map(Number);
      return state.periodo === "ano"
        ? ano === state.ano
        : ano === state.ano && mes - 1 === state.mes;
    });

    const totalReceitas = receitas.reduce((soma, item) => soma + numero(item.valor), 0);
    const totalDespesas = despesas.reduce((soma, item) => soma + numero(item.valor), 0);
    const totalPrevisto = agendamentosPeriodo.reduce((soma, item) => {
      const saldo = numero(item.saldoPendente);
      const total = numero(item.valorTotal);
      const recebido = numero(item.valorRecebido);
      const pendente = saldo > 0 ? saldo : Math.max(0, total - recebido);
      return soma + (total > 0 ? pendente : 0);
    }, 0);

    return { receitas, despesas, totalReceitas, totalDespesas, totalPrevisto };
  }

  function nomePeriodo() {
    if (state.periodo === "ano") {
      return `Ano ${state.ano}`;
    }

    return new Date(state.ano, state.mes, 1)
      .toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
      });
  }

  function escapar(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, (caractere) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[caractere]);
  }

  function estiloCampo() {
    return [
      "box-sizing:border-box",
      "width:100%",
      "padding:12px",
      "border:1px solid #E5D5DE",
      "border-radius:11px",
      "background:#fff",
      "color:#33252E",
      "font:inherit",
      "font-size:14px",
      "outline-color:#9A5A78"
    ].join(";");
  }

  function injetarAvisoPrototipo() {
    const aviso = elemento("#financeiro-aviso-prototipo");
    if (aviso) aviso.remove();
  }

  function adicionarSeletorPeriodo() {
    const secao = elemento("#financeiro");
    const mesSelect = elemento("#financeiroMes", secao);
    const anoSelect = elemento("#financeiroAno", secao);

    if (mesSelect && mesSelect.dataset.bound !== "1") {
      mesSelect.dataset.bound = "1";
      mesSelect.value = String(state.mes);
      mesSelect.addEventListener("change", () => {
        state.mes = Number(mesSelect.value);
        state.periodo = "mes";
        renderizar();
      });
    }

    if (anoSelect && anoSelect.dataset.bound !== "1") {
      anoSelect.dataset.bound = "1";
      anoSelect.value = String(state.ano);
      anoSelect.addEventListener("change", () => {
        state.ano = Number(anoSelect.value);
        renderizar();
      });
    }

    const botao = elemento(".financeiro-periodo", secao);
    if (botao) botao.style.display = "none";

    const anualSelect = elemento(".financeiro-ano-select select", secao);
    if (anualSelect && anualSelect.dataset.bound !== "1") {
      anualSelect.dataset.bound = "1";
      anualSelect.value = String(state.ano);
      anualSelect.addEventListener("change", () => {
        state.ano = Number(anualSelect.value);
        renderizar();
      });
    }

    todos(".financeiro-periodo-grafico button", secao).forEach((b, i) => {
      if (b.dataset.bound === "1") return;
      b.dataset.bound = "1";
      b.addEventListener("click", () => {
        state.periodo = i === 1 ? "ano" : "mes";
        todos(".financeiro-periodo-grafico button", secao).forEach((x, j) => {
          x.classList.toggle("active", j === i);
          x.setAttribute("aria-pressed", j === i ? "true" : "false");
        });
        renderizar();
      });
    });
  }

  function atualizarAbas(nome) {
    const abas = todos(
      ".finance-tabs button",
      elemento("#financeiro")
    );

    abas.forEach((botao, indice) => {
      const ativo =
        ["resumo", "transacoes", "relatorios"][indice] === nome;

      botao.classList.toggle("active", ativo);

      botao.setAttribute(
        "aria-selected",
        ativo ? "true" : "false"
      );
    });
  }

  function adicionarNavegacaoAbas() {
    const abas = todos(
      ".finance-tabs button",
      elemento("#financeiro")
    );

    abas.forEach((botao, indice) => {
      if (botao.dataset.bound === "1") return;

      botao.dataset.bound = "1";

      botao.addEventListener("click", () => {
        state.tab = [
          "resumo",
          "transacoes",
          "relatorios"
        ][indice] || "resumo";

        atualizarAbas(state.tab);

        if (state.tab === "relatorios") {
          gerarRelatorio();
        }
      });
    });
  }

  function fecharModal() {
    const modal = elemento("#financeiro-modal-overlay");

    if (modal) {
      modal.remove();
    }
  }

  function modalBase(titulo, conteudo) {
    fecharModal();

    const overlay = document.createElement("div");

    overlay.id = "financeiro-modal-overlay";

    overlay.style.cssText =
      "position:fixed;inset:0;z-index:99999;" +
      "background:rgba(35,18,28,.55);" +
      "display:flex;align-items:flex-end;" +
      "justify-content:center;padding:12px;";

    const secao = document.createElement("section");

    secao.setAttribute("role", "dialog");
    secao.setAttribute("aria-modal", "true");
    secao.setAttribute("aria-labelledby", "financeiro-modal-titulo");

    secao.style.cssText =
      "width:min(100%,520px);max-height:90vh;overflow:auto;" +
      "background:#fff;border-radius:22px;padding:20px;" +
      "box-shadow:0 20px 60px rgba(0,0,0,.2);";

    secao.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px;">
        <h2 id="financeiro-modal-titulo" style="margin:0;font-size:19px;color:#51223B;">
          ${escapar(titulo)}
        </h2>
        <button
          type="button"
          id="financeiro-fechar-modal"
          aria-label="Fechar"
          style="border:0;background:#F7E8EF;color:#6B304F;border-radius:10px;width:38px;height:38px;font-size:18px;"
        >×</button>
      </div>
      ${conteudo}
    `;

    overlay.appendChild(secao);
    document.body.appendChild(overlay);

    elemento("#financeiro-fechar-modal", overlay)
      .addEventListener("click", fecharModal);

    overlay.addEventListener("click", (evento) => {
      if (evento.target === overlay) {
        fecharModal();
      }
    });

    return overlay;
  }

  function abrirModalLancamento(tipo = "despesa") {
    if (tipo === "receita") {
      alert("Os recebimentos são registrados pela Agenda e aparecem automaticamente no Financeiro. Isso evita lançamentos duplicados.");
      return;
    }

    const categorias = [
      "Gasolina/combustível",
      "Reposição de maquiagem",
      "Reposição de cabelo",
      "Materiais descartáveis",
      "Marketing/divulgação",
      "Taxas bancárias",
      "Manutenção/equipamentos",
      "Transporte/estacionamento",
      "Outras despesas"
    ];

    const opcoesCategorias = categorias
      .map((categoria) => `<option value="${escapar(categoria)}">${escapar(categoria)}</option>`)
      .join("");

    const overlay = modalBase("Adicionar despesa", `
      <form id="financeiro-form-lancamento" style="display:grid;gap:12px;">
        <label style="display:grid;gap:6px;font-size:12px;color:#6A5963;">
          Data
          <input name="data" type="date" value="${hojeISO()}" required style="${estiloCampo()}">
        </label>
        <label style="display:grid;gap:6px;font-size:12px;color:#6A5963;">
          Categoria
          <select name="categoria" required style="${estiloCampo()}">
            <option value="">Selecione</option>${opcoesCategorias}
          </select>
        </label>
        <label style="display:grid;gap:6px;font-size:12px;color:#6A5963;">
          Descrição
          <input name="descricao" maxlength="160" placeholder="Detalhe do gasto" required style="${estiloCampo()}">
        </label>
        <label style="display:grid;gap:6px;font-size:12px;color:#6A5963;">
          Valor (R$)
          <input name="valor" type="number" min="0.01" step="0.01" inputmode="decimal" placeholder="0,00" required style="${estiloCampo()}">
        </label>
        <label style="display:grid;gap:6px;font-size:12px;color:#6A5963;">
          Forma de pagamento
          <select name="formaPagamento" required style="${estiloCampo()}">
            <option value="">Selecione</option>
            <option>Pix</option><option>Dinheiro</option>
            <option>Cartão de débito</option><option>Cartão de crédito</option>
            <option>Transferência</option>
          </select>
        </label>
        <label style="display:grid;gap:6px;font-size:12px;color:#6A5963;">
          Observações (opcional)
          <textarea name="observacao" rows="2" maxlength="500" placeholder="Observações" style="${estiloCampo()}"></textarea>
        </label>
        <button type="submit" style="padding:14px;border:0;border-radius:13px;background:#6B304F;color:#fff;font-weight:750;font-size:14px;">
          Salvar despesa
        </button>
        <p style="margin:0;color:#8A7D85;font-size:10px;line-height:1.45;">
          A despesa será registrada na planilha e ficará disponível nos dispositivos conectados.
        </p>
      </form>
    `);

    elemento("#financeiro-form-lancamento", overlay)
      .addEventListener("submit", async (evento) => {
        evento.preventDefault();
        const formulario = evento.currentTarget;
        const botao = formulario.querySelector('button[type="submit"]');
        const dados = Object.fromEntries(new FormData(formulario).entries());
        const valor = numero(dados.valor);

        if (!Number.isFinite(valor) || valor <= 0) {
          alert("Informe um valor maior que zero.");
          return;
        }
        if (typeof registrarDespesaAPI !== "function") {
          alert("A função de integração da API não foi carregada. Confira o api.js.");
          return;
        }

        botao.disabled = true;
        botao.textContent = "Salvando...";
        try {
          await registrarDespesaAPI({
            data: dados.data,
            descricao: dados.descricao.trim(),
            categoria: dados.categoria,
            valor,
            formaPagamento: dados.formaPagamento,
            observacao: dados.observacao || ""
          });
          fecharModal();
          sincronizarDados();
          renderizar();
          alert("Despesa registrada na planilha com sucesso.");
        } catch (erro) {
          console.error("Erro ao registrar despesa:", erro);
          alert("Não foi possível registrar a despesa: " + (erro.message || erro));
          botao.disabled = false;
          botao.textContent = "Salvar despesa";
        }
      });
  }

  function atualizarCabecalho() {
    atualizarValor(
      ".financeiro-mes-label",
      nomePeriodo()
    );

    const textoPeriodo = elemento(
      ".financeiro-periodo span",
      elemento("#financeiro")
    );

    if (textoPeriodo) {
      textoPeriodo.textContent =
        state.periodo === "ano" ? "Este ano" : "Este mês";
    }

    atualizarValor(
      ".financeiro-ano-pill",
      String(state.ano)
    );
  }

  function atualizarResumo() {
    const resumo = totais();
    atualizarValor(".financeiro-recebido-valor", moeda(resumo.totalReceitas));
    atualizarValor(".financeiro-previsto-valor", moeda(resumo.totalPrevisto));
    atualizarValor(".financeiro-despesas-valor", moeda(resumo.totalDespesas));
    atualizarValor(".financeiro-resultado-valor", moeda(resumo.totalReceitas - resumo.totalDespesas));

    const anualReceitas = state.receitas
      .filter((item) => item.data && Number(item.data.slice(0, 4)) === state.ano && item.status === "Recebido")
      .reduce((soma, item) => soma + numero(item.valor), 0);
    const anualDespesas = state.despesas
      .filter((item) => item.data && Number(item.data.slice(0, 4)) === state.ano)
      .reduce((soma, item) => soma + numero(item.valor), 0);
    const anualPrevisto = state.agendamentos
      .filter((item) => item.data && Number(dataISO(item.data).slice(0, 4)) === state.ano)
      .reduce((soma, item) => {
        const total = numero(item.valorTotal);
        const recebido = numero(item.valorRecebido);
        const saldo = numero(item.saldoPendente);
        return soma + (total > 0 ? (saldo > 0 ? saldo : Math.max(0, total - recebido)) : 0);
      }, 0);

    atualizarValor(".financeiro-anual-recebido", moeda(anualReceitas));
    const anual = elemento(".financeiro-anual-content");
    if (anual) {
      const valores = todos(".financeiro-anual-linha strong", anual);
      if (valores[1]) valores[1].textContent = moeda(anualPrevisto);
      if (valores[2]) valores[2].textContent = moeda(anualDespesas);
      if (valores[3]) valores[3].textContent = moeda(anualReceitas - anualDespesas);
    }

    atualizarValor(".financeiro-despesa-total strong", moeda(resumo.totalDespesas));

    const estadoVazio = elemento(".financeiro-empty-state", elemento("#financeiro"));
    if (estadoVazio) estadoVazio.style.display = resumo.despesas.length > 0 ? "none" : "flex";

    renderizarListaServicos(resumo.receitas);
    renderizarListaDespesas(resumo.despesas);
  }

  function percentual(valor, total) {
    if (!total) return "0%";

    return `${(valor / total * 100).toLocaleString("pt-BR", {
      maximumFractionDigits: 1
    })}%`;
  }

  function renderizarListaServicos(receitas) {
    const container = elemento(
      ".receita-servico",
      elemento("#financeiro")
    );

    if (!container) return;

    const resumo = new Map();

    receitas.forEach((receita) => {
      const nome = receita.servico || "Serviço não informado";

      resumo.set(
        nome,
        (resumo.get(nome) || 0) + Number(receita.valor || 0)
      );
    });

    const itens = Array.from(resumo.entries())
      .sort((a, b) => b[1] - a[1]);

    const linhas = todos(".servico-item", container);

    linhas.forEach((linha, indice) => {
      const item = itens[indice];

      if (!item) {
        linha.style.display = itens.length ? "none" : "flex";

        if (!itens.length) {
          const nomesPadrao = [
            "Maquiagem",
            "Penteado",
            "Maquiagem + penteado",
            "Outros procedimentos"
          ];

          const nome = elemento(".servico-item-name", linha);
          const valor = elemento("strong", linha);

          if (nome) {
            nome.innerHTML =
              `<i class="servico-dot servico-dot--${["one", "two", "three", "four"][indice]}"></i>` +
              escapar(nomesPadrao[indice]);
          }

          if (valor) {
            valor.textContent = "—";
          }
        }

        return;
      }

      linha.style.display = "flex";

      const nome = elemento(".servico-item-name", linha);
      const valor = elemento("strong", linha);

      if (nome) {
        const classePonto = [
          "one",
          "two",
          "three",
          "four"
        ][indice % 4];

        nome.innerHTML =
          `<i class="servico-dot servico-dot--${classePonto}"></i>` +
          escapar(item[0]);
      }

      if (valor) {
        const totalRecebidoProcedimentos = receitas.reduce(
          (soma, receita) => soma + numero(receita.valor),
          0
        );

        // Exibe somente a participação percentual de cada procedimento.
        valor.textContent = percentual(
          numero(item[1]),
          totalRecebidoProcedimentos
        );
      }
    });
  }

  function renderizarListaDespesas(despesas) {
    const container = elemento(".financeiro-despesas-lista", elemento("#financeiro"));
    if (!container) return;

    container.replaceChildren();

    despesas.slice().sort((a, b) => b.data.localeCompare(a.data)).slice(0, 8).forEach((despesa) => {
      const linha = document.createElement("div");
      linha.className = "financeiro-despesa-linha";
      linha.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 0;border-bottom:1px solid #F1E9ED;font-size:12px;";

      const descricao = document.createElement("div");
      descricao.style.cssText = "color:#5C4B55;min-width:0;flex:1;overflow-wrap:anywhere;";
      const titulo = document.createElement("strong");
      titulo.textContent = despesa.categoria || "Despesa";
      const detalhe = document.createElement("small");
      detalhe.style.cssText = "display:block;color:#988A92;margin-top:3px;";
      detalhe.textContent = `${dataLocal(despesa.data)} · ${despesa.descricao || ""}`;
      descricao.append(titulo, detalhe);

      const lado = document.createElement("div");
      lado.style.cssText = "display:flex;align-items:center;gap:7px;flex-shrink:0;";
      const valor = document.createElement("strong");
      valor.style.cssText = "color:#8C3E56;white-space:nowrap;";
      valor.textContent = moeda(despesa.valor);

      const acoes = document.createElement("div");
      acoes.style.cssText = "display:flex;gap:5px;";
      const editar = document.createElement("button");
      editar.type = "button";
      editar.textContent = "Editar";
      editar.title = "Editar despesa";
      editar.style.cssText = "border:1px solid #E8D5DF;background:#FFF7FA;color:#6B304F;border-radius:8px;padding:6px 8px;font-size:11px;cursor:pointer;";
      editar.addEventListener("click", () => abrirEdicaoDespesa(despesa));

      const excluir = document.createElement("button");
      excluir.type = "button";
      excluir.textContent = "Excluir";
      excluir.title = "Excluir despesa";
      excluir.style.cssText = "border:1px solid #F0D5D9;background:#FFF5F5;color:#B4233D;border-radius:8px;padding:6px 8px;font-size:11px;cursor:pointer;";
      excluir.addEventListener("click", () => confirmarExclusaoDespesa(despesa));

      acoes.append(editar, excluir);
      lado.append(valor, acoes);
      linha.append(descricao, lado);
      container.appendChild(linha);
    });
  }

  function abrirEdicaoDespesa(despesa) {
    const overlay = modalBase("Editar despesa", `
      <form id="financeiro-form-editar-despesa" style="display:grid;gap:12px;">
        <label>Descrição
          <input name="descricao" maxlength="160" required value="${escapar(despesa.descricao)}" style="${estiloCampo()}">
        </label>
        <label>Categoria
          <select name="categoria" required style="${estiloCampo()}">
            ${["Gasolina","Produtos","Manutenção","Alimentação","Outros"].map(c => `<option ${c === despesa.categoria ? "selected" : ""}>${c}</option>`).join("")}
          </select>
        </label>
        <label>Valor (R$)
          <input name="valor" inputmode="decimal" required value="${String(despesa.valor).replace(".", ",")}" style="${estiloCampo()}">
        </label>
        <label>Data
          <input name="data" type="date" required value="${escapar(despesa.data)}" style="${estiloCampo()}">
        </label>
        <label>Forma de pagamento
          <select name="formaPagamento" required style="${estiloCampo()}">
            ${["Pix","Dinheiro","Cartão de débito","Cartão de crédito","Transferência","Não informado"].map(c => `<option ${c === despesa.pagamento ? "selected" : ""}>${c}</option>`).join("")}
          </select>
        </label>
        <label>Observação
          <textarea name="observacao" rows="2" style="${estiloCampo()}">${escapar(despesa.observacoes || "")}</textarea>
        </label>
        <button type="submit" style="border:0;border-radius:12px;padding:14px;background:#6B304F;color:#fff;font-weight:700;">Salvar alterações</button>
      </form>
    `);
    const form = elemento("#financeiro-form-editar-despesa", overlay);
    form.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      const dados = Object.fromEntries(new FormData(form).entries());
      const valor = numero(dados.valor);
      if (valor <= 0) return alert("Informe um valor maior que zero.");
      const botao = form.querySelector('button[type="submit"]');
      botao.disabled = true;
      botao.textContent = "Salvando...";
      try {
        if (typeof editarDespesaAPI !== "function") throw new Error("Função de edição não encontrada na API. Atualize o api.js.");
        await editarDespesaAPI({ id: despesa.id, ...dados, valor, observacao: dados.observacao || "" });
        fecharModal();
        await recarregarFinanceiro();
        alert("Despesa atualizada com sucesso.");
      } catch (erro) {
        console.error("Erro ao editar despesa:", erro);
        alert("Não foi possível editar: " + (erro.message || erro));
        botao.disabled = false;
        botao.textContent = "Salvar alterações";
      }
    });
  }

  async function confirmarExclusaoDespesa(despesa) {
    const confirmar = window.confirm(
      `Excluir esta despesa?\\n\\n${despesa.categoria} — ${moeda(despesa.valor)}\\n${despesa.descricao}\\n\\nEssa ação também removerá o lançamento da planilha e atualizará os totais.`
    );
    if (!confirmar) return;
    try {
      if (typeof excluirDespesaAPI !== "function") throw new Error("Função de exclusão não encontrada na API. Atualize o api.js.");
      await excluirDespesaAPI(despesa.id);
      await recarregarFinanceiro();
      alert("Despesa excluída com sucesso.");
    } catch (erro) {
      console.error("Erro ao excluir despesa:", erro);
      alert("Não foi possível excluir: " + (erro.message || erro));
    }
  }

  async function recarregarFinanceiro() {
    if (typeof carregarDados === "function") await carregarDados();
    sincronizarDados();
    renderizar();
  }

  function criarGrafico(chave, canvasId, configuracao) {
    const canvas = elemento(`#${canvasId}`);

    if (!canvas || typeof Chart === "undefined") {
      return;
    }

    if (state.charts[chave]) {
      state.charts[chave].destroy();
    }

    state.charts[chave] = new Chart(
      canvas,
      configuracao
    );
  }

  function atualizarGraficos() {
    if (typeof Chart === "undefined") {
      console.warn("Chart.js não foi encontrado. Os gráficos não serão exibidos.");
      return;
    }

    const labels = [];
    const receitas = [];
    const despesas = [];
    const quantidade = state.periodo === "ano" ? 12 : 6;

    for (let i = quantidade - 1; i >= 0; i--) {
      const data = new Date(
        state.ano,
        state.periodo === "ano" ? 11 - i : state.mes - i,
        1
      );
      const ano = data.getFullYear();
      const mes = data.getMonth();
      labels.push(data.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""));

      const somaMes = (lista) => lista
        .filter((item) => {
          if (!item.data) return false;
          const [a, m] = item.data.split("-").map(Number);
          return a === ano && m - 1 === mes;
        })
        .reduce((soma, item) => soma + numero(item.valor), 0);

      receitas.push(somaMes(state.receitas.filter((p) => p.status === "Recebido")));
      despesas.push(somaMes(state.despesas));
    }

    criarGrafico("faturamento", "graficoFaturamento", {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label: "Receitas recebidas", data: receitas, backgroundColor: "#B66F8B", borderRadius: 7, maxBarThickness: 28 },
          { label: "Despesas", data: despesas, backgroundColor: "#E7A36F", borderRadius: 7, maxBarThickness: 28 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (contexto) => `${contexto.dataset.label}: ${moeda(contexto.raw)}` } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: "#8A7D85", font: { size: 10 } } },
          y: { beginAtZero: true, grid: { color: "#F1E9ED" }, ticks: { color: "#8A7D85", font: { size: 9 }, callback: (valor) => `R$ ${valor}` } }
        }
      }
    });

    const resumo = totais();
    const servicos = new Map();
    resumo.receitas.forEach((pagamento) => {
      const nome = pagamento.servico || "Serviço não informado";
      servicos.set(nome, (servicos.get(nome) || 0) + numero(pagamento.valor));
    });
    const itensServicos = Array.from(servicos.entries()).sort((a, b) => b[1] - a[1]);

    criarGrafico("servicos", "graficoServicos", {
      type: "doughnut",
      data: {
        labels: itensServicos.map((item) => item[0]),
        datasets: [{ data: itensServicos.map((item) => item[1]), backgroundColor: ["#6B304F", "#B66F8B", "#D9A7BA", "#E8D8E0", "#C9A5B6", "#8A536D"], borderWidth: 2, borderColor: "#FFFFFF", hoverOffset: 4 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: "66%",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (contexto) =>
                `${contexto.label}: ${percentual(numero(contexto.raw), resumo.totalReceitas)}`
            }
          }
        }
      }
    });

    const categorias = new Map();
    resumo.despesas.forEach((despesa) => {
      const categoria = despesa.categoria || "Outras despesas";
      categorias.set(categoria, (categorias.get(categoria) || 0) + numero(despesa.valor));
    });
    const itensDespesas = Array.from(categorias.entries()).sort((a, b) => b[1] - a[1]);

    criarGrafico("despesas", "graficoDespesas", {
      type: "doughnut",
      data: {
        labels: itensDespesas.map((item) => item[0]),
        datasets: [{ data: itensDespesas.map((item) => item[1]), backgroundColor: ["#6B304F", "#B66F8B", "#D9A7BA", "#E8D8E0", "#C9A5B6", "#8A536D", "#A7B8A8"], borderWidth: 2, borderColor: "#FFFFFF" }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: "62%",
        plugins: { legend: { position: "bottom", labels: { boxWidth: 9, boxHeight: 9, padding: 12, font: { size: 10 } } }, tooltip: { callbacks: { label: (contexto) => `${contexto.label}: ${moeda(contexto.raw)}` } } }
      }
    });
  }

  function configurarBotaoDespesa() {
    const formulario = elemento("#financeiro-form-despesa", elemento("#financeiro"));
    if (!formulario || formulario.dataset.bound === "1") return;

    formulario.dataset.bound = "1";

    const campoData = formulario.querySelector('[name="data"]');
    if (campoData && !campoData.value) campoData.value = hojeISO();

    // A versão original do formulário não tinha descrição nem forma de pagamento.
    // Incluímos os campos sem alterar o HTML nem a identidade visual.
    if (!formulario.querySelector('[name="descricao"]')) {
      const label = document.createElement("label");
      label.innerHTML = 'Descrição<input name="descricao" type="text" maxlength="160" placeholder="Ex.: Compra de produtos" required>';
      formulario.insertBefore(label, formulario.querySelector(".financeiro-submit-despesa"));
    }

    if (!formulario.querySelector('[name="formaPagamento"]')) {
      const label = document.createElement("label");
      label.innerHTML = `
        Forma de pagamento
        <select name="formaPagamento" required>
          <option value="">Selecione</option>
          <option>Pix</option>
          <option>Dinheiro</option>
          <option>Cartão de débito</option>
          <option>Cartão de crédito</option>
          <option>Transferência</option>
        </select>`;
      formulario.insertBefore(label, formulario.querySelector(".financeiro-submit-despesa"));
    }

    formulario.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      const botao = formulario.querySelector(".financeiro-submit-despesa");
      const dados = Object.fromEntries(new FormData(formulario).entries());
      const valor = numero(dados.valor);

      if (!dados.categoria || !dados.descricao.trim() || !dados.data || !dados.formaPagamento || valor <= 0) {
        alert("Preencha categoria, descrição, data, valor e forma de pagamento.");
        return;
      }
      if (typeof registrarDespesaAPI !== "function") {
        alert("A integração com a API não foi carregada. Confira o api.js.");
        return;
      }

      botao.disabled = true;
      botao.textContent = "Salvando...";
      try {
        await registrarDespesaAPI({
          data: dados.data,
          descricao: dados.descricao.trim(),
          categoria: dados.categoria,
          valor,
          formaPagamento: dados.formaPagamento,
          observacao: dados.observacoes || ""
        });
        await recarregarFinanceiro();
        formulario.reset();
        if (campoData) campoData.value = hojeISO();
        alert("Despesa registrada na planilha com sucesso.");
      } catch (erro) {
        console.error("Erro ao registrar despesa:", erro);
        alert("Não foi possível registrar a despesa: " + (erro.message || erro));
      } finally {
        botao.disabled = false;
        botao.textContent = "Adicionar Despesa";
      }
    });
  }

  function configurarBotaoRelatorio() {
    const botoes = todos(".financeiro-report-button", elemento("#financeiro"));
    botoes.forEach((botao) => {
      // O botão anual possui tratamento próprio logo abaixo.
      if (botao.classList.contains("financeiro-report-anual")) return;
      if (botao.dataset.bound === "1") return;
      botao.dataset.bound = "1";
      botao.addEventListener("click", (evento) => {
        evento.preventDefault();
        gerarRelatorio();
      });
    });

    const botaoAnual = elemento(".financeiro-report-anual", elemento("#financeiro"));
    if (botaoAnual && botaoAnual.dataset.bound !== "1") {
      botaoAnual.dataset.bound = "1";
      botaoAnual.addEventListener("click", () => {
        state.periodo = "ano";
        gerarRelatorio();
      });
    }
  }

  function gerarRelatorio() {
    const resumo = totais();

    const linhasReceitas = resumo.receitas
      .map((receita) => `
        <tr>
          <td>${escapar(dataLocal(receita.data))}</td>
          <td>${escapar(receita.cliente || "")}</td>
          <td>${escapar(receita.servico || "")}</td>
          <td>${escapar(receita.pagamento || "")}</td>
          <td>${moeda(receita.valor)}</td>
        </tr>
      `)
      .join("");

    const linhasDespesas = resumo.despesas
      .map((despesa) => `
        <tr>
          <td>${escapar(dataLocal(despesa.data))}</td>
          <td>${escapar(despesa.categoria || "")}</td>
          <td>${escapar(despesa.descricao || "")}</td>
          <td>${escapar(despesa.pagamento || "")}</td>
          <td>${moeda(despesa.valor)}</td>
        </tr>
      `)
      .join("");

    const janela = window.open("", "_blank");

    if (!janela) {
      alert(
        "O navegador bloqueou o relatório. Permita abrir a janela para gerar o PDF."
      );
      return;
    }

    janela.document.write(`
      <!doctype html>
      <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Relatório Financeiro Flow Pro</title>

        <style>
          body {
            font: 12px Arial, sans-serif;
            color: #2e2630;
            padding: 24px;
          }

          .btn-voltar-flowpro {
            position: fixed;
            top: 14px;
            right: 18px;
            z-index: 9999;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 15px;
            border: 0;
            border-radius: 999px;
            background: #6B304F;
            color: #fff;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 3px 12px rgba(50, 20, 38, .18);
          }

          .btn-voltar-flowpro:hover {
            background: #54233D;
          }

          h1, h2 {
            color: #6B304F;
          }

          h1 {
            font-size: 22px;
          }

          h2 {
            margin-top: 28px;
            font-size: 16px;
          }

          p {
            color: #655963;
          }

          .cards {
            display: flex;
            gap: 12px;
            margin: 16px 0;
          }

          .card {
            border: 1px solid #ddd;
            padding: 12px;
            border-radius: 8px;
            flex: 1;
          }

          .card b {
            display: block;
            font-size: 17px;
            margin-top: 6px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }

          th, td {
            text-align: left;
            padding: 8px;
            border-bottom: 1px solid #ddd;
          }

          th {
            background: #F7E8EF;
            color: #6B304F;
          }

          footer {
            margin-top: 30px;
            color: #777;
            font-size: 10px;
          }

          @media print {
            .btn-voltar-flowpro {
              display: none !important;
            }
          }
        </style>
      </head>

      <body>
        <button
          type="button"
          class="btn-voltar-flowpro"
          onclick="voltarAoFlowPro()"
          aria-label="Fechar relatório e voltar ao Flow Pro"
          title="Voltar ao Flow Pro"
        >
          <span aria-hidden="true">×</span>
          Voltar ao Flow Pro
        </button>

        <h1>Flow Pro — Relatório Financeiro</h1>

        <p>
          Período: ${escapar(nomePeriodo())}
          · Gerado em ${escapar(dataLocal(hojeISO()))}
        </p>

        <div class="cards">
          <div class="card">
            Receitas recebidas
            <b>${moeda(resumo.totalReceitas)}</b>
          </div>

          <div class="card">
            Despesas
            <b>${moeda(resumo.totalDespesas)}</b>
          </div>

          <div class="card">
            Resultado
            <b>${moeda(
              resumo.totalReceitas - resumo.totalDespesas
            )}</b>
          </div>
        </div>

        <h2>Receitas</h2>

        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Cliente</th>
              <th>Serviço</th>
              <th>Pagamento</th>
              <th>Valor</th>
            </tr>
          </thead>

          <tbody>
            ${
              linhasReceitas ||
              '<tr><td colspan="5">Nenhuma receita registrada neste período.</td></tr>'
            }
          </tbody>
        </table>

        <h2>Despesas</h2>

        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Categoria</th>
              <th>Descrição</th>
              <th>Pagamento</th>
              <th>Valor</th>
            </tr>
          </thead>

          <tbody>
            ${
              linhasDespesas ||
              '<tr><td colspan="5">Nenhuma despesa registrada neste período.</td></tr>'
            }
          </tbody>
        </table>

        <footer>
          Relatório gerado pelo Flow Pro.
          Confirme a classificação fiscal com o contador.
        </footer>

        <script>
          function voltarAoFlowPro() {
            // O relatório é aberto pelo próprio Flow Pro em uma nova aba/janela.
            // Primeiro tentamos fechá-la; se o navegador impedir, voltamos no histórico.
            window.close();

            setTimeout(function () {
              if (!window.closed) {
                window.history.back();
              }
            }, 150);
          }

          window.addEventListener("load", function () {
            setTimeout(function () { window.print(); }, 350);
          });
        <\/script>
      </body>
      </html>
    `);

    janela.document.close();
  }

  function renderizar() {
    atualizarCabecalho();
    atualizarResumo();
    atualizarGraficos();
  }

  function iniciar() {
    const secao = elemento("#financeiro");

    if (!secao) return;

    sincronizarDados();
    injetarAvisoPrototipo();
    adicionarSeletorPeriodo();
    adicionarNavegacaoAbas();
    configurarBotaoDespesa();
    configurarBotaoRelatorio();
    renderizar();

    document.addEventListener("dadosCarregados", () => {
      sincronizarDados();
      renderizar();
    });

    console.info(
      "Flow Pro Financeiro iniciado com integração Google Sheets."
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      iniciar,
      { once: true }
    );
  } else {
    iniciar();
  }

  window.FlowProFinanceiro = {
    recarregar: renderizar,

    abrirReceita: () => abrirModalLancamento("receita"),

    abrirDespesa: () => abrirModalLancamento("despesa"),

    gerarRelatorio,

    atualizar: async () => {
      if (typeof carregarDados === "function") await carregarDados();
      sincronizarDados();
      renderizar();
    },

    obterResumo: () => totais()
  };
})();
