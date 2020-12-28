const { ipcRenderer, shell } = require('electron');

const app = new class App {
    send(type: string, payload?: any) {
        ipcRenderer.send(type, payload);
    }

    listen(type: string, callback: (e: any, payload: any) => any) {
        ipcRenderer.on(type, callback);
    }
    
    invoke(type: string, payload?: any) {
        return ipcRenderer.invoke(type, payload);
    }
}

const store = new class Store {
    get(item: string | number) {
        return app.invoke('store.get', item);
    }

    set(input1: string | number | object, value?: any) {
        let data: {} = (!value ? input1 : {
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

const lang = new class Lang {
    private current: string = 'en';
    private data: {} = {};

    constructor() {
        store.get('language').then(storeValue => {
            this.load(storeValue ? storeValue : this.current);
        });
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
            console.log(el);
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
        setTimeout(() => fetch(`views/${view}.html`).then(res => res.text()).then(res => {
            //Parse new view and retrieve configurations.
            const parsed: any = document.createElement('parsed'); parsed.innerHTML = res;
            const viewProperties: any = Object.assign({
                title: "defaultTitle",
                titleSuffix: true,
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
        if (this.currentProfile == username) {
            this.currentProfile = null;
            await store.set('currentProfile', null);
        }
        
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

    async signout(username: string) {
        if (this.currentProfile == username) {
            this.currentProfile = null;
            await store.set('currentProfile', null);
        }

        return await app.invoke('profile.signout', username);
    }

    async load(username: string) {
        var profile: any = await this.find(username);
        if (profile && profile.signedin) {
            this.currentProfile = username;
            await store.set('currentProfile', username);
        } else {
            return false;
        }
    }
}