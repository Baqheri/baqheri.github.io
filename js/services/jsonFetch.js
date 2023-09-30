import { fetchDoi } from "./fetchDoi.js";

export async function jsonFetch(request, options) {
    const json = await (await fetchDoi(request, options)).json();
    
    return {
        items: json.items,
        meta: {
            totalItems: json.meta?.totalItems,
            totalPages: json.meta?.totalPages,
            page: json.meta?.page,
        },
        links: {
            previous: json.links?.previous,
            self: json.links.self,
            next: json.links.next,
        }
    }
}