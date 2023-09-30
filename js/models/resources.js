const CACHE_VERSION = 2;
export const PREFIX_CACHE = 'DOI-FETCH-CACHE - v';

export const BASE = 'https://api.datacite.org';
// For test:
export const test = 'https://api.test.datacite.org';

export const SITEHOST = self.location.origin;
export const ENVIRONMENT = 'DEVELOPMENT'; // 'DEVELOPMENT' || 'PRODUCTION'.
export const DEVELOPMENT_CACHE = `${ENVIRONMENT}-${PREFIX_CACHE}${CACHE_VERSION}`;
export const CURRENT_CACHE = `${PREFIX_CACHE}${CACHE_VERSION}`;

export const CUSTOM_DOI_HEADER = 'X-Doi-From';
export const FALLBACK_URL = './js/models/nocontent.json';
export const CACHEABLE_ASSETS = [
    './',
    './index.html',
    './css/site.css',
	'./assets/favicon.png',
    './assets/favicon144x144.png',
    './assets/manifest.json',
	'./js/main.js',
    './js/services/fetchDoi.js',
	'./js/services/jsonFetch.js',
	'./js/services/registerserviceworker.js',
    './js/models/query.js',
    './js/models/nocontent.json',
    './js/models/diminishDoiApiResponse.js',
	'./js/models/fallbackerror.js',
	'./js/viewmodels/baseviewmodel.js',
	'./js/viewmodels/dropdownhierarchyviewmodel.js',
	'./js/viewmodels/listviewmodel.js',
	'./js/scrollloader/dispatchEvents.js',
	'./js/scrollloader/proxies.js',
	'./js/scrollloader/scrollloader.js',
	'./js/scrollloader/shapeContainer.js',
	'./js/scrollloader/template.js',
	'./js/scrollloader/utilities.js',
	'./js/scrollloader/variables.js',
];

