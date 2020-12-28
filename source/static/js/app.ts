(async function() {
    await profile.initialize();
    var profiles = await profile.list();
    var currentProfile = profile.current();

    if (profiles.length < 1) {
        store.del('currentProfile');
        view.load('profile-selection');
        return;
    }

    if (!currentProfile) {
        store.del('currentProfile');
        view.load('profile-selection');
        return;
    }

    view.load('my-profile');
})();