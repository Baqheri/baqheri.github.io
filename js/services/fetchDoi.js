import { CUSTOM_DOI_HEADER, FALLBACK_URL } from '../models/resources.js';
import { diminishDoiApiResponse } from '../models/diminishDoiApiResponse.js';
import { ErrorWithFacllBack } from '../models/fallbackerror.js';

async function diminish(response) {
    // If from cache, return.
    if (response.headers.has(CUSTOM_DOI_HEADER)) {
        return response;
    }
    return await diminishDoiApiResponse(response);     
};
export async function fetchDoi(request, options){
    const accept = options?.headers?.accept ?? '';
    options = {
        ...options,
        ...{
            headers: {
                ...options.headers,
                accept: accept + 'application/vnd.api+json, application/json',
                //credential: 'same-origin',
            }
        },
        
    };

    try {
        return await diminish(await self.fetch(request, options));  

    } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
            return new Response(err.message, {
                status: 400,
                statusText: 'Bad Request',
            });
        }
        // TODO: if fetch errs with network connection, refetch request!
        if (false && err instanceof TypeError && err.message.includes('to fetch')) {
            // After trying fetch, return fallback content.
            const abortController = new AbortController();
            const delay = delayAcion(request, options, self.fetch, abortController.signal);
            try {      
                const response = await Promise.any([100, 300, 700].map(msec => delay(msec)));
                abortController.abort();
                return await diminish(response);

            } catch (error) {
                let fallback; 
                self.fetch(FALLBACK_URL, options).
                    then(res => diminish(res).then(fback => fallback = fback)).catch(err => {/* */});
                throw new ErrorWithFacllBack(err.message, {
                    cause: err, 
                    fallback,
                });
            } 
        }

        throw err;
    }
            
}

function delayAcion(request, options, fetch, signal) {
    return (delay) => {
        return new Promise((reslv, rejct) => {
            setTimeout( async _ => {
                try {
                    options = {
                        ...options,
                        ...{signal}
                    };
                    const response = await fetch(request, options);
                    reslv(response);
                } catch (err) {
                    rejct(err);
                }
            }, delay);
        });
    };    
}