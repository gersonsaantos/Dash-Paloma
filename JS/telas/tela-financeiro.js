
/* =========================================================
   FLOW PRO — FINANCEIRO MOBILE
   Versão inicial para testes locais.
   Os dados ficam salvos neste navegador.
   A integração com o Google Sheets será feita separadamente.
   ========================================================= */

(function () {
  "use strict";

  const STORAGE_KEY = "flowpro_financeiro_prototipo_v1";

  const state = {
    receitas: [],
    despesas: [],
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

  function lerDados() {
    try {
      const dados = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}"
      );

      state.receitas = Array.isArray(dados.receitas)
        ? dados.receitas
        : [];

      state.despesas = Array.isArray(dados.despesas)
        ? dados.despesas
        : [];
    } catch (erro) {
      console.warn(
        "Não foi possível carregar os dados financeiros.",
        erro
      );

      state.receitas = [];
      state.despesas = [];
    }
  }

  function salvarDados() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          receitas: state.receitas,
          despesas: state.despesas
        })
      );
    } catch (erro) {
      console.error("Erro ao salvar os dados locais:", erro);

      alert(
        "Não foi possível salvar os dados neste navegador."
      );
    }
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
      (item) =>
        item.status !== "Estornado" &&
        item.status !== "Reembolsado"
    );

    const despesas = registrosNoPeriodo(state.despesas);

    const totalReceitas = receitas.reduce(
      (soma, item) => soma + Number(item.valor || 0),
      0
    );

    const totalDespesas = despesas.reduce(
      (soma, item) => soma + Number(item.valor || 0),
      0
    );

    return {
      receitas,
      despesas,
      totalReceitas,
      totalDespesas
    };
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
    if (elemento("#financeiro-aviso-prototipo")) return;

    const secao = elemento("#financeiro");

    if (!secao) return;

    const aviso = document.createElement("div");

    aviso.id = "financeiro-aviso-prototipo";
    aviso.setAttribute("role", "status");

    aviso.textContent =
      "Modo de teste: os lançamentos ficam salvos somente neste navegador.";

    aviso.style.cssText =
      "margin:0 0 14px;padding:10px 12px;border-radius:12px;" +
      "background:#FFF4D9;color:#78551A;font-size:11px;" +
      "line-height:1.45;border:1px solid #F0DCA8;";

    const abas = elemento(".finance-tabs", secao);

    if (abas) {
      abas.insertAdjacentElement("afterend", aviso);
    } else {
      secao.prepend(aviso);
    }
  }

  function adicionarSeletorPeriodo() {
    const botao = elemento(
      ".financeiro-periodo",
      elemento("#financeiro")
    );

    if (!botao || botao.dataset.bound === "1") return;

    botao.dataset.bound = "1";

    botao.addEventListener("click", () => {
      const opcao = prompt(
        "Digite M para escolher um mês ou A para consultar o ano:",
        state.periodo === "ano" ? "A" : "M"
      );

      if (!opcao) return;

      if (opcao.trim().toUpperCase() === "A") {
        state.periodo = "ano";
        renderizar();
        return;
      }

      const entrada = prompt(
        "Informe o mês e o ano no formato MM/AAAA:",
        `${String(state.mes + 1).padStart(2, "0")}/${state.ano}`
      );

      if (!entrada) return;

      const correspondencia = entrada.match(
        /^\s*(\d{1,2})\s*\/\s*(\d{4})\s*$/
      );

      if (
        !correspondencia ||
        Number(correspondencia[1]) < 1 ||
        Number(correspondencia[1]) > 12
      ) {
        alert("Período inválido. Use MM/AAAA.");
        return;
      }

      state.mes = Number(correspondencia[1]) - 1;
      state.ano = Number(correspondencia[2]);
      state.periodo = "mes";

      renderizar();
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

        if (state.tab === "transacoes") {
          abrirModalLancamento("receita");
        }

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

  function abrirModalLancamento(tipo = "receita") {
    const receita = tipo === "receita";

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
      .map((categoria) =>
        `<option value="${escapar(categoria)}">${escapar(categoria)}</option>`
      )
      .join("");

    const overlay = modalBase(
      receita ? "Registrar recebimento" : "Adicionar despesa",
      `
      <form id="financeiro-form-lancamento" style="display:grid;gap:12px;">

        <label style="display:grid;gap:6px;font-size:12px;color:#6A5963;">
          Data
          <input name="data" type="date" value="${hojeISO()}" required style="${estiloCampo()}">
        </label>

        ${
          receita
            ? `
              <label style="display:grid;gap:6px;font-size:12px;color:#6A5963;">
                Nome da cliente
                <input name="cliente" maxlength="120" placeholder="Nome da cliente" required style="${estiloCampo()}">
              </label>

              <label style="display:grid;gap:6px;font-size:12px;color:#6A5963;">
                Serviço
                <input name="servico" maxlength="120" placeholder="Ex.: Maquiagem + penteado" required style="${estiloCampo()}">
              </label>
            `
            : `
              <label style="display:grid;gap:6px;font-size:12px;color:#6A5963;">
                Categoria
                <select name="categoria" required style="${estiloCampo()}">
                  <option value="">Selecione</option>
                  ${opcoesCategorias}
                </select>
              </label>

              <label style="display:grid;gap:6px;font-size:12px;color:#6A5963;">
                Descrição
                <input name="descricao" maxlength="160" placeholder="Detalhe do gasto" required style="${estiloCampo()}">
              </label>
            `
        }

        <label style="display:grid;gap:6px;font-size:12px;color:#6A5963;">
          Valor (R$)
          <input name="valor" type="number" min="0.01" step="0.01" inputmode="decimal" placeholder="0,00" required style="${estiloCampo()}">
        </label>

        <label style="display:grid;gap:6px;font-size:12px;color:#6A5963;">
          Forma de pagamento
          <select name="pagamento" required style="${estiloCampo()}">
            <option value="">Selecione</option>
            <option>Pix</option>
            <option>Dinheiro</option>
            <option>Cartão de débito</option>
            <option>Cartão de crédito</option>
            <option>Transferência</option>
          </select>
        </label>

        ${
          receita
            ? `
              <label style="display:grid;gap:6px;font-size:12px;color:#6A5963;">
                Tipo de recebimento
                <select name="tipoRecebimento" style="${estiloCampo()}">
                  <option>Pagamento integral</option>
                  <option>Sinal</option>
                  <option>Saldo</option>
                  <option>Outro</option>
                </select>
              </label>
            `
            : `
              <label style="display:grid;gap:6px;font-size:12px;color:#6A5963;">
                Fornecedor (opcional)
                <input name="fornecedor" maxlength="120" placeholder="Nome do fornecedor" style="${estiloCampo()}">
              </label>

              <label style="display:grid;gap:6px;font-size:12px;color:#6A5963;">
                Comprovante ou link (opcional)
                <input name="comprovante" maxlength="500" placeholder="Link do comprovante" style="${estiloCampo()}">
              </label>
            `
        }

        <label style="display:grid;gap:6px;font-size:12px;color:#6A5963;">
          Observações (opcional)
          <textarea name="observacoes" rows="2" maxlength="500" placeholder="Observações" style="${estiloCampo()}"></textarea>
        </label>

        <button type="submit" style="padding:14px;border:0;border-radius:13px;background:#6B304F;color:#fff;font-weight:750;font-size:14px;">
          Salvar lançamento de teste
        </button>

        <p style="margin:0;color:#8A7D85;font-size:10px;line-height:1.45;">
          Os dados desta versão ficam salvos somente neste navegador.
        </p>
      </form>
      `
    );

    elemento("#financeiro-form-lancamento", overlay)
      .addEventListener("submit", (evento) => {
        evento.preventDefault();

        const formulario = evento.currentTarget;

        const dados = Object.fromEntries(
          new FormData(formulario).entries()
        );

        const valor = Number(dados.valor);

        if (!Number.isFinite(valor) || valor <= 0) {
          alert("Informe um valor maior que zero.");
          return;
        }

        const registro = {
          id: `${receita ? "REC" : "DES"}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          data: dados.data,
          valor,
          pagamento: dados.pagamento,
          observacoes: dados.observacoes || "",
          criadoEm: new Date().toISOString()
        };

        if (receita) {
          registro.cliente = (dados.cliente || "").trim();
          registro.servico = (dados.servico || "").trim();
          registro.tipoRecebimento =
            dados.tipoRecebimento || "Pagamento integral";
          registro.status = "Recebido";

          state.receitas.push(registro);
        } else {
          registro.categoria = dados.categoria;
          registro.descricao = (dados.descricao || "").trim();
          registro.fornecedor = (dados.fornecedor || "").trim();
          registro.comprovante = (dados.comprovante || "").trim();

          state.despesas.push(registro);
        }

        salvarDados();
        fecharModal();

        state.tab = "resumo";
        atualizarAbas("resumo");
        renderizar();

        alert(
          "Lançamento salvo neste navegador. Ainda não foi enviado à planilha."
        );
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

    atualizarValor(
      ".faturamento-card .financeiro-metric-copy strong",
      moeda(resumo.totalReceitas)
    );

    const indicadores = todos(
      ".financeiro-mini-card strong",
      elemento("#financeiro")
    );

    if (indicadores[0]) {
      indicadores[0].textContent = moeda(resumo.totalDespesas);
    }

    if (indicadores[1]) {
      indicadores[1].textContent = moeda(
        resumo.totalReceitas - resumo.totalDespesas
      );
    }

    const receitasAnuais = state.receitas
      .filter((item) => {
        if (!item.data) return false;

        return (
          Number(item.data.slice(0, 4)) === state.ano &&
          item.status !== "Estornado" &&
          item.status !== "Reembolsado"
        );
      })
      .reduce(
        (soma, item) => soma + Number(item.valor || 0),
        0
      );

    atualizarValor(
      ".financeiro-anual-content strong",
      moeda(receitasAnuais)
    );

    atualizarValor(
      ".financeiro-despesa-total strong",
      moeda(resumo.totalDespesas)
    );

    const estadoVazio = elemento(
      ".financeiro-empty-state",
      elemento("#financeiro")
    );

    if (estadoVazio) {
      estadoVazio.style.display =
        resumo.despesas.length > 0 ? "none" : "flex";
    }

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
        valor.textContent =
          `${moeda(item[1])} · ${percentual(
            item[1],
            receitas.reduce(
              (soma, receita) => soma + Number(receita.valor || 0),
              0
            )
          )}`;
      }
    });
  }

  function renderizarListaDespesas(despesas) {
    const container = elemento(
      ".financeiro-despesas-lista",
      elemento("#financeiro")
    );

    if (!container) return;

    container.replaceChildren();

    despesas
      .slice()
      .sort((a, b) => b.data.localeCompare(a.data))
      .slice(0, 8)
      .forEach((despesa) => {
        const linha = document.createElement("div");

        linha.style.cssText =
          "display:flex;justify-content:space-between;gap:10px;" +
          "padding:10px 0;border-bottom:1px solid #F1E9ED;font-size:12px;";

        const descricao = document.createElement("span");

        descricao.style.cssText =
          "color:#5C4B55;min-width:0;overflow-wrap:anywhere;";

        descricao.textContent = despesa.categoria || "Despesa";

        const detalhe = document.createElement("small");

        detalhe.style.cssText =
          "display:block;color:#988A92;margin-top:3px;";

        detalhe.textContent =
          `${dataLocal(despesa.data)} · ${despesa.descricao || ""}`;

        descricao.appendChild(detalhe);

        const valor = document.createElement("strong");

        valor.style.cssText =
          "color:#8C3E56;white-space:nowrap;";

        valor.textContent = moeda(despesa.valor);

        linha.append(descricao, valor);
        container.appendChild(linha);
      });
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
      console.warn(
        "Chart.js não foi encontrado. Os gráficos não serão exibidos."
      );
      return;
    }

    const resumo = totais();

    const meses = [];
    const valoresMensais = [];

    for (let i = 5; i >= 0; i--) {
      const data = new Date(
        state.ano,
        state.mes - i,
        1
      );

      const ano = data.getFullYear();
      const mes = data.getMonth();

      meses.push(
        data.toLocaleDateString("pt-BR", {
          month: "short"
        }).replace(".", "")
      );

      const total = state.receitas
        .filter((receita) => {
          if (
            !receita.data ||
            receita.status === "Estornado" ||
            receita.status === "Reembolsado"
          ) {
            return false;
          }

          const [anoReceita, mesReceita] =
            receita.data.split("-").map(Number);

          return (
            anoReceita === ano &&
            mesReceita - 1 === mes
          );
        })
        .reduce(
          (soma, receita) => soma + Number(receita.valor || 0),
          0
        );

      valoresMensais.push(total);
    }

    criarGrafico("faturamento", "graficoFaturamento", {
      type: "bar",

      data: {
        labels: meses,

        datasets: [{
          label: "Receitas recebidas",
          data: valoresMensais,
          backgroundColor: "#B66F8B",
          borderRadius: 7,
          maxBarThickness: 28
        }]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,

        plugins: {
          legend: {
            display: false
          },

          tooltip: {
            callbacks: {
              label: (contexto) => moeda(contexto.raw)
            }
          }
        },

        scales: {
          x: {
            grid: {
              display: false
            },

            ticks: {
              color: "#8A7D85",
              font: {
                size: 10
              }
            }
          },

          y: {
            beginAtZero: true,

            grid: {
              color: "#F1E9ED"
            },

            ticks: {
              color: "#8A7D85",
              font: {
                size: 9
              },

              callback: (valor) => `R$ ${valor}`
            }
          }
        }
      }
    });

    const servicos = new Map();

    resumo.receitas.forEach((receita) => {
      const nome = receita.servico || "Serviço não informado";

      servicos.set(
        nome,
        (servicos.get(nome) || 0) + Number(receita.valor || 0)
      );
    });

    const itensServicos = Array.from(servicos.entries())
      .sort((a, b) => b[1] - a[1]);

    criarGrafico("servicos", "graficoServicos", {
      type: "doughnut",

      data: {
        labels: itensServicos.map((item) => item[0]),

        datasets: [{
          data: itensServicos.map((item) => item[1]),

          backgroundColor: [
            "#6B304F",
            "#B66F8B",
            "#D9A7BA",
            "#E8D8E0",
            "#C9A5B6",
            "#8A536D"
          ],

          borderWidth: 2,
          borderColor: "#FFFFFF",
          hoverOffset: 4
        }]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "66%",

        plugins: {
          legend: {
            display: false
          },

          tooltip: {
            callbacks: {
              label: (contexto) => {
                const valor = Number(contexto.raw || 0);

                return `${contexto.label}: ${moeda(valor)} (${percentual(
                  valor,
                  resumo.totalReceitas
                )})`;
              }
            }
          }
        }
      }
    });

    const categorias = new Map();

    resumo.despesas.forEach((despesa) => {
      const categoria = despesa.categoria || "Outras despesas";

      categorias.set(
        categoria,
        (categorias.get(categoria) || 0) +
          Number(despesa.valor || 0)
      );
    });

    const itensDespesas = Array.from(categorias.entries())
      .sort((a, b) => b[1] - a[1]);

    criarGrafico("despesas", "graficoDespesas", {
      type: "doughnut",

      data: {
        labels: itensDespesas.map((item) => item[0]),

        datasets: [{
          data: itensDespesas.map((item) => item[1]),

          backgroundColor: [
            "#6B304F",
            "#B66F8B",
            "#D9A7BA",
            "#E8D8E0",
            "#C9A5B6",
            "#8A536D",
            "#A7B8A8"
          ],

          borderWidth: 2,
          borderColor: "#FFFFFF"
        }]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",

        plugins: {
          legend: {
            position: "bottom",

            labels: {
              boxWidth: 9,
              boxHeight: 9,
              padding: 12,

              font: {
                size: 10
              }
            }
          },

          tooltip: {
            callbacks: {
              label: (contexto) =>
                `${contexto.label}: ${moeda(contexto.raw)}`
            }
          }
        }
      }
    });
  }

  function configurarBotaoDespesa() {
    const botao = elemento(
      ".financeiro-add-button",
      elemento("#financeiro")
    );

    if (!botao || botao.dataset.bound === "1") {
      return;
    }

    botao.dataset.bound = "1";

    botao.addEventListener("click", () => {
      abrirModalLancamento("despesa");
    });
  }

  function configurarBotaoRelatorio() {
    const botao = elemento(
      ".financeiro-report-button",
      elemento("#financeiro")
    );

    if (!botao || botao.dataset.bound === "1") {
      return;
    }

    botao.dataset.bound = "1";

    botao.addEventListener("click", gerarRelatorio);
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
            button {
              display: none;
            }
          }
        </style>
      </head>

      <body>
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
          window.onload = function () {
            window.print();
          };
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

    lerDados();
    injetarAvisoPrototipo();
    adicionarSeletorPeriodo();
    adicionarNavegacaoAbas();
    configurarBotaoDespesa();
    configurarBotaoRelatorio();
    renderizar();

    document.addEventListener("dadosCarregados", renderizar);

    console.info(
      "Flow Pro Financeiro iniciado em modo de teste local."
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

    limparDadosLocais: () => {
      if (
        !confirm(
          "Isso apagará todos os lançamentos de teste deste navegador. Continuar?"
        )
      ) {
        return;
      }

      state.receitas = [];
      state.despesas = [];

      salvarDados();
      renderizar();
    },

    exportarDadosTeste: () =>
      JSON.stringify(
        {
          receitas: state.receitas,
          despesas: state.despesas
        },
        null,
        2
      )
  };
})();
