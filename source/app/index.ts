import { app, BrowserWindow, ipcMain, dialog } from 'electron';
const communicator = require('./workers/communicator');
const path = require("path");

//Setup the local datastore
const Store = require("electron-store");
const store = new Store();

//Prepare the environment
require('dotenv').config();
if (!process.env.PUBLIC_KEY) {
    throw new Error('PUBLIC_KEY is missing from environment. Please provide one or try to reinstall the application. (Can be downloaded from https://www.leafal.io');
}

//Setup a basic axios instance for the leafal API.
import axios from 'axios';
const LeafalAPI = axios.create({
    baseURL: 'https://www.leafal.io/api/',
    headers: {
        "Client-Id": process.env.PUBLIC_KEY
    }
});

console.log("Dependencies have been loaded.");

//App class. Will be used to interface with the window containing the GUI.
class App {
    window: BrowserWindow;
    root: string;

    //Automatically launch the window upon class initialization.
    constructor() {
        this.root = path.dirname(__dirname);    //Get the upper directory of the current file.
        this.window = new BrowserWindow({
            width: 850,
            height: 650,
            minWidth: 500,
            minHeight: 650,
            backgroundColor: '#363636',
            icon: this.root + '/static/img/leafal/logo.png',
            webPreferences: {
                nodeIntegration: true           //This allows the inclustion of ipcRenderer in the client window.
            }
        });

        this.loadFile('loader.html');   //Load the loader while waiting for backend.
    }

    //Load a file from the proper directory.
    loadFile(file: string) {
        this.window.loadFile(this.root + '/static/' + file);
    }

    //Send a message to the window.
    send(type: string, payload?: any) {
        this.window.webContents.send(type, payload);
    }

    //Listen for a message from the window.
    listen(type: string, callback: (e: any, payload: any) => any) {
        ipcMain.on(type, callback);
    }

    //Listen for a request from the window.
    handle(type: string, callback: (e: any, payload: any) => any) {
        ipcMain.handle(type, callback);
    }

    //Basic loader communicators.
    showLoader() { this.send('loader', 'show'); }
    hideLoader() { this.send('loader', 'hide'); }
    toggleLoader() { this.send('loader', 'toggle'); }
};

console.log("Waiting for the electron application to initialize.");


//Once the app is ready to launch a window, create a new App instance, load all local APIs and register all communicators.
app.on('ready', async () => {
    console.log("Launching application window and loading all APIs.");    

    const app = new App();
    const api = {
        profile: require('./api/profileManager'),
        store: store
    }

    if (process.env.NODE_ENV == 'dev') {
        console.log("Running in dev mode, forcibly updating all profile caches.");
        await api.profile.updateCaches(true);   //Update all profile caches in a dev environment. All files from build will be deleted and therefor profile images will go missing.
    }

    console.log("Registering all communication channels.");
    communicator(app, api);

    console.log("Dropping the loader and opening the application interface.");    
    app.loadFile('app.html');   //Load the default webpage.
});