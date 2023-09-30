import { BASE} from './models/resources.js';
import { registerServiceWorker } from './services/registerserviceworker.js';
import { DropDownHierachyViewModel } from './viewmodels/dropdownhierarchyviewmodel.js';
import { ListViewModel } from './viewmodels/listviewmodel.js';

const itemsPerPageControl = document.querySelector('#itemsPerPages');
const consortiumIdsContainer = document.querySelector('div.consortium-ids');
const providerIdsContainer = document.querySelector('div.provider-ids');
const clientIdsContainer = document.querySelector('div.client-ids')
const doisContainer = document.querySelector('div.dois');

let consortiumIds;
itemsPerPageControl.addEventListener('change', _ => {  
    // Dispose prevouse hierarchy.
    consortiumIds?.dispose();
     
    consortiumIds = new DropDownHierachyViewModel(consortiumIdsContainer, 
        BASE + '/providers?member-type=consortium',
        {
            queryStringName: 'consortium-id',
            queryStrings: {
                ['page[size]']: parseInt(itemsPerPageControl.value),
                ['page[number]']: 1,
                sort: 'name',
            },  
        }
    );

    const providerIds = new DropDownHierachyViewModel(providerIdsContainer,
        BASE + '/providers', 
        {
            parent: consortiumIds,
            queryStringName: 'provider-id',
            queryStrings: {
                ['page[size]']: parseInt(itemsPerPageControl.value),
                ['page[number]']: 1,
                sort: 'name',
            },
        }
    );

    const clientIds = new DropDownHierachyViewModel(clientIdsContainer, 
        BASE + '/clients',
        {
            parent: providerIds, 
            queryStringName: 'client-id',
            queryStrings: {
                ['page[size]']: parseInt(itemsPerPageControl.value),
                ['page[number]']: 1,
                sort: 'name',
            },    
        }
    );

    // To better view results, page[size] be dividend of 12!
    let itemsPerPage = parseInt(itemsPerPageControl.value);
    itemsPerPage = Math.ceil(itemsPerPage / 12) * 12;

    const dois = new ListViewModel(doisContainer, 
        BASE + '/dois',
        {    
            parent: clientIds,
            queryStrings: {
                ['page[size]']: itemsPerPage,
                ['page[cursor]']: 1,
                sort: 'name',
            },  
        }
    );
});

await registerServiceWorker();
itemsPerPageControl.dispatchEvent(new Event('change'));
