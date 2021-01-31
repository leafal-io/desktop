(async function() {
    var continueView: null | string = null;
    var referrerView: null | string = null;
    var targetProfile: any = localStorage.getItem('signin-target-profile');

    const formSignin: any = document.querySelector('form[form-signin]');
    const blockNewProfile: any = document.querySelector('form[form-signin] .new-profile');
    const blockExistingProfile: any = document.querySelector('form[form-signin] .existing-profile');
    const blockExistingProfileTitle: any = document.querySelector('form[form-signin] .existing-profile h1');
    const blockExistingProfileImage: any = document.querySelector('form[form-signin] .existing-profile img');
    const buttonBack: any = document.querySelector('form[form-signin] .button-back');

    if (targetProfile) {
        referrerView = 'profile-selection';
        localStorage.removeItem('signin-target-profile');
        targetProfile = await profile.find(targetProfile);

        blockNewProfile.style.display = 'none';
        blockExistingProfile.style.display = null;

        blockExistingProfileTitle.innerText = targetProfile.displayname;
        blockExistingProfileImage.src = targetProfile.localAvatar;
    }

    if (localStorage.getItem('signin-referrer')) {
        referrerView = localStorage.getItem('signin-referrer');
        localStorage.removeItem('signin-referrer')
    }

    if (localStorage.getItem('signin-continue')) {
        continueView = localStorage.getItem('signin-continue');
        localStorage.removeItem('signin-continue')
    }

    if (referrerView) {
        buttonBack.style.display = null;
        buttonBack.setAttribute('load-view', referrerView);
    }

    formSignin.addEventListener('submit', (e: any) => {
        e.preventDefault();

        async function cb(res: any) {
            if (!res.success) {
                alert(res.error);
            } else {
                if (await profile.load(res.profile.username)) {
                    view.load(continueView || 'my-profile');
                } else {
                    alert('An unexpected error occured: Your profile is not signed in, please try restarting or reinstalling the application.');
                }
            }
        }

        if (targetProfile) {
            profile.authenticate(targetProfile.username, e.target.password.value).then(res => cb(res));
        } else {
            profile.byIdentifier(e.target.identifier.value, e.target.password.value).then(res => cb(res));
        }
    });
})();