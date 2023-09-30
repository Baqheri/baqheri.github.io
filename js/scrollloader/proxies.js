export const
proxyBucket = (element, size) => {    
    if (Proxy && Reflect) {
        return new Proxy(element, {
            _scale: 0,
            _items: 0,
            _itemSize: 0,
            _itemsPerPage: 0,
            _recycle: [],
            
            get(target, prop, receiver) {
                switch (prop) {
                    case 'scale':
                        return this._scale;

                    case 'itemSize':
                        return this._itemSize;

                    case 'itemsPerPage':
                        return this._itemsPerPage;

                    case 'items':
                        return this._items;
                    
                    case 'trash':
                        return (pages) => {
                            if (!(pages instanceof Array || 
                                pages?.[Symbol.iterator] || 
                                pages?.[Symbol.asyncIterator])) {
                                    pages = [pages];
                                }
                            for (const page of pages) {
                                const itemsPerPage = page?.childElementCount ? page.childElementCount
                                    : this._itemsPerPage;
                                const meta = JSON.parse(page?.dataset['meta'] ?? "{}");
                                this._recycle.push({itemsPerPage, meta});
                                receiver.items += itemsPerPage;
                            }
                        }
                        
                    case 'peek':
                        return () => this._recycle[this._recycle.length - 1]?.meta;
                        
                    case 'recycle':
                        // Might be generator!
                        return () => {
                            if (!this._recycle.length) return;

                            const recycle = this._recycle.pop();
                            receiver.items -= (recycle?.itemsPerPage ?? (this._items % this._itemsPerPage));
                        }

                    default:
                        return Reflect.get(target, prop);
                }
            },
            set(target, prop, value, receiver) {
                switch (prop) {
                    case 'scale':
                        this._scale = value;
                        // Trigger bucket sizing.
                        receiver.items += 0;
                        return true;

                    case 'items':
                        if (this._itemsPerPage === 0) {
                            throw new Error('First set itemsPerPage!');
                        }
                        this._items = value;
                        target.style[size] = this._items * this._itemSize * this._scale + 'px';
                        this._recycle.length = Math.ceil(this._items / this._itemsPerPage);
                        return true;

                    case 'itemSize':
                        this._itemSize = value;
                        receiver.items += 0;
                        return true;
                    
                    case 'itemsPerPage':
                        this._itemsPerPage = value;
                        return true;
                        
                    default:
                        return Reflect.set(target, prop);
                }
            }

            
        });
    } 
    // Else duck patch.
    else {
        element._items = 0;
        element.itemsPerPage = 0;
        element._itemSize = 0;
        element._recycle = [];
        return Object.defineProperties(element, {
            items: {
                configurable: false,
                Writable: false,
                enumerable: false,
                get: function() {
                    return this._items;
                },
                set: function(value) {
                    this._items += value;
                    element.style[height] = this._items * this._itemSize + 'px';
                },
            },
            itemSize: {
                configurable: false,
                Writable: false,
                enumerable: false,
                get: function() {
                    return this._itemSize;
                },
                set: function(value) {
                    this._itemSize = value;
                    this.items += 0;                       
                },
            },
            recycle: {
                configurable: false,
                Writable: false,
                enumerable: false,
                value: function() {
                    if (!this._recycle.length) return;

                    const recycle = this._recycle.pop();
                    const itemsPerPage = recycle.itemsPerPage ?? this.itemsPerPage;
                    this.items -= itemsPerPage;
                    return recycle.meta;
                }
            },
            trash: {
                configurable: false,
                Writable: false,
                enumerable: false,
                value: function(pages) {
                    if (!(pages instanceof Array || 
                        pages?.[Symbol.iterator] || 
                        pages?.[Symbol.asyncIterator])) {
                            pages = [pages];
                        }
                    for (const page of pages) {
                        const itemsPerPage = page?.childElementCount ? page.childElementCount
                            : this._itemsPerPage;
                        const meta = JSON.parse(page?.dataset['meta'] ?? "{}");
                        this._recycle.push({itemsPerPage, meta});
                        this.items += itemsPerPage;
                    }
                }            
            },
        });
    }
},

proxyPage = (page) => {
    if (false && Proxy && Reflect) {
        return new Proxy(page, {
            get(target, prop, receiver) {
                if (prop === 'resolve') {
                    return this._resolve;
                };
               
                const property = Reflect.get(target, prop);
                if (typeof property === 'function') property.bind(target);
                return property;
            },
            set(target, prop, value, receiver) {
                if (prop === 'resolve') {
                    this._resolve = value;
                    return true;
                }
                return Reflect.set(target, prop, value);
            }
        })
    } else {
        return page;
    }    
}
;