const CACHE_NAME = "agenda-pro-v1";


const arquivos = [

"/",
"/index.html",
"/primeirostyle.css",
"/responsivo.css",
"/script.js"

];



self.addEventListener("install", function(event){

event.waitUntil(

caches.open(CACHE_NAME)
.then(cache=>{

return cache.addAll(arquivos);

})

);

});





self.addEventListener("fetch", function(event){


event.respondWith(

caches.match(event.request)
.then(response=>{


return response || fetch(event.request);


})


);


});