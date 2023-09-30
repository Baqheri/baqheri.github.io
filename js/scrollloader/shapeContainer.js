import { getTemplate } from './template.js';
import { proxyBucket } from './proxies.js';
import { camelCase } from './utilities.js';

export const shape = (scrollContainer, {tagname, resize, direction, timeline}) => {
    const size = resize === 'vertical' ? 'height' : 'width';
    scrollContainer.innerHTML  = getTemplate({tagname, resize, direction, timeline});
    scrollContainer.classList.add('scroll-loader-container');
    
    return {
        container: scrollContainer.querySelector('.scroll-loader'),
        toolbar: scrollContainer.querySelector('.toolbar'),
        preTriggerConfidence: scrollContainer.querySelector('.pre-trigger-confidence'),
        preBucket: proxyBucket(scrollContainer.querySelector('.pre-bucket'), size),
        data: scrollContainer.querySelector('.data'),
        loading: scrollContainer.querySelector('.loading'),
        preTrigger: scrollContainer.querySelector('.pre-trigger'),
        pages: scrollContainer.querySelector('.pages'),
        postTrigger: scrollContainer.querySelector('.post-trigger'),
        postTriggerConfidence: scrollContainer.querySelector('.post-trigger-confidence'),
        postBucket: proxyBucket(scrollContainer.querySelector('.post-bucket'), size),
    };
}
;