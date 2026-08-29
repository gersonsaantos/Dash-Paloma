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

    carregarProximoAtendimento();

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
        `${mensagem}, ${nomeUsuario}! ☀️`;

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

function encontrarValorServico(
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


    const hoje =
        pegarDataBrasilia();



    // ==================================
    // ATENDIMENTOS DE HOJE
    // ==================================

    const atendimentosHoje =
        agendamentos.filter(
            cliente => {

                return cliente.data === hoje;

            }
        );



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
                encontrarValorServico(
                    cliente.servico,
                    cliente.tamanhoCabelo
                );

        }
    );



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
    // MÊS ATUAL
    // ==================================

    const dataAtual =
        criarDataSegura(
            hoje
        );


    let proximosAgendamentos = [];


    if(dataAtual){

        const anoAtual =
            dataAtual.getFullYear();


        const mesAtual =
            dataAtual.getMonth();


        const diaAtual =
            dataAtual.getDate();


        proximosAgendamentos =
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


                    if(
                        anoCliente !==
                        anoAtual
                    ){

                        return false;

                    }


                    if(
                        mesCliente !==
                        mesAtual
                    ){

                        return false;

                    }


                    if(
                        diaCliente <
                        diaAtual
                    ){

                        return false;

                    }


                    return true;

                }
            );

    }



    const elementoProximos =
        document.getElementById(
            "proximosAgendamentos"
        );


    if(elementoProximos){

        elementoProximos.innerText =
            proximosAgendamentos.length;

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


    const dataHoje =
        pegarDataBrasilia();


    const clientesHoje =
        agendamentos.filter(
            cliente => {

                return cliente.data === dataHoje;

            }
        );


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


    if(clientesHoje.length === 0){

        lista.innerHTML = `

            <p>
                Nenhum atendimento hoje.
            </p>

        `;

        return;

    }


    clientesHoje.forEach(
        cliente => {

            const valor =
                encontrarValorServico(
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
                            ${cliente.servico ||
                            "Serviço não informado"}
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
// PRÓXIMO ATENDIMENTO
// =====================================

function carregarProximoAtendimento(){

    const horarioElemento =
        document.getElementById(
            "proximoHorario"
        );


    const tempoElemento =
        document.getElementById(
            "proximoTempo"
        );


    const nomeElemento =
        document.getElementById(
            "proximoNome"
        );


    const servicoElemento =
        document.getElementById(
            "proximoServico"
        );


    const valorElemento =
        document.getElementById(
            "proximoValor"
        );


    if(
        !horarioElemento ||
        !tempoElemento ||
        !nomeElemento ||
        !servicoElemento
    ){

        return;

    }


    if(
        !dadosSistema ||
        !Array.isArray(
            dadosSistema.agendamentos
        )
    ){

        horarioElemento.innerText =
            "--:--";

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
    // DATA E HORA ATUAL
    // ==================================

    const agora =
        new Date();


    const partes =
        new Intl.DateTimeFormat(
            "en-US",
            {
                timeZone:
                    "America/Sao_Paulo",

                year:
                    "numeric",

                month:
                    "2-digit",

                day:
                    "2-digit",

                hour:
                    "2-digit",

                minute:
                    "2-digit",

                hour12:
                    false
            }
        ).formatToParts(
            agora
        );


    const valoresData = {};


    partes.forEach(
        parte => {

            if(
                parte.type !== "literal"
            ){

                valoresData[parte.type] =
                    parte.value;

            }

        }
    );


    const dataAtual =
        `${valoresData.year}-${valoresData.month}-${valoresData.day}`;


    const horaAtual =
        `${valoresData.hour}:${valoresData.minute}`;



    // ==================================
    // FILTRAR ATENDIMENTOS FUTUROS
    // ==================================

    const futuros =
        agendamentos.filter(
            cliente => {

                if(
                    !cliente.data ||
                    !cliente.horario
                ){

                    return false;

                }


                if(
                    cliente.data >
                    dataAtual
                ){

                    return true;

                }


                if(
                    cliente.data <
                    dataAtual
                ){

                    return false;

                }


                return (
                    cliente.horario >=
                    horaAtual
                );

            }
        );



    // ==================================
    // ORDENAR
    // ==================================

    futuros.sort(
        (a,b) => {

            const primeiro =
                `${a.data} ${a.horario}`;


            const segundo =
                `${b.data} ${b.horario}`;


            return primeiro.localeCompare(
                segundo
            );

        }
    );



    // ==================================
    // NENHUM ATENDIMENTO
    // ==================================

    if(
        futuros.length === 0
    ){

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
    // PRÓXIMO
    // ==================================

    const proximo =
        futuros[0];


    window.proximoAtendimento =
        proximo;



    horarioElemento.innerText =
        proximo.horario;


    nomeElemento.innerText =
        proximo.nome ||
        "Cliente";


    servicoElemento.innerText =
        proximo.servico ||
        "Serviço não informado";



    // ==================================
    // VALOR
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
    // TEMPO
    // ==================================

    tempoElemento.innerText =
        calcularTempoAte(
            proximo.data,
            proximo.horario
        );


    console.log(
        "PRÓXIMO ATENDIMENTO:",
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


    const atendimento =
        new Date(
            Number(partesData[0]),
            Number(partesData[1]) - 1,
            Number(partesData[2]),
            Number(partesHora[0]),
            Number(partesHora[1]),
            0
        );


    const agora =
        new Date();


    const diferenca =
        atendimento.getTime()
        -
        agora.getTime();


    if(
        diferenca <= 0
    ){

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
// ABRIR DETALHES
// =====================================

function abrirDetalhesProximo(){

    const cliente =
        window.proximoAtendimento;


    if(!cliente){

        console.log(
            "Nenhum próximo atendimento disponível."
        );

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

                    <span id="detalheNome"></span>

                </div>


                <div class="detalhe-item">

                    <strong>
                        Telefone
                    </strong>

                    <span id="detalheTelefone"></span>

                </div>


                <div class="detalhe-item">

                    <strong>
                        Data
                    </strong>

                    <span id="detalheData"></span>

                </div>


                <div class="detalhe-item">

                    <strong>
                        Horário
                    </strong>

                    <span id="detalheHorario"></span>

                </div>


                <div class="detalhe-item">

                    <strong>
                        Horário final
                    </strong>

                    <span id="detalheHoraFim"></span>

                </div>


                <div class="detalhe-item">

                    <strong>
                        Serviço
                    </strong>

                    <span id="detalheServico"></span>

                </div>


                <div class="detalhe-item">

                    <strong>
                        Tamanho do cabelo
                    </strong>

                    <span id="detalheCabelo"></span>

                </div>


                <div class="detalhe-item">

                    <strong>
                        Penteado
                    </strong>

                    <span id="detalhePenteado"></span>

                </div>

            </div>

        `;


        document.body.appendChild(
            modal
        );



        // ==================================
        // FECHAR
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


    modal.classList.add(
        "ativo"
    );

}



// =====================================
// FECHAR DETALHES
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


    if(
        partes.length !== 3
    ){

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
// BOTÃO VER DETALHES
// =====================================
//
// Usamos delegação de evento.
// Assim funciona mesmo se o card
// for atualizado/recriado pelo JS.
//

document.addEventListener(
    "click",
    function(event){

        const botao =
            event.target.closest(
                "#verDetalhesProximo"
            );


        if(!botao){

            return;

        }


        event.preventDefault();


        console.log(
            "VER DETALHES CLICADO"
        );


        abrirDetalhesProximo();

    }
);



// =====================================
// API TERMINOU DE CARREGAR
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