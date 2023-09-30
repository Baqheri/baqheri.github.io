import { shape } from "./shapeContainer.js";
import { getOfNoneDisplay } from "./utilities.js";

const globalConfig = {
    resize: 'vertical', // || 'horizontal'.
    direction: 'ltr', // || 'ltr'.
    timeline: 'direct', // || 'reverse'. Inverting loading process.
    itemsPerPage: 1,
    numPages: 1,
    fetch: async (url, opitons) => {
        return {
            items: [],
            meta: {
                totalItems: 0,
                totalPages: 1,
                page: 1,
            },
            links: {
                previous: '',
                self: '',
                next: '',
            }
        };
    },
    renderLoadingCallback: element => element.textContent = 'Loading... .',
    renderItemCallback: ({element, content, meta}) => {
        element.textContent = content;
        if (meta) {
            element.dataset['meta'] = JSON.stringify(meta);
        }
    },
    triggerMargin : '10% 0',
    topTagName: 'div',    
}, 

convertTriggerMarginInPercent = (container, triggerMargin) => { 
    const data = container.querySelector('.data');
    return getOfNoneDisplay(container, _ => {   
        // % is relative to width of parent block;
        const containerWidth = container.style.width;
        if (container.offsetWidth === 0) {
            container.style.width = '100px';
        }

        const containerOffsetwidth = container.offsetWidth;
        const containerDisplay = container.style.display;
        const dataMargin = data.style.margin;

        data.style.margin = triggerMargin;
        const computedStyle = document.defaultView.getComputedStyle(data);
        const margin = {};
        // To bette trigger, add an offset.
        margin.top = parseFloat(computedStyle['marginTop']) / containerOffsetwidth * 100  + .5 + '%';
        margin.right = parseFloat(computedStyle['marginRight']) / containerOffsetwidth * 100  + .5 + '%';
        margin.bottom = parseFloat(computedStyle['marginBottom']) / containerOffsetwidth * 100  + .5 + '%';
        margin.left = parseFloat(computedStyle['marginLeft']) / containerOffsetwidth * 100  + .5 + '%';

        data.style.margin = dataMargin;
        container.style.display = containerDisplay;  
        container.style.width = containerWidth;     

        return margin;
    });
}
;

export const configContainer = (scrollContainer, config) => {
    config = {
        ...globalConfig,
        ...config,        
    };
    return {
        ...config,
        ...({    
            size: config.resize === 'vertical' ? 'height' : 'width',
            next: config.timeline === 'direct' ? 'next' : 'previous',
            previous: config.timeline ==='reverse' ? 'next' : 'previous',
            start: config.resize === 'vertical' ? 'top' : (config.direction === 'ltr' ? 'left' : 'right'),
            end: config.resize === 'vertical' ? 'bottom' : (config.direction === 'ltr' ? 'right' : 'left'),
        }),        
        ...shape(scrollContainer, {
            tagname: config.topTagName, 
            resize: config.resize, 
            timeline: config.timeline,
            direction: config.direction,
        }),
        triggerMargin: convertTriggerMarginInPercent(scrollContainer, config.triggerMargin),
    };
};