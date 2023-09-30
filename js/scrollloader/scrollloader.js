import { configContainer } from './variables.js';
import { camelCase, getOfNoneDisplay } from './utilities.js';
import { get } from './getProxy.js';
import * as dispatch from './dispatchEvents.js';

// Facrtory!
export function createScrollLoader(scrollContainer, config) {
    if (!(scrollContainer instanceof HTMLElement)) {
        throw new TypeError('container must be HTMLElement!');
    }
//#region "Scrollloader core"
    const {
        itemsPerPage,
        numPages,
        renderLoadingCallback,
        renderItemCallback,
        fetch,
        size,
        next,
        previous,
        start,
        end,
        triggerMargin,

        container,
        toolbar,
        loading,
        preBucket,
        data,
        preTrigger,
        preTriggerConfidence,
        pages,
        postTrigger,
        postTriggerConfidence,
        postBucket
    } = configContainer(scrollContainer, config);

    const 
    getSize = page => {
        return getOfNoneDisplay(container, _ => page[camelCase('offset', size)]);
    },
    fixupScrollProblem = (page) => {
        // Scrollcontainer must have size set to permit scroll,
        // this is requirment: either form out or from component!!
        const parent = container.parentElement;
        const parentMaxSize = parseFloat(get['max' + size](parent));
        const pageSize = get['offset' + size](page);
        let parentSize = get['offset' + size](parent) + pageSize;
        parentSize = parentSize < parentMaxSize ? parentSize : parentMaxSize;        
        parent.style[size] = parentSize + 'px';
    },

    {
        setObserver,
        waitUntilDisapear,
        scrollHandler,
    } = (() => {
        let intersectionObserver;
        return {
            setObserver: () => {
                if (true && IntersectionObserver) {
                    intersectionObserver = new IntersectionObserver(async entries => {
                        for (const entry of entries) {
                            const target = entry.target;
                            // Handle observing pages to be removed. 
                            if (target.parentElement === pages && !entry.isIntersecting) {
                                intersectionObserver.unobserve(target);
                                (target.resolve)();
                            } 
                            // Handle triggers.
                            // Only once hydrated, because intersectionobserver handler is
                            // invoked once after observing target.
                            else if ((target === preTrigger || target === preTriggerConfidence)  
                                && entry.isIntersecting) {
                                // No await, to prevent queue loading.
                                loadFrom(preBucket);
                            }
                            else if ((target === postTrigger || target === postTriggerConfidence) 
                                && entry.isIntersecting){
                                // No await.
                                loadFrom(postBucket);
                            }
                        }
                    },
                    {
                        root: container,
                        rootMargin: '0%',
                        threshold: 0
                    });
                    
                    intersectionObserver.observe(preTrigger);
                    intersectionObserver.observe(postTrigger);
                    intersectionObserver.observe(preTriggerConfidence);
                    intersectionObserver.observe(postTriggerConfidence);
                }
                // Fallback to scroll.
                else {
                    container.addEventListener('scroll', async _ => {
                        // Check if scroll contaniner is visible.
                        if (container.offsetHeight) {
                            const containerClientSize = container[camelCase('client', size)];
                            const preBucketSize = preBucket[camelCase('offset', size)];
                            const dataOffsetSize = data[camelCase('offset', size)];
    
                            const {startSide, endSide} = start === right ? 
                                {startSide: 'left', endSide: 'right'} : {startSide: start, endSide: end};
    
                            // In 'rtl' scrollLeft in munus, 0 from right.
                            const scroll = Math.abs(container[camelCase('scroll', startSide)]);
    
                            const preTriggerOffset = preBucketSize + triggerMargin[startSide];
                            const postTriggerOffset = preBucketSize + dataOffsetSize - 
                                triggerMargin[endSide] - containerClientSize;                   
                            
                            if (scroll < preTriggerOffset) {                
                                await loadFrom(preBucket, getSignal());
                            } else if (scroll > postTriggerOffset) {
                                await loadFrom(postBucket, getSignal());        
                            }
                        }
                    });
                }
            },
    
            waitUntilDisapear: (page, signal) => {
                if (true && intersectionObserver) {
                    const promise = new Promise((resolve, reject) => {
                        signal.addEventListener('abort', event => {
                            intersectionObserver.unobserve(page);
                            reject(event.message);                
                        });
    
                        page.resolve = resolve;
                    });
                    intersectionObserver.observe(page);
                    return promise;
                } 
                // Fallback to scroll managing.
                else {
                    let scrollHandler;
                    return new Promise((resolve, reject) => {
                        scrollHandler = handler(resolve);
    
                        signal.addEventListener('abort', event => {
                            container.removeEventListener('scroll', scrollHandler);
                            reject(event.message);
                        });
                        
                        container.addEventListener('scroll', scrollHandler);                 
                        // Fake scroll;
                        container.scrollTop += 1;                  
                    });
                    
                    function handler(resolve) {
                        return _ => {
                            const client = page.getBoundingClientRect();
                            const context = container.getBoundingClientRect();
                            // If page's style 'display = none',
                            // its properties are not computable!
                            if (!page.offsetHeight || client.bottom < context.top || 
                                client.top > context.bottom) {    
                                container.removeEventListener('scroll', scrollHandler);
                                resolve();
                            }
                        };
                    } 
                }
            },

            // Control scroll area.
            scrollHandler: async _ => {
                // Check if scroll contaniner is visible.
                if (container.offsetHeight) {
                    const containerClientSize = container[camelCase('client', size)];
                    const startOffset = preBucket[camelCase('offset', size)];
                    const dataOffsetSize = data[camelCase('offset', size)];
                    const endOffset = startOffset + dataOffsetSize - containerClientSize;
    
                    // ScrollLeft is minus for direction: 'rtl'.
                    const scroll = Math.abs(container[camelCase('scroll', start)]);
                    
                    if (scroll < startOffset) {       
                        // To better reflex bucket loading!
                        preTriggerConfidence.classList.toggle('pre-bounce-loader');
                                 
                        container[camelCase('scroll', start)] = startOffset;
                    } else if (scroll > endOffset) {
                        postTriggerConfidence.classList.toggle('post-bounce-loader');
                        
                        container[camelCase('scroll', start)] = endOffset;        
                    }
                }
            },
        };
        
    })(),

    // Controll loading Center.
    {
        abort,
        queueLoading,
        
    } = (() => {
        let controller;
        const
        setTriggers = () => {
            preTrigger.style[start] = triggerMargin[start];
            postTrigger.style[end] = triggerMargin[end];
        },
        activeTriggers = () => [preTrigger, postTrigger, preTriggerConfidence, postTriggerConfidence].
            map(trig => trig.classList.remove('d-none')), 
        deactiveTriggers = () => [preTrigger, postTrigger, preTriggerConfidence, postTriggerConfidence].
            map(trig => trig.classList.add('d-none')),

        setLoading = () => {
            if (!loading.textContent) {
                renderLoadingCallback(loading);
            }
        },
        triggerLoading = (position) => {
            controller = new AbortController();
            dispatch.dispatchAbortLoading(loading, abort);
            if (position === end) {
                toolbar.style.top = toolbar.parentElement[camelCase('client', size)] +'px';
            }
            loading.style[position] = 0;
            loading.classList.remove('d-none');
        
            deactiveTriggers();
        },        
        detriggerLoading = () => {
            loading.classList.add('d-none');
            loading.style[start] = '';
            loading.style[end] = '';
            toolbar.style[start] = '';
            toolbar.style[end] = '';            
        
            // Bussines rule.
            activeTriggers();
            // debounce trigger loading.
            setTimeout( _ => {        
                controller?.abort('Process aborted under control.');
                controller = null;
            }, 10);    
        };

        setTriggers();
        setLoading();
    
        return {        
            abort: (reason) => {
                console.info()
                controller.abort(reason ?? 'AbortError');
            },             
            queueLoading: async (callback, position) => {
                // Loadings are lined.
                // This is a bussiness rule.
                // Can queue loading tasks!
                if (controller) {
                    return;
                }
                console.info('Loading center: loading... .');
        
                try {
                    triggerLoading(position);
                    await callback(controller.signal);
            
                    console.info('Loading center: ...Loaded.');
                } catch (err) {
                    abort(err.message);
                    console.info('Loading center: Loading aborted.');
                    throw err;
                }
                finally {
                    detriggerLoading();
                }
            },
        }
    })(),

    houseKeep = () => {  
        setObserver();    
        container.addEventListener('scroll', scrollHandler);    
        
    }, 

    renderPage = async (pageContent, spare) => {
        spare = spare ?? document.createElement('div');
        // Reset className.
        spare.className = 'page';
        spare.dataset['meta'] = JSON.stringify({meta: pageContent.meta, links: pageContent.links});
    
        let idx = 0;
        for (const item of pageContent.items) {   
            const {content, meta} = item; 
            let child = spare.children[idx++];
            if (!child) {
                child = document.createElement('span');
                spare.append(child);
            }
            // Reset className.
            child.className = 'item';
            child.textContent = '';
            await renderItemCallback({element: child, content, meta});
        }
        // Remove exess items.
        while (idx < spare.childElementCount) {
            spare.children[idx++].remove();                
        }
        
        dispatch.dispatchPageDoming(pages, spare);
        return spare;
    },
    
    createPageNGetInfo = async ({url, spare, signal}) => {
        const pageContent = await fetch(url, {signal});
        spare = await renderPage(pageContent, spare);
        return {
            spare,
            pageMeta: pageContent.meta,
            pageLinks: pageContent.links,
        };
    },

    analyzePageMetas = (pageMeta, pageLinks) => {
        pageMeta = pageMeta ?? {};
        pageLinks = pageLinks ?? {};
        const hasPrevious = pageLinks['previous']?.trim().length > 0;
        const hasNext = pageLinks['next']?.trim().length > 0;
        // getcomptedStyle retruns 'live' amounts! 
        // Everything is relative to container.   
        const computedStyle = document.defaultView.getComputedStyle(container.parentElement); 
        let containerMaxSize = parseFloat(computedStyle[camelCase('max', size)]);
        const containerOffset = container.parentElement[camelCase('offset', size)];
        const containerSize = parseFloat(computedStyle[size]);
        const bodySize = document.body[camelCase('offset', size)];
        // maxHeight ?? offsetHeight ?? height ?? body.offsetHeight.
        containerMaxSize = !isNaN(containerMaxSize) ? containerMaxSize : 
            containerOffset !== 0 ? containerOffset :
            !isNaN(containerSize) ? containerSize : bodySize;  
    
        // These are all business rules.
        let mustLoadedPages, scale;
        let {totalItems, totalPages, page} = pageMeta;
        totalItems = parseInt(totalItems);
        totalPages = parseInt(totalPages);
        page = parseInt(page);        
        totalItems = isNaN(totalItems) ? undefined : totalItems;
        totalPages = isNaN(totalPages) ? undefined : totalPages;
        page = isNaN(page) ? undefined : page;
    
        const pageSize = pages.querySelector('.page')[camelCase('offset', size)];
        const itemSize = pages.querySelector('.item')?.[camelCase('offset', size)];  
        // Number of items in page.           
        const numOfItems = pages.firstElementChild.childElementCount;
    
        if (itemSize === 0) {
            page = 1;
            totalPages = 1;
            totalItems = 0;
            mustLoadedPages = 1;
            scale = 0;
        } else if (numOfItems < itemsPerPage) {
            page = 1;
            totalPages = 1;
            totalItems = numOfItems;
            mustLoadedPages = 1;
            scale = pageSize / (itemSize * numOfItems);
        } else {
            page = page ?? 1;
            totalPages = totalPages ?? ((hasPrevious || hasNext) ? page + 1 : page) ;
            totalItems = totalItems ?? totalPages * itemsPerPage;
            // 1 added to better trigger loading.
            mustLoadedPages = Math.min(
                Math.max(Math.ceil(containerMaxSize / pageSize) + 1, numPages), 
                totalPages);
            scale = pageSize / (itemSize * itemsPerPage);
        }
    
        return {
            page,
            itemSize,
            scale,
            mustLoadedPages,
            totalItems,
            totalPages,
        };
    },
    
    hydrateBuckets = (pageMeta, pageLinks) => {
        let {
            page,
            itemSize,
            scale,
            mustLoadedPages,
            totalItems,
            totalPages,
        } = getOfNoneDisplay(container, _ => analyzePageMetas(pageMeta, pageLinks)); 
    
        preBucket.itemsPerPage = itemsPerPage;
        postBucket.itemsPerPage = itemsPerPage;
        preBucket.itemSize = itemSize;
        postBucket.itemSize = itemSize;
        preBucket.scale = scale;
        postBucket.scale = scale;
    
        preBucket.items = (page - 1) * itemsPerPage; 
        const remindedPages = Math.ceil(totalItems / itemsPerPage) - (page + mustLoadedPages -1);
        const remindedItems = remindedPages === 0 ? 0 : 
            (remindedPages - 1) * itemsPerPage + totalItems % itemsPerPage;
        postBucket.items = remindedItems;
    
        return mustLoadedPages;
    },

    {
        hydrate,
        loadFrom,
    } = (() => {
        let url, oneoff;
        return {
            hydrate: async (home, reset = false) => {
                if (reset) oneoff = false;
            
                if (!home) {
                    throw new TypeError("'home' is required!");
                } else if (home === url && oneoff) {
                    return;        
                }
            
                try {
                    url = home;    
                    console.info('Hydrating... .');
            
                    await queueLoading(async signal => {

                        // If any preivous elements, reuse them.
                        const children = [...pages.children];
                        // Reset pages.
                        pages.textContent = '';    
                        let idx = 0;
                        let {spare, pageMeta, pageLinks} = 
                            await createPageNGetInfo({url, spare: children[idx++], signal});
                        pages.append(spare);
                        fixupScrollProblem(spare);
            
                        let mustLoadedPages = hydrateBuckets(pageMeta, pageLinks); 
                        let nextUrl = pageLinks[next]           
                        while (mustLoadedPages > 1) {
                            ({spare, pageLinks: {[next]: nextUrl}} = 
                                await createPageNGetInfo({url: nextUrl, spare: children[idx++], signal}));
                            pages.append(spare);
                            fixupScrollProblem(spare);
                            
                            mustLoadedPages--;
                        }
            
                        oneoff = true;   
            
                        console.info('Hydrate completed.');
                    });

                } catch (err) {
                    console.log('Hydrate incomplet!');
                    // Reset buckets.
                    preBucket.items = 0;
                    postBucket.items = 0;
                    oneoff = false;           
            
                    throw err;
                }  

            
            },
            
            loadFrom: async (bucket) => {     
                console.info('Loading from bucket... .');
                
                const {otherBucket , adjucentPage, pageToRemove, nextUrl, position, append} = bucket === preBucket ? 
                    {otherBucket : postBucket, adjucentPage: pages.firstElementChild, 
                        pageToRemove: pages.lastElementChild, nextUrl: previous , position: start, append: 'prepend'} :
                    {otherBucket : preBucket, adjucentPage: pages.lastElementChild, 
                        pageToRemove: pages.firstElementChild, nextUrl: next, position: end, append: 'append'};
            
                await queueLoading(async signal => {
                    // Read meta form adjucent loaded page, if nothing, from bucket.
                    let meta = JSON.parse(adjucentPage?.dataset['meta'] ?? "{}");
                    let url = meta.links?.[nextUrl];
                    if (!url) {
                        meta = bucket.peek();
                        url = meta?.links?.self;
                        // There is nohting in bucket; bucket size is not 0: out of bussines,
                        // else return.
                        if (!url) {
                            let bucketSize = parseFloat(bucket.style[size]);
                            bucketSize = Number.isNaN(bucketSize) ? 0 : bucketSize;
                            if (bucketSize !== 0) {
                                throw new TypeError("Out of bussiness, 'url' not found!");
                            }
                            return;                
                        }
                    }
                        
                    const {spare} = await createPageNGetInfo({url, spare: loadFrom.spare, signal});
                    await waitUntilDisapear(pageToRemove, signal); 
                    // If all is ok!
                    const preChangeScroll = container[camelCase('scroll', start)];
                    bucket.recycle();
                    otherBucket.trash(pageToRemove);
                    pageToRemove.remove();
                    pages[append](spare);
                    loadFrom.spare = pageToRemove;
                    // Reset scroll to preChangeScroll to prevent jump.
                    container[camelCase('scroll', start)] = preChangeScroll;
                }, position);
                
                console.info('...from bucket completed.');
            },
        }
    })()
;

    houseKeep();
//#endregion "Scrollloader core"

    let lastSelected;
    const
    active = (item) => {
        lastSelected?.classList.remove('active');
        item.classList.add('active');
        lastSelected = item;
    }, 

    tryFind = (content, isMatch = (element, content) => element.textContent === content) => {       
        const data = pages.querySelectorAll('.item');
        let flag = false;
        for (const item of data) {
            if (isMatch(item, content)) {
                active(item);
                item.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'nearest'});
                flag = true;
                break;
            }
        }     
        return flag;          
    }, 

    firstElement = () => {
        return pages.querySelector('.item');
    };

    pages.addEventListener('click', event => {
        const target = event.target;
        if (target.classList.contains('item')) {
            active(target, lastSelected);
            dispatch.dispatchItemSelected(target);
        }
    });

    loading.addEventListener('click', _ => abort('User aborted!'));

    return {
        hydrate,
        dispose: () => container.parentElement.textContent = '',
        tryFind,
        get firstItemElement() {
            return firstElement();
        },
    }
    
}