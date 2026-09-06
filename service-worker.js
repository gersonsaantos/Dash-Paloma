// =====================================
// SERVICE WORKER - FLOW PRO
// TEMPORARIAMENTE DESATIVADO
// =====================================

self.addEventListener("install", function(event){

    self.skipWaiting();

});


self.addEventListener("activate", function(event){

    event.waitUntil(

        caches.keys().then(function(cacheNames){

            return Promise.all(

                cacheNames.map(function(cacheName){

                    console.log(
                        "Apagando cache:",
                        cacheName
                    );

                    return caches.delete(cacheName);

                })

            );

        })

        .then(function(){

            return self.clients.claim();

        })

    );

});


self.addEventListener("fetch", function(event){

    event.respondWith(

        fetch(event.request)

    );

});