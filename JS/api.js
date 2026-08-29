// =====================================
// CONFIGURAÇÃO DA API
// =====================================


const URL_API = "https://script.google.com/macros/s/AKfycbwUbF_-HVYBS68Ljs8kBHHGstCNMVNdPuGWJbTiCOyHN-gHw1cL55E68MQDYy3MJDmiXQ/exec";




// =====================================
// BANCO DE DADOS DO SISTEMA
// =====================================


let dadosSistema = {

    agendamentos: [],

    servicos: []

};





// =====================================
// CARREGAR DADOS DA PLANILHA
// =====================================


async function carregarDados(){


    try{


        console.log(
            "Buscando dados da API..."
        );



        const resposta = 
        await fetch(URL_API);




        const dados = 
        await resposta.json();





        dadosSistema = dados;




        console.log(
            "Dados carregados:",
            dadosSistema
        );



        console.log(
            "Total agendamentos:",
            dadosSistema.agendamentos.length
        );



        console.log(
            "Total serviços:",
            dadosSistema.servicos.length
        );






        // AVISA AS TELAS QUE OS DADOS CHEGARAM

        document.dispatchEvent(
            new Event("dadosCarregados")
        );





    }catch(erro){



        console.error(

            "Erro ao carregar dados:",
            erro

        );



    }


}







// =====================================
// INICIAR AO ABRIR O APLICATIVO
// =====================================


document.addEventListener(
"DOMContentLoaded",
function(){


    carregarDados();


});