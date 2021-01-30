# leafal.io Desktop
The official desktop application for leafal.io, used to access the store, view profiles, download and play games.

**WARNING:**
This application is early in development. Don't expect much, please report issues within our discord server (Morgan: owner and Kearfy: main dev of this repo): https://discord.gg/RucfrYaWnX


# Running Development Builds
The content below describes requirements, preparations and necessary NPM commands for running development builds of leafal.io Desktop.

## Requirements
- NodeJS 14*
- NPM (included with NodeJS)

## Preparations
- Create `.env` file with public key. (Use `.env-example` as an template)
- run `npm install` in the root directory
- start the application with `npm run dev`

## NPM commands
- `npm run start`: Compiles the application in folder "build" and launches it.
- `npm run dev`: Compiles the application in folder "build" and launches it, but in a dev environment.
- `npm run cleanbuild`: Deletes the "build" directory
- `npm run copysource`: Copies all source files to the build directory
- `npm run preparebuild`: Combines cleanbuild and copysource
- `npm run build`: runs preparebuild and compiles all the typescript code into native Javascript
- `npm run buildonly`: Only compiles the typescript code into native Javascript. (Within the build directory)
- `npm run startonly`: Starts the application without rebuilding or compiling the typescript code.
- `npm run startbasic`: Compiles the typescript in the build directory and starts the application.

## HTML Selectors
- **`load-view`**: Loads a view from the view folder when clicking on element, example: 
    ```html
        <el load-view="choose-profile">Choose profile</el>
    ```

- **`load-lang`**: Loads a language file and updates page when clicking on element, example: 
    ```html
        <el load-lang="en">View app in English</el>
    ```

- **`data-lang`**: Fills in the element with the selected language string from the loaded language file (json). The following language file will be used:

    ```json
        {
            "the": {
                "path": [
                    "This is string #1",
                    "This is string #2"
                ]
            },
            "form": {
                "identifier": "Username or E-mail address"
            }
        }
    ```

    **innerHTML**

    By default, the innerHTML of an element will be **REPLACED** with the selected language string:

    ```html
        <el data-lang="the.path.0"></el>
    ```

    Will result in:

    ```html
        <el data-lang="the.path.0">This is string #1</el>
    ```

    **Attributes**

    You can also fill an attribute of an element, when for example, innerHTML is not available:

    ```html
        <input data-lang="placeholder:form.identifier">
    ```

    Will result in:

    ```html
        <input data-lang="placeholder:form.identifier" placeholder="Username of E-mail address">
    ```

- **`update-profile-details`**: Forcibly updates all profile details on the page when clicked on element, example: 

    *Normally this automatically happens when a new view is loaded.*
    ```html
        <el update-profile-details>Update profile details on page</el>
    ```

- **`data-profile`**: Fills in the element with the selected item from the loaded profile. The following profile will be used:

    ```json
        {
            "id": 1,
            "username": "leafal.io",
            "token": "1a2b3c4d5e6f7g8h9i0j",
            "signedin": true,
            "updated": 1612001444518,
            "displayname": "leafal.io",
            "url": "https://www.leafal.io/profile/leafal.io",
            "avatar": "https://www.leafal.io/assets/uploads/profile1-2.png",
            "localAvatar": "img/profile/1.png",
            "coin": {
                "color": "transparent",
                "title": "Seamless",
                "desktop": "#00FFFFFF"
            },
        }
    ```

    **innerText**

    By default, the innerText of an element will be **REPLACED** with the selected language string:

    ```html
        <el data-profile="displayname"></el>
        <el data-profile="coin.title"></el>
    ```

    Will result in:

    ```html
        <el data-profile="displayname">leafal.io</el>
        <el data-profile="coin.title">Seamless</el>
    ```

    **Attributes**

    You can also fill an attribute of an element, when for example, innerText is not available:

    ```html
        <img data-profile="src:localAvatar">
    ```

    Will result in:

    ```html
        <img data-profile="src:localAvatar" src="img/profile/1.png">
    ```

- **`system-browser`**: Open a link in the browser once clicked on, example: 

    ```html
        <el system-browser="https://leafal.io">View the leafal.io store online!</el>
    ```


# Views
We structure views in a specific way for them able to properly be processed by the router.

## Root elements
Each view can consist of the following root-elements:
- `<view-properties>`: Contains configuration properties for the view.
- `<view-head>`: Contains elements for the current view only that will be inserted at the end of the *head* element.
- `<view-body>`: Contains elements for the current view only that will be inserted at the end of the *body* element.
- `<view-content>`: **REQUIRED**, contains the actual content for the view.

## view-properties
If present, inside the `<view-properties>` element a `{ JSON-object }` is expected. The following keys can be defined:
- `"title"`: Defaults to: `"defaultTitle"`. Expects a path to a language string. Will update the `data-lang` property of the `html > head > title` element.
- `"fillWindow"`: Defaults to `false`. In case a positive property such as `true` is present, the top-navigation bar and bottom status-bar will be hidden.

## Example

```html
    <view-properties>
        {
            "title": "language.path.to.title",
            "fillwindow": false
        }
    </view-properties>

    <view-head>
        <style>
            element.class#id[attribute] {
                property: value
            }
        </style>
        <link rel="stylesheet" type="text/css" href="link/to/sheet.css">
    </view-head>

    <view-body>
        <script>
            alert("Welcome to the current view!");
        </script>
        <script type="text/javascript" src="link/to/script.js"></script>
    </view-body>

    <view-content>
        <h1 data-lang="view.name.title"></h1>
    </view-content>
```

# Client-side workers

Documentation of client-side worker-libraries

## **`app`**-worker

Communicate with the server-side of the application. For available communication channels, see [Communication channels](#communication-channels)

- `app.send(type: string, payload?: any)`: Send a message with an optional payload to the server-side of the application.

    ```javascript
        app.send('message', 'payload');
    ```

- `app.listen(type: string, callback: (event: any, payload: any) => any)`: Listen for a message with an optional payload from the server-side of the application.

    ```javascript
        app.listen('message', (event: any, payload: any) => {
            alert('message received from server: ' + payload);
        });
    ```

- `app.invoke(type: string, payload?: any)`: Send a message with an optional payload to the server-side of the application and wait for it's response.

    **Using Promises**

    ```javascript
        app.invoke('message', 'payload').then((response: any) => {
            alert('Response from server: ' + response);
        });
    ```

    **Using Async/Await**

    ```javascript
        var response: any = app.invoke('message', 'payload');
        alert('Response from server: ' + response);
    ```

    **Using a callback**

    ```javascript
        app.invoke('message', 'payload', (response: any) => {
            alert('Response from server: ' + response);
        });
    ```

## **`store`**-worker

- `store.set(input1: string | number | {item: string | number, value: any}, value?: any)`

    Sets a property in the local data store.

    ```javascript
        store.set('property', 'Value');
    ```

- `store.get(item: string | number)`

    Get a property from the local data store.

    ```javascript
        store.get('property');      //Returns "Value"
    ```

- `store.del(item: string | number)`
- `store.delete(item: string | number)`: *Alias for `store.del`*

    Delete a property from the local data store.

    ```javascript
        store.del('property');
    ```

## **`loader`**-worker

- `loader.show()`

    Show the page loader.

- `loader.hide()`

    Hide the page loader.

- `loader.toggle()`

    Toggle the page loader.

## **`globalEventHandler`**-worker

The *globalEventHandler*-worker is a solution to the ajax view-loading and event registrations. This allows you to register an event which will be captured by the whole page (so that newly loaded elements are also captured). After an event is triggered, it's possible to filter out to a specific element with the use of some helper-functions. Examples will be shown below.

- `globalEventHandler.register(eventType: string, handler: Function)`
    
    Register a global event. An example of an event type is: `click`.
    ```javascript
        globalEventHandler.register('eventType', (event: any) => {
            //Validate call to event handler and potentially handle event.
        });
    ```

- `globalEventHandler.findParent(el: any, cb: Function)`
    
    Validate if element, or any of it's parents, meet the requirements.
    ```javascript
        element = globalEventHandler.findParent(element, (el: any) => {
            //Check if "el" meets your requirements and provide a positive or negative response based on that.
        });
    ```

- `globalEventHandler.findParentWithAttribute(el: any, attr: string)`
    
    Find parent that has attribute.
    ```javascript
        element = globalEventHandler.findParentWithAttribute(element, 'attribute-name');
    ```

- `globalEventHandler.findParentWithClass(el: any, className: string)`
    
    Find parent that has class.
    ```javascript
        element = globalEventHandler.findParentWithClass(element, 'classname');
    ```

### Example

In this example we will register a global event handler that will listen say hi to the user once clicked on.

```javascript
    globalEventHandler.register('eventType', (event: any) => {
        var element = globalEventHandler.findParentWithAttribute(event.target, 'say-hi'); //Find element with "say-hi" attribute.
        if (element) {                                                                    //Element was found, say hi.
            alert('Hi there!');
        }
    });
```
If a user clicks on element with attribute "say-hi", or any of it's children, they will get a pop-up greeting them.
```html
    <div say-hi>
        <p>I will greet you!</p>
    <div>

    <div>
        <p>But I will not :(</p>
    <div>
```

## **`lang`**-worker

We will assume the following language file:
```json
    {
        "language-string": {
            "one": "Hi there!",
            "two": "Goodbye!"
        }
    }
```

- `lang.load(lang: string)`
    
    Loads a language file.
    ```javascript
        lang.load("nl");    //App will now be shown in Dutch.
        lang.load("en");    //App will now be shown in English.
    ```

- `lang.update(el: any, selector?: string)`

    Update a specific element, if given, with a specific selector. The following element will be used:
    ```html
        <el data-lang="language-string.one"></el>
    ```

    **Without defining a selector**
    ```javascript
        var element = document.querySelector('el');
        lang.load(element);

        //Will result in
        <el data-lang="language-string.one">Hi there!</el>
    ```

    **By defining a selector**
    ```javascript
        var element = document.querySelector('el');
        lang.load(element, 'language-string.two');

        //Will result in
        <el data-lang="language-string.one">Goodbye!</el>
    ```

- `lang.updateAll()`

    All elements in the page with attribute `data-lang` will be updated. The following elements will be used:
    ```html
        <el data-lang="language-string.one"></el>
        <el data-lang="language-string.two"></el>
    ```

    Will result in
    ```html
        <el data-lang="language-string.one">Hi there!</el>
        <el data-lang="language-string.two">Goodbye!</el>
    ```

- `lang.get(selector: string)`

    Obtain a langstring by it's selector.
    ```javascript
        lang.get('language-string.one');    //Returns: "Hi there!"
        lang.get('language-string.two');    //Returns: "Goodbye!"
    ```

## **`view`**-worker

- `view.load(view: string)`

    Loads a view. 

## **`profile`**-worker

- `profile.current()`

    Returns the name of the currently loaded profile, if any.

- `profile.list()`

    Returns a list of locally stored profiles in the form of an array.

- `profile.find(username: string)`

    Find a locally stored profile by it's username.

- `profile.create(username: string)`

    Create a locally stored profile by it's username.

- `profile.exists(username: string)`

    Check if a locally stored profile exists by it's username.

- **async** `profile.delete(username: string)`

    Delete a locally stored profile by it's username. Returns true if succesful.

- **async** `profile.info()`

    Returns info about the currently active user, if any user is currently active. Will otherwise return false.

- **async** `profile.authenticate(username: string, password: string)`

    Authenticates a (new) profile by it's username. If no profile yet exists, a new one will be created. Returns the profile information if successful.
    
    **WARNING**: This function should only be used to authenticate a (new) profile by it's username. Use profile.byIdentifier to allow for both a username and E-mail address.

- **async** `profile.byIdentifier(identifier: string, password: string)`

    Authenticates a (new) profile by it's identifier (Username OR E-mail address). If no profile yet exists, a new one will be created. Returns the profile information if successful.

- **async** `profile.signout(username: string)`

    Signs out a locally stored profile by it's username, if signed in. Does so by deleting the authorization token.

- **async** `profile.load(username: string)`

    Loads a locally stored and signed in profile (marks it's as the currently active profile).

- **async** `profile.fillPage()`

    Updates the page with all the details about the currently signed user. A dummy profile will be used if no profile is currently loaded.


# Communication channels

With the use of [***`app`***`-worker`](#app-worker), multiple communication channels between the client- and server-side of the application have been set-up.

## ProfileManager

*This communication channel is normally handled by the* [***`profile`***`-worker`](#profile-worker)*.*

- `profile.list`: List all locally stored profiles.
    
    *Two profiles are locally stored in this example*
    ```javascript
        > await app.invoke('profile.list');

        <- (2) [{...}, {...}]
    ```

- `profile.find`: Find a profile by it's username.
    
    ```javascript
        > await app.invoke('profile.find', 'leafal.io');

        <- {id: 1, username: "leafal.io", …}
    ```

- `profile.exists`: Check if a profile is locally stored by it's username.
    
    ```javascript
        > await app.invoke('profile.exists', 'leafal.io');

        <- true
    ```

- `profile.create`: Create a locally stored profile by it's username.
    
    ```javascript
        > await app.invoke('profile.create', 'leafal.io');

        <- {id: 1, username: "leafal.io", token: null, signedin: false, updated: 0, …}
    ```

- `profile.delete`: Delete a locally stored profile by it's username.
    
    ```javascript
        > await app.invoke('profile.delete', 'leafal.io');

        <- undefined
    ```

- `profile.authenticate`: Authenticate a locally stored profile by it's username.

    **Warning**: This communication channel should not be used to authenticate a user by it's E-mail address. Use `profile.byIdentifier` for that!

    *If the profile does not yet exist, it will automatically be created*
    
    ```javascript
        > await app.invoke('profile.authenicate', {
            username: 'leafal.io',                          //ONLY THE USERNAME, NOT AN E-MAIL ADDRESS!
            password: 'SuperSecretNotActualPassword!'
        });

        <- {success: true, profile{...}}
    ```

- `profile.byIdentifier`: Authenticate a locally stored profile by it's identifier (Username OR E-mail address)

    *If the profile does not yet exist, it will automatically be created*
    
    ```javascript
        > await app.invoke('profile.byIdentifier', {
            username: 'email@domain.tld',
            password: 'SuperSecretNotActualPassword!'
        });

        <- {success: true, profile: {...}}
    ```

- `profile.signout`: Signout a locally stored profile by it's username.
    
    ```javascript
        > await app.invoke('profile.signout', 'leafal.io');

        <- true
    ```

- `profile.updateCache`: Update the cache of a locally stored profile by it's username.
    
    ```javascript
        > await app.invoke('profile.updateCache', 'leafal.io');

        <- true     //In case the profile has already been updated in the past 2 minutes, this will return false.
    ```

- `profile.updateCacheForced`: Forcibly update the cache of a locally stored profile by it's username. (break the 2 minute timer)
    
    ```javascript
        > await app.invoke('profile.updateCache', 'leafal.io');

        <- true
    ```

## Local Data Store

*This communication channel is normally handled by the* [***`store`***`-worker`](#store-worker)*.*

- `store.set`: Set a property in the local data store.

    ```javascript
        > app.send('store.set', {
            item: 'property',
            value: 'Value'
        });

        <- undefined
    ```

- `store.get`: Get a property from the local data store.

    ```javascript
        > await app.invoke('store.get', 'property');

        <- "Value"
    ```

- `store.del`: Delete a property from the local data store.
- `store.delete`: Alias for `store.del`.

    ```javascript
        > app.invoke('store.del', 'property');

        <- undefined
    ```