// =====================================
// TELA INÍCIO - FLOW PRO
// =====================================


// =====================================
// INICIAR TELA
// =====================================

function iniciarInicio(){

    atualizarSaudacao();

    atualizarData();

    carregarAgendaHoje();

}



// =====================================
// SAUDAÇÃO AUTOMÁTICA
// =====================================

function atualizarSaudacao(){


    const elemento =
    document.getElementById(
        "saudacao"
    );


    if(!elemento) return;



    const agora =
    new Date();



    const hora =
    Number(
        agora.toLocaleString(
            "pt-BR",
            {
                timeZone:"America/Sao_Paulo",
                hour:"2-digit"
            }
        )
    );



    let mensagem = "";



    if(hora >= 5 && hora < 12){

        mensagem = "Bom dia";


    }else if(hora >= 12 && hora < 18){

        mensagem = "Boa tarde";


    }else{

        mensagem = "Boa noite";

    }



    const nomeUsuario = "Paloma";


    elemento.innerHTML =
    `${mensagem}, ${nomeUsuario}! ☀️`;


}




// =====================================
// DATA ATUAL BRASÍLIA
// =====================================

function atualizarData(){


    const elemento =
    document.getElementById(
        "dataAtual"
    );


    if(!elemento) return;



    const hoje =
    new Date();



    const dataFormatada =
    hoje.toLocaleDateString(
        "pt-BR",
        {

        weekday:"long",

        day:"numeric",

        month:"long",

        year:"numeric",

        timeZone:"America/Sao_Paulo"

        }
    );



    elemento.innerHTML =
    dataFormatada.charAt(0).toUpperCase()
    +
    dataFormatada.slice(1);



}




// =====================================
// BUSCAR CLIENTES DE HOJE
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



    console.log(
        dadosSistema.agendamentos
    );



    if(!dadosSistema.agendamentos ||
       dadosSistema.agendamentos.length === 0){


        lista.innerHTML =
        "<p>Carregando agenda...</p>";


        return;

    }





    const hoje =
    new Date();



    const dataHoje =
    hoje.toLocaleDateString(
        "en-CA",
        {
        timeZone:"America/Sao_Paulo"
        }
    );



    console.log(
        "Data procurada:",
        dataHoje
    );




    const clientesHoje =

    dadosSistema.agendamentos.filter(cliente=>{


        return cliente.data === dataHoje;


    });




    console.log(
        "Clientes encontrados:",
        clientesHoje
    );





    lista.innerHTML="";





    if(clientesHoje.length === 0){


        lista.innerHTML = `

        <p>
        Nenhum atendimento hoje.
        </p>

        `;


        return;

    }





    clientesHoje.forEach(cliente=>{


        lista.innerHTML += `


        <div class="cliente-home">


            <div class="horario">

                ${cliente.horario}

            </div>


            <img src="assets/Avatares/cliente01 (27).jpg">


            <div class="cliente-info-home">


                <h3>
                ${cliente.nome}
                </h3>


                <p>
                ${cliente.servico}
                </p>


            </div>


        </div>


        `;


    });



}






// =====================================
// INICIAR PÁGINA
// =====================================

document.addEventListener(
"DOMContentLoaded",
function(){

    iniciarInicio();

});





// =====================================
// ATUALIZAR QUANDO API TERMINAR
// =====================================

document.addEventListener(
"dadosCarregados",
function(){


    console.log(
        "API finalizada. Atualizando Home..."
    );


    carregarAgendaHoje();


});