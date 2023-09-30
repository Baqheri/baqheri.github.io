import * as resources from "./js/models/resources.js";
import { diminishDoiApiResponse as  diminish} from "./js/models/diminishDoiApiResponse.js";

//#region 'event handlers'
self.addEventListener('install', installHandler);
self.addEventListener('activate', activateHandler);
self.addEventListener('fetch', fetchHandler);
//#endregion
function cacheName(url) {
    // If localhost and in development stage, development cache.
    if (url.startsWith(resources.SITEHOST) && resources.ENVIRONMENT === 'DEVELOPMENT') {
        return resources.DEVELOPMENT_CACHE;
    } else {
        return resources.CURRENT_CACHE;
    }
}

async function cacheResponse(request, response){  
    const name =  cacheName(request.url);
    const cache = await caches.open(name);

    // A custom header to prevent analysing
    // response twice!!
    response.headers.set(resources.CUSTOM_DOI_HEADER, name);
    // NO awaiting!!
    cache.put(request, response);
}

async function cacheResources(assets) {   
    if (!await caches.has(cacheName(resources.SITEHOST))) {      
        assets.forEach(async asset => {    
            const request = new Request(asset, {
                method: 'GET',
                headers: {
                    accept: '*/*, text/html',
                    credentials: 'same-origin',
                },   
                        
            });
            
            const response = await diminish(await fetch(request));
            // No awaiting!!
            cacheResponse(request, response);
        });
    } 
}
function installHandler(event) {
    console.info('ServiceWorker: installing... .');
    
    event.waitUntil(cacheResources(resources.CACHEABLE_ASSETS)); 
    self.skipWaiting();
}

function activateHandler(event) {
    console.info('ServiceWorker: activating... .');

    event.waitUntil(clients.claim());
}

async function cacheFirst({request}) {
    const responseFromCache = await caches.match(request, {
        cacheName: cacheName(request.url),
    });
    if (responseFromCache) {
        return responseFromCache;
    }

    try {
        // Get from net.
        const responseFromNet = await diminish(await self.fetch(request));
        cacheResponse(request, responseFromNet.clone());
        return responseFromNet; 
    }
    // Bypass server errors to cache.
    catch (err) {
        console.error(`ServiceWorker: ${err.message}`);
        // If server responds with error, send it as is to client.
        if (err.cause instanceof Response) {
            return err.cause;
        }
        throw err;
    }    
}

function fetchHandler(event) {
    console.info('ServiceWorker: fetching... .');

    event.respondWith(cacheFirst({
        request: event.request,

    }));
}