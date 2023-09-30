import { BaseViewModel } from "./baseviewmodel.js";
import { jsonFetch } from "../services/jsonFetch.js";

const domingPageHandler = event => {
    event.target.classList.add('container');
    const page = event.detail.page;
    page.className += ' row';
    event.detail.page.querySelectorAll('.item')
        .forEach(item => item.className += 
            ' col-xs-12 col-sm-6 col-md-4 col-lg-3 col-xxl-3 overflow-auto text-nowrap');
};


export class ListViewModel extends BaseViewModel {
    constructor(container, home, {parent, queryStrings}) {
        super(home, {parent, queryStrings});
        this.container = container;
        // scrollContainer must have maxHeight set.
        this.container.style.maxHeight = this.container.offsetHeight + 'px';

        this.init();
    } 

    init() { 
        

        const scrollContainer = this.container;
        const config = {
            fetch: jsonFetch,
            renderItemCallback: ({element, content, meta}) => {
                let anchor;
                if (meta?.url) {
                    anchor = document.createElement('a');
                    anchor.setAttribute('href', meta.url);
                    anchor.setAttribute('target', '_blank');
                    anchor.className += ' text-success text-decoration-none';
                    anchor.textContent = content;
                    element.append(anchor);
                } else {
                    element.textContent = content;
                }
            },
            itemsPerPage: this.privateQueryStrings['page[size]'],
        };

        super.createScrollLoader(scrollContainer, config);

        this.container.addEventListener('doming-page.scrollloader', domingPageHandler);
    }

    dispose() {
        super.dispose();
        this.container.removeEventListener('doming-page.scrollloader', domingPageHandler);
    }

    clear() {
        super.clear();   
        this.hideContent()
    }

    async hydrate(url) {
        this.showContent();
        await super.hydrate();
    }    
}