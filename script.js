// =====================================
// NAVEGAÇÃO ENTRE TELAS + MENU ATIVO
// =====================================

function abrirPagina(nomePagina, botao) {


    const paginas = document.querySelectorAll(".pagina");


    paginas.forEach(function(pagina){

        pagina.classList.remove("ativa");

    });



    const tela = document.getElementById(nomePagina);


    if(tela){

        tela.classList.add("ativa");

    }



    const botoes = document.querySelectorAll(".mobile-item");


    botoes.forEach(function(item){

        item.classList.remove("active");

    });



    if(botao){

        botao.classList.add("active");

    }


}








// =====================================
// DADOS DOS AGENDAMENTOS
// =====================================


const agendamentos = [


{
nome:"Maria Oliveira",
data:"2026-07-27",
horario:"09:00",
servico:"Maquiagem Social + Penteado",
valor:250
},


{
nome:"Ana Souza",
data:"2026-07-27",
horario:"10:30",
servico:"Maquiagem",
valor:130
},


{
nome:"Carla Silva",
data:"2026-07-27",
horario:"11:30",
servico:"Maquiagem Social",
valor:180
},


{
nome:"Juliana Lima",
data:"2026-07-27",
horario:"13:30",
servico:"Maquiagem Social + Penteado",
valor:250
}


];









// =====================================
// CARREGAMENTO
// =====================================


document.addEventListener("DOMContentLoaded", function(){






// =====================================
// CALENDÁRIO DASHBOARD
// =====================================


const calendarEl = document.getElementById("calendar");



if(calendarEl){


const calendar = new FullCalendar.Calendar(calendarEl,{


initialView:"dayGridMonth",

locale:"pt-br",

height:350,


headerToolbar:{


left:"prev",

center:"title",

right:"next"


},



events:agendamentos.map(cliente=>({


title:cliente.nome,


start:cliente.data+"T"+cliente.horario


}))



});


calendar.render();


}









// =====================================
// CALENDÁRIO COMPLETO AGENDA
// =====================================


const calendarAgendaEl =
document.getElementById("calendarAgenda");



if(calendarAgendaEl){



const calendarAgenda =
new FullCalendar.Calendar(calendarAgendaEl,{



initialView:"dayGridMonth",

locale:"pt-br",

height:450,



headerToolbar:{


left:"prev,next",

center:"title",

right:"today"


},




// CALENDÁRIO LIMPO

events:[],



dateClick:function(info){


filtrarClientes(info.dateStr);


}



});



calendarAgenda.render();



}









// =====================================
// BOTÃO CALENDÁRIO
// =====================================


const botaoCalendario =
document.getElementById("abrirCalendario");



if(botaoCalendario){



botaoCalendario.addEventListener(
"click",
function(){


const calendario =
document.getElementById(
"calendarFullContainer"
);



if(calendario){

calendario.classList.toggle("ativo");

}


});


}



});












// =====================================
// FILTRAR CLIENTES
// MANTENDO O MESMO LAYOUT DA AGENDA
// =====================================


function filtrarClientes(data){



const lista =
document.querySelector(".appointments");



const clientes =
agendamentos.filter(cliente=>{


return cliente.data === data;


});





if(!lista) return;



lista.innerHTML="";







clientes.forEach(cliente=>{



let servicosHTML = "";



if(cliente.servico.includes("+")){


servicosHTML = `


<span class="servico maquiagem">

Maquiagem Social

</span>


<span class="servico penteado">

Penteado

</span>


`;



}else{


servicosHTML = `


<span class="servico maquiagem">

${cliente.servico}

</span>


`;


}





lista.innerHTML += `



<div class="item">



<div class="horario">

${cliente.horario}

</div>





<div class="cliente">


<img src="/assets/Avatares/cliente01 (27).jpg">



<div>

<h3>

${cliente.nome}

</h3>


</div>


</div>






<div class="servicos">


${servicosHTML}


</div>






<div class="financeiro">


<strong>

R$${cliente.valor},00

</strong>



<span class="status confirmado">

Confirmado

</span>



</div>



</div>



`;



});



}









// =====================================
// GRÁFICOS FINANCEIRO
// =====================================



const graficoFaturamento =
document.getElementById(
"graficoFaturamento"
);



if(graficoFaturamento){



new Chart(graficoFaturamento,{


type:"bar",


data:{


labels:[

"Fev",
"Mar",
"Abr",
"Mai",
"Jun",
"Jul"

],


datasets:[{


label:"Faturamento",


data:[

3200,
3800,
4100,
4600,
5600,
6450

],


backgroundColor:"#6B304F",

borderRadius:8


}]


},


options:{


responsive:true,

maintainAspectRatio:false,


plugins:{


legend:{display:false}


}


}



});


}








const graficoServicos =
document.getElementById(
"graficoServicos"
);



if(graficoServicos){



new Chart(graficoServicos,{


type:"doughnut",


data:{


labels:[

"Maquiagem Social",
"Penteado",
"Maquiagem + Penteado",
"Outros"

],


datasets:[{

data:[

45,
25,
17,
13

],


backgroundColor:[

"#6B304F",
"#B76E8A",
"#D9A441",
"#777777"

]


}]


},


options:{


responsive:true,

maintainAspectRatio:false,


plugins:{


legend:{


position:"bottom"


}


}


}


});


}