// =====================================
// NAVEGAÇÃO ENTRE TELAS + MENU ATIVO
// =====================================


function abrirPagina(nomePagina, botao){



    // ===============================
    // ESCONDE TODAS AS TELAS
    // ===============================


    const paginas = document.querySelectorAll(".pagina");


    paginas.forEach(function(pagina){

        pagina.classList.remove("ativa");

    });





    // ===============================
    // MOSTRA A TELA ESCOLHIDA
    // ===============================


    const tela = document.getElementById(nomePagina);


    if(tela){

        tela.classList.add("ativa");

    }







    // ===============================
    // ALTERA BOTÃO ATIVO
    // ===============================


    const botoes = document.querySelectorAll(".mobile-item");


    botoes.forEach(function(item){

        item.classList.remove("active");

    });



    if(botao){

        botao.classList.add("active");

    }



}