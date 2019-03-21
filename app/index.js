const { app, dialog, BrowserWindow } = require('electron');

let win;

function createWindow() {

    win = new BrowserWindow({
        width: 600,
        height: 750,
        frame: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.loadFile('./index.html');
    // win.webContents.openDevTools();
    
    win.on('closed', () => {
        win = null
    });

    win.on('maximize', (e) => {
        win.webContents.executeJavaScript('$("#titlebar").css({"margin" : "0", "padding" : "0 4px 36px 12px"})');
        win.webContents.executeJavaScript('$("#wrapper").css({"left" : 0, "right" : 0, "bottom" : 0})');
        win.webContents.executeJavaScript('$("#wrapper_settings").css({"left" : 0, "right" : 0, "bottom" : 0})');
    });
    
    win.on('move', (e) => {
        win.webContents.executeJavaScript('$("#titlebar").css({"margin" : "4px", "padding" : "0 0 0 12px"})');
        win.webContents.executeJavaScript('$("#wrapper").css({"left" : "4px", "right" : "4px", "bottom" : "4px"})');
        win.webContents.executeJavaScript('$("#wrapper_settings").css({"left" : "4px", "right" : "4px", "bottom" : "4px"})');
    });
    
    win.on('blur', function(){
        win.webContents.executeJavaScript('controllerInputBlurred();');
    });

    win.on('focus', function(){
        win.webContents.executeJavaScript('controllerInputFocused();');
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win === null) {
        createWindow();
    }
});