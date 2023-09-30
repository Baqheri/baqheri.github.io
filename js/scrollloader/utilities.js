export const
camelCase = (prefix, camel) => {
    return prefix + camel[0].toUpperCase() + camel.substring(1);
},

getOfNoneDisplay = (element, callback) => {
    // Elements must be visible to compute style properties!
    let  style;
    let parent = element;
    try {
        while (!parent.offsetHeight) {
            parent.classList.add('scroll-loader-show-hidden');
            parent = parent.parentElement;
        }
        if (parent !== element){
            style = document.createElement('style');
            style.textContent = `                
            .scroll-loader-show-hidden {
                top: 0 !important;
                left: 0 !important;
                visibility: hidden !important;
                display: block !important;
            }`;

            parent.prepend(style);
        }
       
               
        return callback(element);

    } finally {
        style?.remove();
        while (element !== parent) {
            element.classList.remove('scroll-loader-show-hidden');
            element = element.parentElement;
        }
    }
}
;