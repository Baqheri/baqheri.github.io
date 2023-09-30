export const 
     // Page is now not added to DOM, so dispatch event on pages!!
    dispatchPageDoming = (pages, page) => dispatchEvent('doming-page.scrollloader', pages, {page}),
    dispatchAbortLoading = (loading, abort) => dispatchEvent('loading.scrollloader', loading, {abort}),
    dispatchItemSelected = (item) => dispatchEvent('item-selected.scrollloader', item, {item})
;

function dispatchEvent(event, target, detail) {
    return target.dispatchEvent(new CustomEvent(event, {
        bubbles: true,
        cancelable: true,
        detail,
    })); 
}