import {query} from '../models/query.js';
import { createScrollLoader } from '../scrollloader/scrollloader.js';

export class BaseViewModel {
    constructor(home, {parent, queryStrings}) { 
        this.home = home;
        this.parent = parent;
        // Maybe children!
        this.parent && (this.parent.child = this);

        this.privateQueryStrings = queryStrings;
        this.inheritableQueryStrings = {};
    }

    dispose() {
        this.child?.dispose();
        this.scrollLoader.dispose();
    }

    createScrollLoader(container, config) {
        this.scrollContainer = container;
        this.scrollLoader = createScrollLoader(container, config);
    }

    clear() {
        // Maybe clear over children!!
        this.child?.clear();
    };

    async hydrate() {     
        const url = this.getUrl(this.parent?.protectedQueryStrings());      
        await this.scrollLoader.hydrate(url);
     } 

    protectedQueryStrings() {
        return {
            ...this.parent?.protectedQueryStrings(),
            ...this.inheritableQueryStrings,
        }
    }
    getUrl(queries) {
        queries = {
            ...queries,
            ...this.privateQueryStrings,
        };
        const stringQuery = query(queries);
        return this.home.includes('?') ? this.home + '&' + stringQuery : 
            this.home + '?' + stringQuery;
    } 

    hideContent() {
        [].map.call(this.scrollContainer.children, child => child.style.display = 'none');
    }
        
    showContent() {        
        [].map.call(this.scrollContainer.children, child => child.style.display = '');       
    }
}