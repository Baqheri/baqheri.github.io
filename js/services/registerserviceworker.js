import { ENVIRONMENT, CURRENT_CACHE, DEVELOPMENT_CACHE } from "../models/resources.js";

export async function registerServiceWorker() {
    // Servie worker and cache work on secure context!!
    if (window.isSecureContext){
        if ('serviceWorker' in navigator) {
            try {
                const goOffline = document.querySelector('#go-offline');
                goOffline.parentElement.classList.remove('d-none');

                const serviceWorker = navigator.serviceWorker;
                let registration = await serviceWorker.getRegistration();
                goOffline.textContent = registration?.active ? 'Go online' : 'Go offline';                
                goOffline.addEventListener('click', async _ => {
                    if (!registration) {
                        registration = await serviceWorker.register("./serviceworker.js", 
                        {
                            //scope: "/",
                            type: 'module',
                            updateViaCache: 'none'
                        });
                        // Update in developing stage!
                        await registration.update();
                        goOffline.textContent = 'Go online';

                    } else if (registration.active) {   
                        await registration.unregister();
                        const cacheNames = await caches.keys();
                        cacheNames.map(async name => {
                            if (ENVIRONMENT === 'DEVELOPMENT' && name === DEVELOPMENT_CACHE) {
                                await caches.delete(name);
                            }
                            if (ENVIRONMENT === 'PRODUCTION' && name === CURRENT_CACHE) {
                                await caches.delete(name);
                            }
                        });

                        goOffline.textContent = 'Go offline';
                        self.location.reload();
                    } else {
                        queueMicrotask(_ => {
                            if (!registration.active) {
                                registration.unregister();
                            }
                        });
                    }
                });
            } catch (err) {
                throw err;
            }
        }
    }
}