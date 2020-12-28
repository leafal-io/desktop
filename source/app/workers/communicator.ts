const components = [

    // ProfileManager
    (app: any, api: any) => {
        app.handle('profile.list', () => {
            var profs = api.profile.list();
            profs.forEach((p: any, i: number) => profs[i] = p.get());
            return profs;
        });

        app.handle('profile.find', (e: any, username: string) => {
            var p = api.profile.find(username);
            if (p) p = p.get();
            return p;
        });

        app.handle('profile.exists', (e: any, username: string) => api.profile.exists(username));
        app.handle('profile.create', async (e: any, username: string) => {
            var p = await api.profile.create(username);
            if (p) p = p.get();
            return p;
        });

        app.handle('profile.delete', (e: any, username: string) => api.profile.delete(username));
        app.handle('profile.authenticate', (e: any, login: {username: string, password: string}) => {
            var profile = api.profile.find(login.username);
            if (!profile) profile = api.profile.create(login.username);
            return profile.authenticate(login.password);
        });

        app.handle('profile.signout', (e:any, username: string) => {
            var profile = api.profile.find(username);
            if (!profile) return false;
            return profile.signout();
        });

        app.handle('profile.updateCache', (e:any, username: string) => {
            var profile = api.profile.find(username);
            if (!profile) return false;
            return profile.updateCache();
        });

        app.handle('profile.updateCacheForced', (e:any, username: string) => {
            var profile = api.profile.find(username);
            if (!profile) return false;
            return profile.updateCache(true);
        });
    },

    //General datastore usage
    (app: any, api: any) => {
        app.handle('store.get', (e: any, item: string | number) => api.store.get(item));
        app.handle('store.set', (e: any, data: {item: string | number, value: any}) => api.store.set(data.item, data.value));
        app.handle('store.del', (e: any, item: string | number) => api.store.delete(item));
        app.handle('store.delete', (e: any, item: string | number) => api.store.delete(item));
    }
]

module.exports = (app: any, api: any) => {
    //Load all components.
    components.forEach(component => component(app, api));
};