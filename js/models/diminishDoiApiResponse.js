
// Might be implemented async, with window.requestIdleCallback()!
async function diminish(body) {
    if (body?.data) {
        body = {
            items: body.data.map(datum => {
                if (datum.type === 'dois') {
                    return {
                        content: datum.id, 
                        meta : {url: datum.attributes.url}
                    };
                }
                return {content: datum.id};
            }),
            meta: {
                totalItems: body.meta.total,
                totalPages: body.meta.totalPages,
                page: body.meta.page,
            },
            links: body.links,
        };
    }
    return body;
}

export async function diminishDoiApiResponse(response) {
    let  body, errorBody;
    const headers = new Headers(response.headers);
    if (response.headers.get('content-type')?.search(/application\/.*json/i) !== -1) {
        body = await response.json();
        if (body.errors) {
            errorBody = body;
        }
        body = JSON.stringify(await diminish(body));        
        headers.set('Content-Length', body.length ?? headers.get('Content-Length'));
        headers.set('Last-Modified', new Date().toUTCString());
    } else {
        body = response.body;
    }   

    const newResponse = new Response(
        body,
        {
            status: response.status,
            statusText: response.statusText,
            headers: headers,
        }
    );

    // Server respond with 4xx, 5xx errors or
    // server respondes with content error.
    if (!response.ok || errorBody?.errors) {
        const statusCode = errorBody?.errors?.[0].status ?? response.status;
        throw new Error(`HTTP error!, ${statusCode}.`, {cause: newResponse});
    }       
    
    return newResponse;

}
