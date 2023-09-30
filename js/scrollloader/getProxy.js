import { getOfNoneDisplay } from "./utilities.js";

const property = prop => element => getOfNoneDisplay(element, element => element[prop]);
const styleProperty = prop => element => getComputedStyle(element)[prop];

export const get = (() => {
    if (Proxy) {
        return new Proxy({}, {
            get(_, prop) {
                const regEx =/([^-]+?)(-?)([hw])(eight|idth)/;
                prop = prop.replace(regEx, (_1, p1, _2, p3, p4) => p1 + p3.toUpperCase() + p4);
                if (prop.includes('offset')) {
                    return property(prop);
                } else {
                    return styleProperty(prop);
                }
                
            }
        });
    } else {
        
        return {
            offsetHeight: property('offsetHeihgt'),
            offsetheight: property('offsetheihgt'),

            height: styleProperty('height'),
            maxHeight: styleProperty('maxHeight'),
            maxheight: styleProperty('maxHeight'),
            minHeight: styleProperty('minHeight'),
            minheigt: styleProperty('minHeight'),
            ['max-height']: styleProperty('maxHeight'),
            ['min-height']: styleProperty('minHeiht'),
            width: styleProperty('width'),
            maxWidth: styleProperty('maxWidth'),
            maxwidth: styleProperty('maxWidth'),
            minWidth: styleProperty('minWidth'),
            minwidth: styleProperty('minWidth'),
            ['max-width']: styleProperty('maxWidth'),
            ['min-width']: styleProperty('minWidth'),

            offsetWidth: property('offsetWidth'),
            offsetwidth: property('offsetWidth')
        }

    }
})();