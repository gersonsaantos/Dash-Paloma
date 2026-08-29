// =====================================
// SERVICE WORKER - FLOW PRO
// =====================================

const CACHE_NAME = "agenda-pro-v2";


const arquivos = [

    "/",

    "/index.html",

    "/primeirostyle.css",

    "/responsivo.css",

    "/script.js",

    "/tela-inicio.js"

];



// =====================================
// INSTALAÇÃO
// =====================================

self.addEventListener(
    "install",
    function(event){

        self.skipWaiting();

        event.waitUntil(

            caches.open(CACHE_NAME)

                .then(function(cache){

                    return cache.addAll(
                        arquivos
                    );

                })

        );

    }
);



// =====================================
// ATIVAÇÃO
// =====================================

self.addEventListener(
    "activate",
    function(event){

        event.waitUntil(

            caches.keys()
                .then(function(cacheNames){

                    return Promise.all(

                        cacheNames.map(
                            function(cacheName){

                                if(
                                    cacheName !==
                                    CACHE_NAME
                                ){

                                    return caches.delete(
                                        cacheName
                                    );

                                }

                            }
                        )

                    );

                })
                .then(function(){

                    return self.clients.claim();

                })

        );

    }
);



// =====================================
// BUSCAR ARQUIVOS
// =====================================

self.addEventListener(
    "fetch",
    function(event){

        event.respondWith(

            fetch(event.request)

                .then(function(response){

                    return response;

                })

                .catch(function(){

                    return caches.match(
                        event.request
                    );

                })

        );

    }
);