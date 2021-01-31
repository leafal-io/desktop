(async function() {
    const profiles = await profile.list();
    const profilesContainer = document.querySelector('.profiles');
    const profilesContainerInner: any = document.querySelector('.profiles .inner');
    const profilesContainerScrolling: any = document.querySelector('.profiles .scrolling');

    const scrollerLeft = document.querySelector('.profiles .scrollers .left');
    const scrollerRight = document.querySelector('.profiles .scrollers .right');

    const buttonNewProfile = document.querySelector('.newProfile');
    const buttonSwitchManage = document.querySelector('.switch-manage');

    profiles.forEach((userprofile: any, i: number) => {
        var card = document.createElement('div');

        var profileImage = document.createElement('div');
        profileImage.classList.add('profile-image');
        profileImage.innerHTML = `<img src="${userprofile.localAvatar}" alt="${userprofile.displayname}'s profile image">`;
        card.appendChild(profileImage);

        var displayName = document.createElement('h4');
        displayName.innerText = userprofile.displayname;
        card.appendChild(displayName);

        var buttonChoose = document.createElement('button');
        buttonChoose.setAttribute('button-action', '');
        buttonChoose.setAttribute('data-lang', userprofile.signedin ? 'view.profileSelection.continue' : 'view.profileSelection.signin');
        buttonChoose.addEventListener('click', async e => {
            if (userprofile.signedin) {
                if (await profile.load(userprofile.username)) {
                    view.load('my-profile');
                } else {
                    alert('An unexpected error occured: Your profile is not signed in, please try restarting or reinstalling the application.');
                }
            } else {
                localStorage.setItem('signin-target-profile', userprofile.username);
                view.load('signin');
            }
        });
        card.appendChild(buttonChoose);

        var buttonDelete = document.createElement('button');
        buttonDelete.setAttribute('button-manage', 'delete');
        buttonDelete.setAttribute('data-lang', 'view.profileSelection.delete');
        buttonDelete.addEventListener('click', async e => {
            await profile.delete(userprofile.username);
            view.load('profile-selection');
        });
        card.appendChild(buttonDelete);

        card.classList.add('profile');
        if (profilesContainerScrolling) profilesContainerScrolling.appendChild(card);
    });

    lang.updateAll();

    if (profilesContainerScrolling && profilesContainer) Array.from(profilesContainerScrolling.children).forEach((el:any, i:number) => {
        var current = profilesContainer.getAttribute('profile-indexes') || '';
        profilesContainer.setAttribute('profile-indexes', current + ' ' + i);
    })

    if (buttonNewProfile) buttonNewProfile.addEventListener('click', e => {
        localStorage.setItem('signin-referrer', 'profile-selection');
        view.load('signin');
    })

    if (buttonSwitchManage && profilesContainer) buttonSwitchManage.addEventListener('click', e => profilesContainer.classList.toggle('manage'));

    if (profilesContainerInner && profilesContainerScrolling && scrollerLeft && scrollerRight) {
        var totalCards: number = profilesContainerScrolling.children.length;
        var scrolled: number = 0;

        function updateSituation(change?: number) {
            const update = () => {
                var shownCount = profilesContainerInner.clientWidth / 200;
                if (shownCount >= totalCards) {
                    scrolled = 0;
                }

                var outsideBoxLeft = scrolled;
                var outsideBoxRight = totalCards - scrolled - shownCount;
                
                if (change && scrollerLeft && scrollerRight) {
                    if (change > 0) {
                        if (outsideBoxRight > 0) {
                            scrolled += 1;
                            outsideBoxLeft += 1;
                            outsideBoxRight -= 1;
                        }
                    } else {
                        if (outsideBoxLeft > 0) {
                            scrolled -= 1;
                            outsideBoxLeft -= 1;
                            outsideBoxRight += 1;
                        }
                    }
                }

                profilesContainerScrolling.style.left = (scrolled * 200 > 0 ? '-' : '') + (scrolled * 200) + 'px';
                if (scrollerRight) outsideBoxRight > 0 ? scrollerRight.classList.remove('finished') : scrollerRight.classList.add('finished');
                if (scrollerLeft) outsideBoxLeft > 0 ? scrollerLeft.classList.remove('finished') : scrollerLeft.classList.add('finished');
            
            }

            if (change) {
                update();
            } else {
                setTimeout(update, 200); //required for the width transition to finish, otherwise the width is incorrect and scrolling buttons won't be shown.
            }
        }

        scrollerLeft.addEventListener('click', e => updateSituation(-1));
        scrollerRight.addEventListener('click', e => updateSituation(1));
        window.addEventListener('resize', e => updateSituation());
        updateSituation();
    }
})();