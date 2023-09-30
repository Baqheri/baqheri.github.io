import { BaseViewModel } from './baseviewmodel.js';

import { jsonFetch } from '../services/jsonFetch.js';

export class DropDownHierachyViewModel extends BaseViewModel {
    clear = () => {
        this.input.value = '';
        this.onChange();  
        this.hideContent();
        this.dropUP();
    };
    onChange = () => {
        super.clear();
        this.inheritableQueryStrings[this.queryStringName] = this.input.value;
        this.nextButtonXable();
    };
    goBottonClickHandler = () => {
        this.child?.hydrate()
    };
    showBsDropDownHandler = () => {
        this.hydrate();
    };
    shownBsDropDownHandler = () => {   
        this.maxHeight = this.maxHeight ?? getComputedStyle(this.scrollContainer)['maxHeight'];
        const height = this.scrollContainer.style.height;
        this.scrollContainer.style.height = this.maxHeight;
        const bodyBoundingRec = document.body.getBoundingClientRect();
        const containerBoundingRec = this.scrollContainer.getBoundingClientRect(); 
        const offset = bodyBoundingRec.bottom - containerBoundingRec.bottom - 
            containerBoundingRec.height * .1;
        if (offset < 0) {
            this.scrollContainer.style.maxHeight = parseFloat(this.maxHeight) + offset + 'px';
        }
        this.scrollContainer.style.height = height;               
    };
    hiddenBsDropDownHandler = () => {
        this.scrollContainer.style.maxHeight = this.maxHeight;
    };
    domingPageScrollloaderHandler= (event) => {
        event.detail.page.querySelectorAll('.item')
            .forEach(item => item.classList.add('dropdown-item'));
    };
    itemSelectedScrollloaderHandler = (event) => {
        this.input.value = event.detail.item.textContent.trim();
        this.onChange();
    };
    
    constructor(container, home, {parent, queryStringName, queryStrings}) {
        super(home, {parent, queryStrings}); 
        this.container = container;
        this.queryStringName = queryStringName;

        this.init();
    } 

    init() {     
        const scrollContainer = this.container.querySelector('.scroll-container');
        const config = {
            fetch: jsonFetch,
            topTagName: 'li',
            itemsPerPage: this.privateQueryStrings['page[size]'],
        };
        super.createScrollLoader(scrollContainer, config); 

        this.input = this.container.querySelector('.query-input')
        this.clearBotton = this.container.querySelector('.clear-adjucent-input');
        this.dropDownButton = this.container.querySelector('.dropdown-toggle');
        this.goBotton = this.container.querySelector('.go-botton');

        this.nextButtonXable();
        this.clearBotton.addEventListener('click', this.clear);
        this.input.addEventListener('change', this.onChange);
        this.goBotton.addEventListener('click', this.goBottonClickHandler);

        // Bootstrap befor shown event!
        this.container.addEventListener('show.bs.dropdown', this.showBsDropDownHandler);

        // Set maxHeight of dropdown, to be completely visible.
        this.container.addEventListener('shown.bs.dropdown', this.shownBsDropDownHandler);
        this.container.addEventListener('hidden.bs.dropdown', this.hiddenBsDropDownHandler);
        
        // Scrollloader pagedoming event, modify item classes.
        this.container.addEventListener('doming-page.scrollloader', this.domingPageScrollloaderHandler);

        // Scrollloader item-selected.scrollloader event, fill input.
        this.container.addEventListener('item-selected.scrollloader', this.itemSelectedScrollloaderHandler);
    }

    dispose() {
        super.dispose();
        this.clearBotton.removeEventListener('click', this.clear);
        this.input.removeEventListener('change', this.onChange);
        this.goBotton.removeEventListener('click', this.goBottonClickHandler);
        this.container.removeEventListener('show.bs.dropdown', this.showBsDropDownHandler);
        this.container.removeEventListener('shown.bs.dropdown', this.shownBsDropDownHandler);
        this.container.removeEventListener('hidden.bs.dropdown', this.hiddenBsDropDownHandler);
        this.container.removeEventListener('doming-page.scrollloader', this.domingPageScrollloaderHandler);
        this.container.removeEventListener('item-selected.scrollloader', this.itemSelectedScrollloaderHandler);        
    }    

    nextButtonXable() {
        this.goBotton.disabled = !this.input.value;
    }
 
    async hydrate() {
        try {
            this.showContent();
            await super.hydrate();
            this.input.value = this.scrollLoader.firstItemElement?.innerText.trim();
            this.nextButtonXable();
        } catch (err) {
            this.dropUP();
            throw err;
        }
        
    }

    dropUP() {
        // If container is visible, hide container.
        if (this.scrollContainer.offsetHeight) {
            this.dropDownButton.click();
        }    
    }
       
}
