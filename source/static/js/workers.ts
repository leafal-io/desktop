const { ipcRenderer, shell } = require('electron');

const app = new class App {
    send(type: string, payload?: any) {
        ipcRenderer.send(type, payload);
    }

    listen(type: string, callback: (e: any, payload: any) => any) {
        ipcRenderer.on(type, callback);
    }
    
    invoke(type: string, payload?: any, callback?: any) {
        if (typeof payload == 'function') {
            callback = payload;
            payload = undefined;
        }

        if (callback) {
            return ipcRenderer.invoke(type, payload).then(callback);
        } else {
            return ipcRenderer.invoke(type, payload);
        }
    }
}

const store = new class Store {
    get(item: string | number) {
        return app.invoke('store.get', item);
    }

    set(input1: string | number | {item: string | number, value: any}, value?: any) {
        let data: {} = (typeof input1 == 'object' ? input1 : {
            item: input1,
            value: value
        });

        return app.invoke('store.set', data);
    }

    del(item: string | number) {
        return app.invoke('store.del', item);
    }
    
    delete(item: string | number) {
        return app.invoke('store.del', item);
    }
}

const loader = new class Loader {
    private loader: any;

    constructor() {
        this.loader = document.querySelector('body > .loader');

        app.listen('loader', (e, payload) => {
            switch(payload) {
                case 'show': this.show();
                case 'hide': this.hide();
                case 'toggle': this.toggle();
            }
        });
    }

    show() {
        this.loader.classList.remove('hide')
    }

    hide() {
        this.loader.classList.add('hide')
    }

    toggle() {
        this.loader.classList.toggle('hide')
    }
}

const globalEventHandler = new class GlobalEventHandler {
    private registrations: any = {};

    constructor() {
        Object.keys(window).forEach((key: any) => {
            if (/^on/.test(key)) {
                window.addEventListener(key.slice(2), (event: any) => {
                    if (this.registrations[event.type]) this.registrations[event.type].forEach((handler: any) => handler(event));
                });
            }
        });

        this.register('click', (e: any) => {
            var el: any = this.findParentWithAttribute(e.target, 'system-browser');
            if (el) shell.openExternal(el.getAttribute('system-browser'));
        });
    }

    register(eventType: string, handler: any) {
        if (!this.registrations[eventType]) this.registrations[eventType] = [];
        this.registrations[eventType].push(handler);
    }

    findParent(el: any, cb: any) {
        while(el) {
            if (cb(el)) {
                break;
            } else {
                el = el.parentElement;
            }
        }

        return el;
    }

    findParentWithAttribute(el: any, attr: string) {
        return this.findParent(el, (potEl: any) => potEl.getAttribute(attr))
    }

    findParentWithClass(el: any, className: string) {
        return this.findParent(el, (potEl: any) => potEl.classList.contains(className));
    }
}

const lang = new class Lang {
    private current: string = 'en';
    private data: {} = {};

    constructor() {
        store.get('language').then((storeValue: any) => {
            this.load(storeValue ? storeValue : this.current);
        });

        globalEventHandler.register('click', (e: any) => {
            var el: any = globalEventHandler.findParentWithAttribute(e.target, 'load-lang')
            if (el) this.load(el.getAttribute('load-lang'));
        })
    }

    load(lang: string) {
        fetch(`lang/${lang}.json`).then(res => res.json()).then(res => {
            store.set('language', lang);
            this.current = lang;
            this.data = res;
            this.updateAll();
        }).catch(e => {
            loader.show();
            alert('Unknown language file loaded. Try restarting the application or reinstalling the application.');
        })
    }

    updateAll() {
        document.querySelectorAll('[data-lang]').forEach(el => this.update(el));
    }

    update(el: any, selector?: string) {
        try {
            var targetAttribute = null;
            if (!selector) selector = el.getAttribute('data-lang');
            if (!selector) selector = '';
            if (selector.includes(':')) {
                targetAttribute = selector.split(':')[0];
                selector = selector.split(':')[1];
            }
            
            var result = this.get(selector);
            if (!targetAttribute) {
                el.innerText = result;
            } else {
                el.setAttribute(targetAttribute, result);
            }
        } catch(e) {
            console.log(e);
            console.error('Error while updating lang of element: not an element. Ignoring it.');
        }
    }

    get(selector: string) {
        var result: any = this.data;
        selector.split('.').forEach(segment => {
            if (typeof result != 'object') return result = null;
            result = result[segment];
        });

        if (!result) result = 'Unknown path';
        return result;
    }
}

const view = new class View {
    constructor() {
        globalEventHandler.register('click', (e: any) => {
            var el: any = globalEventHandler.findParent(e.target, (potEl: any) => potEl.getAttribute('load-view'))
            if (el) this.load(el.getAttribute('load-view'));
        })
    }
    
    load(view: string) {
        loader.show();

        //Make sure that the loader will not be hidden instantly after loading the view.
        //View can still be loaded while showing the preloader (300ms). Should be enough.
        var forceLoader = true;
        setTimeout(() => {
            if (!forceLoader) loader.hide();
            forceLoader = false;
        }, 400);

        //Make sure that the loader is shown BEFORE the view is obtained and LOADED
        setTimeout(() => fetch(`views/${view}.html`).then(res => res.text()).then(async res => {
            //Parse new view and retrieve configurations.
            const parsed: any = document.createElement('parsed'); parsed.innerHTML = res;
            const viewProperties: any = Object.assign({
                title: "defaultTitle",
                fillwindow: false
            }, (props => props ? JSON.parse(props.innerText) : {})(parsed.querySelector('view-properties')));
            
            //Store all targeted elements
            var el: any = {
                title: document.querySelector('title'),
                content: document.querySelector('.content'),
                newContent: parsed.querySelector('view-content'),
                navbar: document.querySelector('.navbar'),
                statusBar: document.querySelector('.status-bar')
            }

            Object.values(el).forEach((item: any) => !item ? location.reload() : 1);
            el.headElements = parsed.querySelector('view-head');
            el.bodyElements = parsed.querySelector('view-body');

            //Cleanup old view
            document.querySelectorAll('[current-view-only]').forEach(el => {
                if (el.parentNode) el.parentNode.removeChild(el);
            });
        
            //Apply new view
            if (el.title) el.title.setAttribute('data-lang', viewProperties.title);
            if (el.content) el.content.innerHTML = el.newContent.innerHTML;
 
            if (el.headElements) Array.from(el.headElements.children).forEach((el: any) => {
                el.setAttribute('current-view-only', '');
                document.head.appendChild(el);
            });

            if (el.bodyElements) Array.from(el.bodyElements.children).forEach((el: any) => {
                el.setAttribute('current-view-only', '');
                document.body.appendChild(el);
            });

            //Reload all newly imported scripts to make sure they will execute.
            document.querySelectorAll('script[current-view-only]').forEach(script => {
                //create a replacement script tag.
                var replacement = document.createElement('script');
                //copy over all the attributes of the script tag.
                for (var i = 0; i < script.attributes.length; i++) replacement.setAttribute(script.attributes[i].name, script.attributes[i].value);
                //if no src/source was defined, copy over the contents of the script tag.
                if (script.getAttribute('src') === null) replacement.innerHTML = script.innerHTML;
                //replace the script tag with the replacement so it will reload.
                if (script.parentNode) script.parentNode.replaceChild(replacement, script);
            });

            document.body.setAttribute('fillwindow', viewProperties.fillwindow.toString());
            lang.updateAll();
            await profile.fillPage();

            if (!forceLoader) loader.hide();
            forceLoader = false;
        }), 100);
    }
}

const profile = new class Profile {
    private currentProfile: string | null = null;

    async initialize() {
        var profile = await store.get('currentProfile');
        if (profile) await this.load(profile);

        globalEventHandler.register('click', (e: any) => {
            var el: any = globalEventHandler.findParentWithAttribute(e.target, 'update-profile-details')
            if (el) this.fillPage();
        })
    }

    current() {
        return this.currentProfile;
    }
    
    list() {
        return app.invoke('profile.list');
    }

    find(username: string) {
        return app.invoke('profile.find', username);
    }

    create(username: string) {
        return app.invoke('profile.create', username);
    }

    exists(username: string) {
        return app.invoke('profile.exists', username);
    }

    async delete(username: string) {
        if (this.currentProfile == username) await this.unload();        
        return await app.invoke('profile.delete', username);
    }

    async info() {
        if (this.currentProfile) {
            return await this.find(this.currentProfile);
        } else {
            return false;
        }
    }

    async authenticate(username: string, password: string) {
        return await app.invoke('profile.authenticate', {
            username: username,
            password: password
        });
    }

    async byIdentifier(identifier: string, password: string) {
        var res = await app.invoke('profile.byIdentifier', {
            identifier: identifier,
            password: password
        });

        return res;
    }

    async signout(username: string) {
        if (this.currentProfile == username) await this.unload();  
        return await app.invoke('profile.signout', username);
    }

    async load(username: string) {
        var profile: any = await this.find(username);
        if (profile && profile.signedin) {
            this.currentProfile = username;
            await store.set('currentProfile', username);
            document.body.setAttribute('profile-loaded', username);
            return true;
        } else {
            return false;
        }
    }

    async unload() {
        this.currentProfile = null;
        await store.set('currentProfile', null);
        document.body.removeAttribute('profile-loaded');
        return true;
    }

    async fillPage() {
        const userprofile = await this.info() || {
            id: 0,
            username: 'Not signedin',
            token: null,
            signedin: false,
            updated: 0,
            displayname: 'Not signedin',
            url: '#',
            avatar: 'https://www.leafal.io/assets/uploads/default.png',
            localAvatar: 'img/profile/default.png',
            coin: {
                color: '#FF0000',
                title: 'Not signedin',
                desktop: '#FF0000'
            }
        }

        document.querySelectorAll('[data-profile]').forEach((el: any) => {
            try {
                var targetAttribute = null;
                var selector = el.getAttribute('data-profile');

                if (!selector) selector = '';
                if (selector.includes(':')) {
                    targetAttribute = selector.split(':')[0];
                    selector = selector.split(':')[1];
                }

                var result: any = {...userprofile};
                selector.split('.').forEach((segment: any) => {
                    if (typeof result != 'object') return result = null;
                    result = result[segment];
                });
            
                if (!result) result = 'Unknown path';
                if (!targetAttribute) {
                    el.innerText = result;
                } else {
                    el.setAttribute(targetAttribute, result);
                }
            } catch(e) {
                console.log(e);
                console.error('Error while updating content of element: not an element. Ignoring it.');
            }
        })
    }
}